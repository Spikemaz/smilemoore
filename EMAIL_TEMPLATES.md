# Smile Moore - Automated Email System Documentation

**Last Updated:** December 1, 2025
**Email Provider:** Resend (reception@smilemoore.co.uk)

---

## 📧 Email Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER JOURNEY & EMAILS                        │
└─────────────────────────────────────────────────────────────────┘

1. User claims voucher (email + name + phone + postcode)
   └─> ✉️ VOUCHER CONFIRMATION EMAIL (immediate)

2. User at 1 entry (claimed voucher only)
   └─> ✉️ 4-QUESTION FOLLOW-UP #1 (immediate)
       └─> No open after 48 hours?
           └─> ✉️ 4-QUESTION FOLLOW-UP #2
               └─> No open after 48 hours?
                   └─> ✉️ 4-QUESTION FOLLOW-UP #3 (final)

3. User at 2 entries (completed 4 questions)
   └─> ✉️ 10-QUESTION FOLLOW-UP #1 (immediate)
       └─> No open after 48 hours?
           └─> ✉️ 10-QUESTION FOLLOW-UP #2
               └─> No open after 48 hours?
                   └─> ✉️ 10-QUESTION FOLLOW-UP #3 (final)

4. User at 3 entries (completed all surveys)
   └─> ✉️ CHRISTMAS SHARING EMAIL (immediate)
       └─> Incentivize referrals with +10 entries per friend
```

---

## 🎯 Email Deduplication System

**IMPORTANT:** For families using the same email address:

- **Voucher Confirmation**: ONE email with ALL family members' voucher codes in a table
- **Follow-ups**: ONE email per email address (not per person)
- **Tracking**: All rows with same email marked as "sent" simultaneously

**Example:**
```
mum@email.com signs up 3 times (Child 1, Child 2, Parent)
└─> Gets 1 email showing all 3 voucher codes
└─> Gets 1 follow-up (not 3)
└─> No inbox spam! ✅
```

---

## 📨 EMAIL TEMPLATES

---

### **1. VOUCHER CONFIRMATION EMAIL**

**Trigger:** Immediately when user completes postcode field (final step)
**From:** Smile Moore Reception <reception@smilemoore.co.uk>
**Reply-To:** reception@smilemoore.co.uk
**Tracking:** Email open tracking pixel included

#### **1A. Single Signup**

**Subject:** `Your £50 Smile Moore Voucher - SMILEABC123`

**Content:**
```
┌─────────────────────────────────────────────┐
│         Smile Moore (Header Logo)           │
└─────────────────────────────────────────────┘

Congratulations, [Name]! 🎉

Thank you for claiming your voucher! Your £50 voucher is confirmed and ready to use.

┌─────────────────────────────────────────────┐
│          YOUR VOUCHER CODE                   │
│                                              │
│            SMILEABC123                       │
└─────────────────────────────────────────────┘

What Happens Next?
• Keep this voucher code safe - you'll need it when we open!
• We'll keep you updated as we complete our CQC approval process
• You'll receive updates throughout our practice fit-out
• Once we're ready to see our first patients, we'll send you a booking link
• Use your voucher code when booking to redeem your £50 discount
• Bonus: Receive +100 prize draw entries when you redeem your voucher!

┌─────────────────────────────────────────────┐
│          🎁 You're Entered to Win!          │
│                                              │
│ You have 3 entries in our draw to win       │
│ 1 Year of FREE Dentistry worth up to £5,000!│
│                                              │
│ Want +10 bonus entries?                     │
│ Share your unique referral link with friends│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│          YOUR REFERRAL LINK                  │
│                                              │
│ https://smilemoore.co.uk?ref=John-123       │
│                                              │
│ Share this link and get +10 entries for     │
│ every friend who claims their voucher!      │
└─────────────────────────────────────────────┘

If you have any questions, please reply to this email and we'll be happy to help.

© 2025 Smile Moore. All rights reserved.
This email was sent because you claimed a voucher on our website.
```

#### **1B. Multiple Signups (Family)**

**Subject:** `Your 3 Smile Moore Vouchers (£150 Total Value)`

**Content:**
```
┌─────────────────────────────────────────────┐
│         Smile Moore (Header Logo)           │
└─────────────────────────────────────────────┘

Congratulations! 🎉

Thank you for claiming vouchers for your family! You've registered 3 people with a total value of £150.

┌──────────────────┬──────────────┬─────────┐
│ Family Member    │ Voucher Code │ Value   │
├──────────────────┼──────────────┼─────────┤
│ John Smith       │ SMILEABC123  │ £50     │
│ Jane Smith       │ SMILEDEF456  │ £50     │
│ Tom Smith        │ SMILEGHI789  │ £50     │
└──────────────────┴──────────────┴─────────┘

What Happens Next?
• Keep these voucher codes safe - you'll need them when we open!
• We'll keep you updated as we complete our CQC approval process
• You'll receive updates throughout our practice fit-out
• Once we're ready to see our first patients, we'll send you a booking link
• Use your voucher codes when booking to redeem your discount
• Bonus: Receive +100 prize draw entries when you redeem each voucher!

┌─────────────────────────────────────────────┐
│          🎁 You're Entered to Win!          │
│                                              │
│ Each family member has 3 entries in our     │
│ draw to win 1 Year of FREE Dentistry        │
│ worth up to £5,000!                         │
│                                              │
│ Want +10 bonus entries?                     │
│ Share your unique referral link with friends│
└─────────────────────────────────────────────┘

[Referral link section same as above]
```

---

### **2. 4-QUESTION FOLLOW-UP EMAILS**

**Trigger:** User has 1 entry (claimed voucher but didn't complete 4 questions)
**From:** Smile Moore Reception <reception@smilemoore.co.uk>
**Reply-To:** reception@smilemoore.co.uk
**Tracking:** Follow-up open tracking + unsubscribe link included

#### **2A. Follow-up #1 (Variation 1)**

**Send:** Immediately when user has 1 entry
**Subject:** `🎁 Quick reminder: Boost your prize draw entries!`

**Content:**
```
Hi [Name],

We noticed you claimed your £50 voucher but haven't entered the prize draw yet!

It only takes 1 minute to answer 4 quick questions and you'll receive +1 bonus entry.

Click here to complete: https://smilemoore.co.uk

Thank you!
Smile Moore Team

──────────────────────────────────────────
Don't want survey reminders?
Unsubscribe here

Note: Your £50 voucher remains valid. You'll still receive important practice updates.
```

#### **2B. Follow-up #2 (Variation 2)**

**Send:** 48 hours after #1 if not opened
**Subject:** `Don't miss out on winning up to £5,000 of free dentistry!`

**Content:**
```
Hi [Name],

You're so close! Complete 4 simple questions to enter the draw for 1 Year of FREE Dentistry worth up to £5,000.

Plus, you'll earn another entry bringing your total to 2 entries.

Complete now: https://smilemoore.co.uk

Best regards,
Smile Moore Team

[Unsubscribe footer same as above]
```

#### **2C. Follow-up #3 (Variation 3 - Final)**

**Send:** 48 hours after #2 if not opened
**Subject:** `Final chance: Enter the prize draw`

**Content:**
```
Hi [Name],

This is your last reminder to enter the prize draw worth up to £5,000!

4 quick questions = +1 entry in the draw
Takes less than 60 seconds

Complete your entry: https://smilemoore.co.uk

Thank you,
Smile Moore Team

[Unsubscribe footer same as above]
```

---

### **3. 10-QUESTION FOLLOW-UP EMAILS**

**Trigger:** User has 2 entries (completed 4 questions but not 10-question extended survey)
**From:** Smile Moore Reception <reception@smilemoore.co.uk>
**Reply-To:** reception@smilemoore.co.uk

#### **3A. Follow-up #1 (Variation 1)**

**Send:** Immediately when user has 2 entries
**Subject:** `🌟 One more step to maximize your prize entries!`

**Content:**
```
Hi [Name],

Great job completing the first questions! You now have 2 entries in the prize draw worth up to £5,000.

Want to increase your chances? Answer 10 more quick questions and earn +1 bonus entry (3 entries total).

Continue here: https://smilemoore.co.uk

Thank you!
Smile Moore Team

[Unsubscribe footer]
```

#### **3B. Follow-up #2 (Variation 2)**

**Send:** 48 hours after #1 if not opened
**Subject:** `Help us build your perfect dental practice`

**Content:**
```
Hi [Name],

Your feedback is incredibly valuable! We'd love to hear more about your dental preferences.

Complete 10 additional questions and you'll receive:
• +1 bonus entry in the prize draw (3 total)
• Help shape your perfect dental experience

Share your thoughts: https://smilemoore.co.uk

Best regards,
Smile Moore Team

[Unsubscribe footer]
```

#### **3C. Follow-up #3 (Variation 3 - Final)**

**Send:** 48 hours after #2 if not opened
**Subject:** `Last call: Get your 3rd prize draw entry`

**Content:**
```
Hi [Name],

This is your final reminder to maximize your prize draw entries!

You currently have 2 entries. Complete the extended survey to earn your 3rd entry.

It takes just 2 minutes: https://smilemoore.co.uk

Thank you,
Smile Moore Team

[Unsubscribe footer]
```

---

### **4. CHRISTMAS SHARING EMAIL**

**Trigger:** User has 3 entries (completed everything)
**From:** Smile Moore Reception <reception@smilemoore.co.uk>
**Reply-To:** reception@smilemoore.co.uk
**Purpose:** Incentivize referrals

**Send:** Immediately when user completes all surveys
**Subject:** `🎄 Spread Christmas Joy - Share Your £50 Voucher!`

**Content:**
```
Hi [Name],

The festive season is here! 🎄✨

We noticed you claimed your £50 voucher - why not spread some Christmas joy to your family and friends?

🎁 Give the Gift of a Healthy Smile This Christmas

Who else do you know who may also want this? Share your unique referral link and:
• Help your loved ones save £50 on dental care
• Earn +10 bonus entries in the prize draw for EACH friend who claims their voucher
• Perfect timing before the Christmas period!

Your Referral Link: https://smilemoore.co.uk?ref=[Name]-[Code]

The more you share, the better your chances of winning 1 Year of FREE Dentistry worth up to £5,000!

Wishing you a wonderful festive season,
Smile Moore Team 🎅

──────────────────────────────────────────
Don't want promotional emails?
Unsubscribe here
```

---

## 🔄 Email Timing & Logic

### **Follow-up Sending Rules:**

1. **4-Question Follow-ups:**
   - Variation 1: Send immediately when user reaches 1 entry
   - Variation 2: Send 48 hours later IF variation 1 not opened
   - Variation 3: Send 48 hours later IF variation 2 not opened
   - Stop sending once user completes 4 questions (reaches 2 entries)

2. **10-Question Follow-ups:**
   - Variation 1: Send immediately when user reaches 2 entries
   - Variation 2: Send 48 hours later IF variation 1 not opened
   - Variation 3: Send 48 hours later IF variation 2 not opened
   - Stop sending once user completes extended survey (reaches 3 entries)

3. **Christmas Sharing:**
   - Send once when user reaches 3 entries
   - No follow-ups (one-time promotional email)

### **Email Open Tracking:**

All emails include invisible tracking pixels:
- Voucher confirmation: `track-email-open?email=[email]`
- Follow-ups: `track-followup-open?email=[email]&type=[4q/10q/christmas]&v=[1-3]`

### **Unsubscribe Handling:**

- Unsubscribe link: `https://smilemoore.co.uk/api/unsubscribe?email=[email]`
- When unsubscribed: User marked in spreadsheet, no more follow-ups sent
- Voucher remains valid and important practice updates still sent

---

## 📊 Prize Draw Entry System

```
┌─────────────────────────────────────────────────────────────┐
│                  HOW TO EARN ENTRIES                         │
└─────────────────────────────────────────────────────────────┘

Base Entry:
├─ Claim voucher (email + name + phone + postcode)  = +1 entry

Survey Completions:
├─ Complete 4 questions                              = +1 entry
└─ Complete 10-question extended survey              = +1 entry

Total from signups and surveys:                      = 3 entries

Referrals (unlimited):
└─ Each friend who claims voucher via your link      = +10 entries

Voucher Redemption (future):
└─ When you redeem your voucher at practice          = +100 entries
```

---

## 🛠️ Technical Implementation

### **Email Service:** Resend API
- API Key stored in: `RESEND_API_KEY` environment variable
- Domain: smilemoore.co.uk
- Sender: reception@smilemoore.co.uk
- DNS records required for email delivery

### **Tracking in Google Sheets:**

**Columns used for email tracking:**
- Column AC (index 29): Email Sent timestamp
- Column AD (index 30): Email Opened timestamp
- Column AE (index 31): Referral Link Clicked
- Column AI-AJ: Follow-up 1 (4Q) - Sent/Opened
- Column AK-AL: Follow-up 2 (4Q) - Sent/Opened
- Column AM-AN: Follow-up 3 (4Q) - Sent/Opened
- Column AO-AP: Follow-up 1 (10Q) - Sent/Opened
- Column AQ-AR: Follow-up 2 (10Q) - Sent/Opened
- Column AS-AT: Follow-up 3 (10Q) - Sent/Opened
- Column AV: Unsubscribed from Follow-ups
- Column AW: Christmas Sharing Email Sent

### **Cron Job:**
- Follow-up emails sent via cron job: `/api/send-follow-ups`
- Requires authorization header: `Bearer ${CRON_SECRET}`
- Recommended frequency: Run every 6-12 hours

---

## ✏️ Editing Email Templates

### **Location of Templates:**

1. **Voucher Confirmation Email:**
   - File: `app/api/update-voucher/route.ts`
   - Lines: ~240-385 (HTML email template)

2. **4-Question Follow-ups:**
   - File: `app/api/send-follow-ups/route.ts`
   - Lines: 27-74 (3 variations)

3. **10-Question Follow-ups:**
   - File: `app/api/send-follow-ups/route.ts`
   - Lines: 103-151 (3 variations)

4. **Christmas Sharing:**
   - File: `app/api/send-follow-ups/route.ts`
   - Lines: 76-100

### **How to Edit:**

1. Open the file in your code editor
2. Find the template by line number or search for the subject line
3. Edit the `subject` or `body` content
4. Save the file
5. Commit and push changes: `git add . && git commit -m "Update email template" && git push`
6. Changes go live immediately on next email send

---

## 📈 Email Performance Tracking

**Track these metrics in Google Sheets:**
- Email sent count (Column AC)
- Email open rate (Column AD)
- Follow-up variations performance (Columns AW-AX)
- Unsubscribe rate (Column AV)
- Referral link clicks (Column AE)

**Best performing subjects get recorded in:**
- Column AW: Best Performing Subject (4Q)
- Column AX: Best Performing Subject (10Q)

---

## 🚨 Important Notes

1. **Never spam:** Deduplication system ensures one email per address
2. **Family-friendly:** Consolidated emails for multiple signups
3. **Unsubscribe respected:** Users can opt out of survey reminders
4. **Voucher always valid:** Even if unsubscribed, voucher remains active
5. **Professional tone:** Friendly but professional in all communications

---

**Questions or need to modify templates?**
Edit the files listed above or contact the development team.
