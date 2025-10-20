# PayPal Guest Checkout Setup Guide for COMCUBES

## Overview
This guide explains how to enable **guest checkout** for PayPal payments on COMCUBES. Guest checkout allows customers to pay with their debit/credit cards **without logging into a PayPal account** - providing a smooth payment experience similar to Paystack.

## What is Guest Checkout?

With guest checkout enabled, customers will see **TWO payment options** on the PayPal page:

1. **Log in to PayPal** - For customers who have and want to use their PayPal account
2. **Pay with Debit or Credit Card** - For customers who want to pay directly with a card (NO login required)

This is similar to how Paystack shows multiple payment options (Card, Bank Transfer, USSD, etc.).

---

## Required Setup Steps

### Step 1: Enable "PayPal Account Optional" Setting

This is a **critical merchant account setting** that must be enabled for both Sandbox (testing) and Production (live) accounts.

#### For Sandbox Account (Testing):

1. Log into **developer.paypal.com**
2. Go to **Dashboard → Sandbox → Accounts**
3. Find your **Business sandbox account** in the list
4. Click the **3 dots** (⋯) next to your business account → Select **"View/Edit Account"**
5. In the account details modal, click **"Account Settings"** or similar option
6. Navigate to **"Website Payment Preferences"** or **"Payment Preferences"**
7. Look for **"PayPal Account Optional"** setting
8. Turn it **ON** (enabled)
9. **Save** your changes

**Alternative path for Sandbox:**
- developer.paypal.com → Sandbox → Accounts → Click on business email
- Look for "Account Optional" or "Guest Checkout" toggle
- Enable it and save

#### For Production Account (Live Payments):

1. Log into your **PayPal Business Account** at paypal.com
2. Click the **Settings** icon (⚙️) at the top right
3. Go to **Account Settings**
4. Click **"Website Payments"** in the left sidebar
5. Click **"Website Payment Preferences"** or **"Update"** next to Payment Preferences
6. Scroll down to find **"PayPal Account Optional"**
7. Select **"On"** (Allow customers to pay without a PayPal account)
8. **Save** your changes at the bottom of the page

---

### Step 2: Code Implementation (Already Completed)

The COMCUBES backend has been updated with the following code changes to support guest checkout:

```typescript
applicationContext: {
  returnUrl: '...',
  cancelUrl: '...',
  brandName: "COMCUBES",
  userAction: OrderApplicationContextUserAction.PayNow,
  landingPage: OrderApplicationContextLandingPage.Billing,  // ← NEW: Prioritizes card payment
  shippingPreference: OrderApplicationContextShippingPreference.NoShipping,  // ← NEW: No shipping
}
```

These parameters tell PayPal to:
- **`landingPage: Billing`** - Prioritizes the card payment/guest checkout option instead of login
- **`shippingPreference: NoShipping`** - Skip shipping address collection (not needed for business listing services)
- **`userAction: PayNow`** - Show "Pay Now" button instead of "Continue"

---

## Testing Guest Checkout

### How to Test Properly:

1. **Use Incognito/Private Browser Window**
   - Regular browser windows may have PayPal cookies that affect the checkout flow
   - Private browsing ensures you see the true guest checkout experience

2. **Complete a Test Payment**:
   - Go to List Company page or Claim Company page on COMCUBES
   - Fill out the form
   - Select **PayPal** as payment method
   - Choose **USD** currency
   - Click **"List Company"** or **"Claim Company"**
   - You should be redirected to PayPal's checkout page

3. **What You Should See on PayPal Page**:
   - **Option 1**: "Log in to your PayPal account" (with email/password fields)
   - **Option 2**: "Don't have a PayPal account?" or "Pay with Debit or Credit Card" button
   - Click Option 2 to proceed with guest checkout

4. **Guest Checkout Flow**:
   - Enter card number, expiry, CVV
   - Enter billing address
   - Complete payment
   - Redirected back to COMCUBES success page

### Test Card Numbers (Sandbox Only):

```
Visa:       4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Amex:       3782 822463 10005

Expiry: Any future date (e.g., 12/2025)
CVV: Any 3 digits (4 for Amex)
```

---

## Important Notes

### Guest Checkout Availability:

PayPal's display of guest checkout can be affected by:
- **Account settings** (must have "PayPal Account Optional" ON)
- **Browser cookies** (use incognito mode for testing)
- **Buyer's location** (some countries may have restrictions)
- **Risk assessment** (PayPal may require login for high-risk transactions)

### Currency Support:

All payments on COMCUBES are denominated in **USD**. PayPal will:
- Accept the USD payment from customers
- Settle to your merchant account in USD
- Handle any currency conversion if customer pays from a non-USD account

### Production Deployment:

Before going live:
1. ✅ Enable "PayPal Account Optional" in **Production** PayPal account
2. ✅ Test in Sandbox with guest checkout working
3. ✅ Update environment variables with **Production** PayPal credentials:
   - `PAYPAL_CLIENT_ID` (production client ID)
   - `PAYPAL_SECRET` (production secret key)
4. ✅ Test one more time in production with a real payment

---

## Troubleshooting

### Problem: Still seeing only login screen, no guest checkout option

**Solutions**:
1. Verify "PayPal Account Optional" is **enabled** in your PayPal account settings
2. Test in an **incognito/private browser** window (clears PayPal cookies)
3. Clear your browser cache and cookies
4. Try a different browser
5. Wait 5-10 minutes after enabling the setting (may take time to propagate)

### Problem: Payment fails after entering card details

**For Sandbox Testing**:
- Make sure you're using valid test card numbers (see list above)
- Sandbox has $5,000 USD balance - sufficient for all test payments
- Check server logs for detailed error messages

**For Production**:
- Verify customer is using a valid, non-expired card
- Check that card has sufficient funds
- Ensure your PayPal account is verified and in good standing

---

## Support

If you continue experiencing issues after following this guide:

1. Check PayPal's official documentation:
   - https://developer.paypal.com/docs/checkout/
   - https://www.paypal.com/us/cshelp/article/how-do-i-accept-cards-with-checkout-using-the-guest-checkout-option--help307

2. Contact PayPal Merchant Support:
   - For account settings issues
   - For guest checkout availability questions

3. Check COMCUBES server logs:
   - Look for PayPal API errors
   - Verify environment variables are set correctly

---

## Summary Checklist

- [ ] Sandbox: "PayPal Account Optional" enabled
- [ ] Production: "PayPal Account Optional" enabled
- [ ] Code updated with landingPage: "GUEST_CHECKOUT"
- [ ] Tested in incognito browser
- [ ] Guest checkout option appears on PayPal page
- [ ] Test payment completed successfully
- [ ] Production credentials configured
- [ ] Ready to go live!

---

*Last Updated: October 20, 2025*
