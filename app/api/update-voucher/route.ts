import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { updateVisitorStatus } from '@/app/lib/visitorTracking';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '181kDzZ-BbFqJVu4MEF-b2YhhTaNjmV_luMHvUNGQcCY';

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth.getClient();
}

export async function POST(request: NextRequest) {
  try {
    const { email, field, value, campaignSource, emailToName, nameToPhone, phoneToPostcode, totalTime } = await request.json();

    if (!email || !field || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // All data is in Home tab now
    // Find the row with this email (email is in column C)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:C',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === email);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Update the specific field
    const columnMap: { [key: string]: string } = {
      name: 'D',     // Column D
      phone: 'E',    // Column E
      address: 'F',  // Column F (postcode)
    };

    const column = columnMap[field];
    if (!column) {
      return NextResponse.json(
        { error: 'Invalid field' },
        { status: 400 }
      );
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!${column}${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]],
      },
    });

    // Get IP for visitor tracking
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Update visitor tracking with step timing data
    if (field === 'name' && emailToName !== undefined) {
      await updateVisitorStatus(
        ip,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        emailToName
      );
    } else if (field === 'phone' && nameToPhone !== undefined) {
      await updateVisitorStatus(
        ip,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        nameToPhone
      );
    } else if (field === 'address') {
      // Final step - update status and timing
      await updateVisitorStatus(
        ip,
        undefined,
        undefined,
        'Voucher Claimed',
        undefined,
        undefined,
        undefined,
        undefined,
        phoneToPostcode,
        totalTime
      );

      // Get all voucher details from the row to send confirmation email
      const voucherDetailsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!C${rowIndex + 1}:I${rowIndex + 1}`, // Email, Name, Phone, Postcode, Source, Value, Code
      });

      const voucherDetails = voucherDetailsResponse.data.values?.[0];
      if (voucherDetails) {
        const [emailAddr, name, phone, postcode, source, voucherValue, voucherCode] = voucherDetails;

        // Send confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-voucher-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailAddr,
              name,
              voucherCode,
              voucherValue,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating voucher:', error);
    return NextResponse.json(
      { error: 'Failed to update voucher' },
      { status: 500 }
    );
  }
}
