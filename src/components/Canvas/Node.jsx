import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useStateStore, TONES } from '../../store/stateStore';
import { useGraphStore } from '../../store/graphStore';
import { useWindowStore } from '../../store/windowStore';

const Node = ({ node, onClick, onRightClick }) => {
    const { entity, components, state } = node;
    const { mode } = useStateStore();
    const { startConnection, endConnection, transformSourceToCore, focusCameraOn } = useGraphStore();
    const { openWindow } = useWindowStore();

    // Force re-render every 10 seconds for aging animation
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate(n => n + 1);
        }, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Resolve Tone
    const toneId = components.tone?.id;
    const { toneId: globalToneId } = useStateStore();

    // Color Logic:
    let activeColor;
    if (entity.type === 'source') {
        // Neutral Stone Gray for Source
        activeColor = mode === 'LUMA' ? '#a8a29e' : '#78716c'; // Warm stone gray
    } else if (!toneId || toneId === 'void') {
        activeColor = mode === 'LUMA' ? '#a0a0a0' : '#4a4a4a'; // Gray for void
    } else if (toneId === 'base') {
        const globalTone = TONES.find(t => t.id === globalToneId) || TONES[0];
        activeColor = mode === 'LUMA' ? globalTone.lumaColor : globalTone.color;
    } else {
        const tone = TONES.find(t => t.id === toneId) || TONES[0];
        activeColor = mode === 'LUMA' ? tone.lumaColor : tone.color;
    }

    // Resolve Glyph
    const glyphId = components.glyph?.id;
    const glyphChar = getGlyphChar(glyphId);

    // Node Types
    const isSource = entity.type === 'source';
    const isCore = entity.type === 'core';
    const isContainer = entity.type === 'container';
    const isVoid = entity.type === 'void'; // Legacy/Fallback

    // Visual Config
    // Core: Small seed (w-24) + LARGE outer ring
    // Container: base size w-16
    const size = isCore ? 'w-24 h-24' : isSource ? 'w-12 h-12' : 'w-16 h-16';
    const fontSize = isCore ? 'text-3xl' : isSource ? 'text-[0px]' : 'text-xl';

    // Hex to RGB for rgba usage
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };
    const accentRGB = hexToRgb(activeColor);

    const handleMouseDown = (e) => {
        if (e.shiftKey) {
            e.stopPropagation();
            startConnection(node.id, node.position);
        }
    };

    const handleMouseUp = (e) => {
        endConnection(node.id);
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (isSource) {
            transformSourceToCore(node.id);
        }
        focusCameraOn(node.id);
    };

    const handleClick = (e) => {
        e.stopPropagation();

        // Connection Logic (Shift+Click or Ctrl+Click)
        if (e.shiftKey || e.ctrlKey) {
            const { interactionState, tempConnection } = useGraphStore.getState();

            if (interactionState === 'CONNECTING' && tempConnection?.sourceId !== node.id) {
                // Complete connection
                endConnection(node.id);
            } else {
                // Start connection
                startConnection(node.id, node.position);
            }
            return;
        }

        // Activate node (refresh timestamp, trigger joy)
        const { activateNode } = useGraphStore.getState();
        activateNode(node.id);

        // Singleton Pattern: Close all other node-properties windows
        const { windows, closeWindow } = useWindowStore.getState();
        Object.keys(windows).forEach(winId => {
            if (winId.startsWith('node-properties-') && winId !== `node-properties-${node.id}`) {
                closeWindow(winId);
            }
        });

        // Open Properties Window with Unique ID
        const windowId = `node-properties-${node.id}`;
        openWindow(windowId, {
            title: 'PROPERTIES',
            glyph: glyphChar || (isSource ? 'SOURCE' : 'NODE'),
            data: { id: node.id }
        });
        onClick && onClick(node);
    };

    // Check if properties window is open for this node
    const { windows } = useWindowStore();
    const isWindowOpen = windows[`node-properties-${node.id}`]?.isOpen;

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get screen position for radial menu
        const screenX = e.clientX;
        const screenY = e.clientY;

        onRightClick && onRightClick(node.id, { x: screenX, y: screenY });
    };

    // Aging System
    const now = Date.now();
    const lastEditedAt = node.state?.lastEditedAt || now;
    const activatedAt = node.state?.activatedAt || now;
    const ageMs = now - lastEditedAt;
    const timeSinceActivation = now - activatedAt;

    // Age in minutes
    const ageMinutes = ageMs / (1000 * 60);

    // Aging factors (0 = fresh, 1 = very old)
    // Starts fading after 5 minutes, fully faded after 60 minutes
    const ageFactor = Math.min(1, Math.max(0, (ageMinutes - 5) / 55));

    // Brightness: 1.0 (fresh, BRIGHT like panels) -> 0.4 (old, decayed)
    const brightnessFactor = 1.0 - (ageFactor * 0.6);

    // Size: 1.0 (fresh) -> 0.7 (old)
    const sizeFactor = 1.0 - (ageFactor * 0.3);

    // Blur: 0px (fresh) -> 4px (old)
    const blurAmount = ageFactor * 4;

    // Joy animation (first 60 seconds after activation)
    const isJoyful = timeSinceActivation < 60000; // 1 minute
    const joyIntensity = Math.max(0, 1 - (timeSinceActivation / 60000));

    // 2.71D Glassy Liquid Pointcloud Crystal Style (MORE BRIGHT)
    const crystalStyle = {
        background: `radial-gradient(circle at 35% 35%, 
            rgba(255, 255, 255, ${1.0 * brightnessFactor}) 0%, 
            rgba(255, 255, 255, ${0.6 * brightnessFactor}) 25%, 
            rgba(${accentRGB}, ${0.3 * brightnessFactor}) 50%, 
            rgba(0, 0, 0, 0.7) 100%)`,
        boxShadow: `
            inset -8px -8px 30px rgba(0,0,0,0.6),
            inset 4px 4px 20px rgba(255,255,255,${0.7 * brightnessFactor}),
            0 0 ${40 * brightnessFactor}px rgba(${accentRGB}, ${0.4 * brightnessFactor})
        `,
        backdropFilter: `blur(${8 + blurAmount}px)`,
        filter: `blur(${blurAmount}px) brightness(${brightnessFactor})`,
        transform: `scale(${sizeFactor})`,
        transition: 'all 2s ease-out'
    };

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex items-center justify-center outline-none transition-all duration-300"
            style={{
                left: node.position.x,
                top: node.position.y,
                zIndex: isCore ? 50 : (isWindowOpen ? 60 : 10)
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            tabIndex={-1} // Prevent focus
        >
            {/* Source Visuals: Refined Pulse & Ripple with Tooltip */}
            {isSource && (
                <div className="relative flex items-center justify-center w-16 h-16 pointer-events-auto group">
                    {/* Pulsing Source Ring (expands to Core size: 142px) */}
                    <div className="absolute inset-0 rounded-full border border-white/20 animate-source-ping-large" />

                    {/* Central Dot (Smaller: 10px, Subtle Glow, Max Brightness) */}
                    <div
                        className="w-[10px] h-[10px] bg-white rounded-full animate-source-pulse pointer-events-none"
                        style={{ boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)' }}
                    />

                    {/* Label (80px from center) */}
                    <div className="absolute top-[80px] text-[10px] tracking-[0.2em] text-white/50 font-mono pointer-events-none select-none">
                        SOURCE
                    </div>

                    {/* Tooltip (Visible on Hover over the 64px zone) */}
                    <div className="absolute bottom-full mb-2 px-3 py-1.5 bg-os-glass-bg border border-white/10 rounded text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                        Double-click to Materialize
                    </div>
                </div>
            )}

            {/* Core Visuals: Rainbow Spectrum with Glass Ring */}
            {isCore && (
                <>
                    {/* Crystallization Animation Wrapper */}
                    <div className="absolute inset-0 flex items-center justify-center animate-crystallize">
                        {/* Rainbow glow aura - rotating */}
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '180px',
                                height: '180px',
                                background: `conic-gradient(from 0deg,
                                    rgba(255, 0, 0, 0.4),
                                    rgba(255, 127, 0, 0.4),
                                    rgba(255, 255, 0, 0.4),
                                    rgba(0, 255, 0, 0.4),
                                    rgba(0, 255, 255, 0.4),
                                    rgba(0, 0, 255, 0.4),
                                    rgba(148, 0, 211, 0.4),
                                    rgba(255, 0, 0, 0.4))`,
                                filter: 'blur(40px)',
                                animation: 'spin-slow 25s linear infinite'
                            }}
                        />

                        {/* LARGE OUTER Ring - 128px (2x base container) - SOLID 3D GLASS */}
                        <div
                            className="absolute flex items-center justify-center pointer-events-none"
                            style={{
                                width: '128px',
                                height: '128px',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {/* Main THICK glass ring with rainbow shimmer */}
                            <div
                                className="absolute inset-0 rounded-full animate-core-breathe animate-core-morph"
                                style={{
                                    background: `radial-gradient(circle at 50% 50%, 
                                        transparent 40%, 
                                        rgba(255, 255, 255, 0.15) 44%,
                                        rgba(255, 255, 255, 0.25) 50%,
                                        rgba(255, 255, 255, 0.15) 56%,
                                        transparent 60%)`,
                                    boxShadow: `
                                        inset 0 0 30px rgba(255, 255, 255, 0.5),
                                        0 0 60px rgba(200, 200, 255, 0.6),
                                        0 0 90px rgba(150, 150, 255, 0.4)
                                    `,
                                    backdropFilter: 'blur(12px)',
                                    border: `2px solid rgba(255, 255, 255, 0.4)`,
                                }}
                            />

                            {/* Rainbow shimmer rotating overlay */}
                            <div
                                className="absolute inset-0 rounded-full opacity-50"
                                style={{
                                    background: `conic-gradient(from 0deg,
                                        rgba(255, 0, 0, 0.3),
                                        rgba(255, 255, 0, 0.3),
                                        rgba(0, 255, 0, 0.3),
                                        rgba(0, 255, 255, 0.3),
                                        rgba(0, 0, 255, 0.3),
                                        rgba(255, 0, 255, 0.3),
                                        rgba(255, 0, 0, 0.3))`,
                                    animation: 'spin-slow 18s linear infinite',
                                    mixBlendMode: 'screen',
                                    maskImage: 'radial-gradient(circle, transparent 40%, black 45%, black 55%, transparent 60%)'
                                }}
                            />

                            {/* Rotating dashed selection - on hover or when window open */}
                            <div
                                className={clsx(
                                    "absolute rounded-full border-2 border-dashed animate-spin-slow transition-opacity",
                                    isWindowOpen ? "opacity-50" : "opacity-0 group-hover:opacity-50"
                                )}
                                style={{
                                    width: '142px',
                                    height: '142px',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    borderColor: '#fff',
                                }}
                            />
                        </div>

                        <div>
                            {/* Large central glyph - Clean rendering without shadows to prevent artifacts */}
                            <span
                                className="relative z-10 block text-5xl text-white font-sans leading-none select-none flex items-center justify-center w-[1em] h-[1em]"
                                style={{ filter: 'none' }}
                            >
                                {glyphChar || '◉'}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Container Visuals: 2.71D Glassy Sphere (Empty) */}
            {isContainer && (
                <>
                    <div
                        className={clsx(
                            "relative flex items-center justify-center rounded-full transition-all duration-300 animate-liquid",
                            size,
                            isJoyful && "animate-joy"
                        )}
                        style={{
                            ...crystalStyle,
                            opacity: 0.7 * brightnessFactor
                        }}
                    >
                        {/* Lidar Scan Effect Overlay (Subtler) */}
                        <div
                            className="absolute inset-0 rounded-full opacity-20 mix-blend-overlay animate-lidar"
                            style={{
                                background: `linear-gradient(180deg, transparent 40%, rgba(${accentRGB}, 0.8) 50%, transparent 60%)`,
                                backgroundSize: '100% 200%',
                                animationDuration: '8s'
                            }}
                        />
                        {/* Empty */}
                    </div>
                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-full border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity scale-110" />
                </>
            )}

            {/* Legacy/Void Visuals */}
            {isVoid && (
                <div
                    className={clsx(
                        "relative flex items-center justify-center backdrop-blur-md transition-all duration-300 rounded-full",
                        size
                    )}
                    style={{
                        background: 'rgba(10,10,10,0.6)',
                        border: `1.5px solid ${activeColor}`
                    }}
                >
                    <span className={clsx("font-light leading-none", fontSize)} style={{ color: activeColor }}>
                        {glyphChar}
                    </span>
                </div>
            )}

            {/* Connection Port (Visible on Hover or when window open) */}
            {!isSource && (
                <div
                    className={clsx(
                        "absolute inset-0 -m-2 border border-dashed border-white/20 rounded-full transition-opacity pointer-events-none",
                        isWindowOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                />
            )}
        </div>
    );
};

// Helper to map IDs to chars
const getGlyphChar = (id) => {
    const map = {
        'core': '◉', // Base core glyph
        'node': '⬡',
        'void': '○'
    };
    return map[id] || null;
};

export default Node;
