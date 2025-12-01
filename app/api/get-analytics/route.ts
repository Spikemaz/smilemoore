import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Fetch visitor data from Home sheet
    const homeResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Home!A:M',
    });

    const homeRows = homeResponse.data.values || [];

    // Calculate funnel metrics
    const totalVisitors = homeRows.length - 1; // Exclude header
    const validEntries = homeRows.slice(1).filter(row => row[0]); // Has Visitor ID
    const formStarts = validEntries.length;
    const completions = validEntries.filter(row => row[3] && row[3].length > 0).length; // Has postcode
    const conversionRate = formStarts > 0 ? ((completions / formStarts) * 100).toFixed(1) : 0;

    // Fetch customer data
    const customersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Customers!A:L',
    });

    const customerRows = customersResponse.data.values || [];
    const customers = customerRows.slice(1); // Exclude header

    // Calculate email metrics from customers
    const totalCustomers = customers.length;
    const customersWithVouchers = customers.filter(row => row[6]); // Has voucher code

    // Count survey progress
    const customers1Entry = customers.filter(row => row[7] === '1').length; // Survey Progress = 1
    const customers2Entries = customers.filter(row => row[7] === '2').length;
    const customers3Entries = customers.filter(row => row[7] === '3').length;

    // Email template metrics (estimated based on data)
    // Voucher emails = all customers with voucher codes
    const voucherEmailsSent = customersWithVouchers.length;

    // 4Q follow-ups sent to customers with 1 entry
    const followup4QSent = customers1Entry;

    // 10Q follow-ups sent to customers with 2 entries
    const followup10QSent = customers2Entries;

    // Christmas emails sent to customers with 3 entries
    const christmasSent = customers3Entries;

    const analytics = {
      email: {
        totalSent: voucherEmailsSent + followup4QSent + followup10QSent + christmasSent,
        openRate: 0, // TODO: Track via Resend webhooks
        clickRate: 0, // TODO: Track via Resend webhooks
        conversionRate: completions > 0 ? ((completions / totalCustomers) * 100).toFixed(1) : 0,
        templates: {
          voucherSingle: {
            sent: voucherEmailsSent,
            opened: 0,
            clicked: 0,
            openRate: 0,
            clickRate: 0
          },
          voucherFamily: { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 },
          '4q1': {
            sent: followup4QSent,
            opened: 0,
            clicked: 0,
            openRate: 0,
            clickRate: 0
          },
          '4q2': { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 },
          '4q3': { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 },
          '10q1': {
            sent: followup10QSent,
            opened: 0,
            clicked: 0,
            openRate: 0,
            clickRate: 0
          },
          '10q2': { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 },
          '10q3': { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 },
          christmas: {
            sent: christmasSent,
            opened: 0,
            clicked: 0,
            openRate: 0,
            clickRate: 0
          },
          referral: { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 },
        },
      },
      whatsapp: {
        totalSent: 0, // Not yet implemented
        readRate: 0,
        replyRate: 0,
      },
      sms: {
        totalSent: 0, // Not yet implemented
        deliveryRate: 0,
        clickRate: 0,
      },
      funnel: {
        totalVisitors,
        formStarts,
        completions,
        conversionRate: parseFloat(conversionRate as string),
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
