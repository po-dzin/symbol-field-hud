import React from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore, TONES } from '../../store/stateStore';

const NAV_ITEMS = [
    { id: 'HUD', label: 'HUD', icon: <span className="block -mt-1">⍜</span> },
    { id: 'Graph', label: 'Graph', icon: <span className="block">◎</span> },
    { id: 'Agent', label: 'Agent', icon: <span className="block text-xl font-bold" style={{ WebkitTextStroke: '0.5px currentColor' }}>𓂀</span> },
    { id: 'Log', label: 'Log', icon: <span className="block">≡</span> },
    { id: 'Settings', label: 'Settings', icon: <span className="block text-2xl font-bold leading-none -mt-1">∴</span> }
];

const NavItem = ({ id, icon, label, activeTab, setActiveTab, activeColor, className = '' }) => {
    const isActive = activeTab === id;

    return (
        <button
            onClick={() => setActiveTab(id)}
            title={label}
            className={`relative w-[40px] h-[40px] flex items-center justify-center transition-all duration-300 group rounded-xl cursor-pointer hover:bg-white/5 ${className}`}
            style={{
                backgroundColor: isActive ? `${activeColor}15` : undefined
            }}
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
    const { activeTab, setActiveTab, dockZIndex, focusDock, navRailWidth, setNavRailWidth } = useWindowStore();
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
    // Drag Logic
    const [isDragging, setIsDragging] = React.useState(false);

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            // Update width
            const newWidth = Math.max(72, Math.min(e.clientX, window.innerWidth));
            setNavRailWidth(newWidth);
        };

        const handleMouseUp = (e) => {
            if (!isDragging) return;
            setIsDragging(false);

            // Check for Full Screen Trigger (> 80% width)
            if (e.clientX > window.innerWidth * 0.8) {
                console.log('🚀 NavRail Full Screen Trigger -> Switch to HUD Mode');
                setActiveTab('HUD');
                // Reset width with animation (handled by CSS transition if we add it, or just snap back)
                setNavRailWidth(window.innerWidth * 0.146);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, setNavRailWidth, setActiveTab]);

    return (
        <nav
            className="absolute left-0 top-0 h-full py-6 
            backdrop-blur-xl flex flex-col items-center justify-center gap-4 transition-all duration-75 ease-out"
            style={{
                width: navRailWidth || '14.6vw', // Use dynamic width
                background: 'var(--surface-1-bg)',
                borderRight: `var(--panel-stroke-width) solid rgba(${accentRGB}, 0.35)`,
                boxShadow: `0 0 20px rgba(${accentRGB}, 0.22)`,
                zIndex: dockZIndex,
            }}
            onClickCapture={focusDock}
        >
            {/* Drag Handle */}
            <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/10 transition-colors z-50"
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
            />

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
