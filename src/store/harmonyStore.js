import { create } from 'zustand';
import {
    calculateColorHarmonics,
    calculateGeometry,
    calculateGlyphParams,
    calculateUltraState
} from '../engine/harmonics';

/**
 * Harmony Engine State Store
 * Manages system-wide harmonic state including Ultra-Harmony mode
 */
export const useHarmonyStore = create((set, get) => ({
    // State
    isUltraEnabled: false,
    isHarmonicLockEnabled: false,

    baseState: {
        mode: 'DEEP', // 'DEEP' | 'FLOW' | 'LUMA'
        tone: 'void',
        xp_total: 0,
        time: Date.now()
    },

    // Calculated Harmonics (default values)
    harmonics: {
        color: calculateColorHarmonics('DEEP', 'void', 0),
        geometry: calculateGeometry(0, 'DEEP', Date.now()),
        glyph: calculateGlyphParams('DEEP', 'void', 0, Date.now()),
        modifiers: { edgeThickness: 1, glowIntensity: 1 }
    },

    // Actions

    /**
     * Toggle Ultra-Harmony mode on/off
     */
    toggleUltraMode: () => {
        set(state => {
            const newUltra = !state.isUltraEnabled;
            const ultraState = calculateUltraState(state.baseState, newUltra);

            return {
                isUltraEnabled: newUltra,
                harmonics: {
                    ...state.harmonics,
                    modifiers: ultraState.modifiers
                }
            };
        });
    },

    /**
     * Toggle Harmonic Lock (Grid Snapping)
     */
    toggleHarmonicLock: () => set(state => ({ isHarmonicLockEnabled: !state.isHarmonicLockEnabled })),

    /**
     * Update base state (mode, tone, XP, etc.) and recalculate harmonics
     * @param {object} newState - Partial base state to update
     */
    updateBaseState: (newState) => {
        set(state => {
            const mergedState = { ...state.baseState, ...newState };
            const ultraState = calculateUltraState(mergedState, state.isUltraEnabled);

            return {
                baseState: mergedState,
                harmonics: {
                    color: calculateColorHarmonics(mergedState.mode, mergedState.tone, mergedState.xp_total),
                    geometry: calculateGeometry(mergedState.xp_total, mergedState.mode, mergedState.time),
                    glyph: calculateGlyphParams(mergedState.mode, mergedState.tone, mergedState.xp_total, mergedState.time),
                    modifiers: ultraState.modifiers
                }
            };
        });
    },

    /**
     * Animation tick - update time-dependent harmonics
     * Call this from requestAnimationFrame or interval
     * @param {number} time - Current time in milliseconds
     */
    tick: (time) => {
        set(state => {
            const { baseState } = state;
            return {
                harmonics: {
                    ...state.harmonics,
                    geometry: calculateGeometry(baseState.xp_total, baseState.mode, time),
                    glyph: calculateGlyphParams(baseState.mode, baseState.tone, baseState.xp_total, time)
                }
            };
        });
    }
}));
