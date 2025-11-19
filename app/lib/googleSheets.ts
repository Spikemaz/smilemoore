import { google } from 'googleapis';

const SPREADSHEET_ID = '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY';

// Initialize Google Sheets API
function getGoogleSheetsClient() {
  const client_email = process.env.GOOGLE_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

// Get total number of signups
export async function getTotalSignups(): Promise<number> {
  try {
    const sheets = getGoogleSheetsClient();

    // Read from "Signups" sheet, column A (skipping header)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Signups!A2:A', // Start from row 2 (skip header)
    });

    const rows = response.data.values;
    return rows ? rows.length : 0;
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    return 0;
  }
}

// Add new signup to sheet
export async function addSignup(data: {
  email: string;
  name: string;
  phone: string;
  postcode: string;
  campaignSource: string;
  voucherValue: number;
  voucherCode: string;
  batchNumber: number;
}): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();
    const timestamp = new Date().toISOString();
    const totalSignups = await getTotalSignups();

    // Append to "Signups" sheet
    const values = [[
      timestamp,
      data.email,
      data.name,
      data.phone,
      data.postcode,
      data.campaignSource,
      data.voucherValue,
      data.voucherCode,
      data.batchNumber,
      totalSignups + 1, // Running total
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Signups!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    return false;
  }
}

// Initialize sheet with headers (run once)
export async function initializeSheet(): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();

    // Check if "Signups" sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const signupsSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === 'Signups'
    );

    if (!signupsSheet) {
      // Create "Signups" sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Signups',
              },
            },
          }],
        },
      });
    }

    // Add headers
    const headers = [[
      'Timestamp',
      'Email',
      'Name',
      'Phone',
      'Postcode',
      'Campaign Source',
      'Voucher Value',
      'Voucher Code',
      'Batch Number',
      'Total Signups',
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Signups!A1:J1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    return true;
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return false;
  }
}
