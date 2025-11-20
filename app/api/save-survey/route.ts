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
    const { email, dentalCare, timeline, appointmentTimes, importantFactors } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // Find the row with this email in the Home sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:K',
    });

    const rows = response.data.values || [];
    const emailColumnIndex = 2; // Column C (0-indexed)
    let rowIndex = -1;

    // Find the row containing this email
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][emailColumnIndex] === email) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Update the row with survey data (columns L, M, N, O)
    const factorsString = Array.isArray(importantFactors) ? importantFactors.join(', ') : '';

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!L${rowIndex}:O${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[dentalCare, timeline, appointmentTimes, factorsString]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
