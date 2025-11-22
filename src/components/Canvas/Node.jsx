import React from 'react';
import { clsx } from 'clsx';
import { useStateStore } from '../../store/stateStore';

const Node = ({ node, onClick }) => {
    const { type, glyph, title, x, y } = node;
    const { mode } = useStateStore();

    // Shape & Style logic
    const isCore = type === 'core';
    const isModule = type === 'module';
    const isSkill = type === 'skill';

    // Enhanced glow for DEEP/FLOW
    const glowIntensity = mode === 'DEEP' ? 0.6 : mode === 'FLOW' ? 0.45 : 0.3;
    const glowRadius = mode === 'DEEP' ? '20px' : mode === 'FLOW' ? '16px' : '12px';

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: x, top: y }}
            onClick={() => onClick && onClick(node)}
        >
            {/* Enhanced Glow Effect */}
            <div
                className={clsx(
                    "absolute inset-0 rounded-full transition-all duration-500",
                    isCore ? "bg-os-cyan" : "bg-os-violet"
                )}
                style={{
                    filter: `blur(${glowRadius})`,
                    opacity: 0,
                    transform: 'scale(1)',
                    transition: 'opacity 0.5s, transform 0.3s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = glowIntensity;
                    e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            />

            {/* Node Body - Sharper borders */}
            <div className={clsx(
                "relative flex items-center justify-center backdrop-blur-md transition-all duration-300",
                // Shapes with sharper borders
                isCore && "w-24 h-24 rounded-full bg-os-cyan-dim animate-pulse-glow",
                isModule && "h-12 px-4 rounded-full bg-os-glass-bg hover:bg-os-glass-bg/80",
                isSkill && "w-10 h-10 rounded-full bg-os-glass-bg"
            )}
                style={isCore ? {
                    border: '2px solid rgba(117, 205, 205, 0.9)',
                    boxShadow: mode === 'DEEP' ? '0 0 25px rgba(117, 205, 205, 0.8)' :
                        mode === 'FLOW' ? '0 0 20px rgba(117, 205, 205, 0.6)' :
                            '0 0 15px rgba(117, 205, 205, 0.4)'
                } : isModule ? {
                    border: '1.5px solid rgba(180, 200, 220, 0.5)',
                    boxShadow: mode === 'DEEP' ? '0 0 15px rgba(180, 200, 220, 0.35)' :
                        mode === 'FLOW' ? '0 0 12px rgba(180, 200, 220, 0.28)' :
                            '0 0 10px rgba(180, 200, 220, 0.2)'
                } : {
                    border: '1.5px solid rgba(180, 200, 220, 0.45)',
                    boxShadow: mode === 'DEEP' ? '0 0 12px rgba(142, 117, 205, 0.4)' :
                        mode === 'FLOW' ? '0 0 10px rgba(142, 117, 205, 0.32)' :
                            '0 0 8px rgba(142, 117, 205, 0.25)'
                }}
            >

                {/* Glyph */}
                <span className={clsx(
                    "font-light",
                    isCore ? "text-3xl text-os-cyan animate-pulse" : "text-xl text-os-text-primary"
                )}>
                    {glyph}
                </span>

                {/* Title (Only for modules/core usually, or on hover for skills) */}
                {(isModule || isCore) && (
                    <span className={clsx(
                        "ml-3 text-xs font-medium tracking-widest uppercase text-os-text-secondary group-hover:text-os-text-primary transition-colors",
                        isCore && "hidden" // Core usually just glyph, or maybe title below
                    )}>
                        {title}
                    </span>
                )}
            </div>

            {/* External Title for Core/Skills */}
            {(isCore || isSkill) && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-os-text-secondary bg-os-dark/80 px-2 py-1 rounded">
                        {title}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Node;
