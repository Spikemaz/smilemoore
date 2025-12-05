import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { subject, htmlContent, filters } = await request.json();

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Email service not configured',
      });
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get all emails from CustomerID sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'CustomerID!A:D', // Customer ID, Name, Email, Phone
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json({
        success: false,
        message: 'No customers found in database',
      });
    }

    // Skip header row
    const customers = rows.slice(1);

    // Apply filters if provided
    let filteredCustomers = customers.filter(row => row[2]); // Has email

    if (filters?.hasPhone) {
      filteredCustomers = filteredCustomers.filter(row => row[3]); // Has phone
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const results = {
      total: filteredCustomers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails in batches
    for (const customer of filteredCustomers) {
      const [customerId, name, email] = customer;

      try {
        const personalizedHtml = htmlContent
          .replace(/\{name\}/g, name || 'Valued Customer')
          .replace(/\{customerId\}/g, customerId || '');

        await resend.emails.send({
          from: 'Smile Moore Reception <reception@smilemoore.co.uk>',
          to: [email],
          replyTo: 'reception@smilemoore.co.uk',
          subject: subject.replace(/\{name\}/g, name || 'Valued Customer'),
          html: personalizedHtml,
        });

        results.sent++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${email}: ${error.message}`);
      }

      // Rate limiting: Wait 100ms between sends
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error sending mass emails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
