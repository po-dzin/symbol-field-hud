import React, { useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import Node from './Node';
import NPCore from './NPCore';
import XPMandala from './XPMandala';
import Source from './Source';
import { mockNodes, mockEdges } from '../../data/mockGraph';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore } from '../../store/stateStore';

const GraphCanvas = () => {
    const containerRef = useRef(null);
    const { openWindow, xpState, coreStatus } = useWindowStore();
    const { mode } = useStateStore();

    const isCoreActive = coreStatus === 'EXIST';

    // Adaptive grid color based on mode (warmer, less bright)
    const gridColor = mode === 'LUMA' ? 'rgba(120, 110, 95, 0.25)' : '#5a5654'; // Warm neutral for LUMA
    const gridOpacity = mode === 'LUMA' ? 1 : 0.35; // Opacity handled in color string for LUMA

    // Axis colors for better visibility (v0.309.2 - increased DEEP contrast)
    const axisColor = mode === 'LUMA' ? '#5b5349' : mode === 'DEEP' ? 'rgba(170, 190, 205, 0.35)' : 'rgba(180, 200, 210, 0.28)';

    // Spring for pan/zoom
    const [{ x, y, scale }, api] = useSpring(() => ({
        x: 0,
        y: 0,
        scale: 1,
        config: { mass: 1, tension: 170, friction: 26 } // Inertial feel
    }));

    // Gesture handler
    useGesture(
        {
            onDrag: ({ offset: [dx, dy] }) => {
                api.start({ x: dx, y: dy });
            },
            onWheel: ({ offset: [dz], ctrlKey }) => {
                // Simple zoom logic (ctrl+wheel or just wheel depending on preference)
                // For this prototype, let's map wheel to zoom if ctrl is pressed, or just zoom
                // Actually, let's make wheel zoom and drag pan.
                // But standard is wheel pans vertical, shift+wheel horizontal.
                // Let's stick to: Drag to pan. Wheel to zoom.
                const newScale = Math.max(0.5, Math.min(3, 1 - dz / 500));
                api.start({ scale: newScale });
            },
            onPinch: ({ offset: [d] }) => {
                api.start({ scale: 1 + d / 200 });
            }
        },
        {
            target: containerRef,
            drag: { from: () => [x.get(), y.get()] },
            wheel: { from: () => [(1 - scale.get()) * 500], eventOptions: { passive: false } },
            pinch: { scaleBounds: { min: 0.5, max: 2 }, rubberband: true },
        }
    );

    // XP Axes Configuration
    // Layout:
    //      SP (Top)
    // EP (Left) - CORE - MP (Right)
    //      HP (Bottom)

    const getAxisPosition = (axis, value) => {
        const baseDist = 150;
        const dist = baseDist + (value * 1.5); // Push out further with higher XP

        switch (axis) {
            case 'SP': return { x: 0, y: -dist };
            case 'HP': return { x: 0, y: dist };
            case 'EP': return { x: -dist, y: 0 };
            case 'MP': return { x: dist, y: 0 };
            default: return { x: 0, y: 0 };
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-transparent relative">
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
                className="w-full h-full flex items-center justify-center transform-gpu"
                style={{ x, y, scale }}
            >
                {/* Connecting Lines (Axes) - REMOVED v0.327
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <g style={{ transform: 'translate(50%, 50%)' }}>
                        <line x1="0" y1="0" x2={getAxisPosition('SP', xpState.sp).x} y2={getAxisPosition('SP', xpState.sp).y} stroke={axisColor} strokeWidth="1" />
                        <line x1="0" y1="0" x2={getAxisPosition('HP', xpState.hp).x} y2={getAxisPosition('HP', xpState.hp).y} stroke={axisColor} strokeWidth="1" />
                        <line x1="0" y1="0" x2={getAxisPosition('EP', xpState.ep).x} y2={getAxisPosition('EP', xpState.ep).y} stroke={axisColor} strokeWidth="1" />
                        <line x1="0" y1="0" x2={getAxisPosition('MP', xpState.mp).x} y2={getAxisPosition('MP', xpState.mp).y} stroke={axisColor} strokeWidth="1" />
                    </g>
                </svg>
                */}

                {/* NP Core (Center) or Source */}
                <div className="relative z-10">
                    {coreStatus === 'EXIST' ? (
                        <NPCore />
                    ) : (
                        <Source />
                    )}
                </div>

                {/* XP Mandala Nodes - HIDDEN FOR v0.326
                {isCoreActive && (
                    <>
                        <XPMandala type="SP" value={xpState.sp} glyph="🌬️" color="os-sp" glowColor="#ededeb" position={getAxisPosition('SP', xpState.sp)} />
                        <XPMandala type="HP" value={xpState.hp} glyph="🪨" color="os-hp" glowColor="#8fefac" position={getAxisPosition('HP', xpState.hp)} />
                        <XPMandala type="EP" value={xpState.ep} glyph="💧" color="os-ep" glowColor="#67e8f9" position={getAxisPosition('EP', xpState.ep)} />
                        <XPMandala type="MP" value={xpState.mp} glyph="🔥" color="os-mp" glowColor="#fdba74" position={getAxisPosition('MP', xpState.mp)} />
                    </>
                )}
                */}
            </animated.div>

            {/* Canvas Status */}
            <div className="absolute bottom-6 right-6 text-xs font-mono text-os-text-meta opacity-50 pointer-events-none">
                CANVAS // ACTIVE
                <br />
                ZOOM: <animated.span>{scale.to(s => s.toFixed(2))}</animated.span>
            </div>
        </div>
    );
};

export default GraphCanvas;
