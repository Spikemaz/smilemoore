import { NextResponse } from 'next/server';
import { addSignup } from '@/app/lib/googleSheets';
import { VoucherCounter } from '@/app/utils/voucherSystem';
import { getTotalSignups } from '@/app/lib/googleSheets';
import { updateVisitorStatus } from '@/app/lib/visitorTracking';
import { google } from 'googleapis';

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

export async function POST(request: Request) {
  try {
    const { email, name, phone, address, campaignSource, timeToSubmit, scrollDepth, referredBy } = await request.json();

    // Validate required fields - only email is required for initial submission
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get IP address from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Get current signup count
    const totalSignups = await getTotalSignups();
    const counter = new VoucherCounter(totalSignups);
    const tier = counter.getCurrentTier();
    const batchNumber = Math.floor(totalSignups / 90) + 1;

    // Generate random alphanumeric voucher code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 for clarity
    let code = '';

    // Generate random 6-character code (e.g., SMILEA4N21K)
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    const voucherCode = `SMILE${code}`;

    // Add to Google Sheets - this generates the Customer ID
    const result = await addSignup({
      email,
      name,
      phone,
      postcode: address,
      campaignSource: campaignSource || 'direct',
      voucherValue: tier.value,
      voucherCode,
      batchNumber,
      ipAddress: ip,
      referredBy: referredBy || '',
    });

    if (!result.success || !result.customerId) {
      return NextResponse.json(
        { error: 'Failed to save signup' },
        { status: 500 }
      );
    }

    // Use the actual Customer ID that was written to the sheet
    const customerId = result.customerId;

    // Update visitor status to "Email Submitted" with time and scroll metrics
    await updateVisitorStatus(
      ip,
      email,
      customerId,
      'Email Submitted',
      timeToSubmit,
      scrollDepth
    );

    // If this signup was referred, update referrer's stats
    if (referredBy) {
      try {
        const sheets = getGoogleSheetsClient();

        // Find referrer by matching their name in the referral code (format: Name-XXX)
        // Extract the name portion from referredBy (e.g., "John-123" -> "John")
        const referrerName = referredBy.split('-')[0];
        console.log(`Looking for referrer with name: ${referrerName}`);

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Home!D:D', // Name column
        });

        const names = response.data.values || [];
        let referrerRowIndex = -1;

        // Match the name to find the referrer
        for (let i = 1; i < names.length; i++) {
          const name = names[i][0];
          if (name && name.toLowerCase() === referrerName.toLowerCase()) {
            referrerRowIndex = i + 1; // 1-indexed
            console.log(`Found referrer "${name}" at row ${referrerRowIndex}`);
            break;
          }
        }

        if (referrerRowIndex !== -1) {
          console.log(`Updating referrer at row ${referrerRowIndex}`);
          // Get current totals (AF=Total Referrals, AG=Total Draw Entries)
          const totalsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `Home!AF${referrerRowIndex}:AG${referrerRowIndex}`,
          });

          const currentTotals = totalsResponse.data.values?.[0] || [];
          const currentReferrals = parseInt(currentTotals[0]) || 0;
          const currentEntries = parseInt(currentTotals[1]) || 0;

          // Update: +1 referral, +10 draw entries
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Home!AF${referrerRowIndex}:AG${referrerRowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[currentReferrals + 1, currentEntries + 10]],
            },
          });

          // Send referral conversion notification
          try {
            // Get referrer's name
            const referrerDataResponse = await sheets.spreadsheets.values.get({
              spreadsheetId: SPREADSHEET_ID,
              range: `Home!D${referrerRowIndex}`,
            });
            const referrerName = referrerDataResponse.data.values?.[0]?.[0] || 'Unknown';

            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/send-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'referral_conversion',
                data: {
                  referrerName,
                  newEmail: email,
                  totalReferrals: currentReferrals + 1,
                  totalEntries: currentEntries + 10,
                },
              }),
            });
          } catch (notifError) {
            console.error('Failed to send referral notification:', notifError);
          }
        } else {
          console.log(`Referrer not found for: ${referredBy} (name: ${referrerName})`);
          console.log(`Total names in sheet: ${names.length - 1}`);
        }
      } catch (error) {
        console.error('Error updating referrer stats:', error);
        // Don't fail the signup if referral tracking fails
      }
    }

    // Send real-time notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email_submitted',
          data: {
            email,
            voucherValue: tier.value,
            voucherCode,
            totalSignups: totalSignups + 1,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Check if we should announce new batch
    const announcement = counter.shouldReleaseBatch()
      ? counter.getBatchAnnouncementMessage()
      : null;

    return NextResponse.json({
      success: true,
      voucherCode,
      voucherValue: tier.value,
      batchNumber,
      announcement,
      totalSignups: totalSignups + 1,
      customerId,
    });
  } catch (error) {
    console.error('Error submitting voucher:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
