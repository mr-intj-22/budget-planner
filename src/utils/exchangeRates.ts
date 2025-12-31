/**
 * Exchange rate utilities for currency conversion
 */

const BASE_URL = 'https://open.er-api.com/v6/latest';

export interface ExchangeRateResponse {
    result: string;
    base_code: string;
    rates: Record<string, number>;
    time_last_update_utc: string;
    time_next_update_utc: string;
}

/**
 * Fetch latest exchange rates for a base currency
 */
export async function fetchExchangeRates(baseCurrency: string): Promise<ExchangeRateResponse | null> {
    try {
        const response = await fetch(`${BASE_URL}/${baseCurrency}`);
        if (!response.ok) throw new Error('Failed to fetch exchange rates');
        return await response.json();
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
}

/**
 * Convert amount between currencies
 */
export function convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: Record<string, number>
): number {
    if (fromCurrency === toCurrency) return amount;

    // If rates are relative to toCurrency
    if (rates[fromCurrency]) {
        // base is toCurrency, so to get to base (toCurrency) from fromCurrency:
        // amount / rate_of_fromCurrency
        return amount / rates[fromCurrency];
    }

    // If rates are relative to something else (default is usually USD or base of API)
    // We assume rates provided have both from and to relative to some base.
    // However, the API we use returns rates relative to the base we fetch.
    // So if we fetch with base = toCurrency, then rates[fromCurrency] is what we need.

    return amount; // Fallback
}
