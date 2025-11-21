import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { updateVisitorStatus } from '@/app/lib/visitorTracking';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY';

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth.getClient();
}

export async function POST(request: NextRequest) {
  try {
    const { email, field, value, campaignSource, emailToName, nameToPhone, phoneToPostcode, totalTime } = await request.json();

    if (!email || !field || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // All data is in Home tab now
    // Find the row with this email (email is in column C)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:C',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === email);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Update the specific field
    const columnMap: { [key: string]: string } = {
      name: 'D',     // Column D
      phone: 'E',    // Column E
      address: 'F',  // Column F (postcode)
    };

    const column = columnMap[field];
    if (!column) {
      return NextResponse.json(
        { error: 'Invalid field' },
        { status: 400 }
      );
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!${column}${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]],
      },
    });

    // Get IP for visitor tracking
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Update visitor tracking with step timing data
    if (field === 'name' && emailToName !== undefined) {
      await updateVisitorStatus(
        ip,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        emailToName
      );
    } else if (field === 'phone' && nameToPhone !== undefined) {
      await updateVisitorStatus(
        ip,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        nameToPhone
      );
    } else if (field === 'address') {
      // Final step - update status and timing
      await updateVisitorStatus(
        ip,
        undefined,
        undefined,
        'Voucher Claimed',
        undefined,
        undefined,
        undefined,
        undefined,
        phoneToPostcode,
        totalTime
      );

      // Get all voucher details from the row to send confirmation email
      const voucherDetailsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!C${rowIndex + 1}:I${rowIndex + 1}`, // Email, Name, Phone, Postcode, Source, Value, Code
      });

      const voucherDetails = voucherDetailsResponse.data.values?.[0];
      if (voucherDetails) {
        const [emailAddr, name, phone, postcode, source, voucherValue, voucherCode] = voucherDetails;

        // Send confirmation email using Resend directly
        try {
          const { Resend } = await import('resend');

          if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);

            await resend.emails.send({
              from: 'Smile Moore Reception <reception@smilemoore.co.uk>',
              to: [emailAddr],
              replyTo: 'marcus@smilemoore.co.uk',
              subject: `Your £${voucherValue} Smile Moore Voucher - ${voucherCode}`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Your Smile Moore Voucher</title>
                  </head>
                  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
                      <tr>
                        <td align="center">
                          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <tr>
                              <td style="background: linear-gradient(to right, #1f3a33, #70d490); padding: 40px 20px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Smile Moore</h1>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #1f3a33; font-size: 24px;">Congratulations, ${name}! 🎉</h2>
                                <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 24px;">
                                  Thank you for claiming your voucher! Your £${voucherValue} voucher is confirmed and ready to use.
                                </p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                  <tr>
                                    <td style="background-color: #cfe8d7; border-radius: 8px; padding: 30px; text-align: center;">
                                      <p style="margin: 0 0 10px 0; color: #1f3a33; font-size: 14px; font-weight: bold;">YOUR VOUCHER CODE</p>
                                      <p style="margin: 0; color: #1f3a33; font-size: 36px; font-weight: bold; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                                        ${voucherCode}
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                                <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 24px;">
                                  <strong>What Happens Next?</strong>
                                </p>
                                <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 28px;">
                                  <li>Keep this voucher code safe - you'll need it when we open!</li>
                                  <li>We'll keep you updated as we complete our CQC approval process</li>
                                  <li>You'll receive updates throughout our practice fit-out</li>
                                  <li>Once we're ready to see our first patients, we'll send you a booking link</li>
                                  <li>Use your voucher code when booking to redeem your £${voucherValue} discount</li>
                                </ul>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                  <tr>
                                    <td style="background-color: #cfe8d7; border-radius: 8px; padding: 25px; text-align: center;">
                                      <h3 style="margin: 0 0 15px 0; color: #1f3a33; font-size: 20px;">🎁 You're Entered to Win!</h3>
                                      <p style="margin: 0 0 15px 0; color: #1f3a33; font-size: 16px; line-height: 24px;">
                                        You have <strong>3 entries</strong> in our draw to win <strong>1 Year of FREE Dentistry worth £2,000!</strong>
                                      </p>
                                      <p style="margin: 0; color: #1f3a33; font-size: 16px; line-height: 24px;">
                                        Want <strong>+10 bonus entries?</strong> Share your unique referral link with friends!
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                  <tr>
                                    <td style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #cfe8d7;">
                                      <p style="margin: 0 0 10px 0; color: #1f3a33; font-size: 14px; font-weight: bold;">YOUR REFERRAL LINK</p>
                                      <p style="margin: 0 0 15px 0; color: #1f3a33; font-size: 14px; word-break: break-all;">
                                        https://smilemoore.co.uk?ref=${encodeURIComponent(name)}-${Math.floor(100 + Math.random() * 900)}
                                      </p>
                                      <p style="margin: 0; color: #666666; font-size: 13px; line-height: 20px;">
                                        Share this link and get <strong>+10 entries</strong> for every friend who claims their voucher!
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                                <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                                  If you have any questions, please reply to this email and we'll be happy to help.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                  © ${new Date().getFullYear()} Smile Moore. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                  This email was sent because you claimed a voucher on our website.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
              `,
            });
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating voucher:', error);
    return NextResponse.json(
      { error: 'Failed to update voucher' },
      { status: 500 }
    );
  }
}
