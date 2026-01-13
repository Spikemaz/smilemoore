import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { checkEmailOptOut, incrementEmailCount } from '@/app/lib/googleSheets';

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

      // Check if user has opted out
      const hasOptedOut = await checkEmailOptOut(email);
      if (hasOptedOut) {
        console.log(`🚫 Mass email blocked: ${email} has STOP in column BE`);
        results.failed++;
        results.errors.push(`${email}: User has opted out`);
        continue;
      }

      try {
        // Add tracking pixel and unsubscribe link to HTML content
        const trackingPixel = `<img src="https://smilemoore.co.uk/api/track-email-open?email=${encodeURIComponent(email)}" width="1" height="1" alt="" style="display: block; border: 0;" />`;
        const unsubscribeLink = `<p style="text-align: center; margin-top: 20px; font-size: 12px;"><a href="https://smilemoore.co.uk/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999999; text-decoration: underline;">Unsubscribe from emails</a></p>`;

        let personalizedHtml = htmlContent
          .replace(/\{name\}/g, name || 'Valued Customer')
          .replace(/\{customerId\}/g, customerId || '');

        // Insert unsubscribe link and tracking pixel before closing body tag
        personalizedHtml = personalizedHtml.replace('</body>', `${unsubscribeLink}${trackingPixel}</body>`);

        await resend.emails.send({
          from: 'Smile Moore Reception <reception@smilemoore.co.uk>',
          to: [email],
          replyTo: 'reception@smilemoore.co.uk',
          subject: subject.replace(/\{name\}/g, name || 'Valued Customer'),
          html: personalizedHtml,
        });

        // Increment email count
        await incrementEmailCount(email);

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
