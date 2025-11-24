import React from 'react';
import { useWindowStore } from '../../store/windowStore';

const Source = () => {
    const { setCoreStatus } = useWindowStore();

    return (
        <div
            className="relative w-20 h-20 flex items-center justify-center group cursor-pointer"
            onDoubleClick={() => setCoreStatus('EXIST')}
            title="Double Click to Materialize"
        >
            {/* Pulsing Source Ring */}
            <div className="absolute inset-0 rounded-full border border-white/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />

            {/* Inner Source Point */}
            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />

            {/* Label */}
            <div className="absolute -bottom-8 text-[10px] tracking-[0.2em] text-os-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500 uppercase">
                Source
            </div>
        </div>
    );
};

export default Source;
