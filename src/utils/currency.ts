/**
 * Currency formatting utilities
 */

import type { AppSettings } from '../db/schema';

/**
 * Formats a number as currency using the app settings
 */
export function formatCurrency(
    amount: number,
    settings?: AppSettings | null
): string {
    if (settings?.hideFinancialValues) return '****';

    const locale = settings?.currencyLocale ?? 'en-US';
    const currency = settings?.currency ?? 'USD';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formats a number as currency with forced sign (+ or -)
 */
export function formatCurrencyWithSign(
    amount: number,
    settings?: AppSettings | null
): string {
    if (settings?.hideFinancialValues) return (amount >= 0 ? '+' : '-') + '****';
    const formatted = formatCurrency(Math.abs(amount), settings);
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Formats a number as compact currency (e.g., $1.2K, $1.5M)
 */
export function formatCompactCurrency(
    amount: number,
    settings?: AppSettings | null
): string {
    if (settings?.hideFinancialValues) return '****';

    const locale = settings?.currencyLocale ?? 'en-US';
    const currency = settings?.currency ?? 'USD';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        notation: 'compact',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(amount);
}

/**
 * Parses a currency string to a number
 */
export function parseCurrencyInput(value: string): number {
    // Remove all non-numeric characters except decimal point and minus
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Calculates percentage of part to whole
 */
export function calculatePercentage(part: number, whole: number): number {
    if (whole === 0) return 0;
    return Math.min(100, Math.max(0, (part / whole) * 100));
}
