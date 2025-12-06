import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    const { customerId, location } = await request.json();

    if (!customerId || !location) {
      return NextResponse.json(
        { error: 'Missing customerId or location' },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // Find the row with this Customer ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:A', // Customer ID column
    });

    const customerIds = response.data.values || [];
    let rowIndex = -1;

    for (let i = 1; i < customerIds.length; i++) {
      if (customerIds[i][0] === customerId) {
        rowIndex = i + 1; // 1-indexed for sheets
        break;
      }
    }

    if (rowIndex === -1) {
      console.log(`Customer ID ${customerId} not found`);
      return NextResponse.json(
        { error: 'Customer ID not found' },
        { status: 404 }
      );
    }

    // Column mapping for T&C clicks
    // Column AX (index 49 from A) = T&C Clicked Step 3 Checkbox
    // Column AY (index 50 from A) = T&C Clicked Step 3 Bottom Link
    // Column AZ (index 51 from A) = T&C Clicked Success Page

    const columnMap: { [key: string]: string } = {
      'step3_checkbox': 'AX',
      'step3_bottom': 'AY',
      'success_page': 'AZ',
    };

    const column = columnMap[location];
    if (!column) {
      return NextResponse.json(
        { error: 'Invalid location' },
        { status: 400 }
      );
    }

    // Record timestamp of T&C click
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!${column}${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString()]],
      },
    });

    console.log(`✅ Tracked T&C click for Customer ID ${customerId} at ${location}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking T&C click:', error);
    return NextResponse.json(
      { error: 'Failed to track T&C click' },
      { status: 500 }
    );
  }
}
