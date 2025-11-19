import { google } from 'googleapis';

const SPREADSHEET_ID = '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY';

// Initialize Google Sheets API
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

// Get next customer ID from CustomerID sheet
async function getNextCustomerId(): Promise<string> {
  try {
    const sheets = getGoogleSheetsClient();

    // Read current counter from CustomerID sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2',
    });

    const currentId = response.data.values?.[0]?.[0];
    const nextId = currentId ? parseInt(currentId) + 1 : 1;

    // Update the counter
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[nextId]],
      },
    });

    // Format as 00001, 00002, etc.
    return nextId.toString().padStart(5, '0');
  } catch (error) {
    console.error('Error getting next customer ID:', error);
    throw error;
  }
}

// Get total number of signups across ALL campaigns
export async function getTotalSignups(): Promise<number> {
  try {
    const sheets = getGoogleSheetsClient();

    // Count from both Home and Earlybird tabs
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A2:A',
    });

    const earlybirdResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Earlybird!A2:A',
    });

    const homeRows = homeResponse.data.values?.length || 0;
    const earlybirdRows = earlybirdResponse.data.values?.length || 0;

    return homeRows + earlybirdRows;
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

    // Get unique customer ID
    const customerId = await getNextCustomerId();

    // Determine which sheet to use based on campaign source
    const sheetName = data.campaignSource === 'earlybird-qr' ? 'Earlybird' : 'Home';

    // Prepare row data
    const values = [[
      customerId,
      timestamp,
      data.email,
      data.name,
      data.phone,
      data.postcode,
      data.campaignSource,
      data.voucherValue,
      data.voucherCode,
      data.batchNumber,
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:J`,
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

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];

    // Create sheets that don't exist
    const sheetsToCreate = [];
    if (!existingSheets.includes('Home')) {
      sheetsToCreate.push({ addSheet: { properties: { title: 'Home' } } });
    }
    if (!existingSheets.includes('Earlybird')) {
      sheetsToCreate.push({ addSheet: { properties: { title: 'Earlybird' } } });
    }
    if (!existingSheets.includes('CustomerID')) {
      sheetsToCreate.push({ addSheet: { properties: { title: 'CustomerID' } } });
    }

    if (sheetsToCreate.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests: sheetsToCreate },
      });
    }

    // Add headers to Home and Earlybird sheets
    const headers = [[
      'Customer ID',
      'Timestamp',
      'Email',
      'Name',
      'Phone',
      'Postcode',
      'Campaign Source',
      'Voucher Value',
      'Voucher Code',
      'Batch Number',
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A1:J1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Earlybird!A1:J1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    // Initialize CustomerID counter
    const customerIdHeaders = [['Last Customer ID'], ['0']];
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A1:A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: customerIdHeaders },
    });

    return true;
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return false;
  }
}
