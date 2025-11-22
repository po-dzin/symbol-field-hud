import React from 'react';
import { useWindowStore } from '../../store/windowStore';

const StatePanel = () => {
    const { activeTab, coreMode, setCoreMode } = useWindowStore();
    const isPrism = coreMode === 'PRISM';

    if (activeTab !== 'HUD') return null;

    return (
        <div className="absolute top-6 left-24 flex flex-col gap-4 pointer-events-auto z-30">
            {/* Main State Card */}
            <div className="bg-os-glass-bg backdrop-blur-md border border-os-glass-border rounded-lg p-4 shadow-lg w-64">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-os-text-secondary tracking-widest uppercase">
                        System State
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isPrism ? 'bg-os-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'bg-os-text-meta'}`}></div>
                </div>

                {/* Mode Indicator */}
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border transition-all duration-500
                        ${isPrism
                            ? 'bg-gradient-to-br from-os-cyan/20 to-os-violet/20 border-os-cyan/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'bg-black/40 border-os-text-meta/30 text-os-text-meta'
                        }
                    `}>
                        {isPrism ? '🌈' : '🕳'}
                    </div>
                    <div>
                        <div className="text-xs text-os-text-secondary uppercase tracking-wider mb-1">Current Mode</div>
                        <div className={`text-lg font-bold tracking-wide ${isPrism ? 'text-white' : 'text-os-text-meta'}`}>
                            {coreMode}
                        </div>
                    </div>
                </div>

                {/* Tone / Glyph Info */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded p-2 border border-white/5">
                        <div className="text-[10px] text-os-text-secondary uppercase mb-1">Tone</div>
                        <div className="text-sm font-mono text-os-cyan truncate">
                            {isPrism ? 'Crystalline' : 'Abyssal'}
                        </div>
                    </div>
                    <div className="bg-white/5 rounded p-2 border border-white/5">
                        <div className="text-[10px] text-os-text-secondary uppercase mb-1">Glyph</div>
                        <div className="text-sm font-mono text-os-violet">
                            {isPrism ? '✡︎' : '⌀'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatePanel;
