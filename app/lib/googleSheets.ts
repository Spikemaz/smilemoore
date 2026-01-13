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

// Get next customer ID from CustomerID sheet with retry logic for race conditions
async function getNextCustomerId(): Promise<string> {
  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const sheets = getGoogleSheetsClient();

      // CRITICAL: Use timestamp-based ID to prevent race conditions
      // Format: YYMMDDHHMMSSSSS (15 digits) -> then convert to base 36 for shorter ID
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      const second = now.getSeconds().toString().padStart(2, '0');
      const ms = now.getMilliseconds().toString().padStart(3, '0');

      // Add random 2 digits to handle same-millisecond submissions
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');

      // Create unique ID: YYMMDDHHMMSSMSRand
      const timestampId = `${year}${month}${day}${hour}${minute}${second}${ms}${random}`;

      // Convert to base 36 for shorter format (10-11 chars instead of 17)
      const customerId = parseInt(timestampId).toString(36).toUpperCase().padStart(10, '0');

      // Update the counter to track total (for analytics only)
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'CustomerID!A2',
      });

      const currentCount = response.data.values?.[0]?.[0];
      const nextCount = currentCount ? parseInt(currentCount) + 1 : 1;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'CustomerID!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[nextCount]],
        },
      });

      return customerId;
    } catch (error) {
      console.error(`Error getting customer ID (attempt ${attempt + 1}/${maxRetries}):`, error);

      if (attempt === maxRetries - 1) {
        // Last attempt failed - use fallback timestamp ID
        const fallbackId = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
        console.error('⚠️ Using fallback customer ID:', fallbackId);
        return fallbackId;
      }

      // Wait briefly before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }

  // Should never reach here due to fallback, but TypeScript requires it
  throw new Error('Failed to generate customer ID');
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
  smUniversalId?: string;
}): Promise<{ success: boolean; customerId?: string }> {
  try {
    const sheets = getGoogleSheetsClient();
    const timestamp = new Date().toISOString();

    // Get unique customer ID
    const customerId = await getNextCustomerId();


    // Prepare row data (A-L for basic info + column BD for SmileMoore Universal ID)
    const values = [[
      customerId,
      timestamp,
      data.email,
      data.name,
      data.phone,
      data.postcode,
      data.campaignSource, // Use actual campaign source from data
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

    // Add SmileMoore Universal ID to column BD if provided
    if (data.smUniversalId) {
      const rowNumber = (await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Home!A:A',
      })).data.values?.length || 1;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!BD${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[data.smUniversalId]],
        },
      });
    }

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
      'Did They Try To Share?', // AE
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
      'Smile Moore Univeral ID', // BD (note: typo "Univeral" matches your sheet)
      'Email Opt-Out Status', // BE - manually type "STOP" to prevent all automated emails (permanent)
      'Total Emails Sent Count', // BF - tracks how many emails have been sent to this person
      'Last Email 1 Status', // BG - Sent/Opened for most recent email
      'Last Email 1 Date', // BH - Timestamp of most recent email
      'Last Email 2 Status', // BI - Sent/Opened for 2nd most recent email
      'Last Email 2 Date', // BJ - Timestamp of 2nd most recent email
      'Last Email 3 Status', // BK - Sent/Opened for 3rd most recent email
      'Last Email 3 Date', // BL - Timestamp of 3rd most recent email
      'Auto-Stopped', // BM - YES/NO - automatically set after 3 unopened emails over 7 days, resets on any open
      'SMS Follow-up Sent', // BN - tracks if SMS follow-up has been sent
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A1:BN1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: headers },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Earlybird!A1:BN1',
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

/**
 * Email Opt-Out System
 * Column BE (index 56): Email Opt-Out Status - manually type "STOP" to prevent all automated emails (permanent)
 * Column BF (index 57): Total Emails Sent Count - tracks how many emails have been sent to this person
 * Column BG-BL (index 58-63): Last 3 email statuses and dates
 * Column BM (index 64): Auto-Stopped - YES/NO - automatically set after 3 unopened emails over 7 days
 */

// Check if user has opted out of emails (unsubscribed, manual STOP, or auto-stopped)
export async function checkEmailOptOut(email: string): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();

    // Find user by email in Home sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:BM', // Email (C) to Auto-Stopped (BM)
    });

    const rows = response.data.values || [];

    for (let i = 1; i < rows.length; i++) { // Skip header
      const rowEmail = rows[i][0]; // Column C (index 0 in this range)
      const unsubscribed = rows[i][45]; // Column AV (absolute index 47, from C: 47-2=45) - Unsubscribed from Follow-ups
      const manualOptOut = rows[i][54]; // Column BE (absolute index 56, from C: 56-2=54)
      const autoStopped = rows[i][62]; // Column BM (absolute index 64, from C: 64-2=62)

      if (rowEmail && rowEmail.toLowerCase().trim() === email.toLowerCase().trim()) {
        // Check if user clicked unsubscribe link (Column AV has timestamp)
        if (unsubscribed && unsubscribed.toString().trim() !== '') {
          console.log(`🚫 Email blocked: ${email} has unsubscribed (column AV)`);
          return true;
        }

        // Check manual opt-out status
        if (manualOptOut && manualOptOut.toString().toUpperCase() === 'STOP') {
          console.log(`🚫 Email blocked: ${email} has manual STOP in column BE`);
          return true;
        }

        // Check auto-stop status
        if (autoStopped && autoStopped.toString().toUpperCase() === 'YES') {
          console.log(`🚫 Email blocked: ${email} is auto-stopped (3 unopened emails)`);
          return true;
        }

        return false; // User has not opted out
      }
    }

    // Email not found - allow email to proceed
    return false;
  } catch (error) {
    console.error('Error checking email opt-out:', error);
    return false; // On error, don't block emails
  }
}

// Increment email sent counter and update last 3 email tracking
export async function incrementEmailCount(email: string): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();

    // Find user by email in Home sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:BM', // Email (C) to Auto-Stopped (BM)
    });

    const rows = response.data.values || [];

    for (let i = 1; i < rows.length; i++) { // Skip header
      const rowEmail = rows[i][0]; // Column C (index 0 in this range)

      if (rowEmail && rowEmail.toLowerCase() === email.toLowerCase()) {
        const rowNumber = i + 1; // 1-indexed for Sheets API
        const currentCount = parseInt(rows[i][55]) || 0; // Column BF (absolute index 57, from C: 57-2=55)
        const newCount = currentCount + 1;

        // Get current last 3 email statuses
        const email1Status = rows[i][56] || ''; // Column BG (absolute index 58, from C: 58-2=56)
        const email1Date = rows[i][57] || ''; // Column BH (absolute index 59, from C: 59-2=57)
        const email2Status = rows[i][58] || ''; // Column BI (absolute index 60, from C: 60-2=58)
        const email2Date = rows[i][59] || ''; // Column BJ (absolute index 61, from C: 61-2=59)

        const timestamp = new Date().toISOString();

        // Shift emails down: Email 2 → Email 3, Email 1 → Email 2, New → Email 1
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: [
              { range: `Home!BF${rowNumber}`, values: [[newCount]] }, // Increment count
              { range: `Home!BG${rowNumber}`, values: [['Sent']] }, // New email 1 status
              { range: `Home!BH${rowNumber}`, values: [[timestamp]] }, // New email 1 date
              { range: `Home!BI${rowNumber}`, values: [[email1Status]] }, // Email 1 → Email 2
              { range: `Home!BJ${rowNumber}`, values: [[email1Date]] },
              { range: `Home!BK${rowNumber}`, values: [[email2Status]] }, // Email 2 → Email 3
              { range: `Home!BL${rowNumber}`, values: [[email2Date]] },
            ],
          },
        });

        console.log(`📧 Email count for ${email}: ${currentCount} → ${newCount}`);

        // Check if we should auto-stop (3 unopened emails over 7 days)
        await checkAndSetAutoStop(email, rowNumber);
        return;
      }
    }

    console.log(`⚠️ Could not find email ${email} to increment count`);
  } catch (error) {
    console.error('Error incrementing email count:', error);
    // Don't throw - this is non-critical tracking
  }
}

// Check if user should be auto-stopped (3 unopened emails over 7 days)
async function checkAndSetAutoStop(email: string, rowNumber: number): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();

    // Get last 3 email statuses and dates
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!BG${rowNumber}:BL${rowNumber}`,
    });

    const row = response.data.values?.[0] || [];
    const email1Status = row[0]; // BG
    const email1Date = row[1]; // BH
    const email2Status = row[2]; // BI
    const email2Date = row[3]; // BJ
    const email3Status = row[4]; // BK
    const email3Date = row[5]; // BL

    // Check if all 3 are "Sent" (not opened)
    if (email1Status === 'Sent' && email2Status === 'Sent' && email3Status === 'Sent') {
      // Check if oldest email is over 7 days old
      if (email3Date) {
        const oldestDate = new Date(email3Date);
        const now = new Date();
        const daysDiff = (now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff >= 7) {
          // Set Auto-Stop to YES
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Home!BM${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [['YES']],
            },
          });

          console.log(`🛑 Auto-stopped ${email}: 3 unopened emails over 7 days`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking auto-stop:', error);
  }
}

// Record email open and reset auto-stop if needed
export async function recordEmailOpen(email: string): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();

    // Find user by email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:BM',
    });

    const rows = response.data.values || [];

    for (let i = 1; i < rows.length; i++) {
      const rowEmail = rows[i][0];

      if (rowEmail && rowEmail.toLowerCase() === email.toLowerCase()) {
        const rowNumber = i + 1;

        // Update most recent email status to "Opened"
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: [
              { range: `Home!BG${rowNumber}`, values: [['Opened']] }, // Mark as opened
              { range: `Home!BM${rowNumber}`, values: [['NO']] }, // Reset auto-stop
            ],
          },
        });

        console.log(`✅ Email opened by ${email} - auto-stop reset to NO`);
        return;
      }
    }
  } catch (error) {
    console.error('Error recording email open:', error);
  }
}
