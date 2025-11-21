import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const type = searchParams.get('type'); // '4q' or '10q'
    const variation = searchParams.get('v'); // '1', '2', or '3'

    // Always return pixel even if params missing
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const headers = {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    if (!email || !type || !variation) {
      return new NextResponse(pixel, { status: 200, headers });
    }

    const sheets = getGoogleSheetsClient();

    // Find the row with this email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:C',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === email);

    if (rowIndex !== -1) {
      const actualRowIndex = rowIndex + 1; // 1-indexed

      // Determine which column to update based on type and variation
      let columnToUpdate = '';

      if (type === '4q') {
        // Columns AI, AK, AM for variations 1, 2, 3
        if (variation === '1') columnToUpdate = 'AI';
        else if (variation === '2') columnToUpdate = 'AK';
        else if (variation === '3') columnToUpdate = 'AM';
      } else if (type === '10q') {
        // Columns AO, AQ, AS for variations 1, 2, 3
        if (variation === '1') columnToUpdate = 'AO';
        else if (variation === '2') columnToUpdate = 'AQ';
        else if (variation === '3') columnToUpdate = 'AS';
      }

      if (columnToUpdate) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Home!${columnToUpdate}${actualRowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[new Date().toISOString()]],
          },
        });
      }
    }

    return new NextResponse(pixel, { status: 200, headers });
  } catch (error) {
    console.error('Error tracking follow-up open:', error);
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(pixel, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}
