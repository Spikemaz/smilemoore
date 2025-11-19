# Tracking Pixels Setup Guide

Follow these steps to set up your tracking pixels for retargeting and analytics.

---

## 1. Meta Pixel (Facebook/Instagram Retargeting)

### Get Your Meta Pixel ID:

**Step 1:** Go to [Facebook Events Manager](https://business.facebook.com/events_manager)

**Step 2:** If you don't have a Facebook Business account:
- Click "Create Account"
- Follow the prompts to set up your business
- Business name: "Smile Moore Dental"

**Step 3:** Create a Pixel
- Click "Connect Data Sources"
- Select "Web"
- Click "Get Started"
- Name it: "Smile Moore Website Pixel"
- Enter website: `smilemoore.co.uk`
- Click "Continue"

**Step 4:** Skip the installation (we'll do it)
- Click "Continue" → "Done"

**Step 5:** Find Your Pixel ID
- Go back to Events Manager
- Click on your pixel name
- Look for "Pixel ID" - it's a number like: `123456789012345`
- **Copy this number**

**Step 6:** Give me the Pixel ID
- Once you have it, tell me: "My Meta Pixel ID is: XXXXX"
- I'll add it to your website

---

### What Meta Pixel Does:

✅ Tracks everyone who visits your website
✅ Builds "Website Visitors" audience in Facebook
✅ Lets you show Facebook/Instagram ads to people who:
   - Visited your site but didn't book
   - Scanned QR code but left
   - Viewed specific pages

**Retargeting Example:**
1. Person scans QR → visits site → leaves without booking
2. Meta Pixel tracks them (anonymously)
3. You run Facebook ad: "Still thinking about your smile? Book today!"
4. That person sees your ad on Facebook/Instagram
5. They come back and book!

---

## 2. Microsoft Clarity (FREE Heatmaps & Session Recordings)

### Get Your Clarity Project ID:

**Step 1:** Go to [Microsoft Clarity](https://clarity.microsoft.com)

**Step 2:** Sign in with Microsoft account (or create free account)

**Step 3:** Create a Project
- Click "Add new project"
- Project name: "Smile Moore Website"
- Website URL: `https://smilemoore.co.uk`
- Click "Add new project"

**Step 4:** Get Your Project ID
- After creating, you'll see a code snippet
- Look for: `clarity("init", "YOUR_PROJECT_ID");`
- The Project ID looks like: `abcd1234ef`
- **Copy this ID**

**Step 5:** Give me the Project ID
- Tell me: "My Clarity Project ID is: XXXXX"
- I'll add it to your website

---

### What Microsoft Clarity Does:

✅ **Heatmaps** - See where people click, move mouse, scroll
✅ **Session Recordings** - Watch actual visitor sessions (like watching over their shoulder)
✅ **Insights** - See why people leave, what confuses them
✅ **Rage Clicks** - Alerts when users click same spot repeatedly (frustration)
✅ **Dead Clicks** - Shows where people click expecting something to happen
✅ **JavaScript Errors** - Identifies technical issues

**100% FREE - No limits!**

**Example Insights:**
- "Most people leave after viewing services page" → Improve services content
- "Users click phone number expecting it to dial" → Make it clickable
- "People don't scroll to email signup form" → Move it higher

---

## 3. Google Ads Conversion Tracking

### Get Your Google Ads Conversion ID:

**Step 1:** Go to [Google Ads](https://ads.google.com)

**Step 2:** If you don't have Google Ads account:
- Click "Start now"
- Create account (can skip campaign setup for now)

**Step 3:** Create Conversion Action
- Click **Tools & Settings** (wrench icon, top right)
- Under "Measurement", click **Conversions**
- Click **+ New conversion action**
- Select **Website**

**Step 4:** Set up conversion
- Conversion name: "Contact Form Submission"
- Category: "Submit lead form"
- Value: "Don't assign value" (or enter average patient value)
- Count: "One"
- Click "Create and continue"

**Step 5:** Install tag manually
- Choose "Install the tag yourself"
- You'll see code with: `AW-XXXXXXXXX`
- This is your **Conversion ID**
- Looks like: `AW-123456789`
- **Copy this ID**

**Step 6:** Give me the Conversion ID
- Tell me: "My Google Ads Conversion ID is: AW-XXXXX"
- I'll add it to your website

---

### What Google Ads Tracking Does:

✅ Tracks conversions (bookings, form fills, phone calls)
✅ Builds remarketing audiences
✅ Shows Google ads to past website visitors
✅ Tracks ROI on Google ad campaigns

**Where Your Ads Appear:**
- Google Search results
- YouTube videos
- Gmail
- Google Display Network (millions of websites)

---

## Quick Start Instructions:

### **Do These 3 Now (30 minutes total):**

1. **Meta Pixel** (15 mins)
   - Go to [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
   - Create pixel
   - Get Pixel ID
   - Send to me

2. **Microsoft Clarity** (5 mins)
   - Go to [clarity.microsoft.com](https://clarity.microsoft.com)
   - Create project
   - Get Project ID
   - Send to me

3. **Google Ads** (10 mins)
   - Go to [ads.google.com](https://ads.google.com)
   - Create conversion
   - Get Conversion ID
   - Send to me

---

## Once I Have Your IDs:

I'll update the code and push to GitHub. Within 5 minutes:

✅ Meta Pixel will be live (tracking starts immediately)
✅ Clarity will be recording sessions (you can watch visitors!)
✅ Google Ads tracking active (ready for campaigns)

---

## Testing Your Pixels:

### **Meta Pixel:**
1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper) Chrome extension
2. Visit your website
3. Extension icon turns green = Working!

### **Microsoft Clarity:**
1. Visit your Clarity dashboard
2. Wait 2 minutes
3. You'll see your own session recording!

### **Google Ads:**
1. In Google Ads, go to Conversions
2. Look for "Recent conversions"
3. Visit your site → You should see test conversion

---

## Need Help?

**Can't find Pixel ID?** Send me screenshot
**Don't have Facebook Business?** I'll walk you through setup
**Questions?** Just ask!

---

## What Happens Next:

Once pixels are installed, you'll be able to:

1. **See visitor behavior** (Clarity recordings)
2. **Build retargeting audiences** (Meta + Google)
3. **Track conversions** (Form fills, phone calls)
4. **Run remarketing ads** (Show ads to past visitors)
5. **Optimize campaigns** (See which ads work)

**Start by getting your Meta Pixel ID first - it's the most important one!**
