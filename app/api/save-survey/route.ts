import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { updateCustomerIDSheet } from '@/app/lib/updateCustomerIDSheet';

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
    const body = await request.json();
    const {
      email,
      dentalCare,
      timeline,
      appointmentTimes,
      importantFactors,
      previousExperience,
      householdNames, // NEW: Array of household member names
      mostImportantFactor,
      smileConfidence,
      sameClinician,
      neededTreatments,
      beforeAppointment,
      stayLongTerm,
      preventingVisits,
      cosmeticImportance,
      preferredContact,
      dentalExperience,
      additionalFeedback
    } = body;

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

    // CRITICAL: Find the LAST (most recent) row with this email
    // This prevents overwriting earlier family members who share the same email
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i] && rows[i][emailColumnIndex] === email) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        console.log('✅ Found email at row:', rowIndex, 'Email:', email);
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Determine if this is step 5 (first 5 questions) or step 6 (extended 10 questions)
    // Check if the field exists in the request body, not if it's truthy (empty string '' is valid)
    const hasExtendedFields = 'dentalExperience' in body || 'mostImportantFactor' in body || 'smileConfidence' in body;
    const isStep5 = appointmentTimes !== undefined && !hasExtendedFields; // Step 5 has Q1-Q5, no extended fields
    const isStep6 = hasExtendedFields; // Step 6 has extended fields

    if (isStep5) {
      // Step 5: Save only Q1-Q5 (columns M-Q)
      const dentalCareString = Array.isArray(dentalCare) ? dentalCare.join(', ') : dentalCare;
      const appointmentTimesString = Array.isArray(appointmentTimes) ? appointmentTimes.join(', ') : appointmentTimes;
      const factorsString = Array.isArray(importantFactors) ? importantFactors.join(', ') : importantFactors;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!M${rowIndex}:Q${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            appointmentTimesString,    // M - Q1: When do you prefer appointments?
            timeline,                  // N - Q2: When was your most recent appointment?
            dentalCareString,          // O - Q3: What type of dental care?
            factorsString,             // P - Q4: How do you feel about visiting?
            previousExperience || '',  // Q - Q5: Main reason for looking?
          ]],
        },
      });

      // Update CustomerID sheet with live-calculated metrics
      await updateCustomerIDSheet();

      // HOUSEHOLD MEMBERS: Create voucher entries for each household member
      if (householdNames && Array.isArray(householdNames) && householdNames.length > 0) {
        console.log(`👨‍👩‍👧‍👦 Creating vouchers for ${householdNames.length} household members`);

        // Get the original customer's data to copy campaign source, etc.
        const originalData = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `Home!A${rowIndex}:L${rowIndex}`,
        });
        const originalRow = originalData.data.values?.[0] || [];
        const originalCampaignSource = originalRow[6] || ''; // Column G
        const originalReferredBy = originalRow[11] || ''; // Column L

        // Call submit-voucher API for each household member
        const householdVouchers = [];
        for (const memberName of householdNames) {
          if (memberName && memberName.trim()) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/submit-voucher`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email, // Same email as primary user
                  name: memberName.trim(),
                  phone: '', // Will be filled later if needed
                  address: '', // Will be filled later if needed
                  campaignSource: originalCampaignSource,
                  timeToSubmit: 0,
                  scrollDepth: 0,
                  referredBy: originalReferredBy,
                  smUniversalId: '', // Could use same or generate new
                }),
              });

              const result = await response.json();
              if (result.voucherCode) {
                householdVouchers.push({
                  name: memberName.trim(),
                  voucherCode: result.voucherCode,
                  customerId: result.customerId,
                });
                console.log(`✅ Created voucher for ${memberName}: ${result.voucherCode}`);
              }
            } catch (error) {
              console.error(`❌ Failed to create voucher for ${memberName}:`, error);
            }
          }
        }

        // Send family email with all voucher codes
        if (householdVouchers.length > 0) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://smilemoore.co.uk'}/api/send-family-vouchers`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                householdVouchers,
              }),
            });
            console.log(`📧 Sent family voucher email to ${email}`);
          } catch (error) {
            console.error('❌ Failed to send family voucher email:', error);
          }
        }
      }
    } else if (isStep6) {
      // Step 6: Save only Q6-Q15 + Additional Feedback (columns R-AB)
      const treatmentsString = Array.isArray(neededTreatments) ? neededTreatments.join(', ') : '';

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Home!R${rowIndex}:AB${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            dentalExperience || '',    // R - Q6: Previous dental experience?
            mostImportantFactor || '', // S - Q7: Factor that matters most?
            smileConfidence || '',     // T - Q8: Smile confidence?
            sameClinician || '',       // U - Q9: Same clinician important?
            treatmentsString,          // V - Q10: Treatments needed?
            beforeAppointment || '',   // W - Q11: Feel before appointment?
            stayLongTerm || '',        // X - Q12: Stay long-term?
            preventingVisits || '',    // Y - Q13: What prevents visits?
            cosmeticImportance || '',  // Z - Q14: Cosmetic importance?
            preferredContact || '',    // AA - Q15: Preferred contact?
            additionalFeedback || '',  // AB - Additional Feedback
          ]],
        },
      });

      // Update CustomerID sheet with live-calculated metrics
      await updateCustomerIDSheet();
    }

    // Award entries based on survey completion
    // Use the same logic as the save operations above
    const isBasicSurvey = isStep5;
    const isExtendedSurvey = isStep6;

    // Get current entries and timestamps
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Home!B${rowIndex}:BN${rowIndex}`,
    });
    const rowData = dataResponse.data.values?.[0] || [];

    const voucherTimestamp = rowData[0]; // Column B (index 0 in B:BN range)
    const campaignSource = rowData[5] || ''; // Column G (B=0, so G=5) - Campaign Source
    const referredBy = rowData[10] || ''; // Column L (B=0, so L=10) - Referred By
    const currentEntries = parseInt(rowData[31]) || 0; // Column AG (B=0, so AG=31)

    // Follow-up tracking (B:BN range, so subtract 1 from standard index)
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

      // Check if they came from a referral
      if (referredBy) {
        winningVariation = 'Referral';
      }
      // Check if they came from QR code
      else if (campaignSource === 'QR Leaflet 1 Scan' || campaignSource === 'QR Jumper Scan' || campaignSource === 'QR Scan') {
        winningVariation = 'QR';
      }
      // Check follow-up emails
      else if (followup3Sent4Q) {
        winningVariation = 'Variation 3';
      } else if (followup2Sent4Q) {
        winningVariation = 'Variation 2';
      } else if (followup1Sent4Q) {
        winningVariation = 'Variation 1';
      }

      updates.push({
        range: `Home!AW${rowIndex}`,
        values: [[winningVariation]],
      });

    } else if (isExtendedSurvey) {
      // Extended 10 questions: +1 entry
      entriesToAdd = 1;

      // Calculate time to complete 10Q from when they completed 4Q (column AZ = Time to Complete 10Q)
      // We'll use the current timestamp minus when they would have completed 4Q
      const timeToComplete4Q = parseInt(rowData[49]) || 0; // Column AY (50-1=49 in B:BN range)
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

      // Check if they came from a referral
      if (referredBy) {
        winningVariation = 'Referral';
      }
      // Check if they came from QR code
      else if (campaignSource === 'QR Leaflet 1 Scan' || campaignSource === 'QR Jumper Scan' || campaignSource === 'QR Scan') {
        winningVariation = 'QR';
      }
      // Check follow-up emails
      else if (followup3Sent10Q) {
        winningVariation = 'Variation 3';
      } else if (followup2Sent10Q) {
        winningVariation = 'Variation 2';
      } else if (followup1Sent10Q) {
        winningVariation = 'Variation 1';
      }

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
            name: rowData[2] || 'Unknown', // Name from column D (B:BN range, D=2)
            email,
            timeToComplete,
            device: rowData[51] || 'Unknown', // Column BB (52-1=51 in B:BN range)
            totalTime: (parseInt(rowData[48]) || 0) + (parseInt(rowData[49]) || 0), // AW + AX (48 and 49 in B:BN range)
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
