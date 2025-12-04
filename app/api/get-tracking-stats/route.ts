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

    // Read directly from CustomerID sheet (single source of truth)
    const customerIdResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
    });
    const customerIdData = customerIdResponse.data.values?.[0] || [];

    const lastCustomerId = customerIdData[0] || '0';
    const totalVisits = parseInt(customerIdData[1]) || 0;
    const uniqueVisitors = parseInt(customerIdData[2]) || 0;
    const stage1Count = parseInt(customerIdData[3]) || 0;
    const stage2Count = parseInt(customerIdData[4]) || 0;
    const stage3Count = parseInt(customerIdData[5]) || 0;

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
        lastCustomerId,
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
