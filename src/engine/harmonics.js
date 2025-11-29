/**
 * Harmony Engine - Core Logic v0.1
 * Implements the Unified SymbolField Harmonic Specification
 */

// --- Constants ---

// Mode Luminance Baselines
export const MODE_LUMA = {
    DEEP: 6,
    FLOW: 12,
    LUMA: 86
};

// Mode Saturation Baselines
export const MODE_SAT = {
    DEEP: 8,
    FLOW: 8,
    LUMA: 35
};

// --- Helper Functions ---

/**
 * Clamp value between min and max
 */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// --- Color Engine ---

/**
 * Calculate color harmonics based on mode, tone, and XP
 * @param {string} mode - 'DEEP' | 'FLOW' | 'LUMA'
 * @param {string} toneId - Tone identifier (e.g., 'void', 'joy', etc.)
 * @param {number} xpTotal - Total XP value
 * @returns {object} Color harmonics { mode, tone, xp, glow }
 */
export const calculateColorHarmonics = (mode, toneId, xpTotal = 0) => {
    // 2.1 Mode Baselines
    const L_m = MODE_LUMA[mode] || MODE_LUMA.DEEP;
    const S_m = MODE_SAT[mode] || MODE_SAT.DEEP;

    // 2.2 Tone (Emo-Accent)
    // L_t = clamp(L_m + 50, 60, 72)
    const L_t = clamp(L_m + 50, 60, 72);

    // S_t = S_m + Delta_S_t (30-60%)
    // Using base delta of 40% for now
    const delta_S_t = 40;
    const S_t = S_m + delta_S_t;

    // 2.3 XP Colors
    // L_i = L_t - 3
    const L_i = L_t - 3;
    // S_i = 0.9 * S_t
    const S_i = 0.9 * S_t;

    // 2.4 Glow
    // L_glow = L_i + 12
    const L_glow = L_i + 12;
    // S_glow = S_i + 15%
    const S_glow = S_i + 15;

    return {
        mode: { luma: L_m, sat: S_m },
        tone: { luma: L_t, sat: S_t },
        xp: { luma: L_i, sat: S_i },
        glow: { luma: L_glow, sat: S_glow }
    };
};
