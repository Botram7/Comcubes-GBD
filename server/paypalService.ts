// PayPal Service for clean USD payment processing
// No currency conversion - pure USD handling only

import {
  Client,
  Environment,
  OrdersController,
} from "@paypal/paypal-server-sdk";

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
      environment: process.env.NODE_ENV === "production"
        ? Environment.Production
        : Environment.Sandbox,
    });

    this.ordersController = new OrdersController(client);
  }

  /**
   * Initialize PayPal payment (create order)
   * @param data - Payment data
   * @returns PayPal order details with approval URL
   */
  async initializePayment(data: {
    email: string;
    amount: number; // Amount in USD cents
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
      // Convert cents to dollars for PayPal (PayPal expects dollar amounts)
      const amountInDollars = (data.amount / 100).toFixed(2);

      console.log('=== PayPal Request Debug ===');
      console.log('Amount in cents:', data.amount);
      console.log('Amount in USD:', amountInDollars);
      console.log('Email:', data.email);
      console.log('Reference:', data.reference);
      console.log('===============================');

      // Create PayPal order
      const collect = {
        body: {
          intent: "CAPTURE" as const,
          purchaseUnits: [
            {
              referenceId: data.reference,
              amount: {
                currencyCode: "USD",
                value: amountInDollars,
              },
              description: data.metadata?.purpose || "COMCUBES Payment",
              customId: JSON.stringify({
                ...data.metadata,
                email: data.email,
                reference: data.reference
              }),
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
            userAction: "PAY_NOW",
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
   * Verify and capture PayPal payment
   * @param orderId - PayPal order ID
   * @returns Payment verification details
   */
  async verifyPayment(orderId: string): Promise<{
    status: string;
    amount: number; // Amount in cents
    currency: string;
    metadata: any;
  }> {
    if (!this.clientId || !this.secret) {
      console.log('PayPal payment verification (dummy):', orderId);
      return {
        status: 'success',
        amount: 10000, // $100 in cents
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

      const amountValue = parseFloat(capture.amount.value);
      const amountInCents = Math.round(amountValue * 100); // Convert dollars to cents

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
        amount: amountInCents,
        currency: capture.amount.currencyCode,
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
