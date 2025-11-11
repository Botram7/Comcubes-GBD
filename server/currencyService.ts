import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Currency conversion rate cache
interface CurrencyRate {
  rate: number;
  timestamp: number;
  source: 'western-union' | 'exchange-api';
}

class CurrencyConversionService {
  private rateCache = new Map<string, CurrencyRate>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache to avoid hitting API on every payment
  private readonly enableNGNFallback: boolean;

  constructor() {
    // Feature Flag: EMERGENCY-ONLY Western Union/RemitRadar currency conversion
    // This matches the PAYSTACK_ENABLE_NGN_FALLBACK flag in PaystackService
    // Default: false (USD-only, no currency conversion needed)
    // Set to 'true' ONLY in emergency situations
    this.enableNGNFallback = process.env.PAYSTACK_ENABLE_NGN_FALLBACK === 'true';
  }

  /**
   * ⚠️ EMERGENCY-ONLY: Get exchange rate from USD to target currency
   * Primary: Western Union via RemitRadar API
   * Backup: ExchangeRate-API
   * 
   * This method is PRESERVED but only active when PAYSTACK_ENABLE_NGN_FALLBACK=true
   * DO NOT DELETE: Represents significant development work for emergency NGN fallback
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<{ rate: number; source: string }> {
    // FEATURE FLAG CHECK: Fail fast if NGN fallback is disabled
    if (!this.enableNGNFallback) {
      throw new Error(`Currency conversion disabled. Set PAYSTACK_ENABLE_NGN_FALLBACK=true to enable emergency NGN fallback mode.`);
    }

    // If same currency, return 1
    if (fromCurrency === toCurrency) {
      return { rate: 1, source: 'same-currency' };
    }

    const cacheKey = `${fromCurrency}-${toCurrency}`;
    const cached = this.rateCache.get(cacheKey);

    // Check cache first (but refresh on each payment as requested)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`Using cached ${cached.source} rate: ${cached.rate} for ${fromCurrency} to ${toCurrency}`);
      return { rate: cached.rate, source: cached.source };
    }

    try {
      // Primary: Try Western Union via RemitRadar API
      const westernUnionRate = await this.fetchWesternUnionRate(fromCurrency, toCurrency);
      if (westernUnionRate) {
        this.rateCache.set(cacheKey, {
          rate: westernUnionRate,
          timestamp: Date.now(),
          source: 'western-union'
        });
        console.log(`Fetched Western Union rate: ${westernUnionRate} for ${fromCurrency} to ${toCurrency}`);
        return { rate: westernUnionRate, source: 'western-union' };
      }
    } catch (error) {
      console.warn('Western Union rate fetch failed:', error);
    }

    try {
      // Backup: Try ExchangeRate-API
      const exchangeApiRate = await this.fetchExchangeApiRate(fromCurrency, toCurrency);
      if (exchangeApiRate) {
        this.rateCache.set(cacheKey, {
          rate: exchangeApiRate,
          timestamp: Date.now(),
          source: 'exchange-api'
        });
        console.log(`Fetched Exchange API rate: ${exchangeApiRate} for ${fromCurrency} to ${toCurrency}`);
        return { rate: exchangeApiRate, source: 'exchange-api' };
      }
    } catch (error) {
      console.warn('Exchange API rate fetch failed:', error);
    }

    // Fallback to cached rate if available (even if expired)
    if (cached) {
      console.warn(`Using expired cached rate: ${cached.rate} for ${fromCurrency} to ${toCurrency}`);
      return { rate: cached.rate, source: `cached-${cached.source}` };
    }

    // Final fallback - rough approximation (only for USD to NGN)
    if (fromCurrency === 'USD' && toCurrency === 'NGN') {
      console.error('All rate sources failed, using emergency fallback rate USD to NGN: 1500');
      return { rate: 1500, source: 'emergency-fallback' };
    }

    throw new Error(`Unable to get exchange rate for ${fromCurrency} to ${toCurrency}`);
  }

  /**
   * ⚠️ EMERGENCY-ONLY: Fetch Western Union rates via RemitRadar API
   * This method is PRESERVED for emergency NGN fallback situations
   * Only called when PAYSTACK_ENABLE_NGN_FALLBACK=true
   * DO NOT DELETE: Represents integration work with RemitRadar API
   */
  private async fetchWesternUnionRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    // RemitRadar requires country codes, we'll use common defaults
    const currencyToCountry: Record<string, string> = {
      'USD': 'US',
      'NGN': 'NG',
      'EUR': 'DE',
      'GBP': 'GB',
      'CAD': 'CA',
      'AUD': 'AU'
    };

    const fromCountry = currencyToCountry[fromCurrency];
    const toCountry = currencyToCountry[toCurrency];

    if (!fromCountry || !toCountry) {
      console.warn(`Country mapping not available for ${fromCurrency} or ${toCurrency}`);
      return null;
    }

    const testAmount = 100; // Test with $100 equivalent
    const url = `https://api.remitradar.com/GetQuotesWU?CountryFrom=${fromCountry}&CountryTo=${toCountry}&CurrencyFrom=${fromCurrency}&CurrencyTo=${toCurrency}&AmountFrom=${testAmount}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'COMCUBES-Currency-Service/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`RemitRadar API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.Status === 'Success' && data.Data?.Rate) {
      return parseFloat(data.Data.Rate);
    }

    return null;
  }

  /**
   * Fetch rates from ExchangeRate-API (backup source)
   */
  private async fetchExchangeApiRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'COMCUBES-Currency-Service/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`ExchangeRate-API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.rates && data.rates[toCurrency]) {
      return parseFloat(data.rates[toCurrency]);
    }

    return null;
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<{
    convertedAmount: number;
    rate: number;
    source: string;
  }> {
    const { rate, source } = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = Math.round(amount * rate);

    return {
      convertedAmount,
      rate,
      source
    };
  }
}

export const currencyService = new CurrencyConversionService();