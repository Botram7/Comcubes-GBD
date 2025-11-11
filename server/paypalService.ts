// PayPal Service for multi-currency payment processing
// PayPal automatically handles currency conversion to merchant's base currency (USD)

import {
  Client,
  Environment,
  OrdersController,
  CheckoutPaymentIntent,
  OrderApplicationContextLandingPage,
  OrderApplicationContextShippingPreference,
  OrderApplicationContextUserAction,
} from "@paypal/paypal-server-sdk";

// Currency configurations for proper decimal handling
const CURRENCY_DECIMALS: Record<string, number> = {
  // Zero-decimal currencies (amounts are in whole units)
  'JPY': 0, 'KRW': 0, 'VND': 0, 'CLP': 0, 'ISK': 0, 'UGX': 0,
  // Two-decimal currencies (most common)
  'USD': 2, 'EUR': 2, 'GBP': 2, 'CAD': 2, 'AUD': 2, 'NGN': 2,
  'ZAR': 2, 'INR': 2, 'BRL': 2, 'MXN': 2, 'CNY': 2, 'HKD': 2,
  // Three-decimal currencies (rare)
  'BHD': 3, 'JOD': 3, 'KWD': 3, 'OMR': 3, 'TND': 3,
};

export class PayPalService {
  private readonly clientId: string;
  private readonly secret: string;
  private readonly ordersController: OrdersController;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.secret = process.env.PAYPAL_SECRET || '';
    
    if (!this.clientId || !this.secret) {
      console.warn("PayPal credentials not set - PayPal payment functionality will be limited");
    }

    // Initialize PayPal client
    const client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: this.clientId,
        oAuthClientSecret: this.secret,
      },
      timeout: 0,
      environment: process.env.PAYPAL_MODE === "live"
        ? Environment.Production
        : Environment.Sandbox,
    });

    this.ordersController = new OrdersController(client);
  }

  /**
   * Convert amount based on currency decimal places
   * @param amount - Amount in smallest units (cents/pence/etc)
   * @param currency - ISO currency code
   * @returns Formatted amount string for PayPal API
   */
  private formatAmount(amount: number, currency: string): string {
    const decimals = CURRENCY_DECIMALS[currency] ?? 2;
    if (decimals === 0) {
      // Zero-decimal currencies: amount is already in whole units
      return amount.toString();
    }
    // Convert from smallest units to currency units
    const divisor = Math.pow(10, decimals);
    return (amount / divisor).toFixed(decimals);
  }

  /**
   * Initialize PayPal payment (create order) - Multi-currency support
   * @param data - Payment data
   * @returns PayPal order details with approval URL
   */
  async initializePayment(data: {
    email: string;
    amount: number; // Amount in smallest currency units (cents for USD, kobo for NGN, etc)
    currency: string; // ISO currency code (USD, EUR, GBP, NGN, etc)
    reference: string;
    metadata?: any;
  }): Promise<{ approval_url: string; order_id: string; reference: string }> {
    if (!this.clientId || !this.secret) {
      // Return dummy data for development without credentials
      console.log('PayPal payment initialization (dummy):', data);
      return {
        approval_url: 'https://www.sandbox.paypal.com/checkoutnow?token=dummy',
        order_id: 'DUMMY_ORDER_ID',
        reference: data.reference
      };
    }

    try {
      // Format amount based on currency decimal rules
      const formattedAmount = this.formatAmount(data.amount, data.currency);

      console.log('=== PayPal Multi-Currency Request ===');
      console.log('Amount (smallest units):', data.amount);
      console.log('Currency:', data.currency);
      console.log('Formatted Amount:', formattedAmount);
      console.log('Email:', data.email);
      console.log('Reference:', data.reference);
      console.log('=====================================');

      // Truncate metadata to fit within PayPal's 127-character limit for customId
      const truncatedMetadata = {
        type: data.metadata?.type,
        email: data.email.substring(0, 30),
        ref: data.reference.substring(0, 30)
      };

      // Create PayPal order with guest checkout enabled
      const collect = {
        body: {
          intent: CheckoutPaymentIntent.Capture,
          purchaseUnits: [
            {
              referenceId: data.reference,
              amount: {
                currencyCode: data.currency,
                value: formattedAmount,
              },
              description: data.metadata?.purpose || "COMCUBES Payment",
              customId: JSON.stringify(truncatedMetadata).substring(0, 127),
            },
          ],
          applicationContext: {
            returnUrl: process.env.REPLIT_DEV_DOMAIN 
              ? `https://${process.env.REPLIT_DEV_DOMAIN}/payment/success`
              : 'http://localhost:5000/payment/success',
            cancelUrl: process.env.REPLIT_DEV_DOMAIN
              ? `https://${process.env.REPLIT_DEV_DOMAIN}/payment/cancel`
              : 'http://localhost:5000/payment/cancel',
            brandName: "COMCUBES",
            userAction: OrderApplicationContextUserAction.PayNow,
            landingPage: OrderApplicationContextLandingPage.Billing,
            shippingPreference: OrderApplicationContextShippingPreference.NoShipping,
          },
        },
        prefer: "return=representation",
      };

      const { body, ...httpResponse } = await this.ordersController.createOrder(collect);
      const jsonResponse = JSON.parse(String(body));

      console.log('=== PayPal Response ===');
      console.log('Order ID:', jsonResponse.id);
      console.log('Status:', jsonResponse.status);
      console.log('======================');

      if (httpResponse.statusCode !== 201 && httpResponse.statusCode !== 200) {
        throw new Error(`PayPal API error: ${httpResponse.statusCode}`);
      }

      // Extract approval URL from response
      const approvalLink = jsonResponse.links?.find((link: any) => link.rel === 'approve');
      if (!approvalLink) {
        throw new Error('No approval URL returned from PayPal');
      }

      return {
        approval_url: approvalLink.href,
        order_id: jsonResponse.id,
        reference: data.reference
      };
    } catch (error) {
      console.error('PayPal initialization error:', error);
      throw error;
    }
  }

  /**
   * Verify and capture PayPal payment - Multi-currency support
   * @param orderId - PayPal order ID
   * @returns Payment verification details
   */
  async verifyPayment(orderId: string): Promise<{
    status: string;
    amount: number; // Amount in smallest currency units
    currency: string;
    metadata: any;
  }> {
    if (!this.clientId || !this.secret) {
      console.log('PayPal payment verification (dummy):', orderId);
      return {
        status: 'success',
        amount: 10000,
        currency: 'USD',
        metadata: {}
      };
    }

    try {
      // Capture the payment
      const collect = {
        id: orderId,
        prefer: "return=representation",
      };

      const { body, ...httpResponse } = await this.ordersController.captureOrder(collect);
      const jsonResponse = JSON.parse(String(body));

      console.log('=== PayPal Capture Response ===');
      console.log('Order ID:', jsonResponse.id);
      console.log('Status:', jsonResponse.status);
      console.log('================================');

      if (httpResponse.statusCode !== 201 && httpResponse.statusCode !== 200) {
        throw new Error(`PayPal capture error: ${httpResponse.statusCode}`);
      }

      // Check if payment was successful
      if (jsonResponse.status !== 'COMPLETED') {
        return {
          status: 'failed',
          amount: 0,
          currency: 'USD',
          metadata: {}
        };
      }

      // Extract payment details
      const purchaseUnit = jsonResponse.purchaseUnits?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];
      
      if (!capture) {
        throw new Error('No capture data in PayPal response');
      }

      const currency = capture.amount.currencyCode;
      const amountValue = parseFloat(capture.amount.value);
      
      // Convert to smallest currency units based on decimal places
      const decimals = CURRENCY_DECIMALS[currency] ?? 2;
      const multiplier = decimals === 0 ? 1 : Math.pow(10, decimals);
      const amountInSmallestUnits = Math.round(amountValue * multiplier);

      // Parse custom metadata
      let metadata = {};
      try {
        if (purchaseUnit.customId) {
          metadata = JSON.parse(purchaseUnit.customId);
        }
      } catch (e) {
        console.warn('Failed to parse PayPal custom metadata');
      }

      return {
        status: 'success',
        amount: amountInSmallestUnits,
        currency: currency,
        metadata
      };
    } catch (error) {
      console.error('PayPal verification error:', error);
      throw error;
    }
  }

  /**
   * Generate unique payment reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `paypal_${timestamp}_${random}`;
  }

  /**
   * Convert cents to USD
   */
  convertToUSD(cents: number): number {
    return cents / 100;
  }

  /**
   * Convert USD to cents
   */
  convertToCents(usd: number): number {
    return Math.round(usd * 100);
  }
}

export const paypalService = new PayPalService();
