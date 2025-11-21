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
}): Promise<boolean> {
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

    // Initialize Total Referrals (0) and Total Draw Entries (0 - earned through milestones)
    const rowNumber = (await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:A',
    })).data.values?.length || 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!AE${rowNumber}:AF${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[0, 0]], // 0 referrals, 0 entries (earned through milestones)
      },
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
      'Question 1 - Dental Care Type', // M
      'Question 2 - Registration Timeline', // N
      'Question 3 - Preferred Appointment Times', // O
      'Question 4 - Important Factors', // P
      'Question 5 - Previous Dental Experience', // Q
      'Question 6 - Most Important Factor', // R
      'Question 7 - Smile Confidence', // S
      'Question 8 - Same Clinician Preference', // T
      'Question 9 - Needed Treatments', // U
      'Question 10 - Before Appointment Preference', // V
      'Question 11 - Stay Long Term', // W
      'Question 12 - Preventing Visits', // X
      'Question 13 - Cosmetic Importance', // Y
      'Question 14 - Preferred Contact Method', // Z
      'Additional Feedback', // AA
      'Email Sent', // AB
      'Email Opened', // AC
      'Referral Link Clicked', // AD
      'Total Referrals', // AE
      'Total Draw Entries', // AF
      'Referral Link', // AG
      'Follow-up 1 Sent (4Q)', // AH - Timestamp of first follow-up for 4 questions
      'Follow-up 1 Opened (4Q)', // AI - Timestamp when opened
      'Follow-up 2 Sent (4Q)', // AJ
      'Follow-up 2 Opened (4Q)', // AK
      'Follow-up 3 Sent (4Q)', // AL
      'Follow-up 3 Opened (4Q)', // AM
      'Follow-up 1 Sent (10Q)', // AN - Timestamp of first follow-up for 10 questions
      'Follow-up 1 Opened (10Q)', // AO
      'Follow-up 2 Sent (10Q)', // AP
      'Follow-up 2 Opened (10Q)', // AQ
      'Follow-up 3 Sent (10Q)', // AR
      'Follow-up 3 Opened (10Q)', // AS
      'Unsubscribed from Follow-ups', // AT - Timestamp when unsubscribed
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A1:AT1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Earlybird!A1:AT1',
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
