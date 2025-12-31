/**
 * Date formatting and manipulation utilities
 */

/**
 * Formats a date for display (e.g., "Dec 31, 2024")
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

/**
 * Formats a date as ISO string for form inputs (YYYY-MM-DD)
 */
/**
 * Formats a date as ISO string for form inputs (YYYY-MM-DD)
 * Uses local time instead of UTC to avoid date shifting
 */
export function formatDateForInput(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0] ?? '';
}

/**
 * Parses an ISO date string to a Date object
 */
export function parseDateInput(value: string): Date {
    const date = new Date(value);
    // Adjust for timezone offset to get local date
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
}

/**
 * Gets the start and end of a month
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

/**
 * Gets the start and end of a year
 */
export function getYearRange(year: number): { start: Date; end: Date } {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return { start, end };
}

/**
 * Checks if a date is within a range
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
}

/**
 * Gets the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Gets an array of dates for a month (for calendar views)
 */
export function getMonthDates(year: number, month: number): Date[] {
    const days = getDaysInMonth(year, month);
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
}

/**
 * Gets the month name
 */
export function getMonthName(month: number, format: 'long' | 'short' = 'long'): string {
    const date = new Date(2024, month, 1);
    return new Intl.DateTimeFormat('en-US', { month: format }).format(date);
}

/**
 * Gets an array of month names
 */
export function getMonthNames(format: 'long' | 'short' = 'long'): string[] {
    return Array.from({ length: 12 }, (_, i) => getMonthName(i, format));
}

/**
 * Gets relative time string (e.g., "2 days ago", "in 3 months")
 */
export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffDays) < 1) {
        return 'today';
    } else if (Math.abs(diffDays) < 7) {
        return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffDays) < 30) {
        return rtf.format(Math.floor(diffDays / 7), 'week');
    } else if (Math.abs(diffDays) < 365) {
        return rtf.format(Math.floor(diffDays / 30), 'month');
    } else {
        return rtf.format(Math.floor(diffDays / 365), 'year');
    }
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Checks if a date is in the current month
 */
export function isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

/**
 * Gets years for year selector (current year ± range)
 */
export function getYearOptions(range: number = 5): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - range; i <= currentYear + range; i++) {
        years.push(i);
    }
    return years;
}
