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

    // Get Visitors data to analyze unique tracking
    const visitorsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A1:AR100', // Get first 100 rows with headers
    });
    const visitorsData = visitorsResponse.data.values || [];

    // Get Home data to analyze stages
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A1:AB100', // Get first 100 rows with all question columns
    });
    const homeData = homeResponse.data.values || [];

    // Analyze Visitors
    const visitorsHeaders = visitorsData[0];
    const totalVisits = visitorsData.length - 1; // Subtract header row

    // Count unique by SmileMoore Universal ID (AR column)
    const smUniversalIdIndex = visitorsHeaders.indexOf('SmileMoore Universal ID');
    const uniqueIds = new Set();
    for (let i = 1; i < visitorsData.length; i++) {
      const row = visitorsData[i];
      const smId = row[smUniversalIdIndex];
      if (smId) uniqueIds.add(smId);
    }

    // Analyze Home data
    const homeHeaders = homeData[0];

    // Stage 1: Has Customer ID, Email, Name, Phone, Postcode
    const customerIdIndex = homeHeaders.indexOf('Customer ID'); // Column A
    const emailIndex = homeHeaders.indexOf('Email'); // Column C
    const nameIndex = homeHeaders.indexOf('Name'); // Column D
    const phoneIndex = homeHeaders.indexOf('Phone'); // Column E
    const postcodeIndex = homeHeaders.indexOf('Postcode'); // Column F

    // Stage 2: Questions 1-5 (columns M-Q)
    const q1Index = 12; // Column M
    const q5Index = 16; // Column Q

    // Stage 3: Questions 1-10 (columns M-V)
    const q10Index = 21; // Column V

    let stage1Count = 0;
    let stage2Count = 0;
    let stage3Count = 0;

    for (let i = 1; i < homeData.length; i++) {
      const row = homeData[i];

      // Stage 1: All basic fields filled
      const hasCustomerId = row[customerIdIndex]?.trim();
      const hasEmail = row[emailIndex]?.trim();
      const hasName = row[nameIndex]?.trim();
      const hasPhone = row[phoneIndex]?.trim();
      const hasPostcode = row[postcodeIndex]?.trim();

      if (hasCustomerId && hasEmail && hasName && hasPhone && hasPostcode) {
        stage1Count++;

        // Stage 2: Q1-Q5 all filled
        const hasQ1toQ5 = row[q1Index]?.trim() && row[q1Index + 1]?.trim() &&
                          row[q1Index + 2]?.trim() && row[q1Index + 3]?.trim() &&
                          row[q5Index]?.trim();

        if (hasQ1toQ5) {
          stage2Count++;

          // Stage 3: Q1-Q10 all filled
          const hasQ1toQ10 = hasQ1toQ5 &&
                             row[q5Index + 1]?.trim() && row[q5Index + 2]?.trim() &&
                             row[q5Index + 3]?.trim() && row[q5Index + 4]?.trim() &&
                             row[q10Index]?.trim();

          if (hasQ1toQ10) {
            stage3Count++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        visitors: {
          totalVisits,
          uniqueBySmId: uniqueIds.size,
          visitorsHeaders: visitorsHeaders.slice(0, 20), // First 20 columns
          sampleRow: visitorsData[1],
        },
        home: {
          totalRows: homeData.length - 1,
          stage1Count,
          stage2Count,
          stage3Count,
          homeHeaders: homeHeaders.slice(0, 30), // First 30 columns
          sampleRow: homeData[1],
          columnIndexes: {
            customerId: customerIdIndex,
            email: emailIndex,
            name: nameIndex,
            phone: phoneIndex,
            postcode: postcodeIndex,
            q1: q1Index,
            q5: q5Index,
            q10: q10Index,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error analyzing data:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data', details: String(error) },
      { status: 500 }
    );
  }
}
