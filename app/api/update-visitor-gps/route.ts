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
    const { email, gpsLat, gpsLon, gpsAccuracy } = await request.json();

    if (!email || !gpsLat || !gpsLon) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // Find the visitor row by email (most recent)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:J', // A-J to get email column (J)
    });

    const rows = response.data.values || [];

    // Find most recent row with this email (search from bottom up)
    let rowIndex = -1;
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][9] === email) { // Column J (index 9) = Email
        rowIndex = i + 1; // 1-indexed for Sheets API
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Update GPS columns in Visitors sheet
    // Add new columns: BW = GPS Latitude, BX = GPS Longitude, BY = GPS Accuracy
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `Visitors!BW${rowIndex}`, // GPS Latitude
            values: [[gpsLat]],
          },
          {
            range: `Visitors!BX${rowIndex}`, // GPS Longitude
            values: [[gpsLon]],
          },
          {
            range: `Visitors!BY${rowIndex}`, // GPS Accuracy (meters)
            values: [[Math.round(gpsAccuracy)]],
          },
        ],
      },
    });

    console.log(`📍 GPS location saved for ${email}: ${gpsLat}, ${gpsLon} (±${Math.round(gpsAccuracy)}m)`);

    return NextResponse.json({
      success: true,
      message: 'GPS location saved',
    });
  } catch (error) {
    console.error('Error saving GPS location:', error);
    return NextResponse.json(
      { error: 'Failed to save GPS location' },
      { status: 500 }
    );
  }
}
