import React from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore, TONES } from '../../store/stateStore';

// --- Glyphs Set A (Canonical) ---
const HUDGlyph = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeOpacity="0.5" /> {/* Simplified Center */}
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const GraphGlyph = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
);

const AgentGlyph = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M5 12c1.8-3 4-4.5 7-4.5s5.2 1.5 7 4.5c-1.8 3-4 4.5-7 4.5S6.8 15 5 12z" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
);

const LogGlyph = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="9" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="15" x2="16" y2="15" />
    </svg>
);

const SettingsGlyph = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
        <circle cx="9" cy="14" r="1" fill="currentColor" />
        <circle cx="15" cy="14" r="1" fill="currentColor" />
    </svg>
);

const NavItem = ({ id, icon: Icon, activeTab, setActiveTab, activeColor, variant = 'plain' }) => {
    const isActive = activeTab === id;
    const isOrb = variant === 'orb';

    const NAV_ITEMS = [
        { id: 'hud', label: 'HUD Overview', icon: '⍜' },
        { id: 'graph', label: 'Experience Graph', icon: '◎' },
        { id: 'agent', label: 'AI Agent', icon: 'agent' }, // Custom SVG handled in render
        { id: 'log', label: 'Activity Log', icon: '≡' },
        { id: 'settings', label: 'Settings', icon: '∴' }
    ];

    // Custom Agent Glyph - Eye of Horus style
    const AgentGlyphInternal = () => (
        <span className="text-2xl leading-none">𓂀</span>
    );

    const currentNavItem = NAV_ITEMS.find(item => item.id === id);
    const tooltip = currentNavItem ? currentNavItem.label : '';

    return (
        <button
            onClick={() => setActiveTab(id)}
            title={tooltip}
            className={`relative w-10 h-10 flex items-center justify-center transition-all duration-300 group
                ${isOrb ? 'rounded-full' : 'rounded-xl'}
            `}
        >
            {/* Active Background (Only for Orb or if desired for Plain, spec says remove circle container) */}
            {isActive && isOrb && (
                <div
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{ backgroundColor: activeColor, boxShadow: `0 0 15px ${activeColor}` }}
                />
            )}

            {/* Icon */}
            <div
                className={`w-6 h-6 transition-colors duration-300 ${isActive ? '' : 'text-os-text-secondary group-hover:text-os-text-primary'}`}
                style={{
                    color: isActive ? activeColor : undefined,
                    filter: isActive && !isOrb ? `drop-shadow(0 0 8px ${activeColor})` : 'none'
                }}
            >
                {id === 'agent' ? <AgentGlyphInternal /> : <Icon />}
            </div>
        </button>
    );
};

const NavRail = () => {
    const { activeTab, setActiveTab, dockZIndex, focusDock } = useWindowStore();
    const { toneId, mode } = useStateStore();
    const currentTone = TONES.find(t => t.id === toneId) || TONES[0];
    const activeColor = mode === 'LUMA' ? currentTone.lumaColor : currentTone.color;

    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '140, 195, 205';
    };
    const accentRGB = hexToRgb(activeColor);

    return (
        <nav
            className="absolute right-6 top-1/2 -translate-y-1/2 w-[72px] py-6 
            backdrop-blur-xl flex flex-col items-center justify-between gap-4 transition-all duration-200"
            style={{
                background: 'var(--surface-1-bg)',
                border: `var(--panel-stroke-width) solid rgba(${accentRGB}, 0.35)`,
                borderRadius: 'var(--panel-radius)',
                boxShadow: `0 0 20px rgba(${accentRGB}, 0.22)`,
                zIndex: dockZIndex,
                height: 'min(320px, 60vh)'
            }}
            onClickCapture={focusDock}
        >
            {/* Top: HUD */}
            <NavItem id="HUD" icon={HUDGlyph} activeTab={activeTab} setActiveTab={setActiveTab} activeColor={activeColor} variant="plain" />

            {/* Middle: Tools */}
            <div className="flex flex-col gap-4">
                <NavItem id="Graph" icon={GraphGlyph} activeTab={activeTab} setActiveTab={setActiveTab} activeColor={activeColor} variant="orb" />
                <NavItem id="Agent" icon={AgentGlyph} activeTab={activeTab} setActiveTab={setActiveTab} activeColor={activeColor} variant="plain" />
                <NavItem id="Log" icon={LogGlyph} activeTab={activeTab} setActiveTab={setActiveTab} activeColor={activeColor} variant="plain" />
            </div>

            {/* Bottom: Settings */}
            <NavItem id="Settings" icon={SettingsGlyph} activeTab={activeTab} setActiveTab={setActiveTab} activeColor={activeColor} variant="plain" />
        </nav>
    );
};

export default NavRail;
