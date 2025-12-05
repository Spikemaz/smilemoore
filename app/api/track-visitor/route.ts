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
      muid,
      ttp,
      tta,
      smUniversalId,
      pageLoadTime,
      isReturningVisitor,
      sessionCount,
      firstVisitDate,
      dayOfWeek,
      hourOfDay,
      networkType,
    } = await request.json();

    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim() // Take first IP if multiple
      : request.headers.get('x-real-ip') || 'unknown';

    // Get geographic location from IP using ip-api.com (free, no API key required)
    let geoCity = '';
    let geoRegion = '';
    let geoCountry = '';
    let geoLatitude = '';
    let geoLongitude = '';

    if (ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`, {
          headers: { 'User-Agent': 'SmileMoore-Visitor-Tracker' }
        });
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            geoCountry = geoData.country || '';
            geoRegion = geoData.regionName || '';
            geoCity = geoData.city || '';
            geoLatitude = geoData.lat?.toString() || '';
            geoLongitude = geoData.lon?.toString() || '';
            console.log('🌍 Geographic location:', { geoCity, geoRegion, geoCountry, ip });
          }
        }
      } catch (geoError) {
        console.error('❌ Failed to fetch geolocation:', geoError);
      }
    } else {
      console.log('⚠️ Skipping geolocation for local/private IP:', ip);
    }

    // Get unique visitor ID
    const visitorId = await getNextVisitorId();
    const timestamp = new Date().toISOString();

    const sheets = getGoogleSheetsClient();

    // Calculate cookie quality score (how many real platform IDs we captured - 4 platforms total)
    let cookieQualityScore = 0;
    if (fbp) cookieQualityScore++;
    if (gaClientId) cookieQualityScore++;
    if (muid) cookieQualityScore++;
    if (ttp) cookieQualityScore++;

    const allCookiesCaptured = cookieQualityScore === 4 ? 'Yes' : 'No';

    // Prepare row data matching Visitors sheet headers (columns A-BA)
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
      '', // AE - LinkedIn ID (removed - not tracking)
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
      '', // AU - Voucher Code (added when email submitted)
      geoCity || '', // AV - Geo City
      geoRegion || '', // AW - Geo Region/State
      geoCountry || '', // AX - Geo Country
      geoLatitude || '', // AY - Geo Latitude
      geoLongitude || '', // AZ - Geo Longitude
      networkType || '', // BA - Network Type (WiFi/4G/3G/etc)
      '', // BB - Time to First Interaction (seconds)
      '', // BC - Session Duration (seconds)
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:BC',
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
