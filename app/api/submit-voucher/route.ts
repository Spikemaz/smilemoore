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
    const { email, name, phone, address, campaignSource, timeToSubmit, scrollDepth, referredBy, smUniversalId } = await request.json();

    // Validate required fields - only email is required for initial submission
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim() // Take first IP if multiple
      : request.headers.get('x-real-ip') || 'unknown';

    // CRITICAL: NEVER auto-match vouchers - always create new voucher
    // Household members claim via update-voucher API using ?cid= link (Customer ID)
    // This prevents the "2 Johns at same postcode" problem
    const sheets = getGoogleSheetsClient();

    let customerId, voucherCode, tier;

    // ALWAYS create new voucher - no auto-matching by name/postcode/email
    // New voucher - create as normal
    const totalSignups = await getTotalSignups();
    const counter = new VoucherCounter(totalSignups);
    tier = counter.getCurrentTier();
    const batchNumber = Math.floor(totalSignups / 90) + 1;

    // Generate random alphanumeric voucher code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 for clarity
    let code = '';

    // Generate random 6-character code (e.g., SMILEA4N21K)
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    voucherCode = `SMILE${code}`;

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
      smUniversalId: smUniversalId || '',
    });

    if (!result.success || !result.customerId) {
      return NextResponse.json(
        { error: 'Failed to save signup' },
        { status: 500 }
      );
    }

    // Use the actual Customer ID that was written to the sheet
    customerId = result.customerId;

    // Update Visitors sheet with voucher code at the same time - find most recent visitor
    try {

      const visitorsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Visitors!A:AU',
      });

      const visitors = visitorsResponse.data.values || [];

      // Find most recent visitor row (last row)
      const visitorRowIndex = visitors.length;
      console.log('📊 Total Visitors rows:', visitors.length, '| Writing to row:', visitorRowIndex);

      if (visitorRowIndex > 1) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: [
              {
                range: `Visitors!J${visitorRowIndex}`,
                values: [[email]],
              },
              {
                range: `Visitors!K${visitorRowIndex}`,
                values: [[customerId]],
              },
              {
                range: `Visitors!L${visitorRowIndex}`,
                values: [['Email Submitted']],
              },
              {
                range: `Visitors!AU${visitorRowIndex}`, // Column AU - Voucher Code
                values: [[voucherCode]],
              },
            ],
          },
        });
        console.log('✅ Updated Visitors sheet row', visitorRowIndex, 'with email:', email, 'and voucher code:', voucherCode);
      }
    } catch (error) {
      console.error('Error updating Visitors sheet:', error);
      // Don't fail the whole request if this fails
    }

    // If this signup was referred, update referrer's stats
    if (referredBy) {
      try {
        const sheets = getGoogleSheetsClient();

        // referredBy can be either:
        // 1. Customer ID (new format): "6VCH3GXWAV8"
        // 2. Name-code (old format): "Marcus Moore-180"

        let referrerRowIndex = -1;

        // Try Customer ID search first (check if it looks like a Customer ID - all caps, no spaces/hyphens or just one hyphen)
        const looksLikeCustomerId = /^[A-Z0-9]{8,12}$/.test(referredBy);

        if (looksLikeCustomerId) {
          console.log(`🔍 Looking for referrer by Customer ID: ${referredBy}`);

          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Home!A:A', // Customer ID column
          });

          const customerIds = response.data.values || [];

          // Find matching Customer ID
          for (let i = 1; i < customerIds.length; i++) {
            const customerId = customerIds[i][0];
            if (customerId && customerId === referredBy) {
              referrerRowIndex = i + 1; // 1-indexed
              console.log(`✅ Found referrer by Customer ID "${customerId}" at row ${referrerRowIndex}`);
              break;
            }
          }
        } else {
          // Old format: Name-XXX
          const referrerName = referredBy.split('-')[0];
          console.log(`🔍 Looking for referrer by name: ${referrerName} (old format)`);

          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Home!D:D', // Name column
          });

          const names = response.data.values || [];

          // Match the name to find the referrer
          for (let i = 1; i < names.length; i++) {
            const name = names[i][0];
            if (name && name.toLowerCase() === referrerName.toLowerCase()) {
              referrerRowIndex = i + 1; // 1-indexed
              console.log(`✅ Found referrer by name "${name}" at row ${referrerRowIndex}`);
              break;
            }
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

          // Update: +1 referral, +10 draw entries (capped at 250)
          const newEntries = Math.min(currentEntries + 10, 250); // Cap at 250
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Home!AF${referrerRowIndex}:AG${referrerRowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[currentReferrals + 1, newEntries]],
            },
          });

          console.log(`🎁 Referral bonus: ${currentEntries} + 10 = ${newEntries} entries (capped at 250)`);

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
          console.log(`❌ Referrer not found for: ${referredBy}`);
        }
      } catch (error) {
        console.error('Error updating referrer stats:', error);
        // Don't fail the signup if referral tracking fails
      }
    }

    // Send real-time notification
    try {
      const newTotalSignups = totalSignups + 1;

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email_submitted',
          data: {
            email,
            voucherValue: tier.value,
            voucherCode,
            totalSignups: newTotalSignups,
          },
        }),
      });

      // Send milestone notification every 10 signups
      if (newTotalSignups % 10 === 0) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'milestone_signups',
            data: {
              totalSignups: newTotalSignups,
              latestName: name || email,
              campaignSource: campaignSource || 'Unknown',
            },
          }),
        });
      }
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
