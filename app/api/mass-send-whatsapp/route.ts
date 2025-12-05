import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Missing message content' },
        { status: 400 }
      );
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get all phone numbers from CustomerID sheet
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

    // Skip header row and filter for customers with phone numbers
    const customers = rows.slice(1).filter(row => row[3]); // Has phone

    const results = {
      total: customers.length,
      whatsappLinks: [] as { name: string; phone: string; link: string }[],
    };

    // Generate WhatsApp links for each customer
    for (const customer of customers) {
      const [customerId, name, email, phone] = customer;

      // Clean phone number (remove spaces, dashes, etc)
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

      // Personalize message
      const personalizedMessage = message
        .replace(/\{name\}/g, name || 'Valued Customer')
        .replace(/\{customerId\}/g, customerId || '');

      // Generate WhatsApp link
      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;

      results.whatsappLinks.push({
        name: name || 'Unknown',
        phone: phone,
        link: whatsappLink,
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error generating WhatsApp links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
