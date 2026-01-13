import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { SHEETS_CONFIG } from '@/app/lib/emailConfig';

const SPREADSHEET_ID = SHEETS_CONFIG.spreadsheetId;

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Link</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                text-align: center;
              }
              .error {
                color: #d32f2f;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <h1 class="error">Invalid Unsubscribe Link</h1>
            <p>This unsubscribe link is invalid. If you continue to receive emails, please contact us at reception@smilemoore.co.uk</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const sheets = getGoogleSheetsClient();

    // Find the row with this email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:C',
    });

    const rows = response.data.values || [];
    const emailLower = email.toLowerCase().trim();
    const rowIndex = rows.findIndex((row) => row[0]?.toLowerCase().trim() === emailLower);

    if (rowIndex !== -1) {
      const actualRowIndex = rowIndex + 1; // 1-indexed

      // Mark as unsubscribed in column AV
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!AV${actualRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toISOString()]],
        },
      });

      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Unsubscribed Successfully</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                text-align: center;
                background-color: #f8f9fa;
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 {
                color: #1f3a33;
                margin-bottom: 20px;
              }
              .success-icon {
                font-size: 64px;
                margin-bottom: 20px;
              }
              p {
                color: #333;
                line-height: 1.6;
                margin-bottom: 15px;
              }
              .important {
                background-color: #fff7e6;
                border: 2px solid #ffd700;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .important strong {
                color: #d32f2f;
              }
              .contact {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✅</div>
              <h1>You've Been Unsubscribed</h1>
              <p>You will no longer receive any marketing or promotional emails from Smile Moore.</p>

              <div class="important">
                <strong>📋 Important:</strong>
                <p style="margin-top: 10px;">Your £50 voucher is still valid! To stay updated about our practice opening and redeem your voucher, please:</p>
                <ul style="text-align: left; margin: 10px 0; padding-left: 30px;">
                  <li>Follow us on social media for updates</li>
                  <li>Check our website: smilemoore.co.uk</li>
                  <li>Contact us directly when you're ready to book</li>
                </ul>
              </div>

              <p>If you change your mind, contact us to re-subscribe.</p>

              <div class="contact">
                <p>Questions? Contact us at reception@smilemoore.co.uk</p>
              </div>
            </div>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    } else {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Not Found</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                text-align: center;
              }
              .warning {
                color: #f57c00;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <h1 class="warning">Email Not Found</h1>
            <p>We couldn't find this email in our system. If you continue to receive emails, please contact us at reception@smilemoore.co.uk</p>
          </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .error {
              color: #d32f2f;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <h1 class="error">Something Went Wrong</h1>
          <p>There was an error processing your request. Please contact us at reception@smilemoore.co.uk</p>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
