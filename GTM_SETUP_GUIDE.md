# Google Tag Manager Setup Guide
**Container ID:** GTM-MN6GXKS4

## ✅ Code Installation (COMPLETED)
The GTM container is now installed on your website. Once you deploy, it will be live.

---

## 📋 Tags to Configure in GTM

Go to https://tagmanager.google.com and select your container `GTM-MN6GXKS4`

### 1. Google Analytics 4 (GA4)

**Tag Configuration:**
- Tag Type: `Google Analytics: GA4 Configuration`
- Measurement ID: `G-F6CLY0PVY0`
- Triggering: `All Pages`

**Steps:**
1. Click **Tags** → **New**
2. Name it: `GA4 - All Pages`
3. Tag Configuration → Google Analytics: GA4 Configuration
4. Enter Measurement ID: `G-F6CLY0PVY0`
5. Triggering → Select `All Pages`
6. Save

---

### 2. Meta Pixel (Facebook/Instagram)

**Tag Configuration:**
- Tag Type: `Custom HTML`
- HTML Code:
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2396693024117840');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=2396693024117840&ev=PageView&noscript=1"/>
</noscript>
```
- Triggering: `All Pages`

**Steps:**
1. Click **Tags** → **New**
2. Name it: `Meta Pixel - Base Code`
3. Tag Configuration → Custom HTML
4. Paste the HTML code above
5. Triggering → Select `All Pages`
6. Save

---

### 3. TikTok Pixel (When you get Pixel ID)

**Tag Configuration:**
- Tag Type: `Custom HTML`
- HTML Code:
```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('YOUR_TIKTOK_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
```
- Replace `YOUR_TIKTOK_PIXEL_ID` with your actual TikTok Pixel ID
- Triggering: `All Pages`

---

## 🎯 Conversion Events to Set Up

### Email Submitted (Step 1)

**Create Trigger:**
1. **Triggers** → **New**
2. Name: `Form Submit - Email`
3. Trigger Type: `Custom Event`
4. Event name: `email_submitted`
5. Save

**Create Tags for Each Platform:**

**Meta - Email Submit:**
- Tag Type: `Custom HTML`
- HTML:
```html
<script>
fbq('track', 'Lead', {
  content_name: 'Email Submitted',
  content_category: 'Step 1'
});
</script>
```
- Triggering: `Form Submit - Email`

**GA4 - Email Submit:**
- Tag Type: `Google Analytics: GA4 Event`
- Configuration Tag: `GA4 - All Pages`
- Event Name: `generate_lead`
- Event Parameters:
  - `step`: `1`
  - `form_type`: `email`
- Triggering: `Form Submit - Email`

---

### Voucher Claimed (Step 4 Complete)

**Create Trigger:**
1. **Triggers** → **New**
2. Name: `Form Submit - Complete`
3. Trigger Type: `Custom Event`
4. Event name: `voucher_claimed`
5. Save

**Meta - Complete:**
```html
<script>
fbq('track', 'CompleteRegistration', {
  content_name: 'Voucher Claimed',
  value: {{voucher_value}},
  currency: 'GBP'
});
</script>
```

**GA4 - Complete:**
- Event Name: `purchase`
- Event Parameters:
  - `value`: `{{voucher_value}}`
  - `currency`: `GBP`

---

## 🔧 Required Code Changes for Event Tracking

Add these to your form submission handlers:

### Step 1 - Email Submit
```javascript
// After successful email submission
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'email_submitted',
  voucher_value: voucherValue
});
```

### Step 4 - Complete
```javascript
// After final step completion
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'voucher_claimed',
  voucher_value: voucherValue
});
```

---

## 📊 Testing Your Setup

1. **Enable Preview Mode:**
   - In GTM, click **Preview**
   - Enter your website URL: `https://smilemoore.co.uk`
   - Click **Connect**

2. **Test Each Event:**
   - Fill out the form
   - Watch GTM Preview window
   - Verify each tag fires correctly

3. **Publish:**
   - Click **Submit** in GTM
   - Name your version: `Initial Setup - Meta, GA4, TikTok`
   - Click **Publish**

---

## 🚀 Benefits You'll See

✅ **Faster Loading** - All pixels load through one container
✅ **Easy Management** - Add/remove pixels without code changes
✅ **Better Tracking** - Consistent event tracking across platforms
✅ **Lower Ad Costs** - Better page speed = better quality scores
✅ **Version Control** - Roll back changes if something breaks

---

## 📌 Your Pixel IDs

- **Meta Pixel:** 2396693024117840
- **Google Analytics:** G-F6CLY0PVY0
- **TikTok Pixel:** (Add when available)
- **GTM Container:** GTM-MN6GXKS4

---

## Need Help?

Contact me or check these resources:
- GTM Documentation: https://support.google.com/tagmanager
- Meta Pixel Helper: https://developers.facebook.com/docs/meta-pixel
- GA4 Events: https://developers.google.com/analytics/devguides/collection/ga4/events
