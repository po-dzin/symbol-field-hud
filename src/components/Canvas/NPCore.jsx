import { useStateStore, TONES } from '../../store/stateStore';
import { useWindowStore } from '../../store/windowStore';

const NPCore = () => {
    const { coreMode, xpState, isCoreMinimized, toggleCoreMinimize, timeSpiralState, deleteCore } = useWindowStore();
    const { toneId } = useStateStore();
    const currentTone = TONES.find(t => t.id === toneId) || TONES[0];
    const { hp, ep, mp, sp, np } = xpState;
    const { breathPhase } = timeSpiralState;

    const { mode } = useStateStore();

    // If minimized, we might still show a ghost or nothing. Let's hide it for now as it moves to HUD.
    if (isCoreMinimized) return null;

    // Helper to convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    };

    // Visual styles based on mode
    const isPrism = coreMode === 'PRISM';
    const isLuma = mode === 'LUMA';

    // Dynamic styles based on NP value
    const pulseSpeed = Math.max(1, 5 - (np / 25)); // Faster pulse with higher NP

    return (
        <div className="relative flex items-center justify-center w-32 h-32 group">
            {/* Delete Button (Visible on Hover) - Top Right X */}
            <button
                onClick={(e) => { e.stopPropagation(); deleteCore(); }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/50 border border-white/10 hover:bg-os-red/20 hover:border-os-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-50"
                title="Dematerialize"
            >
                <span className="text-[10px] text-os-text-secondary hover:text-os-red">✕</span>
            </button>

            {/* Minimize Button REMOVED v0.327 */}

            {/* OUTER GLOW - Intense Rainbow Halo */}
            <div
                className="absolute inset-[-30%] rounded-full z-0"
                style={{
                    background: `
                        conic-gradient(from 0deg, 
                            rgba(${hexToRgb('#75cdcd')}, 0.4) 0deg,    /* SP - Cyan */
                            rgba(${hexToRgb('#75cd75')}, 0.4) 90deg,   /* MP - Mint */
                            rgba(${hexToRgb('#cd8475')}, 0.4) 180deg,  /* HP - Coral */
                            rgba(${hexToRgb('#cdab75')}, 0.4) 270deg,  /* EP - Sand */
                            rgba(${hexToRgb('#75cdcd')}, 0.4) 360deg   /* SP - Cyan */
                        )
                    `,
                    filter: 'blur(20px)',
                    opacity: 1,
                    animation: 'breathingCrown 6s ease-in-out infinite' // Faster pulse
                }}
            />

            {/* NP CORE or VOID - PURE BLACK CENTER WITH RAINBOW EDGE */}
            <div
                className={`
                    relative z-20 flex items-center justify-center w-20 h-20 rounded-full cursor-pointer
                    transition-all duration-700 ease-in-out group-hover:scale-105
                    bg-black
                    animate-materialize animate-pulse-glow
                `}
                style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,1)', // Inner shadow for depth
                    // RAINBOW EDGE IMPLEMENTATION:
                    border: '3px solid transparent',
                    background: `
                        linear-gradient(black, black) padding-box,
                        conic-gradient(from 0deg, 
                            #75cdcd, /* SP */
                            #75cd75, /* MP */
                            #cd8475, /* HP */
                            #cdab75, /* EP */
                            #75cdcd  /* SP */
                        ) border-box
                    `
                }}
            >

                {/* Inner Glyph */}
                <span className={`text-2xl transition-colors duration-500
                        ${isPrism
                        ? isLuma ? 'text-[#2a2620]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                        : 'text-os-text-meta'}`}
                >
                    {isPrism ? '🌈' : '🕳'}
                </span>

                {/* Rotating Ring (Prism only) */}
                {isPrism && (
                    <div className={`absolute inset-[-4px] rounded-full border animate-[spin_10s_linear_infinite] ${isLuma ? 'border-[#5b5349]/30' : 'border-white/20'}`} />
                )}

                {/* Collapse Effect (Void only) */}
                {!isPrism && (
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] animate-pulse" />
                )}
            </div>

            {/* Label */}
            <div className="absolute -bottom-8 text-xs font-medium tracking-widest text-os-text-secondary opacity-75">
                CORE // {isPrism ? 'PRISM' : 'VOID'}
            </div>
        </div>
    );
};

export default NPCore;
