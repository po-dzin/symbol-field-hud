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

const MainLayout = () => {
    const { windows, activeTab, resetWindows } = useWindowStore();

    useEffect(() => {
        resetWindows();
    }, []);

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
                            <WindowFrame id="agent-main" title="Agent" glyph="𓂀" initialPosition={{ x: 0, y: 0 }} isStatic>
                                <AgentWindow />
                            </WindowFrame>
                        </div>
                    </div>
                );
            case 'Log':
                return (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto w-[600px] h-[400px]">
                            <WindowFrame id="log-main" title="System Log" glyph="≡" initialPosition={{ x: 0, y: 0 }} isStatic>
                                <div className="text-os-text-secondary p-4 font-mono text-sm">
                                    <div className="text-os-cyan mb-2">SYSTEM ONLINE // V.0.2.0</div>
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
                            <WindowFrame id="settings-main" title="Settings" glyph="∷" initialPosition={{ x: 0, y: 0 }} isStatic>
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
                                </div>
                            </WindowFrame>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative w-screen h-screen bg-os-dark overflow-hidden flex">
            {/* Nav Rail - Left */}
            <NavRail />

            {/* Main Content Area */}
            <main className="flex-1 relative h-full">
                {/* Layer 1: The Infinite Canvas (Always Visible) */}
                <div className="absolute inset-0 z-0">
                    <GraphCanvas />
                </div>

                {/* Layer 2: Tab Content Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {renderTabContent()}
                </div>

                {/* Layer 3: HUD Specific Panels */}
                <StatePanel />
                {activeTab === 'HUD' && <XpSummaryPanel />}
                <TimeSpiral />
                <CoreWidget />

                {/* Layer 4: Floating Windows (Legacy/Detail support) - REMOVED */}
                {/* The window-layer div has been removed as part of the v0.2 refactor. 
                    DetailWindow and floating window logic are no longer used in MainLayout. 
                */}

                {/* Dock - Bottom/Right (Removed/Replaced by TimeSpiral) */}
                {/* <Dock /> */}
            </main>
        </div>
    );
};

export default MainLayout;
