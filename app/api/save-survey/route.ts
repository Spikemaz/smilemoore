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

    // Get current entries and timestamps
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!B${rowIndex}:BA${rowIndex}`,
    });
    const rowData = dataResponse.data.values?.[0] || [];

    const voucherTimestamp = rowData[0]; // Column B (index 0 in B:BA range)
    const currentEntries = parseInt(rowData[30]) || 0; // Column AF (B=0, so AF=30)

    // Follow-up tracking (B:BA range, so subtract 1 from standard index)
    const followup1Sent4Q = rowData[32]; // Column AH (33-1=32)
    const followup2Sent4Q = rowData[34]; // Column AJ (35-1=34)
    const followup3Sent4Q = rowData[36]; // Column AL (37-1=36)
    const followup1Sent10Q = rowData[38]; // Column AN (39-1=38)
    const followup2Sent10Q = rowData[40]; // Column AP (41-1=40)
    const followup3Sent10Q = rowData[42]; // Column AR (43-1=42)

    const updates: any[] = [];
    let entriesToAdd = 0;

    if (isBasicSurvey && !isExtendedSurvey) {
      // First 4 questions: +1 entry
      entriesToAdd = 1;

      // Calculate time to complete 4Q (column AX)
      if (voucherTimestamp) {
        const voucherTime = new Date(voucherTimestamp).getTime();
        const nowTime = Date.now();
        const minutesToComplete = Math.round((nowTime - voucherTime) / 60000);

        updates.push({
          range: `Home!AX${rowIndex}`,
          values: [[minutesToComplete]],
        });
      }

      // Track which follow-up variation converted them (column AV)
      let winningVariation = 'Organic';
      if (followup3Sent4Q) winningVariation = 'Variation 3';
      else if (followup2Sent4Q) winningVariation = 'Variation 2';
      else if (followup1Sent4Q) winningVariation = 'Variation 1';

      updates.push({
        range: `Home!AV${rowIndex}`,
        values: [[winningVariation]],
      });

    } else if (isExtendedSurvey) {
      // Extended 10 questions: +1 entry
      entriesToAdd = 1;

      // Calculate time to complete 10Q from when they completed 4Q (column AY)
      // We'll use the current timestamp minus when they would have completed 4Q
      const timeToComplete4Q = parseInt(rowData[48]) || 0; // Column AX (49-1=48 in B:BA range)
      if (voucherTimestamp && timeToComplete4Q) {
        const fourQCompletionTime = new Date(voucherTimestamp).getTime() + (timeToComplete4Q * 60000);
        const nowTime = Date.now();
        const minutesToComplete = Math.round((nowTime - fourQCompletionTime) / 60000);

        updates.push({
          range: `Home!AY${rowIndex}`,
          values: [[minutesToComplete]],
        });
      }

      // Track which follow-up variation converted them (column AW)
      let winningVariation = 'Organic';
      if (followup3Sent10Q) winningVariation = 'Variation 3';
      else if (followup2Sent10Q) winningVariation = 'Variation 2';
      else if (followup1Sent10Q) winningVariation = 'Variation 1';

      updates.push({
        range: `Home!AW${rowIndex}`,
        values: [[winningVariation]],
      });

      // Mark device that completed full survey (column BA)
      // Get device from Visitors sheet by matching email
      try {
        const visitorsResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Visitors!J:E',
        });
        const visitors = visitorsResponse.data.values || [];
        const visitorRow = visitors.find(row => row[0] === email);
        if (visitorRow && visitorRow[5]) {
          updates.push({
            range: `Home!BA${rowIndex}`,
            values: [[visitorRow[5]]], // Device Type from Visitors
          });
        }
      } catch (error) {
        console.error('Error fetching device type:', error);
      }
    }

    // Update entries
    if (entriesToAdd > 0) {
      updates.push({
        range: `Home!AF${rowIndex}`,
        values: [[currentEntries + entriesToAdd]],
      });
    }

    // Batch update all changes
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    }

    // Send notification based on what was completed
    try {
      const notificationType = isBasicSurvey && !isExtendedSurvey ? 'survey_4q_completed' : 'survey_10q_completed';
      const timeToComplete = isBasicSurvey && !isExtendedSurvey
        ? Math.round((Date.now() - new Date(voucherTimestamp).getTime()) / 60000)
        : parseInt(rowData[49]) || 0;

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notificationType,
          data: {
            name: rowData[2] || 'Unknown', // Name from column D (B:BA range, D=2)
            email,
            timeToComplete,
            device: rowData[51] || 'Unknown', // Column BA (52-1=51 in B:BA range)
            totalTime: (parseInt(rowData[48]) || 0) + (parseInt(rowData[49]) || 0), // AX + AY (48 and 49 in B:BA range)
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
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
