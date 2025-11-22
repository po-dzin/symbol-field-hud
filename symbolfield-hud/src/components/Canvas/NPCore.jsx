import React from 'react';
import { useWindowStore } from '../../store/windowStore';

const NPCore = () => {
    const { coreMode, xpState, isCoreMinimized, toggleCoreMinimize, timeSpiralState, deleteCore } = useWindowStore();
    const { np } = xpState;
    const { breathPhase } = timeSpiralState; // We might need actual breath value here, but for now let's use CSS animation

    // If minimized, we might still show a ghost or nothing. Let's hide it for now as it moves to HUD.
    if (isCoreMinimized) return null;

    // Visual styles based on mode
    const isPrism = coreMode === 'PRISM';

    // Dynamic styles based on NP value
    const pulseSpeed = Math.max(1, 5 - (np / 25)); // Faster pulse with higher NP

    return (
        <div className="relative flex items-center justify-center w-32 h-32 group">
            {/* Delete Button (Visible on Hover) */}
            <button
                onClick={(e) => { e.stopPropagation(); deleteCore(); }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-os-text-secondary opacity-0 group-hover:opacity-100 hover:text-os-red transition-all z-50 uppercase tracking-wider"
            >
                Delete Core
            </button>

            {/* Minimize Button (Visible on Hover) */}
            <button
                onClick={toggleCoreMinimize}
                className="absolute -top-4 right-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
                <span className="text-[10px] text-white">↘</span>
            </button>

            {/* Outer Bloom */}
            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000
                ${isPrism
                    ? 'bg-gradient-to-tr from-os-cyan via-os-violet to-os-amber opacity-40'
                    : 'bg-black shadow-[inset_0_0_40px_rgba(0,0,0,1)] opacity-80'
                }
            `} />

            {/* Core Shape */}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-1000
                ${isPrism
                    ? 'bg-white/10 backdrop-blur-md border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                    : 'bg-black border border-os-glass-border shadow-[inset_0_0_20px_rgba(0,0,0,1)]'
                }
            `}>
                {/* Inner Glyph */}
                <span className={`text-2xl transition-colors duration-500
                    ${isPrism ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-os-text-meta'}
                `}>
                    {isPrism ? '🌈' : '🕳'}
                </span>

                {/* Rotating Ring (Prism only) */}
                {isPrism && (
                    <div className="absolute inset-[-4px] rounded-full border border-white/20 animate-[spin_10s_linear_infinite]" />
                )}

                {/* Collapse Effect (Void only) */}
                {!isPrism && (
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] animate-pulse" />
                )}
            </div>

            {/* Label */}
            <div className="absolute -bottom-8 text-xs font-medium tracking-widest text-os-text-secondary opacity-60">
                CORE // {isPrism ? 'PRISM' : 'VOID'}
            </div>
        </div>
    );
};

export default NPCore;
