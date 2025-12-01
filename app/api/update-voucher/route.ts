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
    const { email, customerId, field, value, campaignSource, emailToName, nameToPhone, phoneToPostcode, totalTime } = await request.json();

    // Require either email or customerId
    if ((!email && !customerId) || !field || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // All data is in Home tab now
    // Find the row - prefer customerId (column A) for uniqueness, fall back to email (column C)
    let rowIndex = -1;

    if (customerId) {
      // Search by Customer ID (more reliable for duplicate emails)
      // Pad customerId to 5 digits to match format in sheet (00001, 00010, etc.)
      const paddedCustomerId = customerId.toString().padStart(5, '0');
      console.log('🔍 Received customerId:', customerId, 'type:', typeof customerId);
      console.log('🔍 Padded customerId:', paddedCustomerId);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Home!A:A',
      });
      const rows = response.data.values || [];
      console.log('📊 Total rows in A:A:', rows.length);
      console.log('📊 First 5 rows:', rows.slice(0, 5).map(r => `[${r[0]}] type: ${typeof r[0]}`));

      rowIndex = rows.findIndex((row) => row[0] === paddedCustomerId);
      console.log('📍 Found at rowIndex:', rowIndex, 'Will update row:', rowIndex + 1);

      if (rowIndex === -1) {
        // Not found - log all Customer IDs for debugging
        console.log('❌ Customer ID not found. All IDs in sheet:', rows.slice(0, 20).map(r => r[0]));
      }
    } else {
      // Fall back to email search (legacy support)
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Home!C:C',
      });
      const rows = response.data.values || [];
      rowIndex = rows.findIndex((row) => row[0] === email);
    }

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: customerId ? 'Customer ID not found' : 'Email not found' },
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

    // If updating name, generate and store referral link
    if (field === 'name' && value) {
      const randomCode = Math.floor(100 + Math.random() * 900);
      const referralLink = `https://smilemoore.co.uk/api/track-referral-click?email=${encodeURIComponent(email)}&ref=${encodeURIComponent(value)}-${randomCode}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!AH${rowIndex + 1}`, // Column AH = Referal Link
        valueInputOption: 'RAW',
        requestBody: {
          values: [[referralLink]],
        },
      });
    }

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

      // Award +1 entry for claiming voucher (completing name/phone/postcode)
      const entriesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!AG${rowIndex + 1}`, // Column AG = Total Draw Entries
      });
      const currentEntries = parseInt(entriesResponse.data.values?.[0]?.[0]) || 0;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!AG${rowIndex + 1}`, // Column AG = Total Draw Entries
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[currentEntries + 1]],
        },
      });

      // Get all voucher details from the row to send confirmation email
      const voucherDetailsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!C${rowIndex + 1}:AH${rowIndex + 1}`, // Email through Referal Link
      });

      const voucherDetails = voucherDetailsResponse.data.values?.[0];
      if (voucherDetails) {
        const [emailAddr, name, phone, postcode, source, voucherValue, voucherCode, batchNumber, ipAddress, referredBy, ...surveyAnswers] = voucherDetails;
        const referralLink = voucherDetails[31]; // Column AH (index 31 from C)

        // Check if this email has multiple signups - if so, group them
        const allRowsResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Home!C:I', // Email through Voucher Code columns
        });
        const allRows = allRowsResponse.data.values || [];
        const sameEmailSignups = allRows
          .map((row, idx) => ({ row, index: idx }))
          .filter(({ row }) => row[0] === emailAddr && row[1]) // Has email and name
          .map(({ row, index }) => ({
            name: row[1],
            phone: row[2],
            postcode: row[3],
            voucherValue: row[5],
            voucherCode: row[6],
            rowIndex: index + 1,
          }));

        // Check if email was already sent to this address (check any row with same email)
        const emailSentResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Home!C:AC', // Email through "Email Sent" columns
        });
        const emailSentRows = emailSentResponse.data.values || [];
        const emailAlreadySent = emailSentRows.some(row =>
          row[0] === emailAddr && row[29] // Column AC (Email Sent) = index 29 from C
        );

        // Only send email if not already sent to this address
        if (emailAlreadySent) {
          console.log(`Skipping email to ${emailAddr} - already sent for this address`);
          // Just mark this row as email sent (timestamp)
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Home!AC${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[new Date().toISOString()]],
            },
          });
        } else {

        // Send Discord notification for voucher claim completion
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'voucher_claimed',
              data: {
                name,
                email: emailAddr,
                postcode,
                voucherCode,
                voucherValue,
                entries: currentEntries + 1,
              },
            }),
          });
        } catch (notifError) {
          console.error('Failed to send voucher claim notification:', notifError);
        }

        // Send confirmation email using Resend directly
        try {
          const { Resend } = await import('resend');

          if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);

            // Generate email content based on number of signups
            const isMultiple = sameEmailSignups.length > 1;
            const totalValue = sameEmailSignups.reduce((sum, s) => sum + parseInt(s.voucherValue), 0);

            const voucherListHTML = isMultiple
              ? sameEmailSignups.map(signup => `
                  <tr>
                    <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 5px 0; color: #1f3a33; font-size: 16px; font-weight: bold;">${signup.name}</p>
                      <p style="margin: 0; color: #666; font-size: 14px;">${signup.phone} • ${signup.postcode}</p>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                      <p style="margin: 0; color: #1f3a33; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">${signup.voucherCode}</p>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                      <p style="margin: 0; color: #70d490; font-size: 18px; font-weight: bold;">£${signup.voucherValue}</p>
                    </td>
                  </tr>
                `).join('')
              : '';

            const emailResult = await resend.emails.send({
              from: 'Smile Moore Reception <reception@smilemoore.co.uk>',
              to: [emailAddr],
              replyTo: 'reception@smilemoore.co.uk',
              subject: isMultiple
                ? `Your ${sameEmailSignups.length} Smile Moore Vouchers (£${totalValue} Total Value)`
                : `Your £${voucherValue} Smile Moore Voucher - ${voucherCode}`,
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
                                <h2 style="margin: 0 0 20px 0; color: #1f3a33; font-size: 24px;">
                                  ${isMultiple ? 'Congratulations! 🎉' : `Congratulations, ${name}! 🎉`}
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 24px;">
                                  ${isMultiple
                                    ? `Thank you for claiming vouchers for your family! You've registered ${sameEmailSignups.length} people with a total value of £${totalValue}.`
                                    : `Thank you for claiming your voucher! Your £${voucherValue} voucher is confirmed and ready to use.`
                                  }
                                </p>
                                ${isMultiple
                                  ? `
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 2px solid #cfe8d7; border-radius: 8px; overflow: hidden;">
                                      <tr style="background-color: #1f3a33;">
                                        <td style="padding: 15px; color: white; font-weight: bold;">Family Member</td>
                                        <td style="padding: 15px; color: white; font-weight: bold; text-align: center;">Voucher Code</td>
                                        <td style="padding: 15px; color: white; font-weight: bold; text-align: center;">Value</td>
                                      </tr>
                                      ${voucherListHTML}
                                    </table>
                                  `
                                  : `
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
                                  `
                                }
                                <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 24px;">
                                  <strong>What Happens Next?</strong>
                                </p>
                                <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 28px;">
                                  <li>Keep ${isMultiple ? 'these voucher codes' : 'this voucher code'} safe - you'll need ${isMultiple ? 'them' : 'it'} when we open!</li>
                                  <li>We'll keep you updated as we complete our CQC approval process</li>
                                  <li>You'll receive updates throughout our practice fit-out</li>
                                  <li>Once we're ready to see our first patients, we'll send you a booking link</li>
                                  <li>Use your voucher code${isMultiple ? 's' : ''} when booking to redeem your discount</li>
                                  <li><strong>Bonus: Receive +100 prize draw entries when you redeem ${isMultiple ? 'each' : 'your'} voucher!</strong></li>
                                </ul>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                  <tr>
                                    <td style="background-color: #cfe8d7; border-radius: 8px; padding: 25px; text-align: center;">
                                      <h3 style="margin: 0 0 15px 0; color: #1f3a33; font-size: 20px;">🎁 You're Entered to Win!</h3>
                                      <p style="margin: 0 0 15px 0; color: #1f3a33; font-size: 16px; line-height: 24px;">
                                        ${isMultiple
                                          ? `Each family member has <strong>3 entries</strong> in our draw to win <strong>1 Year of FREE Dentistry worth up to £5,000!</strong>`
                                          : `You have <strong>3 entries</strong> in our draw to win <strong>1 Year of FREE Dentistry worth up to £5,000!</strong>`
                                        }
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
                                        ${referralLink || `https://smilemoore.co.uk?ref=${encodeURIComponent(name)}-${Math.floor(100 + Math.random() * 900)}`}
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
                                <img src="https://smilemoore.co.uk/api/track-email-open?email=${encodeURIComponent(emailAddr)}" width="1" height="1" alt="" style="display: block; border: 0;" />
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

            // Mark email as sent in Google Sheets (column AC) for ALL rows with this email
            if (emailResult) {
              const timestamp = new Date().toISOString();
              const updatePromises = sameEmailSignups.map(signup =>
                sheets.spreadsheets.values.update({
                  spreadsheetId: SPREADSHEET_ID,
                  range: `Home!AC${signup.rowIndex}`,
                  valueInputOption: 'USER_ENTERED',
                  requestBody: {
                    values: [[timestamp]],
                  },
                })
              );
              await Promise.all(updatePromises);
              console.log(`Marked ${sameEmailSignups.length} rows as email sent for ${emailAddr}`);
            }
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the request if email fails
        }
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
