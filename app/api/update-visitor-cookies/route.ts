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
    const { visitorId, fbp, gaClientId } = await request.json();

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

    // Update Facebook Browser ID (Column W) and Google Client ID (Column Y)
    const updates = [];

    if (fbp) {
      updates.push({
        range: `Visitors!W${rowIndex}`,
        values: [[fbp]],
      });
    }

    if (gaClientId) {
      updates.push({
        range: `Visitors!Y${rowIndex}`,
        values: [[gaClientId]],
      });
    }

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
    });
  } catch (error) {
    console.error('Error updating visitor cookies:', error);
    return NextResponse.json(
      { error: 'Failed to update visitor cookies' },
      { status: 500 }
    );
  }
}
