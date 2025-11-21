# Setup Facebook Pixel & Google Analytics for Retargeting

Your code is ready to capture **Facebook Browser IDs** and **Google Analytics Client IDs** from visitors - even those who come via QR codes or direct URL!

This enables you to retarget them later with Facebook/Instagram ads.

## Step 1: Get Your Facebook Pixel ID

1. Go to **[Facebook Events Manager](https://business.facebook.com/events_manager2)**
2. If you don't have a Pixel yet:
   - Click **Connect Data Sources** → **Web** → **Facebook Pixel**
   - Click **Get Started**
   - Name it "Smile Moore Website"
   - Enter your website URL: `smilemoore.co.uk`
   - Click **Continue**
3. Copy your **Pixel ID** (it's a long number like `123456789012345`)

## Step 2: Get Your Google Analytics 4 Measurement ID

1. Go to **[Google Analytics](https://analytics.google.com/)**
2. If you don't have GA4 set up:
   - Click **Admin** (gear icon at bottom left)
   - Click **Create Property**
   - Enter property name: "Smile Moore Dental"
   - Set timezone and currency
   - Click **Next** → **Create**
   - Choose **Web** platform
   - Enter stream name: "Smile Moore Website"
   - Enter URL: `https://smilemoore.co.uk`
   - Click **Create stream**
3. Copy your **Measurement ID** (starts with `G-` like `G-XXXXXXXXXX`)

## Step 3: Add IDs to Your Environment Variables

### On Your Local Computer (.env.local file):

Add these two lines to `c:\Users\marcu\Desktop\SmileMoore\.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

Replace with your actual IDs.

### On Vercel (Production):

1. Go to **[Vercel Dashboard](https://vercel.com/)**
2. Select your **SmileMoore** project
3. Click **Settings** → **Environment Variables**
4. Add two new variables:
   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Value**: `G-XXXXXXXXXX`
   - **Name**: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | **Value**: `123456789012345`
5. Click **Save**
6. Redeploy your site (Vercel will auto-redeploy on next push, or click **Deployments** → **Redeploy**)

## Step 4: Test It's Working

After adding the IDs and deploying:

1. Visit your website: `https://smilemoore.co.uk`
2. Open browser Developer Tools (F12)
3. Go to **Application** tab → **Cookies** → `https://smilemoore.co.uk`
4. You should see:
   - `_fbp` cookie (Facebook Browser ID) - starts with `fb.1.`
   - `_ga` cookie (Google Analytics Client ID) - starts with `GA1.1.`

These will now be captured in your **Visitors** Google Sheet!

## What This Enables:

### Facebook Retargeting (Even from QR Code Scans!)
- **Custom Audiences**: People who visited but didn't claim voucher
- **Lookalike Audiences**: Find similar people to your best customers
- **Retargeting Ads**: Show ads to people who abandoned the form

### Google Analytics
- **Audience Segmentation**: See which visitors convert best
- **Behavior Flow**: Track how people navigate your funnel
- **Google Ads Retargeting**: Retarget visitors with Google Display Ads

## Privacy Compliance

Both Facebook Pixel and Google Analytics are GDPR/UK-compliant when used for:
- ✅ Analytics and website improvement
- ✅ Retargeting ads to people who visited your site
- ✅ Measuring campaign performance

No additional cookie banner needed if you're only using for these purposes in the UK.

---

**Need Help?**
- Facebook Pixel Help: https://www.facebook.com/business/help/952192354843755
- Google Analytics Help: https://support.google.com/analytics/answer/9304153
