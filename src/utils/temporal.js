export const TIME_SCALES = [
    { id: 'NOW', label: 'Now', kind: 'NOW' },
    { id: 'DAY', label: 'Day', kind: 'DAY' },
    { id: 'WEEK', label: 'Week', kind: 'WEEK' },
    { id: 'MONTH', label: 'Month', kind: 'MONTH' },
    { id: 'YEAR', label: 'Year', kind: 'YEAR' }
];

/**
 * Get current date/time in ISO format
 */
export function now() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Create a default TimeWindow for a given kind
 */
export function defaultTimeWindow(kind, nowDate = now()) {
    const date = new Date(nowDate);

    switch (kind) {
        case 'NOW':
            return { kind, from: nowDate, to: nowDate };

        case 'DAY':
            return { kind, from: nowDate, to: nowDate };

        case 'WEEK':
            return {
                kind,
                from: startOfWeek(nowDate),
                to: endOfWeek(nowDate)
            };

        case 'MONTH':
            return {
                kind,
                from: startOfMonth(nowDate),
                to: endOfMonth(nowDate)
            };

        case 'YEAR':
            return {
                kind,
                from: startOfYear(nowDate),
                to: endOfYear(nowDate)
            };

        default:
            return { kind: 'NOW', from: nowDate, to: nowDate };
    }
}

/**
 * Get start of week (Monday)
 */
export function startOfWeek(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday = 1
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday.toISOString().split('T')[0];
}

/**
 * Get end of week (Sunday)
 */
export function endOfWeek(dateStr) {
    const start = new Date(startOfWeek(dateStr));
    start.setDate(start.getDate() + 6);
    return start.toISOString().split('T')[0];
}

/**
 * Get start of month
 */
export function startOfMonth(dateStr) {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

/**
 * Get end of month
 */
export function endOfMonth(dateStr) {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
}

/**
 * Get start of year
 */
export function startOfYear(dateStr) {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
}

/**
 * Get end of year
 */
export function endOfYear(dateStr) {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), 11, 31).toISOString().split('T')[0];
}

/**
 * Cycle to next time scale
 */
export function nextTimeScale(currentKind) {
    const scales = ['NOW', 'DAY', 'WEEK', 'MONTH', 'YEAR'];
    const currentIndex = scales.indexOf(currentKind);
    const nextIndex = (currentIndex + 1) % scales.length;
    return scales[nextIndex];
}

/**
 * Format TimeWindow for display
 */
export function formatTimeWindow(timeWindow) {
    if (!timeWindow) return 'NOW';

    const { kind, from, to } = timeWindow;

    if (kind === 'NOW' || kind === 'DAY') {
        return from;
    }

    if (from === to) {
        return from;
    }

    return `${from} — ${to}`;
}
