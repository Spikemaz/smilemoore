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
    credentials: { client_email, private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password !== 'Ronabambi2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheets = getGoogleSheetsClient();

    // Check which sheets exist
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];

    // Create missing sheets
    const sheetsToCreate = [];
    if (!existingSheets.includes('WA')) {
      sheetsToCreate.push({ addSheet: { properties: { title: 'WA' } } });
    }
    if (!existingSheets.includes('SMS')) {
      sheetsToCreate.push({ addSheet: { properties: { title: 'SMS' } } });
    }
    if (!existingSheets.includes('FUNNEL')) {
      sheetsToCreate.push({ addSheet: { properties: { title: 'FUNNEL' } } });
    }

    if (sheetsToCreate.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests: sheetsToCreate },
      });
    }

    // Initialize WA sheet headers
    const waHeaders = [[
      'Message ID', 'Timestamp', 'Customer ID', 'Email', 'Name', 'Phone',
      'Campaign Type', 'Template Name', 'Message Content', 'Sent Status',
      'Delivered Status', 'Read Status', 'Replied Status', 'Reply Content',
      'Click Tracking', 'Conversion', 'Send Date/Time', 'Delivered Date/Time',
      'Read Date/Time', 'Reply Date/Time', 'Time to Read (minutes)',
      'Time to Reply (minutes)', 'Error Message', 'Retry Count', 'Final Status'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'WA!A1:Y1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: waHeaders },
    });

    // Initialize SMS sheet headers
    const smsHeaders = [[
      'SMS ID', 'Timestamp', 'Customer ID', 'Email', 'Name', 'Phone',
      'Campaign Type', 'Template Name', 'Message Content', 'Sent Status',
      'Delivered Status', 'Click Tracking', 'Conversion', 'Send Date/Time',
      'Delivered Date/Time', 'Time to Delivery (seconds)', 'Cost (per SMS)',
      'Error Message', 'Retry Count', 'Final Status', 'Reply Count', 'Opt-Out Status'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'SMS!A1:V1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: smsHeaders },
    });

    // Initialize FUNNEL sheet headers
    const funnelHeaders = [[
      'Funnel ID', 'Timestamp', 'Visitor ID', 'Customer ID', 'Email',
      'Campaign Source', 'Device Type', 'Browser', 'Landing Page URL', 'Entry Point',
      'Stage 0 - Landed', 'Stage 0 - Time on Page (seconds)', 'Stage 1 - Email Submitted',
      'Stage 1 - Timestamp', 'Stage 1 - Time to Submit (seconds)', 'Stage 2 - Name Submitted',
      'Stage 2 - Timestamp', 'Stage 2 - Time from Email (seconds)', 'Stage 3 - Phone Submitted',
      'Stage 3 - Timestamp', 'Stage 3 - Time from Name (seconds)', 'Stage 4 - Postcode Submitted',
      'Stage 4 - Timestamp', 'Stage 4 - Time from Phone (seconds)', 'Stage 4 - Total Time (seconds)',
      'Stage 5 - Viewed Q1-5', 'Stage 5 - Started Q1-5', 'Stage 5 - Completed Q1-5',
      'Stage 5 - Timestamp', 'Stage 5 - Time to Complete (minutes)', 'Stage 6 - Viewed Q6-10',
      'Stage 6 - Started Q6-10', 'Stage 6 - Completed Q6-10', 'Stage 6 - Timestamp',
      'Stage 6 - Time to Complete (minutes)', 'Drop-off Stage', 'Max Scroll Depth %',
      'Voucher Code Received', 'Follow-up Email Sent', 'Follow-up SMS Sent',
      'Follow-up WhatsApp Sent', 'Conversion Value', 'Days Since First Visit',
      'Total Sessions', 'Returning Visitor', 'Referral Source Name'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'FUNNEL!A1:AT1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: funnelHeaders },
    });

    return NextResponse.json({
      success: true,
      message: 'WA, SMS, and FUNNEL sheets initialized with headers',
      sheetsCreated: sheetsToCreate.map(s => s.addSheet.properties.title),
    });
  } catch (error) {
    console.error('Error initializing sheets:', error);
    return NextResponse.json(
      { error: 'Failed to initialize sheets', details: String(error) },
      { status: 500 }
    );
  }
}
