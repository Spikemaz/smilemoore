# Analytics & Tracking Setup Guide

All tracking pixels have been added to your website. Follow these steps to activate each one:

## 1. Google Analytics (FREE - RECOMMENDED)

**Setup:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create account → Add property → "Smile Moore Dental"
3. Copy your Measurement ID (looks like: `G-XXXXXXXXXX`)
4. Open `app/components/Analytics.tsx`
5. Replace `GA_MEASUREMENT_ID` with your actual ID (2 places)

**What you get:**
- Real-time visitors
- Traffic sources
- Page views
- User demographics
- Location data

---

## 2. Meta Pixel (Facebook/Instagram Ads)

**Setup:**
1. Go to [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. Create Pixel → Name it "Smile Moore Pixel"
3. Copy your Pixel ID (numeric, like: `1234567890`)
4. Open `app/components/Analytics.tsx`
5. Replace `YOUR_META_PIXEL_ID` with your actual ID (2 places)

**What you get:**
- Track Facebook/Instagram ad performance
- Build retargeting audiences
- Track conversions

---

## 3. TikTok Pixel

**Setup:**
1. Go to [ads.tiktok.com](https://ads.tiktok.com)
2. Assets → Events → Web Events → Create Pixel
3. Copy Pixel ID
4. Open `app/components/Analytics.tsx`
5. Replace `YOUR_TIKTOK_PIXEL_ID` with your ID

---

## 4. Google Ads Conversion Tracking

**Setup:**
1. Go to [ads.google.com](https://ads.google.com)
2. Tools → Measurement → Conversions → New Conversion
3. Copy Conversion ID (looks like: `AW-XXXXXXXXX`)
4. Replace `AW-CONVERSION_ID` in Analytics.tsx

---

## 5. Microsoft Ads (Bing)

**Setup:**
1. Go to [ads.microsoft.com](https://ads.microsoft.com)
2. Tools → UET Tags → Create UET tag
3. Copy Tag ID
4. Replace `YOUR_UET_TAG_ID` in Analytics.tsx

---

## 6. LinkedIn Insight Tag

**Setup:**
1. Go to [linkedin.com/campaignmanager](https://linkedin.com/campaignmanager)
2. Account Assets → Insight Tag → Install Insight Tag
3. Copy Partner ID
4. Replace `YOUR_LINKEDIN_PARTNER_ID` in Analytics.tsx (2 places)

---

## 7. Microsoft Clarity (FREE - RECOMMENDED)

**Setup:**
1. Go to [clarity.microsoft.com](https://clarity.microsoft.com)
2. Add new project → "Smile Moore Website"
3. Copy Project ID
4. Replace `YOUR_CLARITY_PROJECT_ID` in Analytics.tsx

**What you get:**
- FREE heatmaps
- Session recordings
- User behavior insights

---

## 8. Pinterest Tag

**Setup:**
1. Go to [ads.pinterest.com](https://ads.pinterest.com)
2. Ads → Conversions → Install Tag
3. Copy Tag ID
4. Replace `YOUR_PINTEREST_TAG_ID` in Analytics.tsx (2 places)

---

## 9. Snapchat Pixel

**Setup:**
1. Go to [ads.snapchat.com](https://ads.snapchat.com)
2. Business Manager → Snapchat Pixel → Create Pixel
3. Copy Pixel ID
4. Replace `YOUR_SNAPCHAT_PIXEL_ID` in Analytics.tsx

---

## 10. Twitter/X Pixel

**Setup:**
1. Go to [ads.twitter.com](https://ads.twitter.com)
2. Tools → Events Manager → Create Pixel
3. Copy Pixel ID
4. Replace `YOUR_TWITTER_PIXEL_ID` in Analytics.tsx

---

## 11. Reddit Pixel

**Setup:**
1. Go to [ads.reddit.com](https://ads.reddit.com)
2. Pixels → Create Pixel
3. Copy Pixel ID
4. Replace `YOUR_REDDIT_PIXEL_ID` in Analytics.tsx

---

## 12. Mailchimp Email Marketing

**Setup:**
1. Go to [mailchimp.com](https://mailchimp.com) (FREE up to 500 subscribers)
2. Create account
3. Audience → Create Audience
4. Copy Audience ID (Settings → Audience name and defaults)
5. Account → Extras → API keys → Create key
6. In Vercel, go to: Settings → Environment Variables
7. Add these variables:
   - `MAILCHIMP_API_KEY` = your API key
   - `MAILCHIMP_AUDIENCE_ID` = your audience ID
   - `MAILCHIMP_SERVER_PREFIX` = server prefix (e.g., `us17` from your API key)
8. Redeploy your site in Vercel

**What you get:**
- Email newsletter signups
- Email campaigns
- Subscriber management

---

## Priority Setup Order:

**Do First (Most Important):**
1. ✅ Google Analytics - Essential for all data
2. ✅ Microsoft Clarity - FREE heatmaps & recordings
3. ✅ Meta Pixel - Best for local business ads
4. ✅ Mailchimp - Build email list from day 1

**Do When Ready to Advertise:**
5. Google Ads
6. TikTok Pixel
7. Microsoft Ads (Bing)

**Optional (Do Later):**
8. LinkedIn, Pinterest, Snapchat, Twitter, Reddit

---

## After Setup:

1. Edit `app/components/Analytics.tsx` with all your IDs
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add tracking pixel IDs"
   git push
   ```
3. Vercel will auto-deploy (2-3 minutes)
4. Your pixels are now live!

---

## Checking if Pixels Work:

- **Google Analytics**: Real-time reports
- **Meta Pixel**: Facebook Pixel Helper extension
- **Clarity**: Sessions appear in dashboard
- Install browser extensions to test pixels:
  - Facebook Pixel Helper
  - Tag Assistant (Google)
  - Omnibug
