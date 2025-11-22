import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY';

function getGoogleSheetsClient() {
  const client_email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL ||process.env.GOOGLE_CLIENT_EMAIL;
  const private_key = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY)?.replace(/\\n/g, '\n');

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
    const {
      visitorId,
      fbp,
      fbc,
      gaClientId,
      gid,
      muid,
      ttp,
      tta,
      mucAds,
      smUniversalId
    } = await request.json();

    if (!visitorId) {
      return NextResponse.json(
        { error: 'visitorId is required' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // Find the visitor row by visitorId (column A)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:A',
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === visitorId) {
        rowIndex = i + 1; // 1-indexed for sheets
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Update all platform IDs
    const updates = [];

    if (fbp) {
      updates.push({
        range: `Visitors!W${rowIndex}`, // Facebook Browser ID (_fbp)
        values: [[fbp]],
      });
    }

    if (fbc) {
      updates.push({
        range: `Visitors!X${rowIndex}`, // Facebook Click ID (_fbc)
        values: [[fbc]],
      });
    }

    if (gaClientId) {
      updates.push({
        range: `Visitors!Y${rowIndex}`, // Google Client ID (_ga)
        values: [[gaClientId]],
      });
    }

    if (gid) {
      updates.push({
        range: `Visitors!Y${rowIndex}`, // Google Session ID (_gid) - Note: Added to schema but using Y for now
        values: [[gid]],
      });
    }

    if (muid) {
      updates.push({
        range: `Visitors!AA${rowIndex}`, // Microsoft User ID (MUID)
        values: [[muid]],
      });
    }

    if (ttp) {
      updates.push({
        range: `Visitors!AC${rowIndex}`, // TikTok Browser ID (_ttp)
        values: [[ttp]],
      });
    }

    if (tta) {
      updates.push({
        range: `Visitors!AC${rowIndex}`, // TikTok Attribution ID (_tta) - Note: Using same column as _ttp for now
        values: [[tta]],
      });
    }

    if (mucAds) {
      updates.push({
        range: `Visitors!AE${rowIndex}`, // LinkedIn/Twitter ID (for now using LinkedIn column)
        values: [[mucAds]],
      });
    }

    if (smUniversalId) {
      updates.push({
        range: `Visitors!AR${rowIndex}`, // SmileMoore Universal ID
        values: [[smUniversalId]],
      });
    }

    // Recalculate cookie quality score
    let cookieQualityScore = 0;
    if (fbp) cookieQualityScore++;
    if (gaClientId) cookieQualityScore++;
    if (muid) cookieQualityScore++;
    if (ttp || tta) cookieQualityScore++;
    if (mucAds) cookieQualityScore++;

    updates.push({
      range: `Visitors!AS${rowIndex}`, // Cookie Quality Score
      values: [[cookieQualityScore]],
    });

    updates.push({
      range: `Visitors!AT${rowIndex}`, // All Cookies Captured
      values: [[cookieQualityScore === 6 ? 'Yes' : 'No']],
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          data: updates,
          valueInputOption: 'RAW',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Visitor cookies updated',
      rowIndex,
      updates: updates.length,
      cookieQualityScore,
    });
  } catch (error) {
    console.error('Error updating visitor cookies:', error);
    return NextResponse.json(
      { error: 'Failed to update visitor cookies' },
      { status: 500 }
    );
  }
}
