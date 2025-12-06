# 📧 Automated Emails Summary - All Fixed!

**Last Updated:** December 5, 2025

---

## ✅ ISSUE FIXED: Referral Links Now Use Customer ID

**Problem:** Emails were using `smilemoore.co.uk` instead of bespoke referral links with Customer ID tracking.

**Solution:** All emails now use the correct format: `https://www.smilemoore.co.uk?ref={CUSTOMER_ID}`

---

## 📬 All Automated Emails in the System

### 1️⃣ Voucher Confirmation Email

**File:** [`app/api/update-voucher/route.ts`](app/api/update-voucher/route.ts)

**Sent When:** User completes Step 3 (address/postcode)

**Trigger:** Automatically after voucher claim

**From:** Smile Moore Reception <reception@smilemoore.co.uk>

**Subject:**
- Single: `Your £{value} Smile Moore Voucher - {code}`
- Multiple: `Your {count} Smile Moore Vouchers (£{total} Total Value)`

**Contains:**
- ✅ Voucher code(s)
- ✅ Referral link with Customer ID: `https://www.smilemoore.co.uk?ref={CUSTOMER_ID}`
- ✅ Social share buttons (Facebook, Twitter, WhatsApp)
- ✅ Prize draw entry count
- ✅ What happens next instructions
- ✅ Email open tracking pixel

**Referral Link Status:** ✅ CORRECT - Uses Customer ID from Column A

---

### 2️⃣ Family Vouchers Email

**File:** [`app/api/send-family-vouchers/route.ts`](app/api/send-family-vouchers/route.ts)

**Sent When:** Multiple household members sign up with same email

**Trigger:** Called from backend when family signup detected

**From:** SmileMoore Dental <noreply@smilemoore.co.uk>

**Subject:** `🎉 Your Family Vouchers - {count} x £50 Codes Inside!`

**Contains:**
- ✅ Table of all family member names and voucher codes
- ✅ Referral link with Customer ID: `https://www.smilemoore.co.uk?ref={CUSTOMER_ID}`
- ✅ Social share buttons
- ✅ Prize draw information (each family member gets entries)
- ✅ How to redeem instructions

**Referral Link Status:** ✅ CORRECT - Uses `customerId` parameter passed to function (line 18)

---

### 3️⃣ Follow-Up Emails (4 Question Survey)

**File:** [`app/api/send-follow-ups/route.ts`](app/api/send-follow-ups/route.ts)

**Sent When:** User has 1 entry (claimed voucher but didn't complete 4 questions)

**Trigger:** Automated cron job checks Google Sheets

**From:** Smile Moore Reception <reception@smilemoore.co.uk>

**Subject Variations:**
1. `🎁 Quick reminder: Boost your prize draw entries!`
2. `Don't miss out on winning up to £5,000 of free dentistry!`
3. `Final chance: Enter the prize draw`

**Send Schedule:**
- Variation 1: Immediately if followup1 not sent
- Variation 2: 48 hours after variation 1 if not opened
- Variation 3: 48 hours after variation 2 if not opened

**Contains:**
- ✅ Reminder to complete 4 questions
- ✅ **Auto-resume link:** `https://smilemoore.co.uk?cid={CUSTOMER_ID}`
- ✅ Unsubscribe link
- ✅ Email open tracking

**Auto-Resume Status:** ✅ CORRECT - Includes `?cid=` parameter
- Pre-fills all completed data (email, name, phone, postcode)
- Jumps directly to Step 5 (4 question survey)
- User continues exactly where they left off

---

### 4️⃣ Follow-Up Emails (10 Question Survey)

**File:** [`app/api/send-follow-ups/route.ts`](app/api/send-follow-ups/route.ts)

**Sent When:** User has 2 entries (completed 4 questions but not 10 question survey)

**Trigger:** Automated cron job checks Google Sheets

**From:** Smile Moore Reception <reception@smilemoore.co.uk>

**Subject Variations:**
1. `🌟 One more step to maximize your prize entries!`
2. `Help us build your perfect dental practice`
3. `Last call: Get your 3rd prize draw entry`

**Send Schedule:**
- Variation 1: Immediately if followup1 not sent
- Variation 2: 48 hours after variation 1 if not opened
- Variation 3: 48 hours after variation 2 if not opened

**Contains:**
- ✅ Reminder to complete extended survey
- ✅ **Auto-resume link:** `https://smilemoore.co.uk?cid={CUSTOMER_ID}`
- ✅ Unsubscribe link
- ✅ Email open tracking

**Auto-Resume Status:** ✅ CORRECT - Includes `?cid=` parameter
- Pre-fills all completed data (email, name, phone, postcode, 4 survey answers)
- Jumps directly to Step 6 (extended survey - 10 questions)
- User continues exactly where they left off

---

### 5️⃣ Christmas Sharing Email

**File:** [`app/api/send-follow-ups/route.ts`](app/api/send-follow-ups/route.ts) (line 76-100)

**Sent When:** User has 3 entries (completed everything)

**Trigger:** Automated cron job checks Google Sheets (sent once per customer)

**From:** Smile Moore Reception <reception@smilemoore.co.uk>

**Subject:** `🎄 Spread Christmas Joy - Share Your £50 Voucher!`

**Contains:**
- ✅ Christmas themed message encouraging sharing
- ✅ Referral link with Customer ID: `https://www.smilemoore.co.uk?ref={CUSTOMER_ID}`
- ✅ Explanation of +10 bonus entries per referral
- ✅ Unsubscribe link
- ✅ Email open tracking

**Referral Link Status:** ✅ FIXED - Now uses Customer ID from Column A (line 183, 297)

**Google Sheets Tracking:** Column AW (Christmas Sharing Email Sent)

---

## 🔍 How Referral Link Tracking Works

### Correct Format:
```
https://www.smilemoore.co.uk?ref={CUSTOMER_ID}
```

### Example:
```
https://www.smilemoore.co.uk?ref=6VCH3GXWAV8
```

### Why Customer ID Instead of Name:
1. **Privacy** - No personal information in URL
2. **Unique** - Each signup gets unique ID (even same name)
3. **Trackable** - Can track who referred whom in Google Sheets
4. **Shareable** - Works for family signups with same email

### Where Customer ID Comes From:
- Generated automatically in [`app/lib/googleSheets.ts`](app/lib/googleSheets.ts)
- Stored in Column A of Google Sheets
- Format: 11 uppercase alphanumeric characters (e.g., `6VCH3GXWAV8`)

---

## 📊 Google Sheets Tracking Columns

### Email Sent Tracking:
- **Column AC** - Email Sent (timestamp when voucher email sent)
- **Column AI-AM** - 4 Question Follow-up tracking (sent & opened)
- **Column AO-AS** - 10 Question Follow-up tracking (sent & opened)
- **Column AV** - Unsubscribed from Follow-ups (if user unsubscribes)
- **Column AW** - Christmas Sharing Email Sent (timestamp)

### NEW: Terms & Conditions Click Tracking:
- **Column AX** - T&C Clicked Step 3 Checkbox (timestamp)
- **Column AY** - T&C Clicked Step 3 Bottom Link (timestamp)
- **Column AZ** - T&C Clicked Success Page (timestamp)

**Tracking API:** [`app/api/track-tc-click/route.ts`](app/api/track-tc-click/route.ts)

**Locations Tracked:**
1. `step3_checkbox` - T&C link in checkbox label on Step 3
2. `step3_bottom` - T&C link at bottom of Step 3 form
3. `success_page` - T&C link on final success page (Step 6)

---

## 🔧 Email Service Configuration

**Provider:** Resend (https://resend.com)

**Environment Variable:** `RESEND_API_KEY`

**Sending Domains:**
- `reception@smilemoore.co.uk` - Voucher confirmations, follow-ups
- `noreply@smilemoore.co.uk` - Family vouchers

**Reply-To:** `reception@smilemoore.co.uk` (all emails)

---

## 🎯 Email Open Tracking

All emails include invisible 1x1 pixel for open tracking:

**Voucher Emails:**
```html
<img src="https://smilemoore.co.uk/api/track-email-open?email={email}" />
```

**Follow-Up Emails:**
```html
<img src="https://smilemoore.co.uk/api/track-followup-open?email={email}&type={type}&v={variation}" />
```

**Tracking API:**
- [`app/api/track-email-open/route.ts`](app/api/track-email-open/route.ts)
- [`app/api/track-followup-open/route.ts`](app/api/track-followup-open/route.ts)

---

## 🚫 Unsubscribe System

**Unsubscribe Link in All Follow-Up Emails:**
```html
<a href="https://smilemoore.co.uk/api/unsubscribe?email={email}">Unsubscribe here</a>
```

**What It Does:**
- Sets Column AV to TRUE in Google Sheets
- User still receives voucher email (initial confirmation)
- User NO LONGER receives:
  - 4 question follow-ups
  - 10 question follow-ups
  - Christmas sharing email

**Note:** Important practice updates (like opening dates) would need a separate system.

**Unsubscribe API:** [`app/api/unsubscribe/route.ts`](app/api/unsubscribe/route.ts)

---

## ✅ Verification Checklist

**To verify emails are working correctly:**

1. **Check Referral Links:**
   - [ ] Open email
   - [ ] Click "YOUR REFERRAL LINK"
   - [ ] URL should be `https://www.smilemoore.co.uk?ref={CUSTOMER_ID}`
   - [ ] NOT `smilemoore.co.uk?ref={NAME}-{NUMBER}`

2. **Check Social Share Buttons:**
   - [ ] Facebook button includes referral link with Customer ID
   - [ ] Twitter button includes referral link with Customer ID
   - [ ] WhatsApp button includes referral link with Customer ID

3. **Check Google Sheets:**
   - [ ] Column AC shows email sent timestamp
   - [ ] Column A has Customer ID (e.g., `6VCH3GXWAV8`)
   - [ ] Referral link in email matches Column A Customer ID

4. **Check T&C Tracking:**
   - [ ] Click T&C link in checkbox label → Column AX gets timestamp
   - [ ] Click T&C link at bottom of form → Column AY gets timestamp
   - [ ] Click T&C link on success page → Column AZ gets timestamp

---

## 🐛 Common Issues & Fixes

### Issue: "Email has smilemoore.co.uk instead of referral link"
**Cause:** Old code using name-based referral instead of Customer ID
**Fix:** ✅ FIXED in commit - all emails now use Customer ID

### Issue: "Referral link not tracking in Google Sheets"
**Check:**
1. Does URL have `?ref={CUSTOMER_ID}` parameter?
2. Does Customer ID match Column A in Google Sheets?
3. Is [`app/api/submit-voucher/route.ts`](app/api/submit-voucher/route.ts) detecting referral correctly?

### Issue: "Family got separate emails instead of one combined email"
**Cause:** Timing - emails sent as each person completes Step 3
**Current Behavior:** Each family member gets individual email immediately
**Alternative:** Use [`send-family-vouchers`](app/api/send-family-vouchers/route.ts) for combined email (requires manual trigger)

---

## 📝 Email Content Summary

**All Emails Include:**
- ✅ Smile Moore branding (green gradient header)
- ✅ Responsive design (mobile-friendly)
- ✅ Clear call-to-action buttons
- ✅ Unsubscribe option (follow-ups only)
- ✅ Email open tracking pixel
- ✅ Footer with copyright and practice info

**Social Share Platforms:**
- Facebook
- Twitter/X
- WhatsApp

**Prize Draw Messaging:**
- Base entries: 3 per person
- Bonus for completing survey: +1 per milestone
- Bonus for referrals: +10 per successful referral
- Bonus for redemption: +100 when voucher redeemed

---

## 🚀 Future Enhancements

**Potential Additions:**
1. Practice opening announcement email
2. Appointment booking reminder
3. Voucher expiry warning (before 12 months)
4. Winner announcement email (prize draw results)
5. Birthday voucher emails
6. Re-engagement campaigns

**All future emails should:**
- Use Customer ID for referral tracking
- Include email open tracking
- Provide unsubscribe option
- Match existing branding
- Be mobile-responsive

---

## 📞 Support

**If emails aren't sending:**
1. Check `RESEND_API_KEY` environment variable
2. Check Resend dashboard for delivery status
3. Check spam/junk folders
4. Verify email address format is valid
5. Check console logs for error messages

**Resend Dashboard:** https://resend.com/emails

**Test Email Sending:**
```bash
# Send test voucher email
curl -X POST https://smilemoore.co.uk/api/update-voucher \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","customerId":"TEST123","field":"address","value":"Test"}'
```

---

**All emails now correctly use Customer ID for referral tracking! ✅**
