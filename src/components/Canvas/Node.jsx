import React from 'react';
import { clsx } from 'clsx';

const Node = ({ node, onClick }) => {
    const { type, glyph, title, x, y } = node;

    // Shape & Style logic
    const isCore = type === 'core';
    const isModule = type === 'module';
    const isSkill = type === 'skill';

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: x, top: y }}
            onClick={() => onClick && onClick(node)}
        >
            {/* Glow Effect */}
            <div className={clsx(
                "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                isCore ? "bg-os-cyan" : "bg-os-violet"
            )} />

            {/* Node Body */}
            <div className={clsx(
                "relative flex items-center justify-center border backdrop-blur-md transition-all duration-300",
                // Shapes
                isCore && "w-24 h-24 rounded-full border-os-cyan/50 bg-os-cyan-dim animate-pulse-glow",
                isModule && "h-12 px-4 rounded-full border-os-glass-border bg-os-glass-bg hover:border-os-cyan/50 hover:bg-os-glass-bg/80",
                isSkill && "w-10 h-10 rounded-full border-os-glass-border bg-os-glass-bg hover:border-os-violet/50"
            )}>

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
