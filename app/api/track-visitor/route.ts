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
      deviceModel,
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
      fbp,
      fbc,
      gaClientId,
      fbclid,
      gclid,
      msclkid,
      ttclid,
      li_fat_id,
      pageLoadTime,
      isReturningVisitor,
      sessionCount,
      firstVisitDate,
      dayOfWeek,
      hourOfDay,
    } = await request.json();

    // Get IP address from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Get unique visitor ID
    const visitorId = await getNextVisitorId();
    const timestamp = new Date().toISOString();

    const sheets = getGoogleSheetsClient();

    // Prepare row data matching Visitors sheet headers (columns A-AP)
    const values = [[
      visitorId, // A - Visitor ID
      timestamp, // B - Timestamp
      ip, // C - IP Address
      campaignSource || 'direct', // D - Campaign Source
      deviceType || 'unknown', // E - Device Type
      deviceModel || 'unknown', // F - Device Model
      browser || 'unknown', // G - Browser
      userAgent || 'unknown', // H - User Agent
      referrer || 'direct', // I - Referrer
      '', // J - Email (empty initially)
      '', // K - Customer ID (empty initially)
      'Visited', // L - Status
      utmSource || '', // M - UTM Source
      utmMedium || '', // N - UTM Medium
      utmCampaign || '', // O - UTM Campaign
      utmTerm || '', // P - UTM Term
      utmContent || '', // Q - UTM Content
      os || 'unknown', // R - Operating System
      screenResolution || 'unknown', // S - Screen Resolution
      language || 'unknown', // T - Language
      timezone || 'unknown', // U - Timezone
      landingPage || '', // V - Landing Page
      fbp || '', // W - Facebook Browser ID
      fbc || fbclid || '', // X - Facebook Click ID
      gclid || '', // Y - Google Click ID
      msclkid || '', // Z - Microsoft Click ID
      ttclid || '', // AA - TikTok Click ID
      li_fat_id || '', // AB - LinkedIn Click ID
      pageLoadTime || 0, // AC - Page Load Time
      isReturningVisitor ? 'Yes' : 'No', // AD - Returning Visitor
      sessionCount || 1, // AE - Session Count
      firstVisitDate || '', // AF - Date
      dayOfWeek || '', // AG - Day of Week
      hourOfDay || 0, // AH - Hour of Day
      '', // AI - Time to Email Submit (calculated later)
      '', // AJ - Max Scroll Depth % (updated later)
      '', // AK - Time Email → Name (seconds) (calculated later)
      '', // AL - Time Name → Phone (seconds) (calculated later)
      '', // AM - Time Phone → Postcode (seconds) (calculated later)
      '', // AN - Total Time - Load → Complete (seconds) (calculated later)
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:AN',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return NextResponse.json({
      success: true,
      visitorId,
      timestamp,
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
