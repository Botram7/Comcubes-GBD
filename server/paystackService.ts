// Paystack Service for payment processing
export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    
    if (!this.secretKey) {
      console.warn("PAYSTACK_SECRET_KEY not set - payment functionality will be limited");
    }
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
        
        // If 403 error and we tried USD, fallback to NGN
        if (response.status === 403 && preferredCurrency === 'USD') {
          console.warn('USD not supported by this Paystack account, falling back to NGN...');
          return await this.initializePaymentNGN(data);
        }
        throw new Error(`Paystack API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Failed to initialize payment');
      }

      return result.data;
    } catch (error) {
      // If we get a 403 error and we tried USD, fallback to NGN
      if (error instanceof Error && error.message.includes('403') && preferredCurrency === 'USD') {
        console.warn('USD payment failed, falling back to NGN equivalent...');
        return await this.initializePaymentNGN(data);
      }
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  // Fallback method for NGN payments with USD to NGN conversion
  private async initializePaymentNGN(originalData: {
    email: string;
    amount: number; // USD amount in cents
    reference: string;
    metadata?: any;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    // Convert USD cents to NGN kobo (approximate: 1 USD = 800 NGN)
    const usdAmount = originalData.amount / 100; // Convert cents to dollars
    const ngnAmount = usdAmount * 800; // Convert USD to NGN (approximate rate)
    const ngnKobo = this.convertToKobo(ngnAmount);

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
          conversionRate: 800,
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

    console.log(`Payment initialized with NGN fallback: $${usdAmount} USD ≈ ₦${ngnAmount} NGN`);
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