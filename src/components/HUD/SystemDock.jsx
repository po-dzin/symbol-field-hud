import React from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore, TONES } from '../../store/stateStore';

const SystemDock = () => {
    const { windows, restoreWindow } = useWindowStore();
    const { toneId, mode } = useStateStore();
    const currentTone = TONES.find(t => t.id === toneId) || TONES[0];
    const activeColor = mode === 'LUMA' ? currentTone.lumaColor : currentTone.color;

    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '140, 195, 205';
    };
    const accentRGB = hexToRgb(activeColor);

    const minimizedWindows = Object.values(windows).filter(w => w.isMinimized);

    return (
        <div
            className="w-full h-[var(--height-footer)] flex items-center justify-center gap-4 relative z-[var(--z-windows)]"
            style={{
                borderTop: `1px solid rgba(${accentRGB}, 0.1)`
            }}
        >
            {/* Dock Background Blur */}
            <div className="absolute inset-0 bg-os-glass/5 backdrop-blur-sm -z-10" />

            {/* Minimized Windows List */}
            {minimizedWindows.length === 0 ? (
                <div className="text-os-text-meta text-xs tracking-widest opacity-50">
                    SYSTEM DOCK ACTIVE
                </div>
            ) : (
                minimizedWindows.map(win => (
                    <button
                        key={win.id}
                        onClick={() => restoreWindow(win.id)}
                        className="group relative flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-2"
                        title={`Restore ${win.title}`}
                    >
                        {/* Window Preview / Icon */}
                        <div
                            className="w-[104px] h-[72px] rounded-lg flex items-center justify-center border transition-all duration-300"
                            style={{
                                background: 'var(--surface-1-bg)',
                                borderColor: `rgba(${accentRGB}, 0.3)`,
                                boxShadow: `0 4px 12px rgba(0,0,0,0.2)`
                            }}
                        >
                            <span className="text-2xl" style={{ color: activeColor }}>{win.glyph}</span>
                        </div>

                        {/* Label */}
                        <span className="text-[10px] font-medium text-os-text-secondary opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 whitespace-nowrap">
                            {win.title}
                        </span>

                        {/* Active Indicator */}
                        <div className="w-1 h-1 rounded-full bg-os-text-secondary opacity-50" />
                    </button>
                ))
            )}
        </div>
    );
};

export default SystemDock;
