
import { create } from 'zustand';

export const useWindowStore = create((set) => ({
    windows: {}, // { [id]: { id, title, glyph, isOpen, isMinimized, zIndex, position } }
    activeWindowId: null,
    nextZIndex: 100,
    dockZIndex: 50, // Initial dock z-index

    focusDock: () => set((state) => ({
        dockZIndex: state.nextZIndex,
        nextZIndex: state.nextZIndex + 1,
        activeWindowId: null // Optional: deselect window when dock is focused? Or keep active? User said "click dock -> above window".
    })),

    // Spec v0.2 State
    activeTab: 'HUD', // HUD, Graph, Log, Agent, Settings
    xpState: {
        hp: 50, // 🪨
        ep: 50, // 💧
        mp: 50, // 🔥
        sp: 50, // 🌬️
        np: 100 // 🕳/🌈
    },
    timeSpiralState: {
        expanded: false,
        breathPhase: 'inhale' // inhale, hold, exhale
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    updateXP: (type, value) => set((state) => ({
        xpState: { ...state.xpState, [type]: value }
    })),
    toggleTimeSpiral: () => set((state) => ({
        timeSpiralState: { ...state.timeSpiralState, expanded: !state.timeSpiralState.expanded }
    })),

    toggleWindowPin: (id) => set((state) => ({
        windows: {
            ...state.windows,
            [id]: {
                ...state.windows[id],
                isPinned: !state.windows[id].isPinned
            }
        }
    })),

    isCoreMinimized: false,
    coreStatus: 'SOURCE', // 'SOURCE' | 'EXIST'

    toggleCoreMinimize: () => set((state) => ({ isCoreMinimized: !state.isCoreMinimized })),
    setCoreStatus: (status) => set({ coreStatus: status }),

    // Legacy support (mapped to status)
    deleteCore: () => set({ coreStatus: 'SOURCE' }),
    createCore: () => set({ coreStatus: 'EXIST' }),

    openWindow: (id, config) => set((state) => {
        if (state.windows[id]) {
            // If already open, just focus it
            return {
                activeWindowId: id,
                windows: {
                    ...state.windows,
                    [id]: { ...state.windows[id], isOpen: true, isMinimized: false, zIndex: state.nextZIndex }
                },
                nextZIndex: state.nextZIndex + 1
            };
        }

        // Calculate cascade position
        const openCount = Object.values(state.windows).filter(w => w.isOpen).length;
        const cascadeOffset = openCount * 30;
        const defaultPos = { x: 100 + cascadeOffset, y: 100 + cascadeOffset };

        // Open new
        return {
            activeWindowId: id,
            windows: {
                ...state.windows,
                [id]: {
                    id,
                    isOpen: true,
                    isMinimized: false,
                    zIndex: state.nextZIndex,
                    position: config.position || defaultPos,
                    ...config
                }
            },
            nextZIndex: state.nextZIndex + 1
        };
    }),

    closeWindow: (id) => set((state) => ({
        windows: {
            ...state.windows,
            [id]: { ...state.windows[id], isOpen: false }
        }
    })),

    minimizeWindow: (id) => set((state) => ({
        windows: {
            ...state.windows,
            [id]: { ...state.windows[id], isMinimized: true }
        },
        activeWindowId: null
    })),

    focusWindow: (id) => set((state) => ({
        activeWindowId: id,
        windows: {
            ...state.windows,
            [id]: { ...state.windows[id], zIndex: state.nextZIndex }
        },
        nextZIndex: state.nextZIndex + 1
    })),

    updateWindowPosition: (id, position) => set((state) => ({
        windows: {
            ...state.windows,
            [id]: { ...state.windows[id], position }
        }
    })),

    resetWindows: () => set({ windows: {}, activeWindowId: null }),
}));
