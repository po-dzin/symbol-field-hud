import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useGraphStore = create((set, get) => ({
    nodes: [],
    edges: [],
    selection: [],
    interactionState: 'IDLE', // IDLE, CONNECTING, DRAGGING

    // Core Lifecycle
    hasCore: false,

    // Connection State
    tempConnection: null, // { sourceId, sourcePos, currentPos }

    // Camera State (Persistent)
    camera: { x: null, y: null, scale: 1 }, // x/y null means not yet initialized
    cameraMode: 'manual', // 'manual' | 'focus' | 'ritual'
    cameraCommand: null, // { type: 'PAN'|'FOCUS', target: {x,y,scale}, duration, id }

    // Camera Settings (v0.37)
    cameraSettings: {
        infinite: true,
        minZoom: 0.15,
        maxZoom: 2.0,
        autoCenter: false
    },

    // Actions
    updateCamera: (camera) => {
        set(state => ({
            camera: { ...state.camera, ...camera }
        }));
    },

    setCameraMode: (mode) => set({ cameraMode: mode }),

    panCameraTo: (x, y, scale = null) => {
        set(state => ({
            cameraMode: 'manual',
            cameraCommand: {
                type: 'PAN',
                target: { x, y, scale: scale || state.camera.scale },
                id: Date.now()
            }
        }));
    },

    focusCameraOn: (nodeId) => {
        const { nodes, camera } = get();
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Calculate center position
        // We want the node to be in the center of the viewport
        // Viewport Center (screen space) = (WindowWidth/2, WindowHeight/2)
        // Node Position (world space) = (node.x, node.y)
        // Camera Position (world space offset) = ScreenCenter - NodePos * Scale

        // We need window dimensions. Since store is pure JS, we might assume standard center 
        // or rely on the component to calculate the exact target.
        // Let's pass the NODE as the target and let the component handle the math.

        set({
            cameraMode: 'focus',
            cameraCommand: {
                type: 'FOCUS',
                targetNodeId: nodeId,
                id: Date.now()
            }
        });
    },

    stopCamera: () => set({ cameraCommand: null }),

    startConnection: (sourceId, sourcePos) => {
        set({
            interactionState: 'CONNECTING',
            tempConnection: { sourceId, sourcePos, currentPos: sourcePos }
        });
    },

    updateTempConnection: (currentPos) => {
        set(state => ({
            tempConnection: { ...state.tempConnection, currentPos }
        }));
    },

    endConnection: (targetId) => {
        const { tempConnection, edges } = get();
        if (tempConnection && targetId && tempConnection.sourceId !== targetId) {
            // Create Edge
            const newEdge = {
                id: uuidv4(),
                source: tempConnection.sourceId,
                target: targetId,
                type: 'mycelial'
            };
            // Check for duplicates
            const exists = edges.some(e =>
                (e.source === newEdge.source && e.target === newEdge.target) ||
                (e.source === newEdge.target && e.target === newEdge.source)
            );

            if (!exists) {
                set(state => ({ edges: [...state.edges, newEdge] }));
            }
        }
        set({ interactionState: 'IDLE', tempConnection: null });
    },

    cancelConnection: () => {
        set({ interactionState: 'IDLE', tempConnection: null });
    },

    initializeGraph: () => {
        const { nodes, hasCore } = get();
        if (nodes.length === 0 && !hasCore) {
            // Spawn Source Node at origin (not screen center)
            set({
                nodes: [{
                    id: 'source-node',
                    position: { x: 0, y: 0 },
                    entity: { type: 'source' },
                    components: {
                        glyph: { id: 'source' },
                        tone: { id: 'void' },
                        xp: { hp: 0, ep: 0, mp: 0, sp: 0, np: 100 },
                        temporal: { scale: 'now' }
                    },
                    state: {
                        isSource: true,
                        isCore: false,
                        mode: 'DEEP'
                    }
                }]
            });
        }
    },

    transformSourceToCore: (id) => {
        set(state => ({
            hasCore: true,
            nodes: state.nodes.map(node => {
                if (node.id === id) {
                    return {
                        ...node,
                        entity: { type: 'core' },
                        components: {
                            ...node.components,
                            glyph: { id: 'core' }, // Base core glyph
                            tone: { id: 'base' } // Inherit base tone
                        },
                        state: {
                            ...node.state,
                            isSource: false,
                            isCore: true
                        }
                    };
                }
                return node;
            })
        }));
    },

    addNode: (position, autoConnectTo = null) => {
        const newNode = {
            id: uuidv4(),
            position,
            entity: { type: 'container' }, // Empty container
            components: {
                glyph: null, // No glyph
                tone: null, // No tone initially
                xp: { hp: 0, ep: 0, mp: 0, sp: 0, np: 0 },
                temporal: { scale: 'day' }
            },
            state: {
                mode: 'DEEP',
                lastEditedAt: Date.now(), // Timestamp for aging system
                activatedAt: Date.now() // For "joy" animation
            }
        };

        set(state => {
            const newNodes = [...state.nodes, newNode];
            let newEdges = state.edges;

            // Auto-connect if requested
            if (autoConnectTo) {
                const newEdge = {
                    id: uuidv4(),
                    source: autoConnectTo,
                    target: newNode.id,
                    type: 'mycelial'
                };
                newEdges = [...state.edges, newEdge];
            }

            return {
                nodes: newNodes,
                edges: newEdges,
                interactionState: 'IDLE',
                tempConnection: null
            };
        });

        return newNode.id;
    },

    activateNode: (id) => {
        set(state => ({
            nodes: state.nodes.map(node =>
                node.id === id
                    ? {
                        ...node,
                        state: {
                            ...node.state,
                            lastEditedAt: Date.now(),
                            activatedAt: Date.now()
                        }
                    }
                    : node
            )
        }));
    },

    updateNodePosition: (id, position) => {
        set(state => ({
            nodes: state.nodes.map(node =>
                node.id === id ? { ...node, position } : node
            )
        }));
    },

    selectNode: (id) => {
        set({ selection: [id] });
    },

    clearSelection: () => {
        set({ selection: [] });
    },

    // Node Management Actions
    cloneNode: (id) => {
        const { nodes } = get();
        const sourceNode = nodes.find(n => n.id === id);
        if (!sourceNode) return null;

        const clonedNode = {
            ...sourceNode,
            id: uuidv4(),
            position: {
                x: sourceNode.position.x + 50,
                y: sourceNode.position.y + 50
            },
            state: {
                ...sourceNode.state,
                lastEditedAt: Date.now(),
                activatedAt: Date.now()
            }
        };

        set(state => ({
            nodes: [...state.nodes, clonedNode]
        }));

        return clonedNode.id;
    },

    deleteNode: (id) => {
        const { nodes } = get();
        const node = nodes.find(n => n.id === id);

        // Cannot delete Core node
        if (node?.entity.type === 'core') {
            console.warn('⚠️ Cannot delete Core node');
            return false;
        }

        set(state => ({
            nodes: state.nodes.filter(n => n.id !== id),
            edges: state.edges.filter(e => e.source !== id && e.target !== id),
            selection: state.selection.filter(s => s !== id)
        }));

        console.log('🗑 Node deleted:', id);
        return true;
    },

    // Component Management Actions
    addComponentToNode: (nodeId, componentType, initialData = {}) => {
        set(state => ({
            nodes: state.nodes.map(node => {
                if (node.id === nodeId) {
                    const updatedComponents = { ...node.components };

                    // Set default data based on component type
                    switch (componentType) {
                        case 'glyph':
                            updatedComponents.glyph = initialData.id || { id: 'node' };
                            break;
                        case 'tone':
                            updatedComponents.tone = initialData.id || { id: 'void' };
                            break;
                        case 'xp':
                            updatedComponents.xp = initialData || { hp: 0, ep: 0, mp: 0, sp: 0, np: 0 };
                            break;
                        case 'temporal':
                            updatedComponents.temporal = initialData || { scale: 'day' };
                            break;
                        case 'process':
                            updatedComponents.process = initialData || { enabled: false };
                            break;
                        case 'ritual':
                            updatedComponents.ritual = initialData || { enabled: false };
                            break;
                        default:
                            break;
                    }

                    return {
                        ...node,
                        components: updatedComponents,
                        state: {
                            ...node.state,
                            lastEditedAt: Date.now()
                        }
                    };
                }
                return node;
            })
        }));
    },

    removeComponentFromNode: (nodeId, componentType) => {
        set(state => ({
            nodes: state.nodes.map(node => {
                if (node.id === nodeId) {
                    const updatedComponents = { ...node.components };
                    updatedComponents[componentType] = null;

                    return {
                        ...node,
                        components: updatedComponents,
                        state: {
                            ...node.state,
                            lastEditedAt: Date.now()
                        }
                    };
                }
                return node;
            })
        }));
    },

    updateNodeComponent: (nodeId, componentType, data) => {
        set(state => ({
            nodes: state.nodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        components: {
                            ...node.components,
                            [componentType]: data
                        },
                        state: {
                            ...node.state,
                            lastEditedAt: Date.now()
                        }
                    };
                }
                return node;
            })
        }));
    }
}));
