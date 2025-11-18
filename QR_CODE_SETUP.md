# QR Code with Tracking Setup

## Option 1: Simple QR Code with Google Analytics Tracking (RECOMMENDED)

**URL to use in QR code:**
```
https://smilemoore.co.uk?utm_source=qr&utm_medium=offline&utm_campaign=print
```

This URL includes UTM parameters that Google Analytics will automatically track!

**Generate QR Code:**

### Method 1: Free Online Generator
1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/) or [qrcode-monkey.com](https://www.qrcode-monkey.com/)
2. Paste: `https://smilemoore.co.uk?utm_source=qr&utm_medium=offline&utm_campaign=print`
3. Customize colors (use your brand blue: `#2563eb`)
4. Download as PNG or SVG (high resolution for printing)

### Method 2: Using Google Chrome
1. Open: `https://smilemoore.co.uk?utm_source=qr&utm_medium=offline&utm_campaign=print`
2. Right-click anywhere on page
3. Click "Create QR Code for this page"
4. Download

---

## Option 2: Advanced QR Code with Click Tracking

Use a URL shortener with analytics:

### Bitly (FREE - Best for tracking clicks)
1. Go to [bitly.com](https://bitly.com) (free account)
2. Create short link: `https://smilemoore.co.uk?utm_source=qr&utm_medium=offline&utm_campaign=print`
3. You'll get something like: `https://bit.ly/smilemoore`
4. Bitly dashboard shows:
   - Total clicks
   - Clicks over time
   - Location of scanners
   - Device type
5. Generate QR code from Bitly dashboard

### Alternative: TinyURL, Rebrandly, or Short.io

---

## Option 3: Multiple QR Codes for Different Locations

Track where people are scanning from:

**Flyer at dental office:**
```
https://smilemoore.co.uk?utm_source=qr&utm_medium=flyer&utm_campaign=office
```

**Business cards:**
```
https://smilemoore.co.uk?utm_source=qr&utm_medium=business_card&utm_campaign=networking
```

**Print ad in newspaper:**
```
https://smilemoore.co.uk?utm_source=qr&utm_medium=print_ad&utm_campaign=newspaper
```

**Window poster:**
```
https://smilemoore.co.uk?utm_source=qr&utm_medium=poster&utm_campaign=window
```

Generate a different QR code for each! Then you can track which location gets more scans in Google Analytics.

---

## What Data You'll See in Google Analytics

Once Google Analytics is set up (see ANALYTICS_SETUP.md):

1. Go to Analytics → Reports → Acquisition → Traffic acquisition
2. Filter by:
   - Source: `qr`
   - Medium: `offline`, `flyer`, `business_card`, etc.
3. You'll see:
   - Number of scans
   - City/Country of users
   - Device type
   - Time spent on site
   - Pages viewed
   - Conversions (bookings, email signups)

---

## Best Practices for QR Codes:

1. **Size**: Minimum 2cm x 2cm for print
2. **Contrast**: Dark code on light background
3. **Test**: Always test before printing large quantities
4. **Call to action**: Add text like "Scan for special offer" or "Book your appointment"
5. **Landing page**: Consider creating a special page for QR code visitors

---

## Sample QR Code Design Ideas:

**On flyers:**
```
┌─────────────────┐
│   [QR CODE]     │
│                 │
│ Scan to book    │
│ your dental     │
│ appointment     │
└─────────────────┘
```

**On business cards:**
```
┌──────────────────────────┐
│ Marcus Moore             │
│ Smile Moore Dental       │
│                          │
│ [small QR]  Visit us at  │
│             smilemoore   │
└──────────────────────────┘
```

---

## Downloading High-Quality QR Codes:

For professional printing:
- **Format**: SVG or PNG
- **Resolution**: At least 300 DPI
- **Size**: 1000x1000 pixels minimum

---

## Free QR Code Resources:

1. **QR Code Monkey** (best customization): https://www.qrcode-monkey.com/
2. **QR Code Generator**: https://www.qr-code-generator.com/
3. **Bitly QR**: https://bitly.com/pages/features/qr-codes
4. **Chrome built-in**: Right-click → Create QR code

---

## Next Steps:

1. Choose your URL (with UTM parameters)
2. Generate QR code
3. Download high-resolution version
4. Test it with your phone
5. Add to marketing materials
6. Monitor scans in Google Analytics

Your QR codes will automatically track in Google Analytics once you set it up!
