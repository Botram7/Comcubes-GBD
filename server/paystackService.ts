// Paystack Service for payment processing
import { currencyService } from './currencyService.js';

export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly enableNGNFallback: boolean;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    // Feature Flag: EMERGENCY-ONLY NGN fallback system
    // Default: false (USD-only mode via Zenith Bank USD account)
    // Set to 'true' ONLY if Paystack USD channels experience outages
    // This preserves the Western Union/RemitRadar currency conversion system
    // without activating it automatically
    this.enableNGNFallback = process.env.PAYSTACK_ENABLE_NGN_FALLBACK === 'true';
    
    if (!this.secretKey) {
      console.warn("PAYSTACK_SECRET_KEY not set - payment functionality will be limited");
    }
    
    console.log(`💳 Paystack Mode: ${this.enableNGNFallback ? '⚠️ NGN FALLBACK ENABLED (Emergency Mode)' : '✅ USD-ONLY (Production Mode)'}`);
  }

  async initializePayment(data: {
    email: string;
    amount: number; // in cents for USD, kobo for NGN
    reference: string;
    currency?: string; // 'USD' or 'NGN' (defaults to USD for international business)
    metadata?: any;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    if (!this.secretKey) {
      // Return dummy data for development
      console.log('Payment initialization (dummy):', data);
      return {
        authorization_url: 'https://checkout.paystack.com/dummy',
        access_code: 'dummy_access_code',
        reference: data.reference
      };
    }
    
    const preferredCurrency = data.currency || 'USD';
    
    try {
      const payload = {
        email: data.email,
        amount: data.amount,
        currency: preferredCurrency,
        reference: data.reference,
        metadata: data.metadata,
      };
      
      console.log('=== Paystack Request Debug ===');
      console.log('Payload being sent to Paystack:', JSON.stringify(payload, null, 2));
      console.log('Amount type:', typeof payload.amount);
      console.log('Amount value:', payload.amount);
      console.log('Currency:', payload.currency);
      console.log('Email:', payload.email);
      console.log('===============================');
      
      // First, try with the preferred currency (USD)
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('=== Paystack Error Response ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error Body:', errorText);
        console.error('===============================');
        
        // FEATURE FLAG CHECK: Only fallback to NGN if explicitly enabled
        if ((response.status === 403 || (response.status === 400 && errorText.includes('No active channel'))) && preferredCurrency === 'USD') {
          if (this.enableNGNFallback) {
            console.warn('⚠️ NGN Fallback Active: USD channels not available, converting to NGN...');
            return await this.initializePaymentNGN(data);
          } else {
            // USD-only mode: Fail with clear error instead of silent fallback
            console.error('❌ USD payment failed. NGN fallback is DISABLED (set PAYSTACK_ENABLE_NGN_FALLBACK=true to enable)');
            throw new Error(`Paystack USD payment failed: ${errorText}. Please contact support or enable NGN fallback mode.`);
          }
        }
        throw new Error(`Paystack API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Failed to initialize payment');
      }

      return result.data;
    } catch (error) {
      // FEATURE FLAG CHECK: Only fallback to NGN if explicitly enabled
      if (error instanceof Error && error.message.includes('403') && preferredCurrency === 'USD') {
        if (this.enableNGNFallback) {
          console.warn('⚠️ NGN Fallback Active: USD payment exception, converting to NGN...');
          return await this.initializePaymentNGN(data);
        } else {
          console.error('❌ USD payment failed. NGN fallback is DISABLED');
          throw new Error(`Paystack USD payment failed. Please contact support or enable NGN fallback mode.`);
        }
      }
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  // ⚠️ EMERGENCY-ONLY NGN Fallback Method
  // This method is PRESERVED but INACTIVE by default
  // Only activates when PAYSTACK_ENABLE_NGN_FALLBACK=true
  // 
  // Purpose: Convert USD payments to NGN equivalent when Paystack USD channels are unavailable
  // Uses: Western Union/RemitRadar API for real-time exchange rates
  // 
  // DO NOT DELETE: This code represents significant development work and may be needed
  // in emergency situations (e.g., Paystack USD channel outages, banking issues)
  // 
  // To activate: Set environment variable PAYSTACK_ENABLE_NGN_FALLBACK=true
  // To deactivate: Remove the variable or set to 'false' (default)
  private async initializePaymentNGN(originalData: {
    email: string;
    amount: number; // USD amount in cents
    reference: string;
    metadata?: any;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    let ngnKobo: number;
    let conversionRate: number;
    let rateSource: string;

    try {
      // Get real-time conversion rate from USD to NGN
      // Note: originalData.amount is in USD cents, we need to convert to USD first
      const usdAmount = originalData.amount / 100; // Convert cents to USD
      const conversion = await currencyService.convertCurrency(usdAmount, 'USD', 'NGN');
      const ngnAmount = conversion.convertedAmount; // Amount in NGN
      ngnKobo = this.convertToKobo(ngnAmount); // Convert NGN to kobo for Paystack
      conversionRate = conversion.rate;
      rateSource = conversion.source;
      
      console.log(`=== Currency Conversion ===`);
      console.log(`Original: ${originalData.amount} USD cents (${usdAmount} USD)`);
      console.log(`Rate: ${conversionRate} (source: ${rateSource})`);
      console.log(`Converted: ${ngnAmount} NGN (${ngnKobo} kobo)`);
      console.log(`===========================`);
      
    } catch (conversionError) {
      console.warn('Currency conversion failed, using emergency fallback rate:', conversionError);
      // Emergency fallback: 1 USD = 1500 NGN
      const usdAmount = originalData.amount / 100;
      const ngnAmount = usdAmount * 1500;
      ngnKobo = this.convertToKobo(ngnAmount);
      conversionRate = 1500;
      rateSource = 'emergency-fallback';
      
      console.log(`Emergency fallback: ${usdAmount} USD → ${ngnAmount} NGN (${ngnKobo} kobo)`);
    }

    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: originalData.email,
        amount: ngnKobo,
        currency: 'NGN',
        reference: originalData.reference,
        metadata: {
          ...originalData.metadata,
          originalCurrency: 'USD',
          originalAmount: originalData.amount,
          conversionRate: conversionRate,
          rateSource: rateSource,
          fallbackPayment: true
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Paystack NGN fallback API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.status) {
      throw new Error(result.message || 'Failed to initialize NGN fallback payment');
    }

    const finalUsdAmount = originalData.amount / 100;
    const finalNgnAmount = this.convertToNaira(ngnKobo);
    console.log(`Payment initialized with NGN fallback: $${finalUsdAmount} USD ≈ ₦${finalNgnAmount} NGN (rate: ${conversionRate}, source: ${rateSource})`);
    return result.data;
  }

  async verifyPayment(reference: string): Promise<{
    status: string;
    amount: number;
    reference: string;
    customer: { email: string };
    metadata: any;
    currency?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Failed to verify payment');
      }

      return result.data;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  generateReference(): string {
    return `COMCUBES_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convert USD to Cents (Paystack expects USD amounts in cents)
  convertToCents(usd: number): number {
    return Math.round(usd * 100);
  }

  // Convert Cents to USD
  convertToUSD(cents: number): number {
    return cents / 100;
  }

  // Convert Naira to Kobo (Paystack expects NGN amounts in kobo)
  convertToKobo(naira: number): number {
    return Math.round(naira * 100);
  }

  // Convert Kobo to Naira
  convertToNaira(kobo: number): number {
    return kobo / 100;
  }
}

export const paystackService = new PaystackService();