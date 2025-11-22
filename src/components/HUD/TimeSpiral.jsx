import React, { useEffect, useState } from 'react';
import { useWindowStore } from '../../store/windowStore';

const TimeSpiral = () => {
    const { timeSpiralState, toggleTimeSpiral, activeTab } = useWindowStore();
    const { expanded } = timeSpiralState;
    const [breath, setBreath] = useState(0);

    // Breath Cycle Animation (6s cycle)
    useEffect(() => {
        let start = Date.now();
        const animate = () => {
            const now = Date.now();
            const elapsed = (now - start) / 6000; // 6s period
            const phase = Math.sin(elapsed * Math.PI * 2); // -1 to 1
            const normalized = (phase + 1) / 2; // 0 to 1
            setBreath(normalized);
            requestAnimationFrame(animate);
        };
        const id = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(id);
    }, []);

    if (activeTab !== 'HUD') return null;

    return (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 flex flex-col items-center z-50">
            {/* Spiral Container */}
            <div
                className={`relative flex items-center justify-center transition-all duration-700 ease-out
                    ${expanded ? 'w-96 h-96 mb-12' : 'w-24 h-24'}
                `}
            >
                {/* Breath Layer (Inner) */}
                <div
                    className="absolute rounded-full border-2 border-os-cyan/30"
                    style={{
                        width: expanded ? '20%' : '60%',
                        height: expanded ? '20%' : '60%',
                        opacity: 0.3 + (breath * 0.7),
                        transform: `scale(${1 + (breath * 0.1)})`
                    }}
                />

                {/* Day Layer (24h) */}
                <div className={`absolute rounded-full border border-os-glass-border transition-all duration-500
                    ${expanded ? 'w-[40%] h-[40%] border-os-violet/40' : 'w-[80%] h-[80%]'}
                `}>
                    {expanded && <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-os-violet">DAY</span>}
                </div>

                {/* Week Layer (7d) */}
                <div className={`absolute rounded-full border border-os-glass-border transition-all duration-500
                    ${expanded ? 'w-[60%] h-[60%] border-os-amber/30' : 'w-[90%] h-[90%] opacity-0'}
                `}>
                    {expanded && <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-os-amber">WEEK</span>}
                </div>

                {/* Month Layer */}
                <div className={`absolute rounded-full border border-os-glass-border transition-all duration-500
                    ${expanded ? 'w-[80%] h-[80%] border-white/20' : 'w-full h-full opacity-0'}
                `}>
                    {expanded && <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/50">MONTH</span>}
                </div>

                {/* Year Layer (Outer) */}
                <div className={`absolute rounded-full border border-dashed border-os-glass-border transition-all duration-500
                    ${expanded ? 'w-full h-full opacity-100' : 'w-full h-full opacity-0'}
                `}>
                    {expanded && <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/30">YEAR</span>}
                </div>

                {/* Center Interaction */}
                <button
                    onClick={toggleTimeSpiral}
                    className="absolute w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center z-10"
                >
                    <span className="text-xs text-os-text-primary opacity-80">
                        {expanded ? '×' : '⏳'}
                    </span>
                </button>
            </div>

            {/* Label */}
            <div className="mt-2 text-[10px] tracking-[0.2em] text-os-text-meta uppercase opacity-60">
                {expanded ? 'TEMPORAL EXPANSION' : 'NOW'}
            </div>
        </div>
    );
};

export default TimeSpiral;
