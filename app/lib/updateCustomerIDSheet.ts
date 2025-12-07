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

/**
 * Updates CustomerID sheet with live-calculated metrics from actual sheet data
 * Call this whenever data changes (visitor, signup, survey completion)
 */
export async function updateCustomerIDSheet(): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();

    // Get ALL Visitors data
    const visitorsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A2:AR',
    });
    const visitorsData = visitorsResponse.data.values || [];

    const totalVisits = visitorsData.length;

    // Unique visitors by SmileMoore Universal ID (column AR - index 43)
    const uniqueIds = new Set();
    visitorsData.forEach(row => {
      const smId = row[43]; // Column AR: A=0, AR=43 (A is column 0, so AR is 0+17=43 in 0-indexed)
      if (smId) uniqueIds.add(smId);
    });
    const uniqueVisitors = uniqueIds.size;

    // Get Home data
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A2:AB',
    });
    const homeData = homeResponse.data.values || [];

    const lastCustomerId = homeData.length > 0 ? homeData[homeData.length - 1][0] : '0';

    // Count stages - EXCLUDE Q5 additional household members from all counts
    let stage1Count = 0;
    let stage2Count = 0;
    let stage3Count = 0;

    homeData.forEach(row => {
      const hasCustomerId = row[0]?.trim();
      const hasEmail = row[2]?.trim();
      const hasName = row[3]?.trim();
      const hasPhone = row[4]?.trim();
      const hasPostcode = row[5]?.trim();
      const campaignSource = row[6] || ''; // Column G - Campaign Source

      // CRITICAL: Skip Q5 additional household members from all counts
      // These are auto-created entries, not real signups
      const isHouseholdMember = campaignSource.includes('Q5 Additional Person');

      if (hasCustomerId && hasEmail && hasName && hasPhone && hasPostcode && !isHouseholdMember) {
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

    // Update CustomerID sheet row 2
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

    console.log('✅ CustomerID sheet updated:', updatedValues[0]);
  } catch (error) {
    console.error('❌ Error updating CustomerID sheet:', error);
    // Don't throw - this is non-critical
  }
}
