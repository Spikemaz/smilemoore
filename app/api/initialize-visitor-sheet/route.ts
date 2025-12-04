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
    const sheets = getGoogleSheetsClient();

    // Check if Visitors sheet exists
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const visitorSheet = sheetMetadata.data.sheets?.find(
      (sheet) => sheet.properties?.title === 'Visitors'
    );

    if (!visitorSheet) {
      return NextResponse.json(
        { error: 'Visitors sheet not found' },
        { status: 404 }
      );
    }

    // Read existing headers
    const existingHeaders = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!1:1',
    });

    const currentHeaders = existingHeaders.data.values?.[0] || [];
    const currentColumnCount = currentHeaders.length;

    // Define complete header row (columns A-BC)
    const headers = [
      'Visitor ID', // A
      'Timestamp', // B
      'IP Address', // C
      'Campaign Source', // D
      'Device Type', // E
      'Device Model', // F
      'Browser', // G
      'User Agent', // H
      'Referrer', // I
      'Email', // J
      'Customer ID', // K
      'Status', // L
      'UTM Source', // M
      'UTM Medium', // N
      'UTM Campaign', // O
      'UTM Term', // P
      'UTM Content', // Q
      'Operating System', // R
      'Screen Resolution', // S
      'Language', // T
      'Timezone', // U
      'Landing Page', // V
      'Facebook Browser ID (_fbp)', // W
      'Facebook Click ID (_fbc)', // X
      'Google Client ID (_ga)', // Y
      'Google Click ID (gclid)', // Z
      'Microsoft User ID (MUID)', // AA
      'Microsoft Click ID (msclkid)', // AB
      'TikTok Browser ID (_ttp)', // AC
      'TikTok Click ID (ttclid)', // AD
      'LinkedIn ID (li_fat_id)', // AE
      'Page Load Time (ms)', // AF
      'Returning Visitor', // AG
      'Session Count', // AH
      'First Visit Date', // AI
      'Day of Week', // AJ
      'Hour of Day', // AK
      'Time to Email Submit (s)', // AL
      'Max Scroll Depth %', // AM
      'Time Email → Name (s)', // AN
      'Time Name → Phone (s)', // AO
      'Time Phone → Postcode (s)', // AP
      'Total Time (s)', // AQ
      'SmileMoore Universal ID', // AR
      'Cookie Quality Score', // AS
      'All Cookies Captured', // AT
      'Voucher Code', // AU
      'Geo City', // AV - NEW
      'Geo Region', // AW - NEW
      'Geo Country', // AX - NEW
      'Geo Latitude', // AY - NEW
      'Geo Longitude', // AZ - NEW
      'Network Type', // BA - NEW
      'Time to First Interaction (s)', // BB - NEW
      'Session Duration (s)', // BC - NEW
    ];

    // Update headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!1:1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    // Format header row (bold, freeze)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: visitorSheet.properties?.sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.44,
                    green: 0.83,
                    blue: 0.56,
                  },
                  textFormat: {
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: visitorSheet.properties?.sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: `Visitors sheet initialized with ${headers.length} columns`,
      previousColumnCount: currentColumnCount,
      newColumnCount: headers.length,
      newColumns: headers.slice(currentColumnCount),
    });
  } catch (error) {
    console.error('Error initializing visitor sheet:', error);
    return NextResponse.json(
      { error: 'Failed to initialize visitor sheet' },
      { status: 500 }
    );
  }
}
