import { describe, it, expect } from 'vitest';
import common from '../pb_hooks/lib/common.js';

describe('formatDateTime', () => {
    it('formats a valid date string correctly', () => {
        // Appending time to ensure it is treated as local time or at least middle of the day to avoid timezone shifts
        // when running in different environments if interpreted as UTC midnight.
        // Actually, '2024-01-15' is UTC midnight. In EST it is Jan 14. 
        // Let's use a specific ISO string with time or just accept that it uses local formatting.
        // Better: Expect the output to be one of the two valid dates depending on timezone, OR fix input.
        // Fixing input to noon UTC is safer:
        const dateStr = '2024-01-15T12:00:00Z';
        const formatted = common.formatDateTime(dateStr);
        // 12:00 UTC is 07:00 EST, so it stays Jan 15.
        expect(formatted).toBe('Jan 15, 2024');
    });

    it('formats a Date object correctly', () => {
        const date = new Date('2024-02-05T12:00:00Z');
        // Note: verify run time timezone or use a fixed one if needed.
        // For simplicity, we check if it contains "Feb 05, 2024" or handling timezone diffs.
        // Let's stick to the string output which uses local time in the implementation:
        // d.getDate(), d.getFullYear() use local system time.
        // To be safe in CI, we might want to stick to simple string inputs YYYY-MM-DD
        // or check for the specific format expected based on the input.
        const formatted = common.formatDateTime(date);
        expect(formatted).toMatch(/Feb 05, 2024/);
    });

    it('returns "-" for null input', () => {
        const formatted = common.formatDateTime(null);
        expect(formatted).toBe('-');
    });

    it('returns "-" for invalid date string', () => {
        const formatted = common.formatDateTime('invalid-date');
        expect(formatted).toBe('-');
    });
});
