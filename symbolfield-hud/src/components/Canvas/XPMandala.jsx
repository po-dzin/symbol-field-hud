import React from 'react';

const XPMandala = ({ type, value, glyph, color, position }) => {
    // Calculate size/glow based on value
    const size = 40 + (value / 100) * 20; // 40px to 60px
    const glowIntensity = value / 100;

    return (
        <div
            className="absolute flex items-center justify-center transition-all duration-1000 ease-out"
            style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                width: `${size}px`,
                height: `${size}px`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* Mandala Geometry (CSS/SVG approximation) */}
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <div className={`w-full h-full border border-${color}/30 rotate-45`} />
                <div className={`absolute w-full h-full border border-${color}/30 rotate-0`} />
            </div>

            {/* Inner Node */}
            <div className={`
                relative w-10 h-10 rounded-full flex items-center justify-center
                bg-os-glass-bg backdrop-blur-sm border border-${color}/50
                shadow-[0_0_${20 * glowIntensity}px_${color}]
            `}>
                <span className={`text-${color} text-lg`}>{glyph}</span>
            </div>

            {/* Label */}
            <div className="absolute -bottom-6 text-[10px] font-mono text-os-text-secondary opacity-70">
                {type} :: {value}
            </div>
        </div>
    );
};

export default XPMandala;
