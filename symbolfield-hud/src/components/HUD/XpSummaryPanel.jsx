import React from 'react';
import { useWindowStore } from '../../store/windowStore';

const XpSummaryPanel = () => {
    const { xpState } = useWindowStore();
    const { hp, ep, mp, sp, np } = xpState;

    return (
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-auto z-30">
            {/* Panel Container */}
            <div className="bg-os-glass-bg backdrop-blur-md border border-os-glass-border rounded-lg p-4 shadow-lg w-48">
                <div className="text-xs font-bold text-os-text-secondary mb-3 tracking-widest uppercase border-b border-white/5 pb-2">
                    XP Summary
                </div>

                <div className="space-y-3">
                    {/* SP - Silver/White */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-os-text-primary">🌬️</span>
                            <span className="text-xs text-os-text-secondary font-mono">SP</span>
                        </div>
                        <span className="text-sm font-mono text-os-text-primary">{sp}</span>
                    </div>

                    {/* MP - Red/Orange */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-os-amber">🔥</span>
                            <span className="text-xs text-os-text-secondary font-mono">MP</span>
                        </div>
                        <span className="text-sm font-mono text-os-amber">{mp}</span>
                    </div>

                    {/* EP - Cyan */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-os-cyan">💧</span>
                            <span className="text-xs text-os-text-secondary font-mono">EP</span>
                        </div>
                        <span className="text-sm font-mono text-os-cyan">{ep}</span>
                    </div>

                    {/* HP - Green */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-os-green">🪨</span>
                            <span className="text-xs text-os-text-secondary font-mono">HP</span>
                        </div>
                        <span className="text-sm font-mono text-os-green">{hp}</span>
                    </div>

                    {/* NP - Rainbow/Black */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="text-os-violet">🌈</span>
                            <span className="text-xs text-os-text-secondary font-mono">NP</span>
                        </div>
                        <span className="text-sm font-mono text-transparent bg-clip-text bg-gradient-to-r from-os-cyan via-os-violet to-os-amber">
                            {np}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default XpSummaryPanel;
