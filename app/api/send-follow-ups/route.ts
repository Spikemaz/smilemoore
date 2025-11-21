import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';

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
    body: (name: string, voucherValue: number) => `
      Hi ${name},

      We noticed you claimed your £${voucherValue} voucher but haven't entered the £2,000 prize draw yet!

      It only takes 1 minute to answer 4 quick questions and you'll receive +1 bonus entry.

      Click here to complete: https://smilemoore.co.uk

      Thank you!
      Smile Moore Team
    `
  },
  {
    subject: "Don't miss out on winning £2,000 of free dentistry!",
    body: (name: string, voucherValue: number) => `
      Hi ${name},

      You're so close! Complete 4 simple questions to enter the draw for 1 Year of FREE Dentistry worth £2,000.

      Plus, you'll earn another entry bringing your total to 2 entries.

      Complete now: https://smilemoore.co.uk

      Best regards,
      Smile Moore Team
    `
  },
  {
    subject: "Final chance: Enter the £2,000 prize draw",
    body: (name: string, voucherValue: number) => `
      Hi ${name},

      This is your last reminder to enter the £2,000 prize draw!

      4 quick questions = +1 entry in the draw
      Takes less than 60 seconds

      Complete your entry: https://smilemoore.co.uk

      Thank you,
      Smile Moore Team
    `
  }
];

// Email variations for 10 questions follow-up
const tenQuestionVariations = [
  {
    subject: "🌟 One more step to maximize your prize entries!",
    body: (name: string) => `
      Hi ${name},

      Great job completing the first questions! You now have 2 entries in the £2,000 prize draw.

      Want to increase your chances? Answer 10 more quick questions and earn +1 bonus entry (3 entries total).

      Continue here: https://smilemoore.co.uk

      Thank you!
      Smile Moore Team
    `
  },
  {
    subject: "Help us build your perfect dental practice",
    body: (name: string) => `
      Hi ${name},

      Your feedback is incredibly valuable! We'd love to hear more about your dental preferences.

      Complete 10 additional questions and you'll receive:
      • +1 bonus entry in the prize draw (3 total)
      • Help shape your perfect dental experience

      Share your thoughts: https://smilemoore.co.uk

      Best regards,
      Smile Moore Team
    `
  },
  {
    subject: "Last call: Get your 3rd prize draw entry",
    body: (name: string) => `
      Hi ${name},

      This is your final reminder to maximize your prize draw entries!

      You currently have 2 entries. Complete the extended survey to earn your 3rd entry.

      It takes just 2 minutes: https://smilemoore.co.uk

      Thank you,
      Smile Moore Team
    `
  }
];

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

    // Get all signups (need up to column AS for 10Q follow-up tracking)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:AS',
    });

    const rows = response.data.values || [];
    let sentCount = 0;

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const email = row[2]; // Column C (index 2)
      const name = row[3]; // Column D (index 3)
      const voucherValue = row[7]; // Column H (index 7)
      const entries = parseInt(row[31]) || 0; // Column AF (index 31) - Total Draw Entries
      const unsubscribed = row[44]; // Column AT (index 44) - Unsubscribed from Follow-ups

      if (!email || !name || unsubscribed) continue; // Skip if unsubscribed

      const rowIndex = i + 1; // 1-indexed for sheets

      // Check if needs 4-question follow-up (has 1 entry only)
      if (entries === 1) {
        const followup1Sent = row[33]; // Column AH (index 33)
        const followup1Opened = row[34]; // Column AI (index 34)
        const followup2Sent = row[35]; // Column AJ (index 35)
        const followup2Opened = row[36]; // Column AK (index 36)
        const followup3Sent = row[37]; // Column AL (index 37)

        let variationIndex = -1;
        let columnToUpdate = '';

        // Determine which follow-up to send
        if (!followup1Sent) {
          variationIndex = 0;
          columnToUpdate = 'AH';
        } else if (followup1Sent && !followup1Opened && !followup2Sent) {
          // Wait 48 hours before sending variation 2
          const sentDate = new Date(followup1Sent);
          const now = new Date();
          if (now.getTime() - sentDate.getTime() > 48 * 60 * 60 * 1000) {
            variationIndex = 1;
            columnToUpdate = 'AJ';
          }
        } else if (followup2Sent && !followup2Opened && !followup3Sent) {
          // Wait 48 hours before sending variation 3
          const sentDate = new Date(followup2Sent);
          const now = new Date();
          if (now.getTime() - sentDate.getTime() > 48 * 60 * 60 * 1000) {
            variationIndex = 2;
            columnToUpdate = 'AL';
          }
        }

        if (variationIndex !== -1) {
          const variation = fourQuestionVariations[variationIndex];
          const trackingParam = `?email=${encodeURIComponent(email)}&type=4q&v=${variationIndex + 1}`;

          await resend.emails.send({
            from: 'Smile Moore <noreply@smilemoore.co.uk>',
            to: [email],
            subject: variation.subject,
            html: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  ${variation.body(name, voucherValue).split('\n').map(line => line.trim() ? `<p style="margin: 10px 0;">${line.trim()}</p>` : '').join('')}

                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                    <p style="font-size: 12px; color: #999; margin: 5px 0;">
                      Don't want survey reminders?
                      <a href="https://smilemoore.co.uk/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #1f3a33; text-decoration: underline;">
                        Unsubscribe here
                      </a>
                    </p>
                    <p style="font-size: 11px; color: #999; margin: 5px 0;">
                      Note: Your £50 voucher remains valid. You'll still receive important practice updates.
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

          sentCount++;
        }
      }

      // Check if needs 10-question follow-up (has 2 entries only)
      if (entries === 2) {
        const followup1Sent = row[39]; // Column AN
        const followup1Opened = row[40]; // Column AO
        const followup2Sent = row[41]; // Column AP
        const followup2Opened = row[42]; // Column AQ
        const followup3Sent = row[43]; // Column AR

        let variationIndex = -1;
        let columnToUpdate = '';

        if (!followup1Sent) {
          variationIndex = 0;
          columnToUpdate = 'AN';
        } else if (followup1Sent && !followup1Opened && !followup2Sent) {
          const sentDate = new Date(followup1Sent);
          const now = new Date();
          if (now.getTime() - sentDate.getTime() > 48 * 60 * 60 * 1000) {
            variationIndex = 1;
            columnToUpdate = 'AP';
          }
        } else if (followup2Sent && !followup2Opened && !followup3Sent) {
          const sentDate = new Date(followup2Sent);
          const now = new Date();
          if (now.getTime() - sentDate.getTime() > 48 * 60 * 60 * 1000) {
            variationIndex = 2;
            columnToUpdate = 'AR';
          }
        }

        if (variationIndex !== -1) {
          const variation = tenQuestionVariations[variationIndex];
          const trackingParam = `?email=${encodeURIComponent(email)}&type=10q&v=${variationIndex + 1}`;

          await resend.emails.send({
            from: 'Smile Moore <noreply@smilemoore.co.uk>',
            to: [email],
            subject: variation.subject,
            html: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  ${variation.body(name).split('\n').map(line => line.trim() ? `<p style="margin: 10px 0;">${line.trim()}</p>` : '').join('')}

                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                    <p style="font-size: 12px; color: #999; margin: 5px 0;">
                      Don't want survey reminders?
                      <a href="https://smilemoore.co.uk/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #1f3a33; text-decoration: underline;">
                        Unsubscribe here
                      </a>
                    </p>
                    <p style="font-size: 11px; color: #999; margin: 5px 0;">
                      Note: Your £50 voucher remains valid. You'll still receive important practice updates.
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

          sentCount++;
        }
      }
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
