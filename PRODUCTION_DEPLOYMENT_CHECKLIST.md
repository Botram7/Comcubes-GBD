# COMCUBES Production Deployment Checklist

## Overview
This checklist guides you through deploying COMCUBES to production with all monetization features (Google AdSense, Google Analytics 4, Microsoft Clarity) and payment gateways (Paystack USD, PayPal) fully activated.

---

## Prerequisites
✅ Zenith Bank USD account integrated with Paystack  
✅ PayPal business account configured  
✅ Google AdSense account approved with ad units created  
✅ Google Analytics 4 property set up (Measurement ID: G-T9WCL2L81X)  
✅ Microsoft Clarity project created (if using)  
✅ Namecheap SMTP credentials (already configured)  
✅ Google Custom Search API credentials (already configured)  

---

## Phase 1: Configure Environment Secrets

### Step 1: Set Replit Secrets
1. In your Replit workspace, click **Tools** → **Secrets** (or use the lock icon in the sidebar)
2. Add the following secrets one by one:

#### Required Secrets for Analytics & Monetization:

| Secret Key | Value | Purpose |
|-----------|--------|---------|
| `VITE_GA_MEASUREMENT_ID` | `G-T9WCL2L81X` | Google Analytics 4 tracking |
| `VITE_ADSENSE_CLIENT_ID` | `ca-pub-XXXXXXXXXXXXXXXX` | Google AdSense ad serving (get from AdSense dashboard) |
| `VITE_CLARITY_PROJECT_ID` | `your_clarity_project_id` | Microsoft Clarity heat maps (optional) |

**How to get these values:**
- **GA4 Measurement ID**: Go to Google Analytics → Admin → Data Streams → Web → Measurement ID (format: G-XXXXXXXXXX)
- **AdSense Client ID**: Go to Google AdSense → Account → Settings → Account information → Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
- **Clarity Project ID**: Go to Microsoft Clarity → Settings → Project ID

#### Payment Gateway Secrets (Already Set):
| Secret Key | Status | Purpose |
|-----------|---------|---------|
| `PAYPAL_CLIENT_ID` | ✅ Already configured | PayPal payments |
| `PAYPAL_SECRET` | ✅ Already configured | PayPal API authentication |
| `PAYSTACK_SECRET_KEY` | ⚠️ **Verify USD-enabled key** | Paystack payments with USD support |

**Important**: Since you now have a Zenith Bank USD account, verify that your `PAYSTACK_SECRET_KEY` is for the **USD-enabled Paystack account**, not the old NGN-only account.

### Step 2: Verify Environment Variables
Run this command in the Replit Shell to verify secrets are accessible:
```bash
echo "GA4: $VITE_GA_MEASUREMENT_ID"
echo "AdSense: $VITE_ADSENSE_CLIENT_ID"
echo "Clarity: $VITE_CLARITY_PROJECT_ID"
echo "Paystack: ${PAYSTACK_SECRET_KEY:0:10}..." # Shows first 10 chars only
echo "PayPal: ${PAYPAL_CLIENT_ID:0:10}..."
```

Expected output should show your values (not "undefined" or empty).

---

## Phase 2: Test Paystack USD Integration

### Step 1: Test Transaction Flow
1. Navigate to `/list-company` page on your development environment
2. Fill out the company listing form with test data
3. Proceed to payment selection
4. **Test Paystack USD Payment**:
   - Select "Paystack" as payment method
   - Choose "USD" as currency
   - Complete test payment using Paystack test card:
     - Card Number: `4084084084084081`
     - CVV: `408`
     - Expiry: Any future date
     - PIN: `0000`
     - OTP: `123456`
5. **Verify**:
   - Payment success notification appears
   - Email confirmation received at admin@comcubes.com
   - Transaction recorded in database (check `/admin` dashboard)
   - USD amount displays correctly (no NGN conversion errors)

### Step 2: Test PayPal Fallback
1. Repeat company listing flow
2. Select "PayPal" as payment method
3. Complete test payment using PayPal Sandbox account
4. Verify similar success indicators

### Step 3: Test Self-Service Advertising (/advertise)
1. Navigate to `/advertise` (not linked in nav, direct URL access)
2. Configure an ad purchase:
   - Select ad formats and positions
   - Choose 3-month duration
   - Select USD currency
3. Test both payment gateways (Paystack and PayPal)
4. Verify email notifications sent to admin@comcubes.com

---

## Phase 3: Validate Analytics & AdSense Integration

### Step 1: Check GA4 Initialization
1. Open your development site in Chrome
2. Press F12 to open DevTools → Console tab
3. Look for log message: `"Google Analytics 4 initialized with ID: G-T9WCL2L81X"`
4. If you see: `"Google Analytics 4 not configured - set VITE_GA_MEASUREMENT_ID"`, go back to Phase 1

### Step 2: Test GA4 Event Tracking
1. Navigate through your site (homepage → sectors → industries → companies)
2. Use Google Analytics 4 DebugView:
   - Go to Google Analytics → Admin → DebugView
   - Ensure "Enable debug mode" is active (or add `?debug_mode=true` to your URL)
3. Verify events appear in real-time:
   - `page_view` events for each page navigation
   - Custom events like `search`, `sector_click`, `company_view`

### Step 3: Verify AdSense Ads Display (UPDATED - More Ad Placements!)
With `VITE_ADSENSE_CLIENT_ID` set, verify ads on all pages:

#### **HomePage (3 new ad placements)**:
- [ ] Ad 1: Above-the-fold (after hero section) - Responsive format
- [ ] Ad 2: Mid-content (after "Why Choose" section) - Responsive format
- [ ] Ad 3: Before final CTA - Responsive format

#### **SectorsPage**:
- [ ] Desktop: Left sidebar vertical ad (160x600)
- [ ] Desktop: In-content responsive ad (after intro)
- [ ] Mobile/Tablet: In-content responsive ad displays (sidebar hidden on mobile)

#### **IndustryPage**:
- [ ] Desktop: Left sidebar vertical ad (160x600)
- [ ] Mobile/Tablet: In-content responsive ad before company grid

#### **CompanyProfilePage**:
- [ ] Desktop: Left sidebar vertical ad (160x600)
- [ ] Mobile/Tablet: Responsive ad at top of content area

#### **Mobile Testing (CRITICAL)**:
1. Open site on mobile device or use Chrome DevTools mobile emulator
2. Verify responsive ads display on:
   - Homepage (all 3 placements)
   - Sectors page (in-content ad)
   - Industry pages (in-content ad before companies)
   - Company profiles (top ad)
3. **Expected mobile behavior**:
   - Sidebar ads (160x600) are hidden on mobile
   - Responsive ads adapt to screen width
   - Ads don't break page layout or overflow

#### **Expected Behavior**:
- **Development**: You may see blank ad spaces or placeholder ads (normal for dev environments)
- **Production**: Ads should display within 10-30 minutes of first traffic
- **Total Manual Ads**: 12+ placements (3 on HomePage, 2-3 per other key page)

#### **Troubleshooting**: 
If no ads appear after 24 hours in production:
- Check AdSense dashboard for policy violations
- Verify `VITE_ADSENSE_CLIENT_ID` matches your AdSense Publisher ID exactly
- Ensure ad units are approved in AdSense dashboard
- Check browser console for AdSense errors (F12 → Console)

### Step 4: Configure Auto Ads (Optional but Recommended for Maximum Revenue)

**What are Auto Ads?**  
Google's AI automatically places additional ads in optimal positions you might miss, supplementing your manual placements for 10-20% more revenue.

**Setup Steps** (takes 5 minutes):
1. Follow the complete guide in **`AUTO_ADS_SETUP_GUIDE.md`** (located in project root)
2. **Quick summary**:
   - Go to Google AdSense → Ads → Your site → Enable Auto ads
   - Set ad load to **50-60%** (NOT 100% - critical!)
   - Enable: Anchor ads, Vignette ads (mobile), In-article ads
   - Disable: Matched content, Multiplex ads
   - Use Preview Tool to block bad placements
3. **Verification**:
   - Auto Ads may take 24-48 hours to start showing
   - Check AdSense dashboard → Reports → Filter by "Auto ads"
   - Monitor Page RPM (Revenue Per Mille) after 30 days

**Expected result**: Manual ads + Auto ads = 10-20% higher total revenue vs manual-only approach.

### Step 5: Test Microsoft Clarity (Optional)
1. If `VITE_CLARITY_PROJECT_ID` is set, check browser console for: `"Microsoft Clarity initialized"`
2. Visit Microsoft Clarity dashboard to see live session recordings

---

## Phase 4: Database & Production Readiness

### Step 1: Sync Production Database
1. Navigate to `/admin-sync` (password-protected page)
2. Enter admin password
3. Review database synchronization status
4. If needed, run sync to ensure production DB matches development schema

### Step 2: Verify Email Service
1. Test contact form submissions (if applicable)
2. Test company listing email notifications
3. Test ad purchase email notifications
4. Verify emails are sent from `noreply@comcubes.com` via Namecheap SMTP

### Step 3: Final Code Review
- [ ] All console.log statements removed from production code (optional, but recommended)
- [ ] No hardcoded test data in database seed files
- [ ] Error handling in place for payment gateway failures
- [ ] All legal pages accessible (Privacy Policy, Terms, Disclaimer, Affiliate Disclosure)

---

## Phase 5: Publish to Production

### Step 1: Restart Workflow
Before publishing, ensure all changes are active:
1. In Replit, stop the "Start application" workflow if running
2. Restart it by clicking the "Run" button
3. Wait for successful startup message: `🚀 Starting database bootstrap initialization...`
4. Verify no errors in console

### Step 2: Publish the Application
1. In Replit, click **Deploy** button (or **Publish** depending on your plan)
2. Follow Replit's deployment flow:
   - Confirm deployment settings
   - Wait for build to complete (usually 2-5 minutes)
   - Deployment will create a `.replit.app` domain (e.g., `comcubes.replit.app`)
3. **Production URL**: Your site will be live at `https://your-repl-name.replit.app`

### Step 3: Configure Custom Domain (Optional but Recommended)
1. In Replit deployment settings, add custom domain: `comcubes.com`
2. Update DNS records at your domain registrar:
   - Add CNAME record pointing to your Replit deployment
   - Wait for DNS propagation (5-60 minutes)
3. Verify SSL certificate is auto-provisioned by Replit

---

## Phase 6: Post-Deployment Verification

### Step 1: Live Site Smoke Test
Visit your production URL and verify:
- [ ] Homepage loads without errors
- [ ] Search functionality works (local and global search)
- [ ] Sector navigation works (all 20 sectors)
- [ ] Geography hub loads (all continents)
- [ ] Company profiles display correctly
- [ ] Payment pages load (list company, claim company, advertise)
- [ ] Legal pages accessible (footer links)

### Step 2: Analytics Verification (First 24 Hours)
1. **Google Analytics 4**:
   - Go to GA4 dashboard → Reports → Realtime
   - Verify live users are being tracked
   - Check Acquisition → Traffic acquisition for source/medium data
2. **Microsoft Clarity**:
   - Check dashboard for heatmaps and session recordings
3. **Google AdSense**:
   - Ads may take 10-30 minutes to start showing
   - Check AdSense dashboard → Home → Estimated earnings
   - Verify impressions are being recorded

### Step 3: Payment Gateway Live Test
⚠️ **Use real payment amounts (or Paystack test mode if available)**
1. Test company listing purchase with real USD payment
2. Verify funds appear in Zenith Bank USD account (via Paystack dashboard)
3. Test PayPal payment and verify funds in PayPal Business account
4. Verify email receipts are sent to customers

### Step 4: Monitor Error Logs
1. In Replit, check workflow logs for any errors:
   - Server errors (500, 400 responses)
   - Database connection issues
   - Payment gateway API failures
2. Set up monitoring alerts (if available via Replit or external service)

---

## Phase 7: Ongoing Maintenance

### Weekly Tasks:
- [ ] Review Google AdSense earnings and performance
- [ ] Check GA4 traffic trends and top pages
- [ ] Monitor payment gateway transaction success rates
- [ ] Review email delivery success (via Namecheap logs)

### Monthly Tasks:
- [ ] Review and approve company claim requests (Admin Dashboard)
- [ ] Analyze top-searched sectors/industries
- [ ] Optimize ad placements based on AdSense recommendations
- [ ] Review and update content positioning based on GA4 audience demographics

### Quarterly Tasks:
- [ ] Update sector/industry descriptions for SEO
- [ ] Review Phase 2-5 of Platform Transformation Roadmap (see replit.md)
- [ ] Evaluate API costs (Google Custom Search)
- [ ] Plan new features based on user feedback

---

## Troubleshooting Common Issues

### Issue: AdSense Ads Not Showing
**Symptoms**: Blank spaces where ads should appear  
**Solutions**:
1. Verify `VITE_ADSENSE_CLIENT_ID` is correct (check for typos, extra spaces)
2. Ensure your AdSense account is approved and not under review
3. Check AdSense policy compliance (no prohibited content)
4. Wait 24-48 hours for ad serving to stabilize on new domain
5. Verify ad units are created and approved in AdSense dashboard

### Issue: GA4 Not Tracking
**Symptoms**: No data in GA4 Realtime reports  
**Solutions**:
1. Check browser console for initialization message
2. Verify `VITE_GA_MEASUREMENT_ID` matches GA4 property exactly
3. Disable browser ad blockers (they may block GA4)
4. Use GA4 DebugView to see raw events
5. Ensure Replit Secret is set for **frontend** (prefix: `VITE_`)

### Issue: Paystack USD Payments Failing
**Symptoms**: Payment errors, NGN-only option showing  
**Solutions**:
1. Verify Zenith USD account is active in Paystack dashboard
2. Check `PAYSTACK_SECRET_KEY` is for USD-enabled account
3. Test with Paystack test cards first
4. Review Paystack dashboard → Developers → API Keys for correct environment (test vs live)
5. Contact Paystack support if USD is not showing as available currency

### Issue: Email Notifications Not Sending
**Symptoms**: No emails received for transactions/claims  
**Solutions**:
1. Check Namecheap email account quota (ensure not full)
2. Verify SMTP credentials are correct (check server logs)
3. Test email with simple SMTP tool (e.g., Postman, curl)
4. Check spam/junk folders
5. Review email service logs in workflow console

---

## Emergency Rollback Procedure

If critical issues arise post-deployment:

1. **Quick Fix**: In Replit, click **Stop** on deployment → fix issue in code → **Restart & Redeploy**
2. **Full Rollback**: 
   - Replit deployments maintain previous versions
   - Go to Deploy dashboard → Select previous stable deployment → Promote to production
3. **Database Rollback**: 
   - Use `/admin-sync` interface to restore from backup (if available)
   - Or manually restore from PostgreSQL backup (contact Replit support)

---

## Success Criteria

Your production deployment is successful when:

✅ All 12 pages load without errors  
✅ Google AdSense ads display on designated positions (left sidebar, in-content)  
✅ Google Analytics 4 tracks page views and events in real-time  
✅ Paystack accepts USD payments with correct currency display  
✅ PayPal fallback works for international customers  
✅ Email notifications send successfully for all transaction types  
✅ Search functionality (local + global) returns accurate results  
✅ Admin dashboard displays statistics and waitlist correctly  
✅ Legal compliance pages (Privacy Policy, Terms, etc.) are accessible  
✅ Mobile responsiveness works across all devices  

---

## Support Contacts

**Technical Issues**:
- Replit Support: https://replit.com/support
- Google AdSense Help: https://support.google.com/adsense
- Google Analytics Support: https://support.google.com/analytics

**Payment Gateway Issues**:
- Paystack Support: support@paystack.com
- PayPal Business Support: https://www.paypal.com/businesshelp

**Email/SMTP Issues**:
- Namecheap Support: https://www.namecheap.com/support/

---

## Next Steps After Successful Deployment

Once production is stable, proceed with **Phase 1: Content Repositioning & Market Expansion** from the Platform Transformation Roadmap (see replit.md) to maximize user engagement and monetization potential.

---

*Document Version: 1.0*  
*Last Updated: November 6, 2025*  
*Prepared for: COMCUBES Production Launch*
