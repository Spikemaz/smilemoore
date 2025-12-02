import { NextResponse } from 'next/server';
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
    // Simple authentication - require password
    const { password } = await request.json();

    if (password !== 'Ronabambi2025') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // Read current row 2 data to preserve it
    const currentDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
    });

    const currentData = currentDataResponse.data.values?.[0] || ['0', '0', '0', '0', '0', '0'];

    // Define correct headers
    const headers = [[
      'Last Customer ID',
      'Site Visitors Total',
      'Site Visitors Unique',
      'Stage 1',
      'Stage 2',
      'Stage 3'
    ]];

    // Write headers to row 1
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A1:F1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    // Ensure row 2 data is preserved
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [currentData] },
    });

    return NextResponse.json({
      success: true,
      message: 'CustomerID headers fixed successfully',
      currentData: {
        lastCustomerId: currentData[0],
        siteVisitorsTotal: currentData[1],
        siteVisitorsUnique: currentData[2],
        stage1: currentData[3],
        stage2: currentData[4],
        stage3: currentData[5],
      },
    });
  } catch (error) {
    console.error('Error fixing CustomerID headers:', error);
    return NextResponse.json(
      { error: 'Failed to fix headers' },
      { status: 500 }
    );
  }
}
