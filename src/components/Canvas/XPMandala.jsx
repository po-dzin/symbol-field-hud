import React from 'react';
import { useStateStore } from '../../store/stateStore';

const XPMandala = ({ type, value, glyph, color, glowColor, position }) => {
    const { mode } = useStateStore();
    // Calculate size/glow based on value
    const size = 40 + (value / 100) * 20; // 40px to 60px
    const glowIntensity = value / 100;

    // Enhanced XP colors for better visibility
    const isLuma = mode === 'LUMA';

    const xpColors = {
        SP: { color: '#f2e6c2', glow: 'rgba(242, 230, 194' },  // White-gold (Air) - Fixed
        HP: { color: '#99e699', glow: 'rgba(153, 230, 153' },  // Green (Earth) - Brightened
        EP: { color: '#93e6e6', glow: 'rgba(147, 230, 230' },  // Cyan (Water) - Brightened
        MP: { color: '#ffcc80', glow: 'rgba(255, 204, 128' },  // Orange (Fire) - Brightened
        NP: { color: '#c2a9e6', glow: 'rgba(194, 169, 230' }   // Purple (Void) - Brightened
    };

    const xpColor = xpColors[type] || xpColors.HP;
    const displayColor = isLuma ? '#5b5349' : xpColor.color;
    const glowBase = xpColor.glow;

    return (
        <div
            className="absolute flex items-center justify-center transition-all duration-1000 ease-out group cursor-pointer"
            style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                width: `${size}px`,
                height: `${size}px`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* SEPARATED GLOW LAYER - Reduced Haze */}
            <div
                className="absolute inset-[-26%] rounded-full pointer-events-none z-0"
                style={{
                    background: `radial-gradient(circle, 
                        rgba(${hexToRgb(xpColor.color)}, 0.30) 20%, 
                        rgba(${hexToRgb(xpColor.color)}, 0.18) 45%, 
                        transparent 75%
                    )`,
                    filter: 'blur(6px)',
                    opacity: mode === 'DEEP' ? 0.85 : mode === 'LUMA' ? 0.40 : 0.55
                }}
            />

            {/* SHARP MANDALA LAYER - No Blur, High Opacity */}
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_20s_linear_infinite] z-10">
                {/* Diamond shape */}
                <div
                    className="w-full h-full border rotate-45 transition-all duration-500 rounded-sm"
                    style={{
                        borderColor: displayColor,
                        borderWidth: '1.25px',
                        opacity: mode === 'DEEP' ? 1 : 0.9,
                        filter: mode === 'DEEP' ? `drop-shadow(0 0 5px ${displayColor}) drop-shadow(0 0 10px ${displayColor})` : 'none', // Double glow for intensity
                        boxShadow: 'none'
                    }}
                />
                {/* Cross shape */}
                <div
                    className="absolute w-full h-full border rotate-0 transition-all duration-500"
                    style={{
                        borderColor: displayColor,
                        borderWidth: '1.25px',
                        opacity: mode === 'DEEP' ? 1 : 0.9,
                        filter: mode === 'DEEP' ? `drop-shadow(0 0 5px ${displayColor}) drop-shadow(0 0 10px ${displayColor})` : 'none',
                        boxShadow: 'none'
                    }}
                />
            </div>

            {/* Inner Node - Sharp */}
            <div
                className="relative w-10 h-10 rounded-full flex items-center justify-center bg-os-glass-bg backdrop-blur-sm border transition-all duration-500 z-20"
                style={{
                    borderColor: displayColor,
                    borderWidth: '1.25px',
                    boxShadow: 'none' // Removed inner glow to reduce fog
                }}
            >
                <span
                    className="text-lg font-bold"
                    style={{ color: displayColor }}
                >
                    {glyph}
                </span>
            </div>

            {/* Label */}
            <div className="absolute -bottom-6 text-[10px] font-mono text-os-text-secondary opacity-70 z-20">
                {type} :: {value}
            </div>
        </div>
    );
};

// Helper to convert hex to rgb for gradient
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

export default XPMandala;
