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

export async function POST() {
  try {
    const sheets = getGoogleSheetsClient();

    // EMAIL sheet headers (38 columns: A-AL)
    const emailHeaders = [[
      'Email ID', // A
      'Timestamp', // B
      'Customer ID', // C
      'Email Address', // D
      'Name', // E
      'Phone', // F
      'Campaign Type', // G
      'Template Name', // H
      'Subject Line', // I
      'Email Content Preview', // J
      'From Name', // K
      'Delivered', // L
      'Opened', // M
      'Clicked', // N
      'Bounced', // O
      'Unsubscribed', // P
      'Complained (Spam)', // Q
      'First Open Time', // R
      'Total Opens Count', // S
      'Link Clicked', // T
      'Click Count', // U
      'Device Opened On', // V
      'Email Client', // W
      'Location (City)', // X
      'Location (Country)', // Y
      'Time to Open (minutes)', // Z
      'Time to Click (minutes)', // AA
      'Engagement Score', // AB
      'Conversion Event', // AC
      'Revenue Generated', // AD
      'A/B Test Variation', // AE
      'Personalization Used', // AF
      'Send Error', // AG
      'Error Message', // AH
      'Retry Count', // AI
      'IP Address', // AJ
      'User Agent', // AK
      'Notes', // AL
    ]];

    // Check if EMAIL sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === 'EMAIL'
    );

    if (sheetExists) {
      // Sheet exists, just verify/update headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'EMAIL!A1:AL1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: emailHeaders },
      });

      return NextResponse.json({
        success: true,
        message: 'EMAIL sheet headers updated',
      });
    } else {
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'EMAIL',
                },
              },
            },
          ],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'EMAIL!A1:AL1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: emailHeaders },
      });

      return NextResponse.json({
        success: true,
        message: 'EMAIL sheet created with headers',
      });
    }
  } catch (error) {
    console.error('Error initializing EMAIL sheet:', error);
    return NextResponse.json(
      { error: 'Failed to initialize EMAIL sheet', details: error },
      { status: 500 }
    );
  }
}
