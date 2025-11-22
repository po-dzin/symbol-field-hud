import React, { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore, MODES, TONES, GLYPHS } from '../../store/stateStore';

const Tooltip = ({ text }) => (
    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded text-[10px] text-white whitespace-nowrap pointer-events-none z-50">
        {text}
    </div>
);

const ModePill = ({ modeKey, active, onClick, accentColor, mode }) => {
    const modeData = MODES[modeKey];
    const [hover, setHover] = useState(false);
    const isLuma = modeKey === 'LUMA';

    // Convert hex to RGB for radial gradient
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    };

    const accentRGB = hexToRgb(accentColor);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            title={`${modeData.label} Mode`}
            className={`
                inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full transition-all duration-300
                ${active ? '' : 'hover:bg-white/5'}
            `}
            style={active ? {
                background: isLuma
                    ? `radial-gradient(circle, rgba(${accentRGB}, 0.20) 0%, rgba(235,225,210,0.95) 70%)`
                    : `radial-gradient(circle, rgba(${accentRGB}, 0.12) 0%, rgba(0,0,0,0.9) 70%)`,
                border: `1.5px solid rgba(${accentRGB}, 0.9)`,
                boxShadow: `0 0 14px rgba(${accentRGB}, 0.7)`,
                color: isLuma ? 'var(--neutralTextLuma, #2A2620)' : '#FFFFFF'
            } : {
                background: 'transparent',
                border: '1.5px solid transparent',
                color: mode === 'LUMA' ? '#5b5349' : 'var(--text-secondary)'
            }}
        >
            <span className="text-lg inline-flex items-center justify-center leading-none">
                {modeData.icon}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest leading-none">
                {modeData.label}
            </span>
        </button>
    );
};

const ToneSelector = ({ currentToneId, onSelect, accentColor, mode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentTone = TONES.find(t => t.id === currentToneId) || TONES[0];
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                title={`Current Tone: ${currentTone.label}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
                <div
                    className="w-5 h-5 rounded-full shadow-sm border border-white/10"
                    style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}40` }}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-os-dark-blue/95 backdrop-blur-xl border border-os-glass-border rounded-full p-2 flex items-center gap-2 shadow-2xl z-50">
                    {TONES.map(tone => {
                        const toneDisplayColor = mode === 'LUMA' ? tone.lumaColor : tone.color;
                        return (
                            <button
                                key={tone.id}
                                onClick={() => { onSelect(tone.id); setIsOpen(false); }}
                                title={tone.label}
                                className="w-8 h-8 rounded-full hover:scale-110 transition-transform flex items-center justify-center"
                            >
                                <div
                                    className="w-6 h-6 rounded-full shadow-sm border border-white/10"
                                    style={{ backgroundColor: toneDisplayColor }}
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const GlyphSelector = ({ currentGlyphId, onSelect, accentColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentGlyph = GLYPHS.find(g => g.id === currentGlyphId) || GLYPHS[0];
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                title={`Current Glyph: ${currentGlyph.name}`}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer"
                style={isOpen ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
            >
                <span className="text-xl text-os-text-primary" style={{ color: isOpen ? accentColor : undefined }}>
                    {currentGlyph.char}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-os-dark-blue/95 backdrop-blur-xl border border-os-glass-border rounded-full p-2 flex items-center gap-2 shadow-2xl z-50">
                    {GLYPHS.map(glyph => (
                        <button
                            key={glyph.id}
                            onClick={() => { onSelect(glyph.id); setIsOpen(false); }}
                            title={glyph.name}
                            className={`w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-lg
                                ${glyph.id === currentGlyphId ? 'text-white font-bold' : 'text-os-text-secondary'}
                            `}
                            style={glyph.id === currentGlyphId ? { color: accentColor } : {}}
                        >
                            {glyph.char}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatePanel = () => {
    const { activeTab } = useWindowStore();
    const { mode, toneId, glyphId, setMode, setTone, setGlyph } = useStateStore();

    const currentTone = TONES.find(t => t.id === toneId) || TONES[0];
    const activeColor = mode === 'LUMA' ? currentTone.lumaColor : currentTone.color;

    // Convert hex to RGB for CSS rgba
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '140, 195, 205';
    };

    const accentRGB = hexToRgb(activeColor);

    if (activeTab !== 'HUD') return null;

    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
            <div
                className="flex items-center gap-4 px-5 h-[72px] backdrop-blur-xl transition-all duration-300"
                style={{
                    background: 'var(--surface-1-bg)',
                    border: `var(--panel-stroke-width) solid rgba(${accentRGB}, 0.35)`,
                    borderRadius: 'var(--panel-radius)',
                    boxShadow: `0 0 20px rgba(${accentRGB}, 0.22)`
                }}
            >
                {/* MODE Group */}
                <div className="flex items-center gap-1 rounded-full p-1"
                    style={{ backgroundColor: mode === 'LUMA' ? 'rgba(90, 80, 65, 0.15)' : 'rgba(0,0,0,0.1)' }}
                >
                    {Object.keys(MODES).map(key => (
                        <ModePill
                            key={key}
                            modeKey={key}
                            active={mode === key}
                            onClick={() => setMode(key)}
                            accentColor={activeColor}
                            mode={mode}
                        />
                    ))}
                </div>

                <div className="w-px h-8 bg-white/10" />

                {/* TONE & GLYPH */}
                <div className="flex items-center gap-2">
                    <ToneSelector currentToneId={toneId} onSelect={setTone} accentColor={activeColor} mode={mode} />
                    <GlyphSelector currentGlyphId={glyphId} onSelect={setGlyph} accentColor={activeColor} />
                </div>

                {/* Removed Duplicate Settings Dot */}
            </div>
        </div>
    );
};

export default StatePanel;
