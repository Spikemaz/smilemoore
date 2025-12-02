import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { updateCustomerIDSheet } from '@/app/lib/updateCustomerIDSheet';

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

    // Read current visitor IDs from Visitors sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:A',
    });

    const rows = response.data.values || [];

    // Filter out empty rows and header row, extract visitor numbers
    let maxVisitorNum = 0;
    for (const row of rows) {
      if (row && row[0] && typeof row[0] === 'string' && row[0].startsWith('V-')) {
        const numStr = row[0].replace('V-', '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxVisitorNum) {
          maxVisitorNum = num;
        }
      }
    }

    // Next ID is max + 1
    const nextId = maxVisitorNum + 1;

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
      gid,
      fbclid,
      gclid,
      msclkid,
      ttclid,
      li_fat_id,
      muid,
      ttp,
      tta,
      mucAds,
      smUniversalId,
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

    // Calculate cookie quality score (how many real platform IDs we captured)
    let cookieQualityScore = 0;
    if (fbp) cookieQualityScore++;
    if (gaClientId) cookieQualityScore++;
    if (muid) cookieQualityScore++;
    if (ttp) cookieQualityScore++;
    if (li_fat_id) cookieQualityScore++;
    if (mucAds) cookieQualityScore++;

    const allCookiesCaptured = cookieQualityScore === 6 ? 'Yes' : 'No';

    // Prepare row data matching Visitors sheet headers (columns A-AT)
    const values = [[
      visitorId, // A - Visitor ID
      timestamp, // B - Timestamp
      ip, // C - IP Address
      campaignSource || 'direct', // D - Campaign Source (includes "Referral: Name-XXX" if from referral link)
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
      fbp || '', // W - Facebook Browser ID (_fbp)
      fbc || fbclid || '', // X - Facebook Click ID (_fbc / fbclid)
      gaClientId || '', // Y - Google Client ID (_ga)
      gclid || '', // Z - Google Click ID (gclid)
      muid || '', // AA - Microsoft User ID (MUID)
      msclkid || '', // AB - Microsoft Click ID (msclkid)
      ttp || '', // AC - TikTok Browser ID (_ttp)
      ttclid || '', // AD - TikTok Click ID (ttclid)
      li_fat_id || '', // AE - LinkedIn ID (li_fat_id)
      pageLoadTime || 0, // AF - Page Load Time
      isReturningVisitor ? 'Yes' : 'No', // AG - Returning Visitor
      sessionCount || 1, // AH - Session Count
      firstVisitDate || '', // AI - Date
      dayOfWeek || '', // AJ - Day of Week
      hourOfDay || 0, // AK - Hour of Day
      '', // AL - Time to Email Submit (calculated later)
      '', // AM - Max Scroll Depth % (updated later)
      '', // AN - Time Email → Name (seconds) (calculated later)
      '', // AO - Time Name → Phone (seconds) (calculated later)
      '', // AP - Time Phone → Postcode (seconds) (calculated later)
      '', // AQ - Total Time - Load → Complete (seconds) (calculated later)
      smUniversalId || '', // AR - SmileMoore Universal ID
      cookieQualityScore, // AS - Cookie Quality Score
      allCookiesCaptured, // AT - All Cookies Captured
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:AT',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    // Update CustomerID sheet with live-calculated metrics
    await updateCustomerIDSheet();

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
