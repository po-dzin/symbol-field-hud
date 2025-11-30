import React from 'react';
import { useGraphStore } from '../../store/graphStore';
import { useStateStore, TONES } from '../../store/stateStore';

const GraphInfo = () => {
    const { nodes, edges } = useGraphStore();
    const { toneId, mode } = useStateStore();
    const currentTone = TONES.find(t => t.id === toneId) || TONES[0];
    const activeColor = mode === 'LUMA' ? currentTone.lumaColor : currentTone.color;

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '140, 195, 205';
    };
    const accentRGB = hexToRgb(activeColor);

    const version = 'v0.45';
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const connectedNodes = nodes.filter(n => edges.some(e => e.from === n.id || e.to === n.id)).length;

    return (
        <div
            className="absolute bottom-6 right-6 z-30 pointer-events-auto"
        >
            <div
                className="flex flex-col gap-1 px-4 py-3 backdrop-blur-xl transition-all duration-300 cursor-default"
                style={{
                    background: 'var(--surface-1-bg)',
                    border: `var(--panel-stroke-width) solid rgba(${accentRGB}, 0.25)`,
                    borderRadius: 'var(--panel-radius)',
                    boxShadow: `0 0 12px rgba(${accentRGB}, 0.15)`
                }}
            >
                <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1" style={{ color: mode === 'LUMA' ? '#5b5349' : 'var(--text-secondary)' }}>
                    SYSTEM
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-[10px] uppercase opacity-60" style={{ color: mode === 'LUMA' ? '#5b5349' : 'var(--text-secondary)' }}>Version</span>
                    <span className="text-xs font-medium" style={{ color: activeColor }}>{version}</span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-[10px] uppercase opacity-60" style={{ color: mode === 'LUMA' ? '#5b5349' : 'var(--text-secondary)' }}>Nodes</span>
                    <span className="text-xs font-medium" style={{ color: activeColor }}>{nodeCount}</span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-[10px] uppercase opacity-60" style={{ color: mode === 'LUMA' ? '#5b5349' : 'var(--text-secondary)' }}>Edges</span>
                    <span className="text-xs font-medium" style={{ color: activeColor }}>{edgeCount}</span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-[10px] uppercase opacity-60" style={{ color: mode === 'LUMA' ? '#5b5349' : 'var(--text-secondary)' }}>Connected</span>
                    <span className="text-xs font-medium" style={{ color: activeColor }}>{connectedNodes}</span>
                </div>
            </div>
        </div>
    );
};

export default GraphInfo;
