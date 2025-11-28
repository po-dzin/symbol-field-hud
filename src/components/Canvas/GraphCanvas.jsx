import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import Node from './Node';
import RadialMenu from './RadialMenu';
import { useGraphStore } from '../../store/graphStore';
import { useStateStore } from '../../store/stateStore';
import { useWindowStore } from '../../store/windowStore';

const GraphCanvas = () => {
    const containerRef = useRef(null);
    const {
        nodes,
        edges,
        tempConnection,
        interactionState,
        initializeGraph,
        addNode,
        transformSourceToCore,
        updateTempConnection,
        cancelConnection
    } = useGraphStore();
    const { mode } = useStateStore();

    // Radial Menu State
    const [radialMenu, setRadialMenu] = useState(null); // { nodeId, position }

    // Initialize Graph (Spawn Source if empty)
    useEffect(() => {
        initializeGraph();
    }, [initializeGraph]);

    // Adaptive grid color based on mode
    const gridColor = mode === 'LUMA' ? 'rgba(120, 110, 95, 0.25)' : '#5a5654';
    const gridOpacity = mode === 'LUMA' ? 1 : 0.35;
    const edgeColor = mode === 'LUMA' ? 'rgba(50, 90, 90, 0.4)' : 'rgba(117, 205, 205, 0.3)';

    // Camera System v0.37
    // Camera System v0.37
    // SELECTIVE SUBSCRIPTION: Do NOT subscribe to 'camera' state updates to prevent re-renders on drag!
    const cameraCommand = useGraphStore(state => state.cameraCommand);
    const cameraSettings = useGraphStore(state => state.cameraSettings);
    const setCameraMode = useGraphStore(state => state.setCameraMode);
    const updateCamera = useGraphStore(state => state.updateCamera);

    // Read initial camera state ONCE (non-reactive)
    const initialCameraState = useRef(useGraphStore.getState().camera).current;

    const initialX = initialCameraState.x !== null ? initialCameraState.x : (typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
    const initialY = initialCameraState.y !== null ? initialCameraState.y : (typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
    const initialScale = initialCameraState.scale !== 1 ? initialCameraState.scale : 1;

    // Use a ref to track the LOGICAL camera position, independent of animation state
    const cameraRef = useRef({ x: initialX, y: initialY, scale: initialScale });

    const [{ x, y, scale }, api] = useSpring(() => ({
        x: initialX,
        y: initialY,
        scale: initialScale,
        config: { mass: 1, tension: 170, friction: 26 }
    }));

    useEffect(() => {
        console.log('🎥 GraphCanvas MOUNTED');
        return () => console.log('🎥 GraphCanvas UNMOUNTED');
    }, []);

    // Handle Camera Commands (Focus / Pan)
    useEffect(() => {
        if (!cameraCommand) return;

        if (cameraCommand.type === 'FOCUS') {
            const node = nodes.find(n => n.id === cameraCommand.targetNodeId);
            if (node && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const cx = rect.width / 2;
                const cy = rect.height / 2;

                // Smooth focus: Keep current scale or ensure visibility?
                // For now, keep current scale to avoid jarring zooms, unless it's too small/large.
                const currentScale = cameraRef.current.scale;
                const targetScale = currentScale;

                const targetX = cx - node.position.x * targetScale;
                const targetY = cy - node.position.y * targetScale;

                // Update logical ref so next drag starts correctly
                cameraRef.current = { x: targetX, y: targetY, scale: targetScale };

                api.start({
                    x: targetX,
                    y: targetY,
                    scale: targetScale,
                    config: { mass: 1, tension: 100, friction: 20 } // Smooth ease
                });

                // Update persistent store
                updateCamera({ x: targetX, y: targetY, scale: targetScale });
            }
        } else if (cameraCommand.type === 'PAN') {
            const { x, y, scale } = cameraCommand.target;
            cameraRef.current = { x, y, scale };
            api.start({ x, y, scale });
            updateCamera({ x, y, scale });
        }

        // CRITICAL: Clear the command so it doesn't re-trigger on re-renders!
        useGraphStore.getState().stopCamera();

    }, [cameraCommand, nodes, api, updateCamera]);

    // Gesture handlers (Memoized)
    const handlers = React.useMemo(() => ({
        onDrag: ({ offset: [dx, dy], first, last }) => {
            if (interactionState === 'CONNECTING') return;

            if (first) setCameraMode('manual');

            api.start({ x: dx, y: dy, immediate: true }); // Immediate for responsive drag

            if (last) {
                updateCamera({ x: dx, y: dy });
            }
        },
        onWheel: ({ event, offset: [ds], last, first, memo }) => {
            if (first) setCameraMode('manual');

            // Zoom towards mouse pointer logic
            // memo stores [initialScale, initialX, initialY, mouseX, mouseY]
            if (!memo) {
                const rect = containerRef.current.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                memo = [scale.get(), x.get(), y.get(), mouseX, mouseY];
            }

            const [startScale, startX, startY, mx, my] = memo;

            // Calculate new scale based on wheel delta (ds is accumulated)
            // useGesture wheel offset is weird, let's use movement or calculate manually
            // Actually, let's stick to simple scaling first, but fix the 'from'

            // Simple approach: just update scale, but use current animated value for 'from'
            // To do proper "zoom to point", we need to adjust X/Y

            // Let's stick to the user's "Jump" issue first. 
            // The jump is caused by 'from' mismatch.

            const newScale = Math.max(cameraSettings.minZoom, Math.min(cameraSettings.maxZoom, ds));

            api.start({ scale: newScale });

            if (last) {
                updateCamera({ scale: newScale });
            }

            return memo;
        },
        onPinch: ({ offset: [d], last, first }) => {
            if (first) setCameraMode('manual');

            api.start({ scale: d });

            if (last) {
                updateCamera({ scale: d });
            }
        }
    }), [interactionState, api, setCameraMode, updateCamera, cameraSettings, x, y, scale]);

    // Gesture config (Memoized)
    const config = React.useMemo(() => ({
        target: containerRef,
        drag: {
            // CRITICAL FIX: Start from current ANIMATED position, not static ref
            from: () => [x.get(), y.get()],
            filterTaps: true,
            threshold: 5
        },
        wheel: {
            // Start from current scale
            from: () => [scale.get()],
            eventOptions: { passive: false },
            // Adjust scale factor
            scale: 0.005
        },
        pinch: {
            from: () => [scale.get()],
            scaleBounds: { min: cameraSettings.minZoom, max: cameraSettings.maxZoom },
            rubberband: true
        },
    }), [cameraSettings, x, y, scale]);

    useGesture(handlers, config);

    // Handle Global Mouse Move for Connection Line
    const handleMouseMove = (e) => {
        if (interactionState === 'CONNECTING') {
            const rect = containerRef.current.getBoundingClientRect();
            const currentScale = scale.get();
            const currentX = x.get();
            const currentY = y.get();

            const mouseX = (e.clientX - rect.left - currentX) / currentScale;
            const mouseY = (e.clientY - rect.top - currentY) / currentScale;

            updateTempConnection({ x: mouseX, y: mouseY });
        }
    };

    // Handle Global Mouse Up to Cancel Connection
    const handleMouseUp = () => {
        if (interactionState === 'CONNECTING') {
            cancelConnection();
        }
    };

    // Handle ESC key to close radial menu and Backspace to delete selected node
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && radialMenu) {
                setRadialMenu(null);
            }

            // Backspace to delete selected node
            if (e.key === 'Backspace' && !radialMenu) {
                const { selection, deleteNode } = useGraphStore.getState();
                if (selection.length > 0) {
                    e.preventDefault(); // Prevent browser back navigation
                    selection.forEach(nodeId => {
                        deleteNode(nodeId);
                    });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [radialMenu]);

    // Double Click to Create Node (or Single Click while Shift if connecting)
    const handleDoubleClick = (e) => {
        // Don't create on Shift+Click (that's for connections)
        if (e.shiftKey) return;

        // CANNOT create nodes without Core!
        const coreExists = nodes.some(n => n.entity.type === 'core');
        if (!coreExists) {
            console.log('❌ Cannot create nodes - Core must exist first!');
            return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const currentScale = scale.get();
        const currentX = x.get();
        let finalX = (e.clientX - rect.left - currentX) / currentScale;
        const currentY = y.get();
        let finalY = (e.clientY - rect.top - currentY) / currentScale;

        // REPULSION: If too close to Core, push node away
        if (coreNode) {
            const dx = finalX - coreNode.position.x;
            const dy = finalY - coreNode.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const minDistance = 80; // Comfortable distance from Core

            if (distance < minDistance) {
                // Push node away to minDistance
                const angle = Math.atan2(dy, dx);
                finalX = coreNode.position.x + Math.cos(angle) * minDistance;
                finalY = coreNode.position.y + Math.sin(angle) * minDistance;
                console.log('⚡ Node pushed away from Core (repulsion)');
            }
        }

        const newNodeId = addNode({ x: finalX, y: finalY });

        // Auto-open properties window for newly created node
        if (newNodeId) {
            setTimeout(() => {
                const { openWindow, windows, closeWindow } = useWindowStore.getState();

                // Singleton: Close other node-properties windows
                Object.keys(windows).forEach(winId => {
                    if (winId.startsWith('node-properties-')) {
                        closeWindow(winId);
                    }
                });

                // Open window for new node
                const windowId = `node-properties-${newNodeId}`;
                openWindow(windowId, {
                    title: 'PROPERTIES',
                    glyph: 'NODE',
                    data: { id: newNodeId }
                });
            }, 0);
        }
    };

    // Click Canvas to Create Connected Node (Shift+Click while connecting)
    const handleCanvasClick = (e) => {
        if (e.shiftKey && interactionState === 'CONNECTING' && tempConnection) {
            // CANNOT create nodes without Core!
            const coreExists = nodes.some(n => n.entity.type === 'core');
            if (!coreExists) {
                console.log('❌ Cannot create nodes - Core must exist first!');
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            const currentScale = scale.get();
            const currentX = x.get();
            const currentY = y.get();

            let finalX = (e.clientX - rect.left - currentX) / currentScale;
            let finalY = (e.clientY - rect.top - currentY) / currentScale;

            // REPULSION: If too close to Core, push node away
            if (coreNode) {
                const dx = finalX - coreNode.position.x;
                const dy = finalY - coreNode.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const minDistance = 80;

                if (distance < minDistance) {
                    const angle = Math.atan2(dy, dx);
                    finalX = coreNode.position.x + Math.cos(angle) * minDistance;
                    finalY = coreNode.position.y + Math.sin(angle) * minDistance;
                    console.log('⚡ Connected node pushed away from Core');
                }
            }

            // Create node and auto-connect to source
            addNode({ x: finalX, y: finalY }, tempConnection.sourceId);
        }
    };

    const handleNodeClick = (node) => {
        if (node.entity.type === 'source') {
            transformSourceToCore(node.id);
        }
    };

    // Off-screen Core Indicator Logic
    const [coreIndicator, setCoreIndicator] = React.useState(null);
    const coreNode = nodes.find(n => n.entity.type === 'core');

    // Network Impulses State
    const [impulses, setImpulses] = React.useState([]);

    // Send greeting signals when edge is created (2 forward, 2 backward)
    const sendGreetingSignals = (edge) => {
        if (!edge) return;

        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        // Signal 1 & 2: Source -> Target (Forward)
        setTimeout(() => {
            const impulseId = `greeting-fwd-1-${edge.id}-${Date.now()}`;
            setImpulses(prev => [...prev, { id: impulseId, edgeId: edge.id, startTime: Date.now(), type: 'greeting', fromSource: true }]);
            setTimeout(() => setImpulses(prev => prev.filter(i => i.id !== impulseId)), 2000);
        }, 100);

        setTimeout(() => {
            const impulseId = `greeting-fwd-2-${edge.id}-${Date.now()}`;
            setImpulses(prev => [...prev, { id: impulseId, edgeId: edge.id, startTime: Date.now(), type: 'greeting', fromSource: true }]);
            setTimeout(() => setImpulses(prev => prev.filter(i => i.id !== impulseId)), 2000);
        }, 400); // Quick follow-up

        // Signal 3 & 4: Target -> Source (Backward)
        setTimeout(() => {
            const impulseId = `greeting-bwd-1-${edge.id}-${Date.now()}`;
            setImpulses(prev => [...prev, { id: impulseId, edgeId: edge.id, startTime: Date.now(), type: 'greeting', fromSource: false }]);
            setTimeout(() => setImpulses(prev => prev.filter(i => i.id !== impulseId)), 2000);
        }, 1300);

        setTimeout(() => {
            const impulseId = `greeting-bwd-2-${edge.id}-${Date.now()}`;
            setImpulses(prev => [...prev, { id: impulseId, edgeId: edge.id, startTime: Date.now(), type: 'greeting', fromSource: false }]);
            setTimeout(() => setImpulses(prev => prev.filter(i => i.id !== impulseId)), 2000);
        }, 1600); // Quick follow-up
    };

    // Track edges and send greetings for new ones
    const prevEdgesRef = React.useRef([]);
    useEffect(() => {
        const newEdges = edges.filter(e => !prevEdgesRef.current.some(pe => pe.id === e.id));
        newEdges.forEach(edge => sendGreetingSignals(edge));
        prevEdgesRef.current = edges;
    }, [edges]);

    // Send signals on component changes (glyph, tone, etc.) - ONE signal per change
    const prevComponentsRef = React.useRef(new Map());

    // Initialize map on mount to prevent initial flood
    useEffect(() => {
        nodes.forEach(node => {
            if (!prevComponentsRef.current.has(node.id)) {
                prevComponentsRef.current.set(node.id, JSON.stringify(node.components));
            }
        });
    }, []);

    useEffect(() => {
        nodes.forEach(node => {
            const prevComponents = prevComponentsRef.current.get(node.id);
            const currentComponents = JSON.stringify(node.components);

            // If components changed (and we have a previous state)
            if (prevComponents && prevComponents !== currentComponents) {
                // Send signals through all edges connected to this node
                const nodeEdges = edges.filter(e => e.source === node.id || e.target === node.id);
                nodeEdges.forEach(edge => {
                    const impulseId = `change-${edge.id}-${Date.now()}`; // Unique ID per change event

                    // Check if we already sent this specific impulse recently (debounce)
                    if (impulses.some(i => i.id === impulseId)) return;

                    const fromSource = edge.source === node.id;
                    setImpulses(prev => [...prev, {
                        id: impulseId,
                        edgeId: edge.id,
                        startTime: Date.now(),
                        type: 'change',
                        fromSource
                    }]);
                    setTimeout(() => setImpulses(prev => prev.filter(i => i.id !== impulseId)), 2000);
                });
            }

            prevComponentsRef.current.set(node.id, currentComponents);
        });
    }, [nodes, edges]); // Removed impulses from dependency to avoid loops

    // Random ambient signals (30s-1min interval)
    useEffect(() => {
        if (!coreNode || edges.length === 0) return;

        const triggerRandomSignal = () => {
            const randomEdge = edges[Math.floor(Math.random() * edges.length)];
            const impulseId = `random-${Date.now()}`;
            setImpulses(prev => [...prev, {
                id: impulseId,
                edgeId: randomEdge.id,
                startTime: Date.now(),
                type: 'ambient',
                fromSource: Math.random() > 0.5 // Random direction
            }]);
            setTimeout(() => setImpulses(prev => prev.filter(i => i.id !== impulseId)), 2000);
        };

        const scheduleNext = () => {
            const delay = 30000 + Math.random() * 30000; // 30-60s
            setTimeout(() => {
                triggerRandomSignal();
                scheduleNext();
            }, delay);
        };

        scheduleNext();
    }, [coreNode, edges.length]);

    // Update Off-screen Indicator
    useEffect(() => {
        if (!coreNode || !containerRef.current) {
            setCoreIndicator(null);
            return;
        }

        const updateIndicator = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const currentScale = scale.get();
            const currentX = x.get();
            const currentY = y.get();

            // Core position in screen coordinates
            const screenX = coreNode.position.x * currentScale + currentX;
            const screenY = coreNode.position.y * currentScale + currentY;

            // Check if off-screen (with some padding)
            const padding = 50;
            const isOffScreen =
                screenX < -padding ||
                screenX > rect.width + padding ||
                screenY < -padding ||
                screenY > rect.height + padding;

            if (isOffScreen) {
                // Calculate direction and position on edge
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const dx = screenX - cx;
                const dy = screenY - cy;
                const angle = Math.atan2(dy, dx);

                // Intersect with screen bounds
                // Simple clamping for now (can be improved for corners)
                let indicatorX = cx + Math.cos(angle) * (Math.min(cx, cy) - 40);
                let indicatorY = cy + Math.sin(angle) * (Math.min(cx, cy) - 40);

                // Better rectangular intersection
                const tan = Math.tan(angle);
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Intersect vertical edges
                    const sign = Math.sign(dx);
                    indicatorX = cx + sign * (cx - 40);
                    indicatorY = cy + sign * (cx - 40) * tan;
                    // Clamp Y
                    if (Math.abs(indicatorY - cy) > cy - 40) {
                        indicatorY = cy + Math.sign(dy) * (cy - 40);
                        indicatorX = cx + Math.sign(dy) * (cy - 40) / tan;
                    }
                } else {
                    // Intersect horizontal edges
                    const sign = Math.sign(dy);
                    indicatorY = cy + sign * (cy - 40);
                    indicatorX = cx + sign * (cy - 40) / tan;
                    // Clamp X
                    if (Math.abs(indicatorX - cx) > cx - 40) {
                        indicatorX = cx + Math.sign(dx) * (cx - 40);
                        indicatorY = cy + Math.sign(dx) * (cx - 40) * tan;
                    }
                }

                setCoreIndicator({ x: indicatorX, y: indicatorY, angle: angle * (180 / Math.PI) });
            } else {
                setCoreIndicator(null);
            }
        };

        // Use interval instead of rAF to avoid constant updates
        const interval = setInterval(updateIndicator, 100); // Update 10 times per second
        return () => clearInterval(interval);

    }, [coreNode]); // Only depend on coreNode, not animated values

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-transparent relative"
            onDoubleClick={handleDoubleClick}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: gridOpacity
                }}
            />

            <animated.div
                className="w-full h-full transform-gpu origin-top-left"
                style={{ x, y, scale }}
            >
                {/* Edges Layer */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
                    {/* Existing Edges */}
                    {edges.map(edge => {
                        const sourceNode = nodes.find(n => n.id === edge.source);
                        const targetNode = nodes.find(n => n.id === edge.target);
                        if (!sourceNode || !targetNode) return null;

                        // Calculate edge points from node boundaries, not centers
                        const getNodeRadius = (node) => {
                            if (node.entity.type === 'core') return 64; // Core ring outer radius (128px diameter / 2)
                            if (node.entity.type === 'source') return 32; // Source w-16 = 64px diameter / 2 (was 24)
                            return 32; // Container w-16 = 64px diameter / 2
                        };

                        const dx = targetNode.position.x - sourceNode.position.x;
                        const dy = targetNode.position.y - sourceNode.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance === 0) return null;

                        const sourceRadius = getNodeRadius(sourceNode);
                        const targetRadius = getNodeRadius(targetNode);

                        // Start point: edge of source node
                        const x1 = sourceNode.position.x + (dx / distance) * sourceRadius;
                        const y1 = sourceNode.position.y + (dy / distance) * sourceRadius;

                        // End point: edge of target node
                        const x2 = targetNode.position.x - (dx / distance) * targetRadius;
                        const y2 = targetNode.position.y - (dy / distance) * targetRadius;

                        return (
                            <g key={edge.id}>
                                <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={edgeColor}
                                    strokeWidth="1.5"
                                    strokeDasharray="5,5"
                                    className="opacity-60"
                                />
                                {/* Impulse Animation */}
                                {impulses.filter(i => i.edgeId === edge.id).map(impulse => {
                                    // Calculate start/end points respecting node radius (same as edge lines)
                                    // This makes signals appear to "merge" with the node spheres
                                    const startNode = impulse.fromSource ? sourceNode : targetNode;
                                    const endNode = impulse.fromSource ? targetNode : sourceNode;

                                    const startRadius = getNodeRadius(startNode);
                                    const endRadius = getNodeRadius(endNode);

                                    // Recalculate vector for this specific direction
                                    const idx = endNode.position.x - startNode.position.x;
                                    const idy = endNode.position.y - startNode.position.y;
                                    const idist = Math.sqrt(idx * idx + idy * idy);

                                    if (idist === 0) return null;

                                    const startX = startNode.position.x + (idx / idist) * startRadius;
                                    const startY = startNode.position.y + (idy / idist) * startRadius;
                                    const endX = endNode.position.x - (idx / idist) * endRadius;
                                    const endY = endNode.position.y - (idy / idist) * endRadius;

                                    return (
                                        <circle
                                            key={impulse.id}
                                            r="3"
                                            fill="#fff"
                                            className="animate-impulse"
                                            style={{
                                                offsetPath: `path("M${startX},${startY} L${endX},${endY}")`,
                                                animation: 'move-and-dissolve 1s linear forwards'
                                            }}
                                        />
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* Temp Connection Line */}
                    {interactionState === 'CONNECTING' && tempConnection && (
                        <line
                            x1={tempConnection.sourcePos.x}
                            y1={tempConnection.sourcePos.y}
                            x2={tempConnection.currentPos.x}
                            y2={tempConnection.currentPos.y}
                            stroke={edgeColor}
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="animate-pulse"
                        />
                    )}
                </svg>

                {/* Nodes Layer */}
                {nodes.map(node => (
                    <Node
                        key={node.id}
                        node={node}
                        onClick={handleNodeClick}
                        onRightClick={(nodeId, position) => {
                            setRadialMenu({ nodeId, position });
                        }}
                    />
                ))}
            </animated.div>

            {/* Off-screen Core Indicator */}
            {coreIndicator && (
                <div
                    className="absolute w-20 h-20 flex items-center justify-center pointer-events-none"
                    style={{
                        left: coreIndicator.x,
                        top: coreIndicator.y,
                        transform: `translate(-50%, -50%) rotate(${coreIndicator.angle}deg)`,
                        zIndex: 1000
                    }}
                >
                    {/* Arrow/Glow */}
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-white/50 blur-[2px]" />
                    <div className="absolute w-full h-full rounded-full animate-pulse-glow"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                            boxShadow: '0 0 20px rgba(255,255,255,0.3)'
                        }}
                    />
                </div>
            )}

            {/* Canvas Status */}
            <div className="absolute bottom-6 right-6 text-xs font-mono text-os-text-meta opacity-50 pointer-events-none">
                GRAPH MODE // v0.3
                <br />
                NODES: {nodes.length} | EDGES: {edges.length}
                <br />
                ZOOM: <animated.span>{scale.to(s => s.toFixed(2))}</animated.span>
                <br />
                {interactionState === 'CONNECTING' && <span className="text-os-cyan animate-pulse">CONNECTING...</span>}
            </div>

            {/* Radial Menu */}
            {radialMenu && (
                <RadialMenu
                    nodeId={radialMenu.nodeId}
                    position={radialMenu.position}
                    onClose={() => setRadialMenu(null)}
                />
            )}
        </div>
    );
};

export default GraphCanvas;
