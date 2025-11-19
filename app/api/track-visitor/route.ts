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

async function getNextVisitorId(): Promise<string> {
  try {
    const sheets = getGoogleSheetsClient();

    // Read current visitor count from Visitors sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:A',
    });

    const rows = response.data.values?.length || 1; // 1 for header
    const nextId = rows; // Next visitor number

    // Format as V-00001, V-00002, etc.
    return `V-${nextId.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error('Error getting next visitor ID:', error);
    return `V-${Date.now().toString().slice(-5)}`;
  }
}

export async function POST(request: Request) {
  try {
    const {
      campaignSource,
      deviceType,
      browser,
      userAgent,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      os,
      screenResolution,
      language,
      timezone,
      landingPage,
    } = await request.json();

    // Get IP address from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Get unique visitor ID
    const visitorId = await getNextVisitorId();
    const timestamp = new Date().toISOString();

    const sheets = getGoogleSheetsClient();

    // Prepare row data with all tracking information
    const values = [[
      visitorId,
      timestamp,
      ip,
      campaignSource || 'direct',
      deviceType || 'unknown',
      browser || 'unknown',
      userAgent || 'unknown',
      referrer || 'direct',
      '', // Email (empty initially)
      '', // Customer ID (empty initially)
      'Visited', // Status
      utmSource || '',
      utmMedium || '',
      utmCampaign || '',
      utmTerm || '',
      utmContent || '',
      os || 'unknown',
      screenResolution || 'unknown',
      language || 'unknown',
      timezone || 'unknown',
      landingPage || '',
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:U',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return NextResponse.json({
      success: true,
      visitorId,
      message: 'Visitor tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}
