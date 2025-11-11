# COMCUBES - Final Publishing Instructions

**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT  
**Date**: November 11, 2025  
**Final Approval**: Architect Reviewed & Approved

---

## 🎯 CRITICAL: Understanding Database Sync

There are **TWO DIFFERENT** types of database synchronization:

### 1. Schema Sync (AUTOMATIC ✅)
**What it is**: Database structure (tables, columns, relationships)  
**When it happens**: Automatically when you click "Publish" in Replit  
**What you do**: NOTHING - Replit handles this automatically

**Examples**:
- Creating new tables
- Adding new columns
- Changing column types
- Adding indexes or constraints

**Status**: ✅ Your schema is stable and will auto-sync to production

---

### 2. Data Sync (MANUAL - Required After Publishing)
**What it is**: The actual content in your database (7,400+ companies, sectors, industries, countries)  
**When it happens**: You manually trigger it AFTER publishing  
**What you do**: Visit https://comcubes.com/admin-sync after publishing

**Examples**:
- All 7,400+ company records
- 20 sectors
- 350+ industries  
- Geographic data (continents, regions, countries)
- Enriched company intelligence data

**Status**: ✅ Clean data export ready (3.5MB, verified Oct 18, 2025)

---

## 📋 Step-by-Step Publishing Process

### STEP 1: Set Up Production Secrets

Go to Replit Secrets tab and add these variables:

#### Required Authentication Secrets
```bash
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=<bcrypt_hashed_password>
SESSION_SECRET=<random_32+_character_string>
ADMIN_SECRET=<random_secret_for_database_sync>
```

**Generate Hashed Password**:
```bash
# Run this in Replit Shell:
npx ts-node -e "import('bcrypt').then(bcrypt => bcrypt.default.hash('YourPassword123', 12).then(console.log))"
```

**Generate Random Secrets**:
```bash
# For SESSION_SECRET and ADMIN_SECRET:
npx ts-node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Required Payment Gateway Secrets
```bash
PAYSTACK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXX
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_SECRET=your_production_secret
PAYPAL_MODE=live
```

**⚠️ CRITICAL**: 
- Use LIVE keys, not TEST keys!
- **MUST set PAYPAL_MODE=live** - Without this, PayPal uses sandbox mode even with live credentials

#### Required Email Service Secrets
```bash
SMTP_HOST=mail.comcubes.com
SMTP_PORT=465
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

#### Required Google Services
```bash
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_engine_id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXX
```

#### Required Storage
```bash
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your_bucket_name
```

#### Auto-Provided by Replit
```bash
DATABASE_URL               # Automatically set by Replit
NODE_ENV=production        # Set this to 'production'
REPLIT_DEV_DOMAIN         # Automatically set by Replit
DOMAIN                    # Your production domain (e.g., comcubes.replit.app)
```

---

### STEP 2: Click "Publish" in Replit

1. Open the **Publishing** tool in your Replit workspace
2. Replit will suggest **Autoscale Deployment** ✅ (recommended)
3. Review the configuration
4. Click **"Publish"** button

**What happens automatically**:
- ✅ Build process runs (npm run build)
- ✅ Production server starts
- ✅ Database schema syncs from dev to production
- ✅ Environment variables load from Secrets
- ✅ HTTPS certificate issued
- ✅ Production URL becomes available

**Wait time**: 2-5 minutes for first deployment

---

### STEP 3: Verify Production is Running

Once publishing completes, visit your production URL and check:

- [ ] ✅ Homepage loads without errors
- [ ] ✅ Search functionality works
- [ ] ✅ Company listings display
- [ ] ✅ No console errors in browser (F12)

**Expected at this stage**:
- ✅ Website structure works
- ❌ Database is EMPTY (no companies yet - this is normal!)
- ✅ Schema exists but has no data

---

### STEP 4: Sync Production Database (REQUIRED)

**Now comes the critical step**: Import your 7,400+ companies into production.

#### Visit the Admin Sync Page
1. Go to: **https://comcubes.com/admin-sync**
2. You'll see the Database Sync Interface

#### Authenticate
1. Enter your `ADMIN_SECRET` (the one you added to Replit Secrets)
2. Click "Check Status"

#### Review Current State
The interface will show:
```
Production Database Status:
- Continents: 0
- Regions: 0
- Countries: 0
- Sectors: 0
- Industries: 0
- Companies: 0
```

#### Execute Sync
1. Click the **"Sync Database"** button
2. The sync process will:
   - ✅ Validate data integrity
   - ✅ Start database transaction
   - ✅ Clear existing data (safely)
   - ✅ Import 7,400+ companies
   - ✅ Import geographic data
   - ✅ Import sectors and industries
   - ✅ Verify data counts
   - ✅ Commit transaction

**Duration**: 30-60 seconds

#### Verify Sync Success
After sync completes, check status again:
```
Production Database Status:
- Continents: 7
- Regions: ~20
- Countries: ~200
- Sectors: 20
- Industries: ~350
- Companies: 7,400+
```

**✅ SUCCESS**: Your production database now has all data!

---

### STEP 5: Final Production Verification

#### Test Critical Flows:

**1. Browse Companies** ✅
- Visit https://comcubes.com
- Click on a sector (e.g., "Technology")
- Click on an industry (e.g., "Software Development")
- Verify companies display correctly

**2. Search Functionality** ✅
- Use local directory search
- Try global search (Google Custom Search)
- Verify results appear

**3. Company Claim Flow** ✅
- Find a company
- Click "Claim This Listing"
- Fill out the form
- Submit and verify email is sent
- Complete email verification
- Test payment flow (card payment)

**4. Admin Dashboard** ✅
- Visit https://comcubes.com/admin
- Login with your ADMIN_USERNAME and ADMIN_PASSWORD
- Verify statistics display correctly
- Check waitlist management
- Verify industry analytics

**5. Payment Processing** ✅
- Test Paystack payment (USD card)
- Verify PayPal alternative works
- Check payment success page
- Verify payment confirmation emails

**6. Analytics Tracking** ✅
- Open browser DevTools (F12)
- Go to Network tab
- Navigate around the site
- Verify Google Analytics 4 events firing
- Check AdSense ads appear (may take 24-48 hours)

---

## 🚨 Troubleshooting

### Issue: Admin Sync Page Returns 403 Forbidden
**Solution**: Verify `ADMIN_SECRET` in Replit Secrets matches what you're entering

### Issue: Database Sync Fails
**Solution**: 
1. Check production logs in Replit Publishing tool
2. Verify DATABASE_URL is set
3. Ensure clean_database_export.json file exists (it does ✅)
4. Contact support if transaction fails

### Issue: Payments Not Working
**Solution**:
1. Verify PAYSTACK_SECRET_KEY starts with `sk_live_`
2. Check Paystack dashboard for account status
3. Verify Zenith Bank USD account is active
4. Test with PayPal as alternative

### Issue: Emails Not Sending
**Solution**:
1. Verify SMTP credentials in Secrets
2. Check SMTP_HOST=mail.comcubes.com
3. Check SMTP_PORT=465
4. Test email from admin dashboard

### Issue: Apple Pay Not Appearing
**Expected**: Apple Pay requires domain verification by Apple, which can take 24-48 hours after publishing. The domain verification file is already configured correctly.

---

## 📊 What's Included in Production

### Data Ready to Sync:
- ✅ 7,400+ companies with enriched intelligence data
- ✅ 20 business sectors
- ✅ 350+ industries
- ✅ 7 continents
- ✅ ~20 regions
- ✅ ~200 countries
- ✅ Geocoded company locations
- ✅ Company verification statuses

### Features Enabled:
- ✅ Hierarchical directory navigation
- ✅ Local directory search
- ✅ Global Google Custom Search
- ✅ Company claim verification system
- ✅ Email verification (rate-limited)
- ✅ Dual payment gateways (Paystack + PayPal)
- ✅ Apple Pay support (USD transactions)
- ✅ Currency-aware payment channels
- ✅ Admin dashboard with analytics
- ✅ Industry slot management
- ✅ Waitlist functionality
- ✅ Google Analytics 4 tracking
- ✅ Google AdSense monetization
- ✅ Self-service ad platform
- ✅ Legal pages (Privacy, Terms, Disclaimer)

### Security Features:
- ✅ HTTPS enforced
- ✅ Helmet security headers
- ✅ Rate limiting (DDoS protection)
- ✅ Bcrypt password hashing
- ✅ Secure session management
- ✅ XSS protection
- ✅ CSRF protection
- ✅ SQL injection protection (Drizzle ORM)

---

## ✅ Pre-Flight Checklist

Before clicking Publish:
- [x] All security fixes applied
- [x] No TypeScript errors
- [x] Build successful
- [x] Clean data export verified (3.5MB)
- [x] Production secrets documented
- [x] Database sync process understood
- [x] Rollback plan in place
- [x] Post-publish verification steps documented

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ App loads at https://comcubes.com
- ✅ Database sync completes (7,400+ companies)
- ✅ Search works (local + global)
- ✅ Payment processing works (Paystack + PayPal)
- ✅ Email verification sends
- ✅ Admin dashboard accessible
- ✅ Google Analytics tracking
- ✅ No critical errors in logs

---

## 📞 Support Resources

- **Replit Support**: Through Replit platform
- **Paystack Support**: support@paystack.com
- **PayPal Support**: PayPal Developer Portal
- **Google Support**: Respective service dashboards

---

## 🔄 Rollback Process

If critical issues occur:

### Option 1: Replit Rollback
1. Open "Checkpoints" in Replit
2. Select checkpoint before publish
3. Restore

### Option 2: Unpublish Temporarily
1. Go to Publishing tool
2. Click "Unpublish"
3. Fix issues
4. Republish

---

**Final Status**: ✅ READY TO PUBLISH

You have everything you need to successfully deploy COMCUBES to production!
