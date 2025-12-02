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
    credentials: { client_email, private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();

    // Read CustomerID tab
    const customerIdResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A1:F10',
    });

    // Check Home sheet signups
    const homeResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A2:A',
    });

    // Check Visitors sheet
    const visitorsResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A2:A',
    });

    return NextResponse.json({
      success: true,
      customerIdSheet: {
        headers: customerIdResult.data.values?.[0],
        counters: customerIdResult.data.values?.[1],
        allRows: customerIdResult.data.values,
      },
      actualCounts: {
        homeSignups: homeResult.data.values?.length || 0,
        visitors: visitorsResult.data.values?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error debugging sheet:', error);
    return NextResponse.json(
      { error: 'Failed to debug sheet', details: String(error) },
      { status: 500 }
    );
  }
}
