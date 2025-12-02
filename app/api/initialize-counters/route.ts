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

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password !== 'Ronabambi2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheets = getGoogleSheetsClient();

    // Get current customer ID (column A)
    const currentDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2',
    });
    const currentCustomerId = currentDataResponse.data.values?.[0]?.[0] || '0';

    // Count actual data from sheets
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A2:A',
    });
    const homeCount = homeResponse.data.values?.length || 0;

    const visitorsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A2:A',
    });
    const visitorsCount = visitorsResponse.data.values?.length || 0;

    // Count unique visitors (assuming all are unique for now - we can refine this later)
    const uniqueVisitorsCount = visitorsCount;

    // Initialize row 2 with REAL CURRENT DATA
    const initialData = [[
      currentCustomerId,           // Column A: Last Customer ID (preserve existing)
      visitorsCount.toString(),    // Column B: Site Visitors Total
      uniqueVisitorsCount.toString(), // Column C: Site Visitors Unique
      homeCount.toString(),        // Column D: Stage 1 (signups)
      '0',                         // Column E: Stage 2 (will increment from tracking)
      '0',                         // Column F: Stage 3 (will increment from tracking)
    ]];

    // Write the initialized data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: initialData },
    });

    return NextResponse.json({
      success: true,
      message: 'CustomerID counters initialized with current data',
      initializedWith: {
        lastCustomerId: currentCustomerId,
        siteVisitorsTotal: visitorsCount,
        siteVisitorsUnique: uniqueVisitorsCount,
        stage1: homeCount,
        stage2: 0,
        stage3: 0,
      },
    });
  } catch (error) {
    console.error('Error initializing counters:', error);
    return NextResponse.json(
      { error: 'Failed to initialize counters' },
      { status: 500 }
    );
  }
}
