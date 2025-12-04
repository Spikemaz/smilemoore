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
    const {
      visitorId,
      sessionDuration,
      timeToFirstInteraction,
      maxScrollDepth,
    } = await request.json();

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID is required' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // Find the visitor row by visitor ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:BC',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return NextResponse.json(
        { error: 'No visitor data found' },
        { status: 404 }
      );
    }

    // Find matching visitor by ID (Column A)
    let matchRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowVisitorId = row[0]; // Column A = Visitor ID
      if (rowVisitorId === visitorId) {
        matchRowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (matchRowIndex === -1) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Update session data
    const updates: any[] = [];

    if (timeToFirstInteraction !== undefined && timeToFirstInteraction > 0) {
      updates.push({
        range: `Visitors!BB${matchRowIndex}`, // Column BB = Time to First Interaction
        values: [[timeToFirstInteraction]],
      });
    }

    if (sessionDuration !== undefined && sessionDuration > 0) {
      updates.push({
        range: `Visitors!BC${matchRowIndex}`, // Column BC = Session Duration
        values: [[sessionDuration]],
      });
    }

    if (maxScrollDepth !== undefined && maxScrollDepth > 0) {
      updates.push({
        range: `Visitors!AM${matchRowIndex}`, // Column AM = Max Scroll Depth
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

      console.log(`✅ Updated session data for visitor ${visitorId} at row ${matchRowIndex}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Session data updated successfully',
    });
  } catch (error) {
    console.error('Error updating session data:', error);
    return NextResponse.json(
      { error: 'Failed to update session data' },
      { status: 500 }
    );
  }
}
