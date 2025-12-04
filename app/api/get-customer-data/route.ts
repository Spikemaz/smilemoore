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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // Find the row with this Customer ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:AB', // Get all columns up to Additional Feedback
    });

    const rows = response.data.values || [];
    let customerRow = null;
    let rowIndex = -1;

    // Find the customer by ID (Column A)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][0] === customerId) {
        customerRow = rows[i];
        rowIndex = i + 1; // 1-indexed
        break;
      }
    }

    if (!customerRow) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Map the row data to an object
    const customerData = {
      customerId: customerRow[0] || '',
      timestamp: customerRow[1] || '',
      email: customerRow[2] || '',
      name: customerRow[3] || '',
      phone: customerRow[4] || '',
      postcode: customerRow[5] || '',
      campaignSource: customerRow[6] || '',
      voucherValue: customerRow[7] || '',
      voucherCode: customerRow[8] || '',
      batchNumber: customerRow[9] || '',
      ipAddress: customerRow[10] || '',
      referredBy: customerRow[11] || '',

      // Survey questions (M-Q: columns 12-16)
      appointmentTimes: customerRow[12] || '',
      timeline: customerRow[13] || '',
      dentalCare: customerRow[14] || '',
      importantFactors: customerRow[15] || '',
      previousExperience: customerRow[16] || '',

      // Extended survey (R-AB: columns 17-27)
      dentalExperience: customerRow[17] || '',
      mostImportantFactor: customerRow[18] || '',
      smileConfidence: customerRow[19] || '',
      sameClinician: customerRow[20] || '',
      neededTreatments: customerRow[21] || '',
      beforeAppointment: customerRow[22] || '',
      stayLongTerm: customerRow[23] || '',
      preventingVisits: customerRow[24] || '',
      cosmeticImportance: customerRow[25] || '',
      preferredContact: customerRow[26] || '',
      additionalFeedback: customerRow[27] || '',

      // Determine which step they should be on
      hasBasicInfo: !!(customerRow[2] && customerRow[3]), // email & name
      hasPhoneAddress: !!(customerRow[4] && customerRow[5]), // phone & postcode
      hasSurveyQ1to5: !!customerRow[12], // appointmentTimes (first survey question)
      hasExtendedSurvey: !!customerRow[17], // dentalExperience (first extended question)
    };

    console.log(`✅ Retrieved customer data for ${customerId}: ${customerData.name}`);

    return NextResponse.json({ success: true, data: customerData });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
