import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY';

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth.getClient();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const ref = searchParams.get('ref');

    if (!email || !ref) {
      // Redirect to home page even if params missing
      return NextResponse.redirect(new URL(`/?ref=${ref || ''}`, request.url));
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // Find the row with this email (email is in column C)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:C',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === email);

    if (rowIndex !== -1) {
      // Update Referral Link Clicked column (AE) with timestamp
      // This tracks when the user clicks/copies their own referral link to share it
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!AE${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Yes']],
        },
      });
    }

    // Redirect to home page with referral parameter
    return NextResponse.redirect(new URL(`/?ref=${encodeURIComponent(ref)}`, request.url));
  } catch (error) {
    console.error('Error tracking referral click:', error);
    // Redirect to home page even on error
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref') || '';
    return NextResponse.redirect(new URL(`/?ref=${encodeURIComponent(ref)}`, request.url));
  }
}
