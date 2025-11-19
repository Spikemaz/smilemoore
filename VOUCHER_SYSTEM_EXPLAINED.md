# Dynamic Voucher Counter System

## How It Works

### Page Load
1. Visitor lands on page
2. System checks total signups in database (Google Sheets)
3. Calculates which "batch" we're in (every 90 signups = 1 batch)
4. Shows random number between actual remaining and 100

**Example:**
- 25 people have signed up
- Shows: Random between 75-100 (e.g., "87 vouchers remaining")

### During Form Completion
As user progresses through steps 1-4:
- Counter randomly decreases by 0-3 vouchers
- Creates urgency: "87... 84... 82... 79..."
- Never goes below actual remaining (minimum 16 shown)

### Page Refresh
- New random number generated
- One less than before (because they signed up)
- Example: First visit shows 87, refresh shows 74, etc.

---

## Tiered Voucher Values

Based on TOTAL signups across all batches:

| Signups | Voucher Value | Message |
|---------|---------------|---------|
| 0-499 | £50 | "Only X £50 Vouchers Remaining!" |
| 500-999 | £40 | "Only X £40 Vouchers Remaining!" |
| 1000-1499 | £30 | "Only X £30 Vouchers Remaining!" |
| 1500-1999 | £20 | "Only X £20 Vouchers Remaining!" |
| 2000-4999 | £10 | "Only X £10 Vouchers Remaining!" |
| 5000+ | £0 | "Join X spots left for Free Dentistry Draw!" |

---

## Batch System

### Batch Release Schedule:
- **Batch 1**: Vouchers 1-100 (hold back last 10, release at 90)
- **Batch 2**: Vouchers 101-200 (release at 190)
- **Batch 3**: Vouchers 201-300 (release at 290)
- And so on...

### When Batch Completes (90 signups):
1. Show announcement: "🎉 90 vouchers claimed! 100 more released!"
2. Counter resets to show 100 again
3. Continues countdown from 100 → minimum
4. At 16 or fewer actual remaining, stop decreasing

### Example Flow:

**Batch 1 (0-90 signups):**
```
Signup #1:  Shows 87 (random 75-100)
Signup #45: Shows 63 (random 45-100)
Signup #85: Shows 21 (close to limit)
Signup #89: Shows 17 (near minimum)
Signup #90: Shows 16 (at minimum)
```

**Batch 2 Starts (90th signup):**
```
Announcement: "90 vouchers claimed! 100 more available!"
Signup #91:  Shows 95 (random start again)
Signup #130: Shows 72
... continues ...
```

---

## Urgency Colors

Header changes color based on remaining:

- **20 or fewer**: 🔥 Red (HIGH urgency)
- **21-50**: 🟧 Orange (MEDIUM urgency)
- **51+**: 🔵 Blue (LOW urgency)

---

## Google Sheets Integration

### What Gets Tracked:
Every form submission saves to Google Sheets:

| Column | Data |
|--------|------|
| Timestamp | When submitted |
| Email | User email |
| Name | Full name |
| Phone | Phone number |
| Postcode | Address/postcode |
| Campaign Source | /earlybird, /leaflet, etc. |
| Voucher Value | £50, £40, £30, etc. |
| Voucher Code | SMILE50, SMILE40, etc. |
| Batch Number | Which batch (1, 2, 3...) |
| Total Signups | Running count |

### Sheet Structure:
```
Sheet 1: "Signups" - All form submissions
Sheet 2: "Stats" - Summary (total count, current batch, etc.)
Sheet 3: "Bonus Survey" - The 4-question survey answers
```

---

## Implementation Steps

### Phase 1: Basic (Working Now)
- ✅ Dynamic counter decreases during form
- ✅ Session-based (resets on refresh)
- ✅ Minimum threshold enforced
- ⏳ Hardcoded total signups (0)

### Phase 2: Google Sheets Connection (Next)
- Connect to Google Sheets API
- Read total signups on page load
- Write form submissions
- Real-time counter updates

### Phase 3: Advanced Features
- Admin dashboard to view stats
- Email/SMS voucher delivery
- Duplicate email prevention
- Real-time counter sync across users

---

## Testing The System

### Manually Set Signup Count:
```bash
# Set to 0 (start of batch 1)
curl -X PUT http://localhost:3000/api/voucher-status \
  -H "Content-Type: application/json" \
  -d '{"count": 0}'

# Set to 85 (near end of batch 1)
curl -X PUT http://localhost:3000/api/voucher-status \
  -d '{"count": 85}'

# Set to 500 (triggers £40 vouchers)
curl -X PUT http://localhost:3000/api/voucher-status \
  -d '{"count": 500}'
```

### Simulate Form Submission:
```bash
curl -X POST http://localhost:3000/api/voucher-status \
  -H "Content-Type: application/json" \
  -d '{"action": "increment"}'
```

---

## Next Steps

1. **Set up Google Sheets**
   - Create spreadsheet
   - Enable Google Sheets API
   - Get credentials
   - Share sheet with service account

2. **Connect API**
   - Read total signups from Sheet
   - Write form submissions
   - Update counter in real-time

3. **Test Flow**
   - Submit test forms
   - Watch counter decrease
   - Verify data in sheets
   - Test batch transitions

Want me to set up Google Sheets integration now?
