# Analytics & AdSense Configuration Guide

## 🎯 Overview

This guide provides step-by-step instructions for configuring Google Analytics 4 (GA4), Microsoft Clarity, and Google AdSense for the COMCUBES platform.

## 📋 Prerequisites

You need to sign up for the following services and obtain your credentials:

### 1. Google Analytics 4 (GA4)
**Purpose**: Track website traffic, user behavior, and conversions

**Setup Steps**:
1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** (gear icon in bottom left)
4. Click **Create Property**
5. Enter property details:
   - Property name: `COMCUBES`
   - Reporting time zone: Your timezone
   - Currency: USD
6. Click **Next** and complete the setup
7. Select **Web** as the platform
8. Enter your website URL (e.g., `https://your-repl-name.repl.co`)
9. Click **Create Stream**
10. **Copy your Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Microsoft Clarity
**Purpose**: Heatmaps, session recordings, and user behavior insights

**Setup Steps**:
1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Sign in with your Microsoft account
3. Click **Add new project**
4. Enter project details:
   - Name: `COMCUBES`
   - Website URL: Your Replit deployment URL
5. Click **Setup**
6. **Copy your Project ID** (format: `XXXXXXXXXX`)

### 3. Google AdSense
**Purpose**: Display automated ads on your website

**Setup Steps**:
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in with your Google account
3. Apply to AdSense program with your website
4. Wait for approval (typically 1-2 weeks)
5. Once approved, navigate to **Account** → **Settings**
6. **Copy your Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

**Important**: Your AdSense account must be **approved** before ads will display. During the review period, you can add the client ID but no ads will show.

## ⚙️ Configuration in Replit

### Step 1: Add Environment Variables

1. In your Replit workspace, click the **Tools** icon (left sidebar)
2. Select **Secrets** (lock icon)
3. Add the following environment variables:

| Variable Name | Example Value | Where to Get It |
|--------------|---------------|-----------------|
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics property → Data Streams → Your stream |
| `VITE_CLARITY_PROJECT_ID` | `n9k7m5h3j2` | Microsoft Clarity → Settings → Project ID |
| `VITE_ADSENSE_CLIENT_ID` | `ca-pub-1234567890123456` | Google AdSense → Account → Publisher ID |

### Step 2: Verify Configuration

After adding the secrets:

1. **Restart your workflow** (the "Start application" workflow will automatically restart)
2. Open your website in a new tab
3. Open **Browser DevTools** (F12 or right-click → Inspect)
4. Check the **Console** tab for confirmation messages:

```
✓ Google Analytics 4 initialized with ID: G-XXXXXXXXXX
✓ Microsoft Clarity initialized with ID: XXXXXXXXXX
```

If you see these messages, analytics is configured correctly! ✅

If you see warnings instead:
```
⚠ Google Analytics 4 not configured - set VITE_GA_MEASUREMENT_ID
⚠ Microsoft Clarity not configured - set VITE_CLARITY_PROJECT_ID
```

This means the environment variables are not set. Double-check the secret names match exactly.

### Step 3: Verify AdSense Configuration

1. Open Browser DevTools → **Network** tab
2. Filter by `adsbygoogle`
3. Refresh the page
4. You should see requests to `pagead2.googlesyndication.com`

**Note**: Ads will only display if your AdSense account is approved. During review, the scripts will load but no ads will show.

## 🧪 Testing Analytics

### Test GA4 Tracking

1. Visit your website
2. Navigate between different pages (Home → Sectors → Industries → Companies)
3. Wait 5-10 minutes
4. Go to Google Analytics → **Reports** → **Realtime**
5. You should see your active session

### Test Microsoft Clarity

1. Visit your website and interact with it:
   - Click on sectors
   - Use the search feature
   - View company profiles
2. Wait 5-10 minutes
3. Go to Microsoft Clarity → **Recordings**
4. You should see your session recording

### Test AdSense (After Approval)

1. Clear browser cache
2. Visit your website
3. AdSense units should display:
   - **Left sidebar**: 160x600 skyscraper ad
   - **Right sidebar**: Affiliate banner (not AdSense)
4. Ads may take 10-20 minutes to start displaying

## 🚫 Common Issues

### Issue: "Google Analytics 4 not configured" warning

**Solution**: 
- Check that the secret name is exactly `VITE_GA_MEASUREMENT_ID` (case-sensitive)
- Verify the value starts with `G-`
- Restart the workflow after adding secrets

### Issue: "Microsoft Clarity not configured" warning

**Solution**:
- Check that the secret name is exactly `VITE_CLARITY_PROJECT_ID` (case-sensitive)
- Verify the Project ID is copied correctly (no extra spaces)
- Restart the workflow after adding secrets

### Issue: AdSense ads not showing

**Possible causes**:
1. **Account not approved**: Wait for AdSense approval (check your email)
2. **Ad blocker enabled**: Disable ad blockers to test
3. **Insufficient traffic**: AdSense may not serve ads to low-traffic sites
4. **Policy violations**: Ensure your site complies with [AdSense policies](https://support.google.com/adsense/answer/48182)

### Issue: Analytics not tracking events

**Solution**:
- Check browser console for errors
- Verify you're not using an ad blocker (blocks analytics scripts)
- Test in incognito mode
- Wait 24-48 hours for data to populate in dashboards

## 📊 What Data is Tracked?

### Google Analytics 4

Automatically tracked:
- ✅ Page views (every route change)
- ✅ User sessions
- ✅ Geographic location
- ✅ Device type (mobile, desktop, tablet)
- ✅ Browser and OS
- ✅ Traffic sources

Custom events (implemented in code):
- 🔍 Search queries (`search` event)
- 🖱️ Ad clicks (`ad_click` event)
- 💰 Conversions (`conversion` event for payments)
- 📧 Form submissions (`form_submit` event)

### Microsoft Clarity

Automatically tracked:
- ✅ Session recordings (anonymized)
- ✅ Heatmaps (where users click)
- ✅ Scroll depth
- ✅ Rage clicks (frustration indicators)
- ✅ Dead clicks (non-functional elements)

## 🔐 Privacy & Compliance

Both analytics services are configured with privacy-first settings:

✅ **IP Anonymization**: User IPs are anonymized
✅ **Cookie Compliance**: Uses SameSite=None;Secure cookies
✅ **GDPR Ready**: Compatible with cookie consent systems
✅ **No PII**: No personally identifiable information collected

Your Privacy Policy should mention:
- Google Analytics for website analytics
- Microsoft Clarity for user experience analysis
- Google AdSense for advertising
- Links to [Google Privacy Policy](https://policies.google.com/privacy) and [Microsoft Privacy Policy](https://privacy.microsoft.com/)

## 📈 Next Steps

After configuring analytics:

1. **Wait 24-48 hours** for initial data collection
2. **Review traffic patterns** in GA4 to understand user behavior
3. **Watch Clarity recordings** to identify UX improvements
4. **Monitor AdSense performance** once approved (revenue, CTR, RPM)
5. **Set up conversion tracking** for company listings and claims
6. **Create custom reports** for business insights

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Review the [MONETIZATION_SETUP_GUIDE.md](MONETIZATION_SETUP_GUIDE.md) for broader context
3. Verify all environment variables are set correctly
4. Contact Google/Microsoft support for account-specific issues

## 📚 Additional Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [Microsoft Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Google AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
