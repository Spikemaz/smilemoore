# 🚫 Unsubscribe & Deletion System Guide

**Last Updated:** December 5, 2025

---

## ✅ Unsubscribe System - Already Implemented!

### 📊 Google Sheets Column

**Column AV (index 46)** - "Unsubscribed from Follow-ups"

**Value:**
- Empty = User subscribed (will receive follow-ups)
- Timestamp = User unsubscribed (will NOT receive follow-ups)

**Example:** `2025-12-05T14:23:45.123Z`

---

## 🔗 How Unsubscribe Works

### 1. Unsubscribe Link in Emails

**All follow-up emails include:**
```html
<a href="https://smilemoore.co.uk/api/unsubscribe?email={email}">
  Unsubscribe here
</a>
```

**Found in:**
- 4 question reminder emails
- 10 question reminder emails
- Christmas sharing email

---

### 2. User Clicks Unsubscribe Link

**What Happens:**

1. **User clicks link** in email
2. **Opens:** `https://smilemoore.co.uk/api/unsubscribe?email=user@example.com`
3. **System finds** their row in Google Sheets (searches Column C for email)
4. **Updates Column AV** with timestamp ([unsubscribe/route.ts:78-85](app/api/unsubscribe/route.ts:78-85))
5. **Shows success page** with confirmation message

**Success Page Says:**
```
✅ You've Been Unsubscribed

You will no longer receive follow-up emails about completing the survey questions.

⚠️ Important: Your £50 voucher is still valid and you will still receive important updates about:
- Our CQC approval process
- Practice opening date
- Booking instructions to redeem your voucher
- Prize draw results

You've only unsubscribed from survey reminder emails.
```

---

### 3. Automated Emails Check Unsubscribe Status

**File:** [app/api/send-follow-ups/route.ts:188-190](app/api/send-follow-ups/route.ts:188-190)

**Code:**
```typescript
const unsubscribed = row[46]; // Column AV (index 46)

if (!email || !name || unsubscribed) continue; // Skip if unsubscribed
```

**Result:**
- ✅ If Column AV is empty → Send follow-up email
- ❌ If Column AV has timestamp → **SKIP** (don't send)

---

## 🗑️ Deletion from Google Sheets

### What Happens When You Delete a Row?

**Scenario:** You manually delete a user's row from Google Sheets

**Result:** ✅ **Automated emails STOP automatically**

**Why?**

1. **Cron job runs** ([send-follow-ups/route.ts:169-172](app/api/send-follow-ups/route.ts:169-172))
2. **Fetches all rows** from Google Sheets: `range: 'Home!A:AV'`
3. **Loops through rows** (line 181)
4. **Deleted row doesn't exist** in fetched data
5. **Loop skips it** → No email sent

**Important:** Once deleted, row is **completely removed** from all processing.

---

## 🔄 Two Ways to Stop Emails

### Option 1: Unsubscribe (Recommended for Users)

**How:**
- User clicks "Unsubscribe" link in email
- Column AV updated with timestamp
- Row remains in sheet

**Benefits:**
- ✅ User can still be contacted for important updates (practice opening, prize draw)
- ✅ Voucher data preserved
- ✅ Can track "unsubscribe rate" metric
- ✅ Can see who opted out
- ✅ Reversible (can manually clear Column AV to re-subscribe)

**What STOPS:**
- ❌ 4 question reminder emails
- ❌ 10 question reminder emails
- ❌ Christmas sharing email

**What CONTINUES:**
- ✅ Initial voucher email (already sent)
- ✅ Future: Practice opening announcement
- ✅ Future: Prize draw results
- ✅ Future: Voucher expiry warnings

---

### Option 2: Delete Row (Admin Action)

**How:**
- Manually delete row in Google Sheets
- Row completely removed

**Benefits:**
- ✅ All automated emails stop immediately
- ✅ Complete removal from system
- ✅ GDPR compliance (right to be forgotten)

**Drawbacks:**
- ❌ All data lost
- ❌ Can't contact for prize draw results
- ❌ Can't track metrics
- ❌ Irreversible (need to re-enter data to restore)

**What STOPS:**
- ❌ ALL automated emails
- ❌ ALL future communications
- ❌ Can't redeem voucher (code invalid if row deleted)

---

## 📋 Complete Email Flow with Unsubscribe

### Email Type 1: Voucher Confirmation

**File:** [update-voucher/route.ts](app/api/update-voucher/route.ts)

**Sent:** When user completes Step 3 (address/postcode)

**Unsubscribe Link:** ❌ NO (one-time transactional email)

**Checks Column AV:** ❌ NO (sent regardless - it's their voucher!)

**Can Be Stopped By:**
- Deleting row BEFORE they complete Step 3
- (But they already requested the voucher, so this would be unusual)

---

### Email Type 2: Family Vouchers

**File:** [send-family-vouchers/route.ts](app/api/send-family-vouchers/route.ts)

**Sent:** When multiple family members sign up with same email

**Unsubscribe Link:** ❌ NO (transactional - contains voucher codes)

**Checks Column AV:** ❌ NO (they need their voucher codes)

**Can Be Stopped By:**
- Deleting row BEFORE family signup completes

---

### Email Type 3: 4 Question Follow-Ups

**File:** [send-follow-ups/route.ts](app/api/send-follow-ups/route.ts)

**Sent:** When user has 1 entry (voucher but no survey)

**Unsubscribe Link:** ✅ YES

**Checks Column AV:** ✅ YES ([line 188-190](app/api/send-follow-ups/route.ts:188-190))

**Can Be Stopped By:**
- User clicks "Unsubscribe" link → Column AV updated
- Admin deletes row from Google Sheets
- User completes 4 questions → Entries increase, no longer qualifies

---

### Email Type 4: 10 Question Follow-Ups

**File:** [send-follow-ups/route.ts](app/api/send-follow-ups/route.ts)

**Sent:** When user has 2 entries (completed 4 questions)

**Unsubscribe Link:** ✅ YES

**Checks Column AV:** ✅ YES ([line 188-190](app/api/send-follow-ups/route.ts:188-190))

**Can Be Stopped By:**
- User clicks "Unsubscribe" link → Column AV updated
- Admin deletes row from Google Sheets
- User completes extended survey → Entries increase, no longer qualifies

---

### Email Type 5: Christmas Sharing Email

**File:** [send-follow-ups/route.ts](app/api/send-follow-ups/route.ts)

**Sent:** When user has 3 entries (completed everything)

**Unsubscribe Link:** ✅ YES

**Checks Column AV:** ✅ YES ([line 188-190](app/api/send-follow-ups/route.ts:188-190))

**Can Be Stopped By:**
- User clicks "Unsubscribe" link → Column AV updated
- Admin deletes row from Google Sheets
- Column AW already has timestamp (already sent once)

---

## 🧪 Testing Unsubscribe

### Test 1: Unsubscribe from Follow-Ups

**Steps:**
1. Find user with 1 entry (has voucher, no survey)
2. Note their email from Column C
3. Visit: `https://smilemoore.co.uk/api/unsubscribe?email={email}`
4. Should see success page
5. Check Google Sheets Column AV → Should have timestamp
6. Wait for next cron run
7. **Expected:** User does NOT receive follow-up email

---

### Test 2: Delete Row Stops Emails

**Steps:**
1. Find user with 1 entry
2. Note their row number
3. Manually delete entire row from Google Sheets
4. Wait for next cron run
5. **Expected:** User does NOT receive any emails (row doesn't exist)

---

### Test 3: Unsubscribe Link in Email

**Steps:**
1. Send test follow-up email to yourself
2. Open email
3. Click "Unsubscribe here" link at bottom
4. Should redirect to success page
5. Check Google Sheets → Column AV has timestamp
6. **Expected:** No more follow-ups sent

---

## 🛡️ Data Privacy & GDPR

### Right to Unsubscribe

**✅ Compliant:**
- Every follow-up email has unsubscribe link
- One-click unsubscribe (no login required)
- Clear confirmation message
- Immediate effect (checked on every send)

**Regulations Met:**
- GDPR Article 21 (Right to object)
- CAN-SPAM Act (Unsubscribe mechanism)
- PECR (Marketing opt-out)

---

### Right to Be Forgotten (GDPR Article 17)

**How to Implement:**

**Option A: Soft Delete (Recommended First)**
1. Set Column AV (unsubscribed) to timestamp
2. Manually clear all personal data columns:
   - Column C (email) → `[REDACTED]`
   - Column D (name) → `[REDACTED]`
   - Column E (phone) → `[REDACTED]`
   - Column F (postcode) → `[REDACTED]`
3. Keep Customer ID and voucher code (for records)
4. User can't be contacted, data anonymized

**Option B: Hard Delete**
1. Delete entire row from Google Sheets
2. All data permanently removed
3. All emails stop automatically
4. Irreversible

**Best Practice:**
- Use Option A for normal unsubscribe requests
- Use Option B for formal GDPR deletion requests

---

## 📊 Monitoring Unsubscribes

### Track Unsubscribe Rate

**Google Sheets Formula:**
```
=COUNTIF(AV:AV, "<>") / COUNTA(C:C)
```

**Shows:** Percentage of users who unsubscribed

**Healthy Rate:** < 5% for follow-up emails

**High Rate (>10%):** Consider email frequency/content

---

### See Who Unsubscribed

**Filter in Google Sheets:**
1. Select Column AV
2. Data → Create a filter
3. Filter Column AV → Show only non-empty
4. Shows all unsubscribed users with timestamp

---

## 🔧 Admin Actions

### Re-subscribe a User (if they request)

**Steps:**
1. Find their row in Google Sheets
2. Click Column AV cell
3. Delete timestamp (leave empty)
4. Save
5. **Result:** They'll receive follow-ups again on next cron run

---

### Bulk Unsubscribe (if needed)

**Steps:**
1. Select Column AV for all rows
2. Enter: `=NOW()` (current timestamp)
3. Apply to all selected cells
4. **Result:** All users unsubscribed

**Use Case:** Campaign ending, stop all follow-ups

---

### Check Email Send Status

**Columns to Review:**
- Column AC - Email Sent (voucher confirmation)
- Column AI - 4Q Follow-up 1 Sent
- Column AK - 4Q Follow-up 2 Sent
- Column AM - 4Q Follow-up 3 Sent
- Column AO - 10Q Follow-up 1 Sent
- Column AQ - 10Q Follow-up 2 Sent
- Column AS - 10Q Follow-up 3 Sent
- Column AW - Christmas Sharing Email Sent
- **Column AV - Unsubscribed** ← Key column

**If Column AV has value:** All future follow-ups stopped

---

## 🚀 Future Email Types

**When adding new automated emails, ALWAYS:**

1. ✅ Check Column AV before sending
   ```typescript
   const unsubscribed = row[46]; // Column AV
   if (unsubscribed) continue; // Skip
   ```

2. ✅ Include unsubscribe link in email
   ```html
   <a href="https://smilemoore.co.uk/api/unsubscribe?email={email}">
     Unsubscribe from these emails
   </a>
   ```

3. ✅ Clearly state what they're unsubscribing FROM
   ```
   "You will no longer receive {specific email type}"
   ```

4. ✅ Clarify what they WILL still receive
   ```
   "You'll still get important updates about practice opening"
   ```

---

## ✅ Summary

**Unsubscribe Column:** Column AV
- ✅ Already implemented and working
- ✅ Checked by all follow-up email sends
- ✅ One-click unsubscribe process
- ✅ GDPR compliant

**Row Deletion:**
- ✅ Automatically stops ALL emails (row doesn't exist)
- ✅ Complete data removal
- ✅ Use for "right to be forgotten" requests

**Best Practice:**
- Let users unsubscribe themselves (Column AV)
- Only delete rows for GDPR deletion requests or data cleanup
- Monitor unsubscribe rate to improve email quality

**Both methods work perfectly to stop automated emails!** 🎉
