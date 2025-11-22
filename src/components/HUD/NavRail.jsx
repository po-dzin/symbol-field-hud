import React from 'react';
import { useWindowStore } from '../../store/windowStore';

const NavItem = ({ glyph, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
w - 12 h - 12 rounded - xl flex items - center justify - center
transition - all duration - 300 group relative
      ${active ? 'bg-os-cyan-dim text-os-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'text-os-text-secondary hover:text-os-text-primary hover:bg-white/5'}
`}
    >
        <span className="text-xl">{glyph}</span>

        {/* Tooltip */}
        <div className="absolute left-14 px-2 py-1 bg-os-dark-blue border border-os-glass-border rounded-md 
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <span className="text-xs tracking-widest uppercase">{label}</span>
        </div>
    </button>
);

const NavRail = () => {
    const { activeTab, setActiveTab } = useWindowStore();

    return (
        <nav className="w-16 h-full border-r border-os-glass-border bg-os-glass-bg backdrop-blur-md flex flex-col items-center py-6 gap-4 z-50">
            {/* Logo / Home */}
            <div className="mb-4 cursor-pointer" onClick={() => setActiveTab('HUD')}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${activeTab === 'HUD' ? 'border-os-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'border-os-glass-border'}`}>
                    <span className={`text-xs font-bold ${activeTab === 'HUD' ? 'text-os-cyan' : 'text-os-text-secondary'}`}>SF</span>
                </div>
            </div>

            {/* Modules */}
            <NavItem glyph="⊙" label="Graph" active={activeTab === 'Graph'} onClick={() => setActiveTab('Graph')} />
            <NavItem glyph="𓂀" label="Agent" active={activeTab === 'Agent'} onClick={() => setActiveTab('Agent')} />
            <NavItem glyph="≡" label="Log" active={activeTab === 'Log'} onClick={() => setActiveTab('Log')} />
            <NavItem glyph="∷" label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />

            <div className="flex-1" />

            {/* User / Status */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-os-violet to-blue-600 opacity-80"></div>
        </nav>
    );
};

export default NavRail;
