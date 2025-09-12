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
    
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          amount: data.amount,
          currency: data.currency || 'USD', // Default to USD for international business
          reference: data.reference,
          metadata: data.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Failed to initialize payment');
      }

      return result.data;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<{
    status: string;
    amount: number;
    reference: string;
    customer: { email: string };
    metadata: any;
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