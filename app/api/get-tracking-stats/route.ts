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

export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();

    // Fetch CustomerID tracking data from row 2
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
    });

    const data = response.data.values?.[0] || [];

    return NextResponse.json({
      success: true,
      stats: {
        lastCustomerId: data[0] || 'C-00000',
        siteVisitorsTotal: parseInt(data[1]) || 0,
        siteVisitorsUnique: parseInt(data[2]) || 0,
        stage1: parseInt(data[3]) || 0,
        stage2: parseInt(data[4]) || 0,
        stage3: parseInt(data[5]) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching tracking stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking stats' },
      { status: 500 }
    );
  }
}
