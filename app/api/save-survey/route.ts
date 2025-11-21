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

export async function POST(request: Request) {
  try {
    const {
      email,
      dentalCare,
      timeline,
      appointmentTimes,
      importantFactors,
      previousExperience,
      mostImportantFactor,
      smileConfidence,
      sameClinician,
      neededTreatments,
      beforeAppointment,
      stayLongTerm,
      preventingVisits,
      cosmeticImportance,
      preferredContact,
      additionalFeedback
    } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // Find the row with this email in the Home sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!A:Z',
    });

    const rows = response.data.values || [];
    const emailColumnIndex = 2; // Column C (0-indexed)
    let rowIndex = -1;

    // Find the row containing this email
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][emailColumnIndex] === email) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Update the row with all survey data (columns M through AA)
    const factorsString = Array.isArray(importantFactors) ? importantFactors.join(', ') : '';
    const treatmentsString = Array.isArray(neededTreatments) ? neededTreatments.join(', ') : '';

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!M${rowIndex}:AA${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          dentalCare,
          timeline,
          appointmentTimes,
          factorsString,
          previousExperience || '',
          mostImportantFactor || '',
          smileConfidence || '',
          sameClinician || '',
          treatmentsString,
          beforeAppointment || '',
          stayLongTerm || '',
          preventingVisits || '',
          cosmeticImportance || '',
          preferredContact || '',
          additionalFeedback || '',
        ]],
      },
    });

    // Award entries based on survey completion
    // Check if this is the 4-question survey or extended survey
    const isBasicSurvey = dentalCare && timeline && appointmentTimes && importantFactors;
    const isExtendedSurvey = previousExperience || mostImportantFactor || smileConfidence;

    // Get current entries
    const entriesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!AF${rowIndex}`,
    });
    const currentEntries = parseInt(entriesResponse.data.values?.[0]?.[0]) || 0;

    let entriesToAdd = 0;
    if (isBasicSurvey && !isExtendedSurvey) {
      // First 4 questions: +1 entry
      entriesToAdd = 1;
    } else if (isExtendedSurvey) {
      // Extended 10 questions: +1 entry (total of 2 if they answered both sets)
      entriesToAdd = 1;
    }

    if (entriesToAdd > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!AF${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[currentEntries + entriesToAdd]],
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
