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

    const messageQueue = customers.map((customer, index) => {
      const [customerId, name, email, phone] = customer;

      // Clean phone number (remove spaces, dashes, etc)
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

      // Ensure UK format starts with 44
      let formattedPhone = cleanPhone;
      if (cleanPhone.startsWith('0')) {
        formattedPhone = '44' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('44')) {
        formattedPhone = '44' + cleanPhone;
      }

      // Personalize message
      const personalizedMessage = message
        .replace(/\{name\}/g, name || 'Valued Customer')
        .replace(/\{customerId\}/g, customerId || '');

      return {
        index,
        name: name || 'Unknown',
        phone: formattedPhone,
        originalPhone: phone,
        message: personalizedMessage,
      };
    });

    return NextResponse.json({
      success: true,
      total: messageQueue.length,
      messages: messageQueue,
    });
  } catch (error) {
    console.error('Error generating WhatsApp automation data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
