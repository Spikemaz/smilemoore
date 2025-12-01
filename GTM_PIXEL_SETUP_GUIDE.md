# Complete GTM Pixel Setup Guide - All 8 Platforms

This guide will walk you through adding pixels for **8 major advertising platforms** via Google Tag Manager.

---

## 📋 **Platforms We're Adding:**

1. ✅ Facebook/Instagram (Already in GTM)
2. ✅ Google Analytics 4 (Already in GTM)
3. 🆕 TikTok Pixel
4. 🆕 LinkedIn Insight Tag
5. 🆕 Microsoft UET Tag
6. 🆕 Twitter/X Pixel
7. 🆕 Snapchat Pixel
8. 🆕 WhatsApp (Meta Business)

---

## 🎯 **Step-by-Step GTM Setup**

### **Prerequisites:**

1. Open [Google Tag Manager](https://tagmanager.google.com/)
2. Select your **SmileMoore container** (GTM-MN6GXKS4)
3. Have all the platform ad accounts open in separate tabs

---

## **1️⃣ TikTok Pixel**

### **Get Your TikTok Pixel ID:**

1. Go to [TikTok Ads Manager](https://ads.tiktok.com/)
2. Click **Assets** → **Events** → **Web Events**
3. Click **Manage** on your Pixel (or **Create Pixel** if new)
4. Copy your **Pixel ID** (format: `C9ABC123XYZ456` - starts with letter + numbers)
5. Click **Set Up Web Events** → **Manual Installation** → Copy the pixel code

### **Add to GTM:**

1. In GTM, click **Tags** → **New**
2. **Tag Name:** `TikTok Pixel - All Pages`
3. **Tag Type:** Click tag configuration → **Custom HTML**
4. **Paste this code** (replace `YOUR_PIXEL_ID`):

```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

  ttq.load('YOUR_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
```

5. **Triggering:** Click **Triggering** → Select **All Pages**
6. Click **Save**

### **Track Conversion Events:**

Add a second tag for voucher claims:

1. Click **Tags** → **New**
2. **Tag Name:** `TikTok - Lead Event`
3. **Tag Type:** **Custom HTML**
4. **Code:**

```html
<script>
  ttq.track('SubmitForm', {
    content_type: 'product',
    content_name: 'Dental Voucher',
    value: {{DLV - Voucher Value}},
    currency: 'GBP'
  });
</script>
```

5. **Triggering:** Create trigger → **Custom Event** → Event name: `voucher_claimed`
6. Click **Save**

---

## **2️⃣ LinkedIn Insight Tag**

### **Get Your LinkedIn Partner ID:**

1. Go to [LinkedIn Campaign Manager](https://www.linkedin.com/campaignmanager/)
2. Click **Account Assets** → **Insight Tag**
3. Click **Install my Insight Tag**
4. Copy your **Partner ID** (numeric, e.g., `1234567`)
5. Also copy the full tag code

### **Add to GTM:**

1. In GTM, click **Tags** → **New**
2. **Tag Name:** `LinkedIn Insight Tag - All Pages`
3. **Tag Type:** **Custom HTML**
4. **Paste this code** (replace `YOUR_PARTNER_ID`):

```html
<script type="text/javascript">
_linkedin_partner_id = "YOUR_PARTNER_ID";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
(function(l) {
  if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
  window.lintrk.q=[]}
  var s = document.getElementsByTagName("script")[0];
  var b = document.createElement("script");
  b.type = "text/javascript";b.async = true;
  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  s.parentNode.insertBefore(b, s);
})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=YOUR_PARTNER_ID&fmt=gif" />
</noscript>
```

5. **Triggering:** **All Pages**
6. Click **Save**

### **Track Conversion Events:**

1. Click **Tags** → **New**
2. **Tag Name:** `LinkedIn - Lead Conversion`
3. **Tag Type:** **Custom HTML**
4. **Code:**

```html
<script>
  window.lintrk('track', { conversion_id: YOUR_CONVERSION_ID });
</script>
```

5. **Triggering:** Custom Event → `voucher_claimed`
6. Click **Save**

*(Get Conversion ID from LinkedIn Campaign Manager → Conversions)*

---

## **3️⃣ Microsoft UET Tag**

### **Get Your UET Tag ID:**

1. Go to [Microsoft Advertising](https://ads.microsoft.com/)
2. Click **Tools** → **UET Tags**
3. Click **Create UET tag**
4. Name it: `SmileMoore Website`
5. Copy your **Tag ID** (numeric, e.g., `12345678`)

### **Add to GTM:**

1. In GTM, click **Tags** → **New**
2. **Tag Name:** `Microsoft UET - All Pages`
3. **Tag Type:** **Custom HTML**
4. **Paste this code** (replace `YOUR_UET_TAG_ID`):

```html
<script>
(function(w,d,t,r,u){
  var f,n,i;
  w[u]=w[u]||[],f=function(){
    var o={ti:"YOUR_UET_TAG_ID"};
    o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")
  },
  n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){
    var s=this.readyState;
    s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)
  },
  i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)
})(window,document,"script","//bat.bing.com/bat.js","uetq");
</script>
```

5. **Triggering:** **All Pages**
6. Click **Save**

### **Track Conversion Events:**

1. Click **Tags** → **New**
2. **Tag Name:** `Microsoft UET - Lead Event`
3. **Tag Type:** **Custom HTML**
4. **Code:**

```html
<script>
  window.uetq = window.uetq || [];
  window.uetq.push('event', 'submit_lead_form', {
    'event_category': 'Lead',
    'event_label': 'Dental Voucher',
    'event_value': {{DLV - Voucher Value}}
  });
</script>
```

5. **Triggering:** Custom Event → `voucher_claimed`
6. Click **Save**

---

## **4️⃣ Twitter/X Pixel**

### **Get Your Twitter Pixel ID:**

1. Go to [Twitter Ads Manager](https://ads.twitter.com/)
2. Click **Tools** → **Events Manager**
3. Click **Create Pixel**
4. Name it: `SmileMoore Website`
5. Copy your **Pixel ID** (format: `o1abc`, `o2xyz` - starts with `o` + alphanumeric)

### **Add to GTM:**

1. In GTM, click **Tags** → **New**
2. **Tag Name:** `Twitter Pixel - All Pages`
3. **Tag Type:** **Custom HTML**
4. **Paste this code** (replace `YOUR_PIXEL_ID`):

```html
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');

twq('config','YOUR_PIXEL_ID');
</script>
```

5. **Triggering:** **All Pages**
6. Click **Save**

### **Track Conversion Events:**

1. Click **Tags** → **New**
2. **Tag Name:** `Twitter - Lead Event`
3. **Tag Type:** **Custom HTML**
4. **Code:**

```html
<script>
  twq('event', 'tw-xxxxx-yyyyy', {
    value: {{DLV - Voucher Value}},
    currency: 'GBP',
    conversion_id: 'lead_submission'
  });
</script>
```

*(Replace `tw-xxxxx-yyyyy` with your Event ID from Twitter Events Manager)*

5. **Triggering:** Custom Event → `voucher_claimed`
6. Click **Save**

---

## **5️⃣ Snapchat Pixel**

### **Get Your Snapchat Pixel ID:**

1. Go to [Snapchat Ads Manager](https://ads.snapchat.com/)
2. Click **Events Manager** (in top menu)
3. Click **Create Pixel**
4. Name it: `SmileMoore Website`
5. Select **Web** as the platform
6. Copy your **Pixel ID** (long alphanumeric string)

### **Add to GTM:**

1. In GTM, click **Tags** → **New**
2. **Tag Name:** `Snapchat Pixel - All Pages`
3. **Tag Type:** **Custom HTML**
4. **Paste this code** (replace `YOUR_PIXEL_ID`):

```html
<script type='text/javascript'>
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');

snaptr('init', 'YOUR_PIXEL_ID', {
  'user_email': '__INSERT_USER_EMAIL__'
});

snaptr('track', 'PAGE_VIEW');
</script>
```

5. **Triggering:** **All Pages**
6. Click **Save**

### **Track Conversion Events:**

1. Click **Tags** → **New**
2. **Tag Name:** `Snapchat - Lead Event`
3. **Tag Type:** **Custom HTML**
4. **Code:**

```html
<script>
  snaptr('track', 'SIGN_UP', {
    'user_email': {{DLV - User Email}},
    'currency': 'GBP',
    'price': {{DLV - Voucher Value}}
  });
</script>
```

5. **Triggering:** Custom Event → `voucher_claimed`
6. Click **Save**

---

## **6️⃣ WhatsApp (Meta Business)**

### **Get Your WhatsApp Pixel:**

WhatsApp uses the **same Facebook Pixel** for tracking! You don't need a separate pixel.

### **But You DO Need Click-to-WhatsApp Ads Setup:**

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Click **All Tools** → **WhatsApp Manager**
3. Connect your WhatsApp Business account
4. Link it to your Facebook Business account
5. The same **Facebook Pixel** (already in your GTM) tracks WhatsApp ad interactions

### **Add WhatsApp Button to Your Site (Optional):**

If you want a WhatsApp chat button on your site:

1. In GTM, click **Tags** → **New**
2. **Tag Name:** `WhatsApp Chat Button`
3. **Tag Type:** **Custom HTML**
4. **Code:**

```html
<script>
  (function() {
    var whatsappBtn = document.createElement('a');
    whatsappBtn.href = 'https://wa.me/447XXXXXXXXX?text=Hi%20Smile%20Moore%2C%20I%27d%20like%20to%20book%20an%20appointment';
    whatsappBtn.target = '_blank';
    whatsappBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;';
    whatsappBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="60" height="60" />';
    document.body.appendChild(whatsappBtn);
  })();
</script>
```

*(Replace `447XXXXXXXXX` with your WhatsApp Business number)*

5. **Triggering:** **All Pages**
6. Click **Save**

**Note:** WhatsApp doesn't have a separate tracking pixel. All tracking goes through Facebook Pixel for Click-to-WhatsApp ads.

---

## **7️⃣ Setting Up Data Layer Variables (Required for Events)**

Before your conversion tracking works, you need to create Data Layer Variables:

### **Create Variables:**

1. In GTM, click **Variables** → **New**
2. Create these **Data Layer Variables:**

**Variable 1: Voucher Value**
- Name: `DLV - Voucher Value`
- Variable Type: **Data Layer Variable**
- Data Layer Variable Name: `voucher_value`
- Save

**Variable 2: User Email**
- Name: `DLV - User Email`
- Variable Type: **Data Layer Variable**
- Data Layer Variable Name: `user_email`
- Save

**Variable 3: Event Name**
- Name: `DLV - Event Name`
- Variable Type: **Data Layer Variable**
- Data Layer Variable Name: `event`
- Save

---

## **8️⃣ Setting Up Custom Triggers**

### **Create Voucher Claimed Trigger:**

1. In GTM, click **Triggers** → **New**
2. **Trigger Name:** `Event - Voucher Claimed`
3. **Trigger Type:** **Custom Event**
4. **Event Name:** `voucher_claimed`
5. Click **Save**

This trigger already fires in your code at [page.tsx:432](app/page.tsx#L432):
```javascript
window.dataLayer.push({
  event: 'voucher_claimed',
  voucher_value: voucherValue,
  currency: 'GBP'
});
```

---

## **9️⃣ Testing Your Setup**

### **Before Publishing:**

1. In GTM, click **Preview** (top right)
2. Enter your website URL: `https://www.smilemoore.co.uk/`
3. Browse your site and check:
   - All 8 pixels fire on page load
   - Conversion events fire when you claim a voucher

### **Debug Mode:**

In the GTM Preview window, you'll see:
- **Tags Fired:** Should show all 8 platform tags
- **Variables:** Check `DLV - Voucher Value` populates
- **Data Layer:** Verify `voucher_claimed` event appears

### **Check Cookies in Browser:**

1. Open DevTools (F12) → **Application** → **Cookies**
2. You should see:
   - `_fbp` (Facebook)
   - `_ga` (Google)
   - `_ttp` (TikTok)
   - `li_fat_id` (LinkedIn)
   - `MUID` (Microsoft)
   - `muc_ads` (Twitter)
   - `_scid` (Snapchat)

---

## **🔟 Publishing Your Changes**

Once testing looks good:

1. Click **Submit** (top right)
2. **Version Name:** `Added 6 new platform pixels (TikTok, LinkedIn, Microsoft, Twitter, Snapchat, WhatsApp)`
3. **Version Description:**
   ```
   Added tracking pixels for:
   - TikTok Ads
   - LinkedIn Ads
   - Microsoft Advertising
   - Twitter/X Ads
   - Snapchat Ads
   - WhatsApp (via Facebook Pixel)

   All pixels fire on page load.
   Conversion events fire on voucher_claimed event.
   ```
4. Click **Publish**

---

## **✅ Verification Checklist**

After publishing, test on your live site:

- [ ] Visit `https://www.smilemoore.co.uk/` in **Incognito mode**
- [ ] Open **Console** (F12) - check for pixel loading messages
- [ ] Check **Cookies** - should see 7-8 platform cookies
- [ ] Submit a **test voucher claim**
- [ ] Verify **conversion events fired** in GTM Preview
- [ ] Check each platform's **Events Manager**:
  - Facebook: Events Manager → Test Events
  - TikTok: Events → Web Events → Live Events
  - LinkedIn: Conversion Tracking → Event Status
  - Microsoft: UET Tag Helper Chrome Extension
  - Twitter: Events Manager → Test Events
  - Snapchat: Events Manager → Test Events

---

## **📊 Expected Results**

### **Google Sheets Data:**

After GTM setup, new visitors should show:

| Platform | Cookie Name | Example Value | Status |
|----------|-------------|---------------|--------|
| Facebook | _fbp | fb.1.1763814421.xxx | ✅ Real |
| Google | _ga | GA1.1.225723748.xxx | ✅ Real |
| TikTok | _ttp | abc123xyz | ✅ Real |
| LinkedIn | li_fat_id | 19aab8832bc-331901d9 | ✅ Real |
| Microsoft | MUID | MUID19AAB8832BC | ✅ Real |
| Twitter | muc_ads | mia9kdks-k5147yshcp8 | ✅ Real |
| Snapchat | _scid | sc-abc123-xyz456 | ✅ Real |
| WhatsApp | (uses _fbp) | fb.1.1763814421.xxx | ✅ Real |

**Cookie Quality Score:** 7-8/8 (up from 2!)

---

## **🎯 Next Steps After GTM Setup**

1. **Monitor for 24 hours** - ensure all pixels firing correctly
2. **Check match quality** in each platform's Events Manager
3. **Create Custom Audiences** on each platform
4. **Set up Conversion APIs** (Phase 2) for enhanced tracking
5. **Launch retargeting campaigns** across all 8 platforms

---

## **💡 Pro Tips**

1. **Use GTM Preview Mode** religiously - never publish without testing
2. **Set up Google Tag Assistant** Chrome extension for debugging
3. **Check pixel health daily** for first week after launch
4. **Document your Pixel IDs** in a secure password manager
5. **Set up alerts** in each platform for pixel issues

---

## **🆘 Troubleshooting**

### **Pixel not firing:**
- Check GTM Preview - is tag in "Tags Fired" section?
- Check trigger configuration - does it match the event?
- Check browser console - any errors?

### **Cookie not being created:**
- Wait 5-10 seconds for pixel to load
- Check if ad blocker is enabled (disable for testing)
- Verify Pixel ID is correct in GTM tag

### **Conversion event not tracking:**
- Check `dataLayer.push()` is firing in your code
- Verify GTM trigger matches event name exactly
- Check variable configuration in GTM

---

**You're now ready to set up all 8 platforms in GTM!** 🚀

Let me know which platform you want to start with, and I'll help you through each step.
