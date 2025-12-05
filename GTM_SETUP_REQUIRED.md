# Google Tag Manager Setup - REQUIRED CONFIGURATION

## 🚨 IMPORTANT: Your GTM Container Must Be Configured

Your website loads GTM container `GTM-MN6GXKS4`, but ALL pixel tracking must be configured INSIDE GTM.

We've removed duplicate pixels from the code. Now you MUST configure these 4 platforms in GTM:

---

## 📋 Required GTM Tags (4 Platforms)

Go to: https://tagmanager.google.com/
Select Container: **GTM-MN6GXKS4**

---

## 1️⃣ Facebook Pixel

### Check if it exists:
1. Click **Tags** in left menu
2. Look for tag named "Facebook Pixel" or "Meta Pixel"

### If it exists:
- Verify it fires on "All Pages" trigger
- Check the Pixel ID is correct
- Click **Preview** to test

### If it doesn't exist:
1. Click **Tags** → **New**
2. Tag Name: `Facebook Pixel - All Pages`
3. Tag Configuration → **Custom HTML**
4. Paste this code:

```html
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_FACEBOOK_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_FACEBOOK_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
```

5. **IMPORTANT:** Replace `YOUR_FACEBOOK_PIXEL_ID` with your actual pixel ID
6. Triggering: **All Pages**
7. Click **Save**

**Where to find your Facebook Pixel ID:**
- Go to: https://business.facebook.com/events_manager
- Click your Pixel
- Copy the Pixel ID (15-16 digit number)

---

## 2️⃣ Google Analytics 4 (GA4)

### Check if it exists:
1. Click **Tags** in left menu
2. Look for "Google Analytics: GA4 Configuration" or "GA4"

### If it exists:
- Verify Measurement ID is correct (format: `G-XXXXXXXXXX`)
- Check it fires on "All Pages"

### If it doesn't exist:
1. Click **Tags** → **New**
2. Tag Name: `GA4 - Configuration`
3. Tag Configuration → **Google Analytics: GA4 Configuration**
4. Measurement ID: `G-XXXXXXXXXX` (get from Google Analytics)
5. Triggering: **All Pages**
6. Click **Save**

**Where to find your GA4 Measurement ID:**
- Go to: https://analytics.google.com/
- Admin → Data Streams → Your website stream
- Copy "Measurement ID" (starts with G-)

---

## 3️⃣ Microsoft UET Tag (Bing Ads)

### Create the tag:
1. Click **Tags** → **New**
2. Tag Name: `Microsoft UET - All Pages`
3. Tag Configuration → **Custom HTML**
4. Paste this code:

```html
<script>
(function(w,d,t,r,u){
  var f,n,i;
  w[u]=w[u]||[];
  f=function(){
    var o={ti:"187223299", enableAutoSpaTracking: true};
    o.q=w[u];
    w[u]=new UET(o);
    w[u].push("pageLoad");
  };
  n=d.createElement(t);
  n.src=r;
  n.async=1;
  n.onload=n.onreadystatechange=function(){
    var s=this.readyState;
    if(!s || s==="loaded" || s==="complete"){
      f();
      n.onload=n.onreadystatechange=null;
    }
  };
  i=d.getElementsByTagName(t)[0];
  i.parentNode.insertBefore(n,i);
})(window,document,"script","//bat.bing.com/bat.js","uetq");
</script>
```

5. Triggering: **All Pages**
6. Click **Save**

**Your UET Tag ID is: `187223299`**

**Verify in Microsoft Ads:**
- Go to: https://ads.microsoft.com/
- Tools → UET Tags
- Confirm tag ID 187223299 exists

---

## 4️⃣ TikTok Pixel

### Create the tag:
1. Click **Tags** → **New**
2. Tag Name: `TikTok Pixel - All Pages`
3. Tag Configuration → **Custom HTML**
4. Paste this code:

```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;
  var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){
    var i="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i;
    ttq._t=ttq._t||{},ttq._t[e]=+new Date;
    ttq._o=ttq._o||{},ttq._o[e]=n||{};
    var o=document.createElement("script");
    o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
    var a=document.getElementsByTagName("script")[0];
    a.parentNode.insertBefore(o,a)
  };

  ttq.load('7567017294929346577');
  ttq.page();
}(window, document, 'ttq');
</script>
```

5. Triggering: **All Pages**
6. Click **Save**

**Your TikTok Pixel ID is: `7567017294929346577`**

**Verify in TikTok:**
- Go to: https://ads.tiktok.com/
- Assets → Events → Web Events
- Confirm pixel 7567017294929346577 exists

---

## 5️⃣ Conversion Event Tracking

You also need to track when users claim vouchers. Create this trigger and tag:

### Create Trigger:
1. Click **Triggers** → **New**
2. Trigger Name: `Event - Voucher Claimed`
3. Trigger Type: **Custom Event**
4. Event Name: `voucher_claimed`
5. Click **Save**

### Create Conversion Tags:

**Facebook - Lead Event:**
```javascript
<script>
  fbq('track', 'Lead', {
    content_name: 'Dental Voucher',
    value: 50,
    currency: 'GBP'
  });
</script>
```
- Trigger: `Event - Voucher Claimed`

**GA4 - Purchase Event:**
```javascript
<script>
  gtag('event', 'purchase', {
    value: 50,
    currency: 'GBP',
    transaction_id: '{{Random Number}}',
    items: [{
      item_name: 'Dental Voucher',
      item_category: 'Lead Generation',
      price: 50,
      quantity: 1
    }]
  });
</script>
```
- Trigger: `Event - Voucher Claimed`

**Microsoft - Lead Event:**
```javascript
<script>
  window.uetq = window.uetq || [];
  window.uetq.push('event', 'submit_lead_form', {
    'event_category': 'Lead',
    'event_label': 'Dental Voucher',
    'revenue_value': 50,
    'currency': 'GBP'
  });
</script>
```
- Trigger: `Event - Voucher Claimed`

**TikTok - Complete Registration:**
```javascript
<script>
  ttq.track('CompleteRegistration', {
    content_name: 'Dental Voucher',
    value: 50,
    currency: 'GBP'
  });
</script>
```
- Trigger: `Event - Voucher Claimed`

---

## 🧪 Testing Your GTM Setup

### Before Publishing:
1. Click **Preview** (top right in GTM)
2. Enter: `https://smilemoore.co.uk`
3. GTM will open your site in debug mode

### Check:
- **Summary** tab shows "Tags Fired" section
- You should see 4 tags fire on page load:
  - Facebook Pixel
  - GA4 Configuration
  - Microsoft UET
  - TikTok Pixel

### Test Conversion Event:
1. In Preview mode, fill out the form
2. Submit to claim voucher
3. Check "Tags Fired" - should show 4 conversion tags

---

## 📤 Publishing Your Changes

Once testing looks good:

1. Click **Submit** (top right)
2. Version Name: `Add all 4 platform pixels + conversion tracking`
3. Version Description:
   ```
   Added tracking for:
   - Facebook Pixel (PageView + Lead)
   - Google Analytics 4 (PageView + Purchase)
   - Microsoft UET (PageView + Lead)
   - TikTok Pixel (PageView + CompleteRegistration)

   Removed duplicate pixels from codebase.
   All tracking now managed via GTM.
   ```
4. Click **Publish**

---

## ✅ Verification Checklist

After publishing, test on live site:

- [ ] Visit https://smilemoore.co.uk in incognito
- [ ] Open DevTools (F12) → Application → Cookies
- [ ] Check these cookies exist:
  - `_fbp` (Facebook)
  - `_ga` (Google)
  - `MUID` (Microsoft)
  - `_ttp` (TikTok)
- [ ] Submit a test voucher claim
- [ ] Check each platform's Events Manager for the event:
  - Facebook: https://business.facebook.com/events_manager
  - Google: https://analytics.google.com/ → Reports → Realtime
  - Microsoft: https://ads.microsoft.com/ → Conversion Tracking
  - TikTok: https://ads.tiktok.com/ → Events

---

## 🚨 CRITICAL: Do This ASAP

Your website is currently deployed with NO pixel tracking (we removed the hardcoded ones).

**You must configure GTM within 24 hours or you'll lose all tracking data.**

---

## 📊 Expected Results After GTM Setup

### Browser Cookies (in DevTools):
```
_fbp=fb.1.1763767115580.4333110721
_ga=GA1.1.302005674.1763599161
MUID=ABC123DEF456
_ttp=abc123xyz.1763767115580
```

### Google Sheets - Visitors Tab:
| Column | Value | Status |
|--------|-------|--------|
| W - Facebook _fbp | fb.1.xxx | ✅ Real |
| Y - Google _ga | GA1.1.xxx | ✅ Real |
| AA - Microsoft MUID | MUID=xxx | ✅ Real |
| AC - TikTok _ttp | abc123.xxx | ✅ Real |
| AS - Cookie Quality | 4 | ✅ Perfect |
| AT - All Captured | Yes | ✅ Perfect |

---

## 🆘 Need Help?

**Can't access GTM?**
- Go to: https://tagmanager.google.com/
- If you don't see container GTM-MN6GXKS4, you need access
- Ask your Google Ads / Analytics admin to grant you Editor access

**Don't know your Pixel IDs?**
- Facebook: https://business.facebook.com/events_manager
- Google: https://analytics.google.com/ → Admin → Data Streams
- Microsoft: Already provided above (187223299)
- TikTok: Already provided above (7567017294929346577)

**Pixels not firing in Preview mode?**
- Check for JavaScript errors in browser console
- Verify Pixel IDs are correct (no typos)
- Make sure you didn't include quotes around IDs
- Try in Chrome (best compatibility)

---

**This is the CORRECT architecture. All tracking = GTM. Your codebase = Clean.**
