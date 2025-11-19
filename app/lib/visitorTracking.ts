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

export async function updateVisitorStatus(
  ipAddress: string,
  email?: string,
  customerId?: string,
  status?: 'Email Submitted' | 'Voucher Claimed',
  timeToEmailSubmit?: number,
  maxScrollDepth?: number
): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();

    // Find the visitor row by IP address (most recent within last 30 minutes)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:AH',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false; // No data rows

    // Find most recent matching IP (within last 30 min)
    const now = new Date();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

    let matchRowIndex = -1;
    for (let i = rows.length - 1; i >= 1; i--) {
      const row = rows[i];
      const rowIp = row[2]; // Column C = IP Address
      const rowTimestamp = new Date(row[1]); // Column B = Timestamp

      if (rowIp === ipAddress && rowTimestamp >= thirtyMinAgo) {
        matchRowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (matchRowIndex === -1) return false; // No matching visitor found

    // Update the row
    const updates: any[] = [];

    if (email) {
      updates.push({
        range: `Visitors!I${matchRowIndex}`, // Column I = Email
        values: [[email]],
      });
    }

    if (customerId) {
      updates.push({
        range: `Visitors!J${matchRowIndex}`, // Column J = Customer ID
        values: [[customerId]],
      });
    }

    if (status) {
      updates.push({
        range: `Visitors!K${matchRowIndex}`, // Column K = Status
        values: [[status]],
      });
    }

    if (timeToEmailSubmit !== undefined) {
      updates.push({
        range: `Visitors!AG${matchRowIndex}`, // Column AG = Time to Email Submit
        values: [[timeToEmailSubmit]],
      });
    }

    if (maxScrollDepth !== undefined) {
      updates.push({
        range: `Visitors!AH${matchRowIndex}`, // Column AH = Max Scroll Depth
        values: [[maxScrollDepth]],
      });
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating visitor status:', error);
    return false;
  }
}
