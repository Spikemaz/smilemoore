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
    const dentalCareString = Array.isArray(dentalCare) ? dentalCare.join(', ') : dentalCare;
    const appointmentTimesString = Array.isArray(appointmentTimes) ? appointmentTimes.join(', ') : appointmentTimes;
    const factorsString = Array.isArray(importantFactors) ? importantFactors.join(', ') : importantFactors;
    const treatmentsString = Array.isArray(neededTreatments) ? neededTreatments.join(', ') : '';

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!M${rowIndex}:AA${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          dentalCareString,
          timeline,
          appointmentTimesString,
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
    // Check if this is the 5-question survey or extended survey
    const dentalCareArray = Array.isArray(dentalCare) ? dentalCare : [dentalCare];
    const appointmentTimesArray = Array.isArray(appointmentTimes) ? appointmentTimes : [appointmentTimes];
    const isBasicSurvey = dentalCareArray.length > 0 && timeline && appointmentTimesArray.length > 0 && importantFactors && previousExperience;
    const isExtendedSurvey = mostImportantFactor || smileConfidence || sameClinician;

    // Get current entries and timestamps
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!B${rowIndex}:BB${rowIndex}`,
    });
    const rowData = dataResponse.data.values?.[0] || [];

    const voucherTimestamp = rowData[0]; // Column B (index 0 in B:BB range)
    const currentEntries = parseInt(rowData[31]) || 0; // Column AG (B=0, so AG=31)

    // Follow-up tracking (B:BB range, so subtract 1 from standard index)
    const followup1Sent4Q = rowData[33]; // Column AI (34-1=33)
    const followup2Sent4Q = rowData[35]; // Column AK (36-1=35)
    const followup3Sent4Q = rowData[37]; // Column AM (38-1=37)
    const followup1Sent10Q = rowData[39]; // Column AO (40-1=39)
    const followup2Sent10Q = rowData[41]; // Column AQ (42-1=41)
    const followup3Sent10Q = rowData[43]; // Column AS (44-1=43)

    const updates: any[] = [];
    let entriesToAdd = 0;

    if (isBasicSurvey && !isExtendedSurvey) {
      // First 5 questions: +1 entry
      entriesToAdd = 1;

      // Calculate time to complete 5Q (column AY = Time to Complete 4Q)
      if (voucherTimestamp) {
        const voucherTime = new Date(voucherTimestamp).getTime();
        const nowTime = Date.now();
        const minutesToComplete = Math.round((nowTime - voucherTime) / 60000);

        updates.push({
          range: `Home!AY${rowIndex}`,
          values: [[minutesToComplete]],
        });
      }

      // Track which follow-up variation converted them (column AW = Best Performing Subject 4Q)
      let winningVariation = 'Organic';
      if (followup3Sent4Q) winningVariation = 'Variation 3';
      else if (followup2Sent4Q) winningVariation = 'Variation 2';
      else if (followup1Sent4Q) winningVariation = 'Variation 1';

      updates.push({
        range: `Home!AW${rowIndex}`,
        values: [[winningVariation]],
      });

    } else if (isExtendedSurvey) {
      // Extended 10 questions: +1 entry
      entriesToAdd = 1;

      // Calculate time to complete 10Q from when they completed 4Q (column AZ = Time to Complete 10Q)
      // We'll use the current timestamp minus when they would have completed 4Q
      const timeToComplete4Q = parseInt(rowData[49]) || 0; // Column AY (50-1=49 in B:BB range)
      if (voucherTimestamp && timeToComplete4Q) {
        const fourQCompletionTime = new Date(voucherTimestamp).getTime() + (timeToComplete4Q * 60000);
        const nowTime = Date.now();
        const minutesToComplete = Math.round((nowTime - fourQCompletionTime) / 60000);

        updates.push({
          range: `Home!AZ${rowIndex}`,
          values: [[minutesToComplete]],
        });
      }

      // Track which follow-up variation converted them (column AX = Best Performing Subject 10Q)
      let winningVariation = 'Organic';
      if (followup3Sent10Q) winningVariation = 'Variation 3';
      else if (followup2Sent10Q) winningVariation = 'Variation 2';
      else if (followup1Sent10Q) winningVariation = 'Variation 1';

      updates.push({
        range: `Home!AX${rowIndex}`,
        values: [[winningVariation]],
      });

      // Mark device that completed full survey (column BB = Device Converted)
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
            range: `Home!BB${rowIndex}`,
            values: [[visitorRow[5]]], // Device Type from Visitors
          });
        }
      } catch (error) {
        console.error('Error fetching device type:', error);
      }
    }

    // Update entries (column AG = Total Draw Entries)
    if (entriesToAdd > 0) {
      updates.push({
        range: `Home!AG${rowIndex}`,
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
