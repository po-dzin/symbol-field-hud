import React, { useEffect } from 'react';
import NavRail from '../HUD/NavRail';
// import Dock from '../HUD/Dock'; // Replaced by TimeSpiral
import GraphCanvas from '../Canvas/GraphCanvas';
import WindowFrame from '../HUD/WindowFrame';
import AgentWindow from '../Modules/AgentWindow';

import StatePanel from '../HUD/StatePanel'; // Import StatePanel
import TimeSpiral from '../HUD/TimeSpiral'; // Import TimeSpiral
import CoreWidget from '../HUD/CoreWidget'; // Import CoreWidget
import XpSummaryPanel from '../HUD/XpSummaryPanel'; // Import XpSummaryPanel
import { useWindowStore } from '../../store/windowStore';
import { useStateStore } from '../../store/stateStore';

const MainLayout = () => {
    const { windows, activeTab, resetWindows } = useWindowStore();
    const { mode } = useStateStore();

    useEffect(() => {
        resetWindows();
    }, []);

    // Dynamic Background based on Mode
    const getBackgroundStyle = () => {
        switch (mode) {
            case 'DEEP':
                return 'bg-[#050505]'; // Pure Void
            case 'FLOW':
                return 'bg-gradient-to-br from-[#1c1d21] via-[#151619] to-[#0e0f11]'; // Crystalline Neutral
            case 'LUMA':
                return 'bg-[#e9ddc6]'; // Warm Light Beige (L~86)
            default:
                return 'bg-os-dark';
        }
    };

    // Helper to render content based on activeTab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'HUD':
                return null; // HUD overlay is always on top, canvas is visible
            case 'Graph':
                return null; // Just the canvas
            case 'Agent':
                return (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto w-[800px] h-[600px]">
                            <WindowFrame
                                id="agent-main"
                                title="Agent"
                                glyph="𓂀"
                                initialPosition={{ x: 0, y: 0 }}
                                isStatic
                                style={{ zIndex: windows['agent-main']?.zIndex }}
                            >
                                <AgentWindow />
                            </WindowFrame>
                        </div>
                    </div>
                );
            case 'Log':
                return (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto w-[600px] h-[400px]">
                            <WindowFrame
                                id="log-main"
                                title="System Log"
                                glyph="≡"
                                initialPosition={{ x: 0, y: 0 }}
                                isStatic
                                style={{ zIndex: windows['log-main']?.zIndex }}
                            >
                                <div className="text-os-text-secondary p-4 font-mono text-sm">
                                    <div className="text-os-cyan mb-2">SYSTEM ONLINE // V.0.3.0</div>
                                    <div className="opacity-70">Initializing Core... OK</div>
                                    <div className="opacity-70">Loading Modules... OK</div>
                                    <div className="opacity-70">Connecting to Neural Net... OK</div>
                                    <div className="mt-4 text-os-text-primary">Waiting for input...</div>
                                </div>
                            </WindowFrame>
                        </div>
                    </div>
                );
            case 'Settings':
                return (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto w-[500px] h-[600px]">
                            <WindowFrame
                                id="settings-main"
                                title="Settings"
                                glyph="∷"
                                initialPosition={{ x: 0, y: 0 }}
                                isStatic
                                style={{ zIndex: windows['settings-main']?.zIndex }}
                            >
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-os-text-primary font-bold mb-2">Visuals</h3>
                                        <div className="flex items-center justify-between text-os-text-secondary">
                                            <span>Glass Blur</span>
                                            <span className="text-os-cyan">High</span>
                                        </div>
                                        <div className="flex items-center justify-between text-os-text-secondary mt-2">
                                            <span>Animations</span>
                                            <span className="text-os-cyan">On</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-os-text-primary font-bold mb-2">Audio</h3>
                                        <div className="flex items-center justify-between text-os-text-secondary">
                                            <span>Ambience</span>
                                            <span className="text-os-cyan">50%</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-os-glass-border">
                                        <h3 className="text-os-text-primary font-bold mb-2">Experimental</h3>
                                        <div className="flex items-center justify-between text-os-text-secondary mb-3">
                                            <span>Meta-Harmony Mode</span>
                                            <button
                                                onClick={() => useStateStore.getState().setMetaHarmony(!useStateStore.getState().metaHarmony)}
                                                className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${useStateStore.getState().metaHarmony ? 'bg-os-cyan' : 'bg-os-glass-border'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${useStateStore.getState().metaHarmony ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-os-text-secondary">
                                            <span>B&W UI Mode</span>
                                            <button
                                                onClick={() => useStateStore.getState().setGrayscale(!useStateStore.getState().isGrayscale)}
                                                className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${useStateStore.getState().isGrayscale ? 'bg-white' : 'bg-os-glass-border'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all duration-300 ${useStateStore.getState().isGrayscale ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </WindowFrame>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const { isGrayscale } = useStateStore();

    return (
        <div className={`relative w-screen h-screen overflow-hidden flex transition-colors duration-1000 ${getBackgroundStyle()} ${mode === 'LUMA' ? 'mode-luma' : ''} ${mode === 'FLOW' ? 'mode-flow' : ''}`}
            style={{ filter: isGrayscale ? 'grayscale(100%)' : 'none' }}
        >
            {/* Nav Rail - Left (Now Dock) */}
            <NavRail />

            {/* Main Content Area */}
            <main className="flex-1 relative h-full">
                {/* Layer 1: The Infinite Canvas (Always Visible) */}
                <div className={`absolute inset-0 z-0 ${mode === 'LUMA' ? 'opacity-100 mix-blend-normal' : 'opacity-50 mix-blend-screen'}`}>
                    <GraphCanvas />
                </div>

                {/* Layer 2: Tab Content Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {renderTabContent()}
                </div>

                {/* Layer 3: HUD Specific Panels */}
                <StatePanel />
                {activeTab === 'HUD' && <XpSummaryPanel />}
                <TimeSpiral />
                <CoreWidget />
            </main>
        </div>
    );
};

export default MainLayout;
