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

export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();

    // Get ALL Visitors data to count properly
    const visitorsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A2:AR', // All visitor rows, skip header
    });
    const visitorsData = visitorsResponse.data.values || [];

    // Total visits = total rows in Visitors sheet
    const totalVisits = visitorsData.length;

    // Unique visitors = unique SmileMoore Universal IDs (column AR - index 43)
    const uniqueIds = new Set();
    visitorsData.forEach(row => {
      const smId = row[43]; // Column AR (SmileMoore Universal ID)
      if (smId) uniqueIds.add(smId);
    });
    const uniqueVisitors = uniqueIds.size;

    // Get Home data to count stages
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A2:AB', // All data rows, skip header
    });
    const homeData = homeResponse.data.values || [];

    // Get last customer ID from last row (highest ID)
    const lastCustomerId = homeData.length > 0 ? homeData[homeData.length - 1][0] : '0';

    // Count stages by checking actual data
    let stage1Count = 0; // Has Customer ID + Email + Name + Phone + Postcode
    let stage2Count = 0; // Has Q1-Q5 all filled (columns M-Q, indexes 12-16)
    let stage3Count = 0; // Has Q1-Q10 all filled (columns M-V, indexes 12-21)

    homeData.forEach(row => {
      // Stage 1: Check columns A (Customer ID), C (Email), D (Name), E (Phone), F (Postcode)
      const hasCustomerId = row[0]?.trim();
      const hasEmail = row[2]?.trim();
      const hasName = row[3]?.trim();
      const hasPhone = row[4]?.trim();
      const hasPostcode = row[5]?.trim();

      if (hasCustomerId && hasEmail && hasName && hasPhone && hasPostcode) {
        stage1Count++;

        // Stage 2: Check Q1-Q5 (columns M-Q, indexes 12-16)
        const hasQ1 = row[12]?.trim();
        const hasQ2 = row[13]?.trim();
        const hasQ3 = row[14]?.trim();
        const hasQ4 = row[15]?.trim();
        const hasQ5 = row[16]?.trim();

        if (hasQ1 && hasQ2 && hasQ3 && hasQ4 && hasQ5) {
          stage2Count++;

          // Stage 3: Check Q6-Q10 (columns R-V, indexes 17-21)
          const hasQ6 = row[17]?.trim();
          const hasQ7 = row[18]?.trim();
          const hasQ8 = row[19]?.trim();
          const hasQ9 = row[20]?.trim();
          const hasQ10 = row[21]?.trim();

          if (hasQ6 && hasQ7 && hasQ8 && hasQ9 && hasQ10) {
            stage3Count++;
          }
        }
      }
    });

    // Get WA (WhatsApp) metrics
    const waResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'WA!A2:Y',
    });
    const waData = waResponse.data.values || [];
    const waSent = waData.length;
    const waDelivered = waData.filter(row => row[10] === 'Yes').length; // Column K
    const waRead = waData.filter(row => row[11] === 'Yes').length; // Column L
    const waReplied = waData.filter(row => row[12] === 'Yes').length; // Column M

    // Get SMS metrics
    const smsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'SMS!A2:V',
    });
    const smsData = smsResponse.data.values || [];
    const smsSent = smsData.length;
    const smsDelivered = smsData.filter(row => row[10] === 'Yes').length; // Column K
    const smsClicked = smsData.filter(row => row[11] && row[11] !== '0').length; // Column L

    // Get FUNNEL metrics
    const funnelResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'FUNNEL!A2:AT',
    });
    const funnelData = funnelResponse.data.values || [];
    const funnelTotal = funnelData.length;
    const funnelCompleted = funnelData.filter(row => row[35] === 'Completed').length; // Column AJ

    return NextResponse.json({
      success: true,
      stats: {
        lastCustomerId: lastCustomerId || '0',
        siteVisitorsTotal: totalVisits,
        siteVisitorsUnique: uniqueVisitors,
        stage1: stage1Count,
        stage2: stage2Count,
        stage3: stage3Count,
        whatsapp: {
          sent: waSent,
          delivered: waDelivered,
          read: waRead,
          replied: waReplied,
          readRate: waSent > 0 ? ((waRead / waSent) * 100).toFixed(1) : '0.0',
          replyRate: waSent > 0 ? ((waReplied / waSent) * 100).toFixed(1) : '0.0',
        },
        sms: {
          sent: smsSent,
          delivered: smsDelivered,
          clicked: smsClicked,
          deliveryRate: smsSent > 0 ? ((smsDelivered / smsSent) * 100).toFixed(1) : '0.0',
          clickRate: smsSent > 0 ? ((smsClicked / smsSent) * 100).toFixed(1) : '0.0',
        },
        funnel: {
          total: funnelTotal,
          completed: funnelCompleted,
          completionRate: funnelTotal > 0 ? ((funnelCompleted / funnelTotal) * 100).toFixed(1) : '0.0',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tracking stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking stats' },
      { status: 500 }
    );
  }
}
