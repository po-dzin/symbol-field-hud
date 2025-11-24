import React from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore, TONES } from '../../store/stateStore';

const NAV_ITEMS = [
    { id: 'HUD', label: 'HUD', icon: <span className="block transform scale-110">⍜</span> },
    { id: 'Graph', label: 'Graph', icon: '◎' },
    { id: 'Agent', label: 'Agent', icon: <span className="block text-xl -mt-1 transform scale-90 font-bold" style={{ WebkitTextStroke: '0.5px currentColor' }}>𓂀</span> },
    { id: 'Log', label: 'Log', icon: <span className="block transform scale-115">≡</span> },
    { id: 'Settings', label: 'Settings', icon: <span className="block text-3xl -mt-3 font-bold leading-none">∴</span> }
];

const NavItem = ({ id, icon, label, activeTab, setActiveTab, activeColor, className = '' }) => {
    const isActive = activeTab === id;

    return (
        <button
            onClick={() => setActiveTab(id)}
            title={label}
            className={`relative w-10 h-10 flex items-center justify-center transition-all duration-300 group rounded-xl ${className}`}
        >
            {/* Icon */}
            <div
                className={`text-2xl leading-none transition-colors duration-300 ${isActive ? '' : 'text-os-text-secondary group-hover:text-os-text-primary'}`}
                style={{
                    color: isActive ? activeColor : undefined,
                    filter: isActive ? `drop-shadow(0 0 8px ${activeColor})` : 'none'
                }}
            >
                {icon}
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
            backdrop-blur-xl flex flex-col items-center justify-center gap-4 transition-all duration-200"
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
            {NAV_ITEMS.map((item, index) => (
                <NavItem
                    key={item.id}
                    {...item}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activeColor={activeColor}
                    className={index === 1 ? 'mt-0.5' : ''}
                />
            ))}
        </nav>
    );
};

export default NavRail;
