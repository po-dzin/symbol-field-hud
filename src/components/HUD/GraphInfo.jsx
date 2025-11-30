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
            className="absolute bottom-4 right-4 z-10 pointer-events-none"
        >
            <div className="flex flex-col gap-0.5 text-right font-mono text-[10px] opacity-40" style={{ color: mode === 'LUMA' ? '#2A2620' : '#ffffff' }}>
                <div>SF {version}</div>
                <div>{nodeCount}N · {edgeCount}E · {connectedNodes}C</div>
            </div>
        </div>
    );
};

export default GraphInfo;
