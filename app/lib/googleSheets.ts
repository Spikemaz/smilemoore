import { google } from 'googleapis';
import { updateCustomerIDSheet } from './updateCustomerIDSheet';

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

// Get total number of signups - all in Home tab now
export async function getTotalSignups(): Promise<number> {
  try {
    const sheets = getGoogleSheetsClient();

    // Count from Home tab only (all signups go here now)
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A2:A',
    });

    const homeRows = homeResponse.data.values?.length || 0;

    return homeRows;
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
  ipAddress?: string;
  referredBy?: string;
}): Promise<{ success: boolean; customerId?: string }> {
  try {
    const sheets = getGoogleSheetsClient();
    const timestamp = new Date().toISOString();

    // Get unique customer ID
    const customerId = await getNextCustomerId();

    // All signups go to Home tab, but with different source labels
    const sourceLabel = data.campaignSource === 'earlybird-qr' ? 'QR Scan' : 'Home';

    // Prepare row data (A-L for basic info, initialize AE-AF with 0 referrals and 3 base entries)
    const values = [[
      customerId,
      timestamp,
      data.email,
      data.name,
      data.phone,
      data.postcode,
      sourceLabel,
      data.voucherValue,
      data.voucherCode,
      data.batchNumber,
      data.ipAddress || 'unknown',
      data.referredBy || '',
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    // Initialize Total Referrals (0) and Total Draw Entries (1 - awarded for submitting basic info)
    const rowNumber = (await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:A',
    })).data.values?.length || 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!AF${rowNumber}:AG${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[0, 1]], // 0 referrals, 1 entry for submitting email/name/phone/postcode
      },
    });

    // Update CustomerID sheet with live-calculated metrics
    await updateCustomerIDSheet();

    return { success: true, customerId };
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    return { success: false };
  }
}

// Update CustomerID sheet tracking counters
export async function updateCustomerIDTracking(stage: 'visitor' | 'visitor_unique' | 'stage1' | 'stage2' | 'stage3'): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();

    // Verify headers exist first - if not, initialize them
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A1:F1',
    });

    const headers = headersResponse.data.values?.[0];
    const expectedHeaders = [
      'Last Customer ID',
      'Site Visitors Total',
      'Site Visitors Unique',
      'Stage 1',
      'Stage 2',
      'Stage 3'
    ];

    // If headers don't match expected structure, create them
    if (!headers || headers.length !== 6 || headers[0] !== expectedHeaders[0]) {
      console.log('CustomerID headers missing or incorrect - initializing...');

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'CustomerID!A1:F1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [expectedHeaders] },
      });

      // Initialize row 2 with zeros if it doesn't exist
      const dataCheck = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'CustomerID!A2:F2',
      });

      if (!dataCheck.data.values?.[0]) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'CustomerID!A2:F2',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['0', '0', '0', '0', '0', '0']] },
        });
      }
    }

    // Read current values from CustomerID!A2:F2
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
    });

    const values = response.data.values?.[0] || ['0', '0', '0', '0', '0', '0'];
    const lastCustomerId = parseInt(values[0]) || 0;
    const visitorsTotal = parseInt(values[1]) || 0;
    const visitorsUnique = parseInt(values[2]) || 0;
    const stage1Count = parseInt(values[3]) || 0;
    const stage2Count = parseInt(values[4]) || 0;
    const stage3Count = parseInt(values[5]) || 0;

    // Update the appropriate counter
    const newValues = [
      lastCustomerId.toString(),
      stage === 'visitor' ? (visitorsTotal + 1).toString() : visitorsTotal.toString(),
      stage === 'visitor_unique' ? (visitorsUnique + 1).toString() : visitorsUnique.toString(),
      stage === 'stage1' ? (stage1Count + 1).toString() : stage1Count.toString(),
      stage === 'stage2' ? (stage2Count + 1).toString() : stage2Count.toString(),
      stage === 'stage3' ? (stage3Count + 1).toString() : stage3Count.toString(),
    ];

    // Write back updated values
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newValues],
      },
    });
  } catch (error) {
    console.error('Error updating CustomerID tracking:', error);
    // Don't throw - this is non-critical tracking
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

    // Add headers to Home and Earlybird sheets - comprehensive data capture
    const headers = [[
      'Customer ID', // A
      'Timestamp', // B
      'Email', // C
      'Name', // D
      'Phone', // E
      'Postcode', // F
      'Campaign Source', // G
      'Voucher Value', // H
      'Voucher Code', // I
      'Batch Number', // J
      'IP Address', // K
      'Referred By', // L
      'Question 1', // M
      'Question 2', // N
      'Question 3', // O
      'Question 4', // P
      'Question 5', // Q
      'Question 6', // R
      'Question 7', // S
      'Question 8', // T
      'Question 9', // U
      'Question 10', // V
      'Question 11', // W
      'Question 12', // X
      'Question 13', // Y
      'Question 14', // Z
      'Question 15', // AA
      'Additional Feedback', // AB
      'Email Sent', // AC
      'Email Opened', // AD
      'Referral Link Clicked', // AE
      'Total Referrals', // AF
      'Total Draw Entries', // AG
      'Referal Link', // AH (note: typo in your sheet - missing second 'r')
      'Follow-up 1 Sent (4Q)', // AI
      'Follow-up 1 Opened (4Q)', // AJ
      'Follow-up 2 Sent (4Q)', // AK
      'Follow-up 2 Opened (4Q)', // AL
      'Follow-up 3 Sent (4Q)', // AM
      'Follow-up 3 Opened (4Q)', // AN
      'Follow-up 1 Sent (10Q)', // AO
      'Follow-up 1 Opened (10Q)', // AP
      'Follow-up 2 Sent (10Q)', // AQ
      'Follow-up 2 Opened (10Q)', // AR
      'Follow-up 3 Sent (10Q)', // AS
      'Follow-up 3 Opened (10Q)', // AT
      'Email Bounce Back', // AU
      'Unsubscribed from Follow-ups', // AV
      'Best Performing Subject (4Q)', // AW
      'Best Performing Subject (10Q)', // AX
      'Time to Complete 4Q (minutes)', // AY
      'Time to Complete 10Q (minutes)', // AZ
      'Form Drop-off Stage', // BA
      'Device Converted', // BB
      'WhatsApp Follow-up Sent', // BC
      'SMS Follow-up Sent', // BD
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A1:BD1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Earlybird!A1:BD1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    // Initialize CustomerID sheet with tracking headers
    const customerIdHeaders = [[
      'Last Customer ID',
      'Site Visitors Total',
      'Site Visitors Unique',
      'Stage 1 (Email/Name/Phone/Postcode)',
      'Stage 2 (Completed Questions 1-5)',
      'Stage 3 (Completed All Survey)'
    ]];
    const customerIdData = [['0', '0', '0', '0', '0', '0']];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A1:F1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: customerIdHeaders },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: customerIdData },
    });

    return true;
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return false;
  }
}
