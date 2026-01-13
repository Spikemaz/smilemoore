import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { checkEmailOptOut, incrementEmailCount } from '@/app/lib/googleSheets';

const SPREADSHEET_ID = '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY';

function getGoogleSheetsClient() {
  const client_email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!client_email || !private_key) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email,
      private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Email variations for 4 questions follow-up
const fourQuestionVariations = [
  {
    subject: "🎁 Quick reminder: Boost your prize draw entries!",
    body: (name: string, voucherValue: number, customerId: string) => `
      Hi ${name},

      We noticed you claimed your £${voucherValue} voucher but haven't entered the prize draw yet!

      It only takes 1 minute to answer 4 quick questions and you'll receive +1 bonus entry.

      Click here to complete: https://smilemoore.co.uk?cid=${customerId}

      Thank you!
      Smile Moore Team
    `
  },
  {
    subject: "Don't miss out on winning up to £5,000 of free dentistry!",
    body: (name: string, voucherValue: number, customerId: string) => `
      Hi ${name},

      You're so close! Complete 4 simple questions to enter the draw for 1 Year of FREE Dentistry worth up to £5,000.

      Plus, you'll earn another entry bringing your total to 2 entries.

      Complete now: https://smilemoore.co.uk?cid=${customerId}

      Best regards,
      Smile Moore Team
    `
  },
  {
    subject: "Final chance: Enter the prize draw",
    body: (name: string, voucherValue: number, customerId: string) => `
      Hi ${name},

      This is your last reminder to enter the prize draw worth up to £5,000!

      4 quick questions = +1 entry in the draw
      Takes less than 60 seconds

      Complete your entry: https://smilemoore.co.uk?cid=${customerId}

      Thank you,
      Smile Moore Team
    `
  }
];

// Christmas sharing incentive email
const christmasSharingEmail = {
  subject: "🎄 Spread Christmas Joy - Share Your £50 Voucher!",
  body: (name: string, voucherValue: number, customerId: string) => `
    Hi ${name},

    The festive season is here! 🎄✨

    We noticed you claimed your £${voucherValue} voucher - why not spread some Christmas joy to your family and friends?

    🎁 Give the Gift of a Healthy Smile This Christmas

    Who else do you know who may also want this? Share your unique referral link and:
    • Help your loved ones save £${voucherValue} on dental care
    • Earn +10 bonus entries in the prize draw for EACH friend who claims their voucher
    • Perfect timing before the Christmas period!

    Your Referral Link: https://www.smilemoore.co.uk?ref=${customerId}

    The more you share, the better your chances of winning 1 Year of FREE Dentistry worth up to £5,000!

    Wishing you a wonderful festive season,
    Smile Moore Team 🎅
  `
};

// 10-question follow-up emails removed - users now only complete 5 questions
// const tenQuestionVariations = [...]; // Removed

export async function GET(request: Request) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const sheets = getGoogleSheetsClient();

    // Get all signups (need up to column AV for unsubscribe tracking)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:AV',
    });

    const rows = response.data.values || [];
    let sentCount = 0;

    // Track which emails we've already sent to (deduplication for multiple family members)
    const emailsSentThisRun = new Set<string>();

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const customerId = row[0]; // Column A (index 0) - Customer ID
      const email = row[2]; // Column C (index 2)
      const name = row[3]; // Column D (index 3)
      const voucherValue = row[7]; // Column H (index 7)
      const entries = parseInt(row[32]) || 0; // Column AG (index 32) - Total Draw Entries
      const unsubscribed = row[46]; // Column AV (index 46) - Unsubscribed from Follow-ups

      if (!email || !name || unsubscribed) continue; // Skip if unsubscribed

      // Skip if we already sent to this email in this run (deduplication for families)
      if (emailsSentThisRun.has(email)) {
        console.log(`Skipping ${email} - already sent follow-up this run`);
        continue;
      }

      const rowIndex = i + 1; // 1-indexed for sheets

      // Check if needs 4-question follow-up (has 1 entry only)
      if (entries === 1) {
        const followup1Sent = row[34]; // Column AI (index 34)
        const followup1Opened = row[35]; // Column AJ (index 35)
        const followup2Sent = row[36]; // Column AK (index 36)
        const followup2Opened = row[37]; // Column AL (index 37)
        const followup3Sent = row[38]; // Column AM (index 38)

        let variationIndex = -1;
        let columnToUpdate = '';

        // Determine which follow-up to send
        if (!followup1Sent) {
          variationIndex = 0;
          columnToUpdate = 'AI';
        } else if (followup1Sent && !followup1Opened && !followup2Sent) {
          // Wait 48 hours before sending variation 2
          const sentDate = new Date(followup1Sent);
          const now = new Date();
          if (now.getTime() - sentDate.getTime() > 48 * 60 * 60 * 1000) {
            variationIndex = 1;
            columnToUpdate = 'AK';
          }
        } else if (followup2Sent && !followup2Opened && !followup3Sent) {
          // Wait 48 hours before sending variation 3
          const sentDate = new Date(followup2Sent);
          const now = new Date();
          if (now.getTime() - sentDate.getTime() > 48 * 60 * 60 * 1000) {
            variationIndex = 2;
            columnToUpdate = 'AM';
          }
        }

        if (variationIndex !== -1) {
          // Check if user has opted out
          const hasOptedOut = await checkEmailOptOut(email);
          if (hasOptedOut) {
            console.log(`🚫 4Q Follow-up blocked: ${email} has STOP in column BE`);
            continue; // Skip to next person
          }

          const variation = fourQuestionVariations[variationIndex];
          const trackingParam = `?email=${encodeURIComponent(email)}&type=4q&v=${variationIndex + 1}`;

          try {
            await resend.emails.send({
              from: 'Smile Moore Reception <reception@smilemoore.co.uk>',
              replyTo: 'reception@smilemoore.co.uk',
              to: [email],
              subject: variation.subject,
              html: `
                <html>
                  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    ${variation.body(name, voucherValue, customerId).split('\n').map(line => line.trim() ? `<p style="margin: 10px 0;">${line.trim()}</p>` : '').join('')}

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                      <p style="font-size: 12px; color: #999; margin: 5px 0;">
                        Don't want these emails?
                        <a href="https://smilemoore.co.uk/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #1f3a33; text-decoration: underline;">
                          Unsubscribe here
                        </a>
                      </p>
                    </div>

                    <img src="https://smilemoore.co.uk/api/track-followup-open${trackingParam}" width="1" height="1" alt="" style="display: block; border: 0;" />
                  </body>
                </html>
              `,
            });

            // Mark as sent
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: `Home!${columnToUpdate}${rowIndex}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values: [[new Date().toISOString()]],
              },
            });

            // Increment email count
            await incrementEmailCount(email);

            // Mark this email as sent in this run
            emailsSentThisRun.add(email);
            sentCount++;
          } catch (emailError) {
            console.error(`Failed to send 4Q follow-up to ${email}:`, emailError);
            // Continue to next person instead of failing entire batch
          }
        }
      }

      // Check if should receive Christmas sharing email (has 3 entries - completed everything)
      if (entries === 3) {
        const christmasEmailSent = row[48]; // Column AW (index 48) - Christmas Sharing Email Sent

        if (!christmasEmailSent) {
          // Check if user has opted out
          const hasOptedOut = await checkEmailOptOut(email);
          if (hasOptedOut) {
            console.log(`🚫 Christmas email blocked: ${email} has STOP in column BE`);
            continue; // Skip to next person
          }

          // Send Christmas sharing incentive email
          const trackingParam = `?email=${encodeURIComponent(email)}&type=christmas`;

          try {
            await resend.emails.send({
              from: 'Smile Moore Reception <reception@smilemoore.co.uk>',
              replyTo: 'reception@smilemoore.co.uk',
              to: [email],
              subject: christmasSharingEmail.subject,
              html: `
                <html>
                  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    ${christmasSharingEmail.body(name, voucherValue, customerId).split('\n').map(line => line.trim() ? `<p style="margin: 10px 0;">${line.trim()}</p>` : '').join('')}

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                      <p style="font-size: 12px; color: #999; margin: 5px 0;">
                        Don't want these emails?
                        <a href="https://smilemoore.co.uk/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #1f3a33; text-decoration: underline;">
                          Unsubscribe here
                        </a>
                      </p>
                    </div>

                    <img src="https://smilemoore.co.uk/api/track-followup-open${trackingParam}" width="1" height="1" alt="" style="display: block; border: 0;" />
                  </body>
                </html>
              `,
            });

            // Mark as sent in Column AW
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: `Home!AW${rowIndex}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values: [[new Date().toISOString()]],
              },
            });

            // Increment email count
            await incrementEmailCount(email);

            // Mark this email as sent in this run
            emailsSentThisRun.add(email);
            sentCount++;
          } catch (emailError) {
            console.error(`Failed to send Christmas email to ${email}:`, emailError);
            // Continue to next person instead of failing entire batch
          }
        }
      }

      // 10-question follow-ups removed - users now only complete 5 questions
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} follow-up emails`,
      sentCount,
    });
  } catch (error) {
    console.error('Error sending follow-ups:', error);
    return NextResponse.json(
      { error: 'Failed to send follow-ups' },
      { status: 500 }
    );
  }
}
