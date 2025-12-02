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

export async function POST() {
  try {
    const sheets = getGoogleSheetsClient();

    // Get ALL Visitors data to count properly
    const visitorsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A2:AR',
    });
    const visitorsData = visitorsResponse.data.values || [];

    // Total visits = total rows in Visitors sheet
    const totalVisits = visitorsData.length;

    // Unique visitors = unique SmileMoore Universal IDs (column AR - index 43)
    const uniqueIds = new Set();
    visitorsData.forEach(row => {
      const smId = row[43]; // Column AR
      if (smId) uniqueIds.add(smId);
    });
    const uniqueVisitors = uniqueIds.size;

    // Get Home data to count stages
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A2:AB',
    });
    const homeData = homeResponse.data.values || [];

    // Get last customer ID from last row
    const lastCustomerId = homeData.length > 0 ? homeData[homeData.length - 1][0] : '0';

    // Count stages by checking actual data
    let stage1Count = 0;
    let stage2Count = 0;
    let stage3Count = 0;

    homeData.forEach(row => {
      const hasCustomerId = row[0]?.trim();
      const hasEmail = row[2]?.trim();
      const hasName = row[3]?.trim();
      const hasPhone = row[4]?.trim();
      const hasPostcode = row[5]?.trim();

      if (hasCustomerId && hasEmail && hasName && hasPhone && hasPostcode) {
        stage1Count++;

        const hasQ1 = row[12]?.trim();
        const hasQ2 = row[13]?.trim();
        const hasQ3 = row[14]?.trim();
        const hasQ4 = row[15]?.trim();
        const hasQ5 = row[16]?.trim();

        if (hasQ1 && hasQ2 && hasQ3 && hasQ4 && hasQ5) {
          stage2Count++;

          const hasQ6 = row[17]?.trim();
          const hasQ7 = row[18]?.trim();
          const hasQ8 = row[19]?.trim();
          const hasQ9 = row[20]?.trim();
          const hasQ10 = row[21]?.trim();

          if (hasQ6 && hasQ7 && hasQ8 && hasQ9 && hasQ10) {
            stage3Count++;
          }
        }
      }
    });

    // Update CustomerID sheet row 2 with calculated values
    const updatedValues = [[
      lastCustomerId,
      totalVisits.toString(),
      uniqueVisitors.toString(),
      stage1Count.toString(),
      stage2Count.toString(),
      stage3Count.toString(),
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: updatedValues },
    });

    return NextResponse.json({
      success: true,
      message: 'CustomerID sheet updated with live-calculated data',
      stats: {
        lastCustomerId,
        siteVisitorsTotal: totalVisits,
        siteVisitorsUnique: uniqueVisitors,
        stage1: stage1Count,
        stage2: stage2Count,
        stage3: stage3Count,
      },
    });
  } catch (error) {
    console.error('Error updating CustomerID sheet:', error);
    return NextResponse.json(
      { error: 'Failed to update CustomerID sheet' },
      { status: 500 }
    );
  }
}
