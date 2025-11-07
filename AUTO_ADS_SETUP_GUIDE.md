# Google AdSense Auto Ads Setup Guide for COMCUBES

## Overview
This guide shows you how to enable Google AdSense **Auto Ads** as a supplement to your manual ad placements for **maximum revenue potential**. 

**Strategy**: Hybrid Approach (Manual + Auto Ads)
- **Manual ads** (what you have now): Placed in strategic high-performing locations you control
- **Auto Ads** (what this guide sets up): Google's AI fills gaps and finds placements you might miss

**Expected Result**: 10-20% revenue increase compared to manual-only approach, with minimal setup effort.

---

## ⚠️ Important Prerequisites

Before enabling Auto Ads, ensure you have:

1. ✅ **Active Google AdSense account** - Approved and in good standing
2. ✅ **VITE_ADSENSE_CLIENT_ID** environment variable set in Replit Secrets (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. ✅ **Manual ad placements** already deployed (you have these on HomePage, SectorsPage, IndustryPage, CompanyProfilePage)
4. ✅ **Website published** to production (Auto Ads only work on live sites, not localhost/dev)

---

## Step 1: Add Auto Ads Code to Your Site

### Option A: Already Done (Recommended)

Your `GoogleAdSense.tsx` component already includes the Auto Ads script when a valid `VITE_ADSENSE_CLIENT_ID` is set. The code automatically loads:

```javascript
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>
```

**Verification**: Check your browser's Network tab on any page → Search for "adsbygoogle.js" → Should show `200 OK` status.

---

### Option B: Manual Installation (If Needed)

If for some reason the script isn't loading, manually add this to `client/src/main.tsx` or `client/index.html` in the `<head>` section:

```html
<script async 
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous">
</script>
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual AdSense Publisher ID.

---

## Step 2: Enable Auto Ads in AdSense Dashboard

### 2.1 Access Auto Ads Settings

1. Go to [Google AdSense Dashboard](https://www.google.com/adsense)
2. Click **Ads** in the left sidebar
3. Click **Overview** tab
4. Under "By site", find your site (`comcubes.replit.app` or your custom domain)
5. Click **Edit** (pencil icon) next to your site

### 2.2 Turn On Auto Ads

1. Toggle **Auto ads** switch to **ON** (it should turn blue)
2. You'll see a preview of potential ad placements on your site

### 2.3 Configure Ad Load (CRITICAL!)

**This is the most important setting:**

1. Click **Ad load** slider/dropdown
2. Set to **50-60%** (NOT 100%!)
   - **Why not 100%?**: Too many ads hurt user experience (UX) → lower engagement → lower RPM → less revenue
   - **50-60% sweet spot**: Balances revenue with UX, lets Google fill gaps without overwhelming users

3. **Visual guide**:
   ```
   Low (20%) ───── Medium (50-60%) ───── High (100%)
                        ▲
                   Set it HERE
   ```

### 2.4 Enable Recommended Auto Ad Formats

Google Auto Ads supports multiple formats. Enable these for best results:

#### ✅ **Enable (Recommended)**:

- **Anchor ads** - Sticky banners at top/bottom on mobile
  - Pros: High viewability, non-intrusive
  - Best for: Mobile traffic
  
- **Vignette ads** - Full-screen interstitials between page navigations
  - Pros: High CPM
  - Cons: Can annoy users if overused (that's why we set ad load to 50-60%)
  
- **In-article ads** - Ads between paragraphs of content
  - Pros: Natural placement, high engagement
  - Best for: Long-form content (blog posts, company descriptions)

- **In-feed ads** - Ads in content lists/grids
  - Pros: Blends with content
  - Best for: Your sector/industry/company grids

#### ❌ **Disable or Use Cautiously**:

- **Matched content** - Recommended articles/content
  - Only useful if you have a blog or lots of related content
  - **For COMCUBES**: Disable (you're a directory, not a content site)

- **Multiplex ads** - Grid of recommended content with ads
  - Same as matched content
  - **For COMCUBES**: Disable

### 2.5 Use Preview Tool to Block Bad Placements

1. In Auto Ads settings, click **Preview**
2. Your site loads with blue overlays showing where Auto Ads will appear
3. **Check for**:
   - Ads covering navigation menus
   - Ads between every company in your grids (too aggressive)
   - Ads in forms or checkout flows
4. **Block bad placements**:
   - Hover over any blue overlay
   - Click **Block this ad placement**
   - Google remembers your preference

### 2.6 Save and Apply

1. Click **Apply to site** button (bottom right)
2. Auto Ads are now live! (may take 10-30 minutes to start showing)

---

## Step 3: Advanced Settings (Optional but Recommended)

### 3.1 Customize Auto Ads Per Page Type

You can control Auto Ads differently for different pages:

1. In Auto Ads settings → Click **Advanced URL settings**
2. Add rules like:
   ```
   URL contains: /company/
   → Enable: Anchor ads, In-article ads
   → Disable: Vignette ads (don't interrupt when users browse company profiles)
   
   URL contains: /sector/
   → Enable: All formats at 50% ad load
   
   URL is: /
   → Enable: Anchor only (homepage already has 3 manual ads)
   ```

### 3.2 Exclude Specific Pages

If certain pages should NEVER show Auto Ads:

1. Auto Ads settings → **Page exclusions**
2. Add URL patterns to exclude:
   ```
   /list-company    (don't distract users filling out forms)
   /advertise       (don't compete with your own ad sales page)
   /admin           (admin pages)
   ```

---

## Step 4: Monitor Performance

### 4.1 First 48 Hours

Auto Ads need time to learn and optimize:

- **Day 1**: You may see few or no Auto Ads (normal - Google is learning)
- **Day 2-7**: Auto Ads ramp up gradually
- **Week 2+**: Performance stabilizes

### 4.2 Check Auto Ads Revenue

1. Go to AdSense → **Reports**
2. Filter by:
   - **Date range**: Last 30 days
   - **Ad unit**: Select "Auto ads"
3. Compare metrics:
   - **Page RPM**: Revenue per 1,000 pageviews (higher is better)
   - **Impressions**: Number of ads shown
   - **CTR**: Click-through rate (1-3% is normal)

### 4.3 Compare Manual vs Auto Ads

1. In Reports, add dimension: **Ad unit**
2. You'll see:
   ```
   Manual ad units:
   - homepage-above-fold: $X RPM
   - sectors-page-left-sidebar: $Y RPM
   - ...
   
   Auto ads: $Z RPM
   ```

3. **Healthy benchmark**:
   - Manual ads: $3-10 RPM (higher because you control placement)
   - Auto ads: $1-5 RPM (lower but fills gaps you'd otherwise miss)
   - **Total revenue = Manual + Auto** (this is what matters!)

### 4.4 Adjust Ad Load Based on Data

After 30 days, check:

- **If Page RPM increased 10-20%**: Perfect! Keep settings as-is
- **If Page RPM increased <5%**: Try increasing ad load to 60-70%
- **If Page RPM decreased**: Auto Ads are hurting UX → lower ad load to 30-40% or disable vignette ads
- **If users complain about ads**: Lower ad load immediately

---

## Step 5: Troubleshooting

### "Auto Ads Not Showing"

**Possible causes**:

1. **Too early** - Wait 24-48 hours after enabling
2. **Ad blocker enabled** - Disable it to test
3. **Wrong Publisher ID** - Check `VITE_ADSENSE_CLIENT_ID` matches AdSense account
4. **Site not verified** - Go to AdSense → Sites → Verify ownership
5. **Policy violation** - Check AdSense → **Policy Center** for warnings

**Fix**:
```bash
# Check if AdSense script is loading:
# Open browser DevTools → Network tab → Filter "adsbygoogle"
# Should see: adsbygoogle.js - 200 OK status
```

---

### "Auto Ads Showing Too Many Ads"

**Fix**: Lower ad load to 30-40% in AdSense dashboard

---

### "Auto Ads Conflict with Manual Ads"

**Good news**: Google automatically detects manual ad units and avoids doubling up in the same spot. You should NOT see two ads stacked on top of each other.

**If you do see overlapping ads**:
1. Use Preview Tool to block the conflicting Auto Ad placement
2. Or reduce manual ad count on that page

---

### "Revenue Dropped After Enabling Auto Ads"

**Possible causes**:
1. **Ad load too high** (100%) → users leaving faster → fewer page views → less revenue
2. **Vignette ads annoying users** → disable vignettes
3. **Auto Ads competing with high-performing manual ads** → use Page exclusions for your best pages

**Fix**:
1. Check Google Analytics: Has bounce rate increased? Time on site decreased?
2. If yes: Lower ad load or disable Auto Ads on high-traffic pages
3. Wait another 30 days to see if Auto Ads optimize

---

## Step 6: Best Practices for Hybrid Monetization

### ✅ **DO**:

- Keep manual ads in your **3-5 best-performing positions** (above-fold, mid-content, end of content)
- Use Auto Ads at **50-60% ad load** to fill gaps
- Enable **Anchor ads** for mobile users (high revenue, low friction)
- Monitor **Page RPM and bounce rate** monthly
- Test disabling Auto Ads on your **highest-traffic pages** to see if manual-only performs better

### ❌ **DON'T**:

- Set ad load to 100% (kills UX and RPM)
- Remove all manual ads and rely only on Auto Ads (you'll lose revenue)
- Enable Auto Ads on form pages (`/list-company`, `/advertise`)
- Ignore user complaints about ads (they vote with their feet → fewer views → less revenue)
- Check revenue daily (wait at least 30 days for meaningful data)

---

## Expected Results Timeline

### Week 1:
- Auto Ads start appearing sporadically
- Revenue may be flat or slightly down (Google is learning)
- **Action**: Monitor, don't panic

### Week 2-4:
- Auto Ads optimize placements
- Revenue should increase 5-15% vs. manual-only
- **Action**: Check Ad unit report to compare manual vs auto performance

### Month 2+:
- Stable performance
- Revenue increase: 10-20% (industry average for hybrid approach)
- **Action**: Fine-tune ad load based on data

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  COMCUBES AUTO ADS CHEAT SHEET                              │
├─────────────────────────────────────────────────────────────┤
│  Ad Load Setting:       50-60%  (NOT 100%!)                 │
│  Enabled Formats:       Anchor, Vignette, In-article        │
│  Disabled Formats:      Matched content, Multiplex          │
│  Excluded Pages:        /list-company, /advertise, /admin   │
│  Expected Revenue Lift: +10-20% after 30 days               │
│  Check Performance:     Monthly, via Reports → Ad units     │
└─────────────────────────────────────────────────────────────┘
```

---

## Support & Next Steps

**Need help?**
- [Google AdSense Help Center](https://support.google.com/adsense)
- [Auto Ads Official Guide](https://support.google.com/adsense/answer/9261805)
- **Email**: Check with Google AdSense support via your dashboard

**After Auto Ads are stable**, consider:
1. A/B testing ad load percentages (40% vs 60% vs 70%)
2. Trying different ad formats on different device types
3. Moving to the next phase of your Platform Transformation Roadmap (see `replit.md`)

---

*Document Version: 1.0*  
*Last Updated: November 6, 2025*  
*Prepared for: COMCUBES AdSense Optimization*
