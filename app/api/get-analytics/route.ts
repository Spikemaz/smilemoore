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

// Get WhatsApp metrics from WA sheet
async function getWhatsAppMetrics(sheets: any) {
  try {
    const waResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'WA!A2:Y',
    });
    const waData = waResponse.data.values || [];
    const sent = waData.length;
    const read = waData.filter(row => row[11] === 'Yes').length; // Column L
    const replied = waData.filter(row => row[12] === 'Yes').length; // Column M

    return {
      totalSent: sent,
      readRate: sent > 0 ? ((read / sent) * 100).toFixed(1) : '0.0',
      replyRate: sent > 0 ? ((replied / sent) * 100).toFixed(1) : '0.0',
    };
  } catch (error) {
    console.error('Error fetching WA metrics:', error);
    return { totalSent: 0, readRate: '0.0', replyRate: '0.0' };
  }
}

// Get Funnel metrics from FUNNEL sheet
async function getFunnelMetrics(sheets: any, totalVisitors: number, stage1: number, stage3: number) {
  try {
    const funnelResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'FUNNEL!A2:AT',
    });
    const funnelData = funnelResponse.data.values || [];
    const funnelTotal = funnelData.length;
    const funnelCompleted = funnelData.filter(row => row[35] === 'Completed').length; // Column AJ

    // Use FUNNEL sheet data if available, otherwise fallback to existing logic
    const visitors = funnelTotal > 0 ? funnelTotal : totalVisitors;
    const completions = funnelTotal > 0 ? funnelCompleted : stage3;
    const conversionRate = visitors > 0 ? ((stage1 / visitors) * 100).toFixed(1) : '0.0';

    return {
      totalVisitors: visitors,
      formStarts: stage1,
      completions: completions,
      conversionRate,
    };
  } catch (error) {
    console.error('Error fetching funnel metrics:', error);
    return {
      totalVisitors,
      formStarts: stage1,
      completions: stage3,
      conversionRate: totalVisitors > 0 ? ((stage1 / totalVisitors) * 100).toFixed(1) : '0.0',
    };
  }
}

export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();

    // Fetch data from Home sheet (contains campaign sources and follow-up tracking)
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:BN',
    });

    const homeRows = homeResponse.data.values || [];

    // Fetch data from Visitors sheet
    const visitorsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Visitors!A:AT',
    });

    const visitorsRows = visitorsResponse.data.values || [];

    // Email template mapping
    const emailTemplates = {
      'voucher-single': 'Email: Voucher Single',
      'voucher-family': 'Email: Voucher Family',
      '4q-1': 'Email: 4Q Follow-up #1',
      '4q-2': 'Email: 4Q Follow-up #2',
      '4q-3': 'Email: 4Q Follow-up #3',
      '10q-1': 'Email: 10Q Follow-up #1',
      '10q-2': 'Email: 10Q Follow-up #2',
      '10q-3': 'Email: 10Q Follow-up #3',
      'christmas': 'Email: Christmas',
      'referral': 'Email: Referral',
    };

    const smsTemplates = {
      'sms-4q-1': 'SMS: 4Q Follow-up #1',
      'sms-10q-1': 'SMS: 10Q Follow-up #1',
      'sms-referral': 'SMS: Referral',
    };

    // Calculate email stats
    const emailStats: { [key: string]: { sent: number; opened: number; clicked: number } } = {};
    let totalEmailsSent = 0;
    let totalEmailsOpened = 0;
    let totalEmailsClicked = 0;

    // Calculate SMS stats
    const smsStats: { [key: string]: { sent: number; delivered: number; clicked: number } } = {};
    let totalSmsSent = 0;
    let totalSmsDelivered = 0;
    let totalSmsClicked = 0;

    // Initialize stats
    Object.keys(emailTemplates).forEach((key) => {
      emailStats[key] = { sent: 0, opened: 0, clicked: 0 };
    });

    Object.keys(smsTemplates).forEach((key) => {
      smsStats[key] = { sent: 0, delivered: 0, clicked: 0 };
    });

    // Process Home sheet rows (skip header)
    for (let i = 1; i < homeRows.length; i++) {
      const row = homeRows[i];
      if (!row) continue;

      const campaignSource = row[6] || ''; // Column G - Campaign Source

      // Track email sends
      const followup1Sent4Q = row[33]; // Column AI
      const followup2Sent4Q = row[35]; // Column AK
      const followup3Sent4Q = row[37]; // Column AM
      const followup1Sent10Q = row[39]; // Column AO
      const followup2Sent10Q = row[41]; // Column AQ
      const followup3Sent10Q = row[43]; // Column AS

      // Count voucher email sends based on family size
      const isFamilyVoucher = row[11] && parseInt(row[11]) > 1; // Column L - Family Members
      if (row[1]) { // Column B - Voucher Timestamp (means voucher was sent)
        if (isFamilyVoucher) {
          emailStats['voucher-family'].sent++;
          totalEmailsSent++;
        } else {
          emailStats['voucher-single'].sent++;
          totalEmailsSent++;
        }
      }

      // Count follow-up email sends
      if (followup1Sent4Q) {
        emailStats['4q-1'].sent++;
        totalEmailsSent++;
      }
      if (followup2Sent4Q) {
        emailStats['4q-2'].sent++;
        totalEmailsSent++;
      }
      if (followup3Sent4Q) {
        emailStats['4q-3'].sent++;
        totalEmailsSent++;
      }
      if (followup1Sent10Q) {
        emailStats['10q-1'].sent++;
        totalEmailsSent++;
      }
      if (followup2Sent10Q) {
        emailStats['10q-2'].sent++;
        totalEmailsSent++;
      }
      if (followup3Sent10Q) {
        emailStats['10q-3'].sent++;
        totalEmailsSent++;
      }
    }

    // Process Visitors sheet to track clicks from emails and SMS
    for (let i = 1; i < visitorsRows.length; i++) {
      const row = visitorsRows[i];
      if (!row) continue;

      const campaignSource = row[3] || ''; // Column D - Campaign Source

      // Track email clicks
      Object.entries(emailTemplates).forEach(([key, templateName]) => {
        if (campaignSource === templateName) {
          emailStats[key].clicked++;
          totalEmailsClicked++;
        }
      });

      // Track SMS clicks
      Object.entries(smsTemplates).forEach(([key, templateName]) => {
        if (campaignSource === templateName) {
          smsStats[key].clicked++;
          totalSmsClicked++;
        }
      });
    }

    // Calculate funnel stats from CustomerID tracking
    const customerIdResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'CustomerID!A2:F2',
    });

    const customerIdData = customerIdResponse.data.values?.[0] || [];
    const totalVisitors = parseInt(customerIdData[1]) || 0;
    const stage1 = parseInt(customerIdData[3]) || 0;
    const stage2 = parseInt(customerIdData[4]) || 0;
    const stage3 = parseInt(customerIdData[5]) || 0;

    // Calculate rates
    const emailOpenRate = totalEmailsSent > 0 ? (totalEmailsOpened / totalEmailsSent) * 100 : 0;
    const emailClickRate = totalEmailsSent > 0 ? (totalEmailsClicked / totalEmailsSent) * 100 : 0;
    const emailConversionRate = totalEmailsClicked > 0 ? (stage1 / totalEmailsClicked) * 100 : 0;

    const smsDeliveryRate = totalSmsSent > 0 ? (totalSmsDelivered / totalSmsSent) * 100 : 0;
    const smsClickRate = totalSmsSent > 0 ? (totalSmsClicked / totalSmsSent) * 100 : 0;

    const funnelConversionRate = totalVisitors > 0 ? (stage1 / totalVisitors) * 100 : 0;

    // Build template performance arrays
    const emailTemplatePerformance = [
      {
        template: '✉️ Voucher (Single)',
        sent: emailStats['voucher-single'].sent,
        opened: emailStats['voucher-single'].opened,
        clicked: emailStats['voucher-single'].clicked,
        openRate: emailStats['voucher-single'].sent > 0
          ? ((emailStats['voucher-single'].opened / emailStats['voucher-single'].sent) * 100).toFixed(1)
          : '0.0',
        clickRate: emailStats['voucher-single'].sent > 0
          ? ((emailStats['voucher-single'].clicked / emailStats['voucher-single'].sent) * 100).toFixed(1)
          : '0.0',
      },
      {
        template: '👨‍👩‍👧 Voucher (Family)',
        sent: emailStats['voucher-family'].sent,
        opened: emailStats['voucher-family'].opened,
        clicked: emailStats['voucher-family'].clicked,
        openRate: emailStats['voucher-family'].sent > 0
          ? ((emailStats['voucher-family'].opened / emailStats['voucher-family'].sent) * 100).toFixed(1)
          : '0.0',
        clickRate: emailStats['voucher-family'].sent > 0
          ? ((emailStats['voucher-family'].clicked / emailStats['voucher-family'].sent) * 100).toFixed(1)
          : '0.0',
      },
      {
        template: '📬 4Q Follow-up #1',
        sent: emailStats['4q-1'].sent,
        opened: emailStats['4q-1'].opened,
        clicked: emailStats['4q-1'].clicked,
        openRate: emailStats['4q-1'].sent > 0
          ? ((emailStats['4q-1'].opened / emailStats['4q-1'].sent) * 100).toFixed(1)
          : '0.0',
        clickRate: emailStats['4q-1'].sent > 0
          ? ((emailStats['4q-1'].clicked / emailStats['4q-1'].sent) * 100).toFixed(1)
          : '0.0',
      },
      {
        template: '📬 4Q Follow-up #2',
        sent: emailStats['4q-2'].sent,
        opened: emailStats['4q-2'].opened,
        clicked: emailStats['4q-2'].clicked,
        openRate: emailStats['4q-2'].sent > 0
          ? ((emailStats['4q-2'].opened / emailStats['4q-2'].sent) * 100).toFixed(1)
          : '0.0',
        clickRate: emailStats['4q-2'].sent > 0
          ? ((emailStats['4q-2'].clicked / emailStats['4q-2'].sent) * 100).toFixed(1)
          : '0.0',
      },
      {
        template: '📬 4Q Follow-up #3',
        sent: emailStats['4q-3'].sent,
        opened: emailStats['4q-3'].opened,
        clicked: emailStats['4q-3'].clicked,
        openRate: emailStats['4q-3'].sent > 0
          ? ((emailStats['4q-3'].opened / emailStats['4q-3'].sent) * 100).toFixed(1)
          : '0.0',
        clickRate: emailStats['4q-3'].sent > 0
          ? ((emailStats['4q-3'].clicked / emailStats['4q-3'].sent) * 100).toFixed(1)
          : '0.0',
      },
    ];

    return NextResponse.json({
      success: true,
      email: {
        totalSent: totalEmailsSent,
        totalOpened: totalEmailsOpened,
        totalClicked: totalEmailsClicked,
        openRate: emailOpenRate.toFixed(1),
        clickRate: emailClickRate.toFixed(1),
        conversionRate: emailConversionRate.toFixed(1),
        templates: emailTemplatePerformance,
      },
      sms: {
        totalSent: totalSmsSent,
        totalDelivered: totalSmsDelivered,
        totalClicked: totalSmsClicked,
        deliveryRate: smsDeliveryRate.toFixed(1),
        clickRate: smsClickRate.toFixed(1),
      },
      whatsapp: await getWhatsAppMetrics(sheets),
      funnel: await getFunnelMetrics(sheets, totalVisitors, stage1, stage3),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
