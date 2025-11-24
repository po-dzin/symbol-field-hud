import Draggable from 'react-draggable';
import { useRef } from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore, TONES } from '../../store/stateStore';

const XpSummaryPanel = () => {
    const { xpState } = useWindowStore();
    const { toneId, mode } = useStateStore();
    const currentTone = TONES.find(t => t.id === toneId) || TONES[0];
    const activeColor = mode === 'LUMA' ? currentTone.lumaColor : currentTone.color;
    const { hp, ep, mp, sp, np } = xpState;
    const nodeRef = useRef(null);

    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '140, 195, 205';
    };
    const accentRGB = hexToRgb(activeColor);

    return (
        <Draggable nodeRef={nodeRef} handle=".xp-handle">
            <div ref={nodeRef} className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-auto z-30">
                {/* Panel Container */}
                <div
                    className="backdrop-blur-xl p-5 w-48 transition-all duration-300 xp-handle cursor-grab active:cursor-grabbing"
                    style={{
                        background: 'var(--surface-1-bg)',
                        border: `var(--panel-stroke-width) solid rgba(${accentRGB}, 0.35)`,
                        borderRadius: 'var(--panel-radius)',
                        boxShadow: `0 0 20px rgba(${accentRGB}, 0.22)`,
                        animation: 'pulse-glow-smooth 8s ease-in-out infinite',
                        '--glow-color': `${activeColor}60`
                    }}
                >
                    <div className="text-[10px] font-bold mb-4 tracking-[0.08em] uppercase border-b border-white/10 pb-2 flex justify-between items-center"
                        style={{ color: `rgba(${accentRGB}, 0.85)` }}
                        title="Experience Summary"
                    >
                        <span>XP Summary</span>
                        <span className="text-xs opacity-50">∑</span>
                    </div>

                    <div className="space-y-3">
                        <XpRow label="HP" value={hp} icon="🪨" color={mode === 'LUMA' ? '#a85645' : '#cd8475'} />
                        <XpRow label="EP" value={ep} icon="💧" color={mode === 'LUMA' ? '#9c7b4f' : '#cdab75'} />
                        <XpRow label="MP" value={mp} icon="🔥" color={mode === 'LUMA' ? '#4f9c4f' : '#75cd75'} />
                        <XpRow label="SP" value={sp} icon="🌬️" color={mode === 'LUMA' ? '#328a8a' : '#75cdcd'} />
                        <XpRow label="NP" value={np} icon="🌈" color={mode === 'LUMA' ? '#6a4f9c' : '#8e75cd'} />
                    </div>
                </div>
            </div>
        </Draggable>
    );
};

const XpRow = ({ label, value, icon, color }) => {
    const tooltips = {
        'HP': 'Health Points',
        'EP': 'Energy Points',
        'MP': 'Mind Points',
        'SP': 'Spirit Points',
        'NP': 'Nothing Points'
    };

    return (
        <div className="flex items-center justify-between group" title={tooltips[label]}>
            <div className="flex items-center gap-2 text-os-text-secondary group-hover:text-os-text-primary transition-colors">
                <span className="opacity-60 grayscale group-hover:grayscale-0 transition-all duration-300">{icon}</span>
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className="text-sm font-mono font-bold" style={{ color: color }}>
                {value}
            </span>
        </div>
    );
};

export default XpSummaryPanel;
