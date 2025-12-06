# 🔄 Auto-Resume System - How It Works

**Last Updated:** December 5, 2025

---

## 🎯 Overview

The auto-resume system allows users to click email links and pick up exactly where they left off in the funnel, without starting from the beginning.

**Key Feature:** Smart detection distinguishes between:
- 📧 **Email links** → Resume progress (auto-resume)
- 📱 **QR/Direct URLs** → Start fresh (allows helping friends/family)

---

## 🔗 URL Parameters Used

### `?cid={CUSTOMER_ID}` - Email Resume Link

**Format:** `https://smilemoore.co.uk?cid=6VCH3GXWAV8`

**Purpose:** Resume user's progress in the funnel

**Used In:**
- All follow-up emails (4 question reminders)
- All follow-up emails (10 question reminders)
- Any email where user needs to continue their journey

**Behavior:**
- Fetches user data from Google Sheets via Customer ID
- Pre-fills all completed fields
- Jumps to next incomplete step
- Prevents starting over

---

### `?ref={CUSTOMER_ID}` - Referral Tracking Link

**Format:** `https://www.smilemoore.co.uk?ref=6VCH3GXWAV8`

**Purpose:** Track who referred this signup

**Used In:**
- Voucher confirmation emails (for sharing)
- Family voucher emails (for sharing)
- Christmas sharing emails
- Social share buttons

**Behavior:**
- Stores referrer's Customer ID
- Awards +10 bonus entries to referrer when new signup completes
- Starts fresh signup flow (new person, not resume)

---

## 🔄 How Auto-Resume Works

### Step-by-Step Process:

**1. User Receives Follow-Up Email**
```
Subject: Quick reminder: Boost your prize draw entries!

Click here to complete: https://smilemoore.co.uk?cid=6VCH3GXWAV8
```

**2. User Clicks Link**
- URL has `?cid=6VCH3GXWAV8` parameter
- Page loads with Customer ID in URL

**3. Page Detects Customer ID** ([app/page.tsx:95-104](app/page.tsx:95-104))
```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const cidFromUrl = urlParams.get('cid');

  if (cidFromUrl) {
    setCustomerId(cidFromUrl);
    localStorage.setItem('smilemoore_customer_id', cidFromUrl);
    fetchAndPrefillCustomerData(cidFromUrl);
  }
}, []);
```

**4. Fetch User Data** ([app/page.tsx:107-155](app/page.tsx:107-155))
```typescript
async function fetchAndPrefillCustomerData(customerId: string) {
  const response = await fetch(`/api/get-customer-data?customerId=${customerId}`);
  const result = await response.json();

  if (result.success && result.data) {
    // Pre-fill form data
    setFormData({
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.postcode,
    });

    // Pre-fill survey answers
    setSurveyData({...});
    setExtendedSurvey({...});
  }
}
```

**5. Smart Step Detection** ([app/page.tsx:157-203](app/page.tsx:157-203))
```typescript
const urlParams = new URLSearchParams(window.location.search);
const fromEmailLink = urlParams.has('cid');

// Scenario 1: Completed extended survey (3 entries)
if (data.hasExtendedSurvey) {
  if (fromEmailLink) {
    setStep(7); // Show thank you page
  } else {
    // QR/Direct URL - start fresh (allow helping friends)
    localStorage.removeItem('smilemoore_customer_id');
    setStep(1);
  }
}

// Scenario 2: Completed 4 questions (2 entries)
else if (data.hasSurveyQ1to5) {
  if (fromEmailLink) {
    setStep(6); // Resume to extended survey
  } else {
    localStorage.removeItem('smilemoore_customer_id');
    setStep(1);
  }
}

// Scenario 3: Only voucher claimed (1 entry)
else if (data.voucherCode) {
  if (fromEmailLink) {
    setStep(5); // Resume to 4 questions
  } else {
    localStorage.removeItem('smilemoore_customer_id');
    setStep(1);
  }
}
```

**6. User Continues From Where They Left Off**
- All previous answers pre-filled
- Can continue immediately
- No need to re-enter information

---

## 📊 Resume Scenarios

### Scenario A: User Claimed Voucher, Didn't Complete Survey

**Google Sheets Status:**
- Has voucher code (Column G)
- No survey answers (Column J-N empty)
- Total entries: 1

**Follow-Up Email:**
```
Subject: Quick reminder: Boost your prize draw entries!

Click here to complete: https://smilemoore.co.uk?cid=6VCH3GXWAV8
```

**What Happens:**
1. User clicks email link
2. Form pre-fills: email, name, phone, postcode
3. **Jumps to Step 5** (4 question survey)
4. User answers 4 questions
5. Gets +1 entry (total: 2 entries)

---

### Scenario B: User Completed 4 Questions, Didn't Do Extended Survey

**Google Sheets Status:**
- Has voucher code
- Has 4 question answers (Column J-N filled)
- No extended survey (Column O-X empty)
- Total entries: 2

**Follow-Up Email:**
```
Subject: One more step to maximize your prize entries!

Continue here: https://smilemoore.co.uk?cid=6VCH3GXWAV8
```

**What Happens:**
1. User clicks email link
2. Form pre-fills: email, name, phone, postcode, 4 survey answers
3. **Jumps to Step 6** (extended survey - 10 questions)
4. User answers 10 questions
5. Gets +1 entry (total: 3 entries)

---

### Scenario C: User Completed Everything

**Google Sheets Status:**
- Has voucher code
- Has all survey answers
- Total entries: 3

**Christmas Sharing Email:**
```
Subject: Spread Christmas Joy - Share Your £50 Voucher!

Your Referral Link: https://www.smilemoore.co.uk?ref=6VCH3GXWAV8
```

**What Happens:**
1. User clicks (for any reason - maybe to share again)
2. Form pre-fills all data
3. **Jumps to Step 7** (thank you page showing their referral link)
4. User can copy/share link again
5. Can see their current entry count

---

## 🆚 Email Link vs QR/Direct URL Behavior

### Email Link (has `?cid=`)

**URL:** `https://smilemoore.co.uk?cid=6VCH3GXWAV8`

**Behavior:**
- ✅ Auto-resume to incomplete step
- ✅ Pre-fill all existing data
- ✅ Skip completed sections
- ✅ Show progress where they left off

**Use Case:** User clicking from their own email

---

### QR/Direct URL (no `?cid=`)

**URL:** `https://smilemoore.co.uk` or `https://smilemoore.co.uk?ref=ABC123`

**Behavior:**
- ✅ Start fresh from Step 1
- ✅ Clear localStorage
- ✅ Allow new signup
- ✅ Don't pre-fill previous data

**Use Case:**
- User scanning QR code for friend/family member
- User opening site on friend's phone to help them sign up
- New person using referral link

**Why Clear localStorage?**
- User already completed survey (has 3 entries)
- They're using their phone to help friend sign up
- Need fresh form, not their own data
- Prevents accidentally updating their own record

---

## 🔍 Detection Logic

### How System Knows Which Behavior to Use:

```typescript
// Check if URL has ?cid= parameter
const urlParams = new URLSearchParams(window.location.search);
const fromEmailLink = urlParams.has('cid');

if (fromEmailLink) {
  // Email link → Auto-resume
  // Show appropriate step based on what's missing
} else {
  // QR/Direct URL → Fresh start
  // Clear localStorage and start from Step 1
}
```

**Key Insight:** Same person, different context:
- From email = They want to continue THEIR journey
- From QR/Direct = They want to start FRESH (for them or friend)

---

## 📧 All Email Links Updated

### 4 Question Follow-Ups (6 Total Variations)

**Variation 1:**
```
Click here to complete: https://smilemoore.co.uk?cid=${customerId}
```

**Variation 2:**
```
Complete now: https://smilemoore.co.uk?cid=${customerId}
```

**Variation 3:**
```
Complete your entry: https://smilemoore.co.uk?cid=${customerId}
```

---

### 10 Question Follow-Ups (3 Variations)

**Variation 1:**
```
Continue here: https://smilemoore.co.uk?cid=${customerId}
```

**Variation 2:**
```
Share your thoughts: https://smilemoore.co.uk?cid=${customerId}
```

**Variation 3:**
```
It takes just 2 minutes: https://smilemoore.co.uk?cid=${customerId}
```

---

### Christmas Sharing Email

**Referral Link (for sharing):**
```
Your Referral Link: https://www.smilemoore.co.uk?ref=${customerId}
```

**Note:** This uses `?ref=` not `?cid=` because it's for SHARING with others, not resuming.

---

## 🎯 User Experience Flow

### Example: Sarah's Journey

**Day 1 - Initial Signup:**
1. Sarah scans QR code
2. Fills out email, name, phone, postcode
3. Claims £50 voucher
4. Gets email with voucher code
5. Closes browser (too busy to do survey)

**Day 2 - Follow-Up Email:**
1. Receives email: "Boost your prize draw entries!"
2. Clicks: `https://smilemoore.co.uk?cid=SARAH12345`
3. Page loads → Auto-detects she has voucher but no survey
4. **Jumps directly to Step 5** (4 questions)
5. Email/name/phone/postcode already filled
6. Answers 4 questions
7. Gets +1 entry (now has 2 entries total)

**Day 4 - Second Follow-Up:**
1. Receives email: "One more step to maximize entries!"
2. Clicks: `https://smilemoore.co.uk?cid=SARAH12345`
3. Page loads → Detects she completed 4 questions
4. **Jumps directly to Step 6** (extended survey)
5. All previous data pre-filled
6. Answers 10 more questions
7. Gets +1 entry (now has 3 entries total)

**Day 7 - Christmas Sharing Email:**
1. Receives email: "Spread Christmas Joy!"
2. Clicks her referral link to share
3. Page shows **Step 7** (thank you/sharing page)
4. Can copy referral link again
5. Can share via social buttons

**Day 10 - Helping Friend:**
1. Friend asks Sarah to help them sign up
2. Sarah opens `smilemoore.co.uk` on her phone
3. System detects: No `?cid=` parameter
4. Clears Sarah's localStorage
5. **Starts fresh at Step 1**
6. Sarah enters friend's details
7. Friend gets their own voucher

---

## 🛡️ Privacy & Security

**Customer ID Benefits:**
- ✅ No personal info in URL (privacy-friendly)
- ✅ Unique per signup (siblings can share email)
- ✅ Trackable (know who referred whom)
- ✅ Secure (can't guess other IDs)

**localStorage Usage:**
```typescript
// Stored when user starts signup
localStorage.setItem('smilemoore_customer_id', customerId);

// Retrieved on page load
const storedCustomerId = localStorage.getItem('smilemoore_customer_id');

// Cleared when:
// 1. User completes all surveys (from QR/Direct URL)
// 2. User starts helping someone else
// 3. User explicitly wants fresh start
```

---

## 🔧 API Endpoints Used

### 1. Get Customer Data
**Endpoint:** [`/api/get-customer-data`](app/api/get-customer-data/route.ts)

**Request:**
```
GET /api/get-customer-data?customerId=6VCH3GXWAV8
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "6VCH3GXWAV8",
    "email": "sarah@example.com",
    "name": "Sarah Smith",
    "phone": "07123456789",
    "postcode": "SW1A 1AA",
    "voucherCode": "SM-ABC123",
    "voucherValue": "50",
    "appointmentTimes": "Weekday Mornings, Weekday Evenings",
    "timeline": "Within 3 months",
    "dentalCare": "Check-ups, Whitening",
    "importantFactors": "Modern equipment",
    "previousExperience": "4-5 people",
    "hasSurveyQ1to5": true,
    "hasExtendedSurvey": false,
    "totalEntries": 2
  }
}
```

---

## ✅ Testing Auto-Resume

### Test Scenario 1: 4 Question Reminder

1. **Setup:**
   - User has voucher
   - User has NOT completed 4 questions
   - Column AG (Total Draw Entries) = 1

2. **Send Test Email:**
   - Manually trigger follow-up email
   - Email includes: `https://smilemoore.co.uk?cid={CUSTOMER_ID}`

3. **Expected Behavior:**
   - Click link
   - Page loads to Step 5 (4 questions)
   - Email/name/phone/postcode pre-filled
   - Survey questions blank (ready to answer)

4. **After Completion:**
   - Column AG updates to 2
   - Google Sheets shows survey answers
   - User sees success message

---

### Test Scenario 2: Extended Survey Reminder

1. **Setup:**
   - User has voucher
   - User HAS completed 4 questions
   - Column AG = 2

2. **Send Test Email:**
   - Email includes: `https://smilemoore.co.uk?cid={CUSTOMER_ID}`

3. **Expected Behavior:**
   - Click link
   - Page loads to Step 6 (extended survey)
   - All previous data pre-filled
   - Extended survey questions blank

4. **After Completion:**
   - Column AG updates to 3
   - All survey columns filled
   - Christmas sharing email can be sent

---

### Test Scenario 3: QR vs Email Link

1. **Setup:** User completed everything (3 entries)

2. **Test A - Email Link:**
   - Click: `https://smilemoore.co.uk?cid=ABC123`
   - Should show Step 7 (thank you page)
   - Should NOT clear localStorage
   - Should show their referral link

3. **Test B - Direct URL:**
   - Visit: `https://smilemoore.co.uk`
   - Should show Step 1 (fresh form)
   - Should clear localStorage
   - Should allow new signup

---

## 📊 Google Sheets Integration

**Customer ID Column:** Column A

**Resume Logic Checks:**
- Has voucher? (Column G)
- Has 4 questions? (Column J-N)
- Has extended survey? (Column O-X)
- Total entries? (Column AG)

**Auto-Resume Jumps To:**
- Step 5: If only has voucher
- Step 6: If has 4 questions
- Step 7: If has everything

---

## 🚀 Benefits of Auto-Resume System

**For Users:**
- ✅ No need to remember progress
- ✅ Can't accidentally re-submit
- ✅ Seamless experience across devices
- ✅ Pick up exactly where left off
- ✅ Don't have to re-enter info

**For You:**
- ✅ Higher survey completion rates
- ✅ Better data quality (no duplicates)
- ✅ Accurate entry tracking
- ✅ Clear user journey analytics
- ✅ Easy to help users who get stuck

**For Data Integrity:**
- ✅ One Customer ID per signup
- ✅ Can't create duplicates
- ✅ Updates existing record
- ✅ Proper entry counting
- ✅ Accurate referral attribution

---

## 🔮 Future Enhancements

**Potential Additions:**
1. **SMS Resume Links** - Text reminder with auto-resume link
2. **WhatsApp Resume** - Message with `?cid=` link
3. **Progress Bar** - Show % complete in email
4. **Time Estimates** - "Just 2 minutes left!"
5. **Partial Save** - Auto-save as user types

---

**All email links now support auto-resume using `?cid={CUSTOMER_ID}` parameter! 🎉**
