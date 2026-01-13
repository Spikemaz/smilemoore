import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { SHEETS_CONFIG } from '../../lib/emailConfig';

const SPREADSHEET_ID = SHEETS_CONFIG.spreadsheetId;

function getGoogleSheetsClient() {
  const client_email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!client_email || !private_key) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

interface OptOutStatus {
  email: string;
  found: boolean;
  rowNumber?: number;
  unsubscribedTimestamp?: string;  // Column AV (index 45 from C)
  manualStop?: string;              // Column BE (index 54 from C)
  autoStopped?: string;             // Column BM (index 62 from C)
  isOptedOut: boolean;
  optOutReason?: string;
}

export async function GET(request: Request) {
  // Require CRON_SECRET for authorization (same as other protected endpoints)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // List of emails to check
  const emailsToCheck = [
    'taylormuir1993@gmail.com',
    'xavier.adam@gmail.com',
    'marcus.buildingconnections@gmail.com',
    'sazlou13@aol.com',
    'sarasvastisalee@gmail.com',
    'dominicpickles@outlook.com',
    'zaramorgan96@gmail.com',
    'dadapperduck@gmail.com',
    'lorrainetaylor27@googlemail.com',
    'neil-oc@ntlworld.com',
    'lauratettmarsaleh@gmail.com',
    'eleanore.sheriffs@hotmail.com',
    'THAT.CADDINGTON.REF@OUTLOOK.COM',
    'bobo1@h.com',
    'prerunner0809@gmail.com',
    'kamrul070903@gmail.com',
    'jazmineawoyemi11@gmail.com',
    'larlyn.castillon@concentrix.com',
  ];

  try {
    const sheets = getGoogleSheetsClient();

    // Read the entire range from Home sheet
    // Column C = Email, AV = Unsubscribed, BE = Manual STOP, BM = Auto-Stopped
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:BM', // Email (C) to Auto-Stopped (BM)
    });

    const rows = response.data.values || [];
    const results: OptOutStatus[] = [];

    // Build a map of all emails in the sheet for faster lookup
    const emailMap = new Map<string, { rowIndex: number; row: string[] }>();

    for (let i = 1; i < rows.length; i++) { // Skip header row
      const rowEmail = rows[i][0]; // Column C (index 0 in this range)
      if (rowEmail) {
        emailMap.set(rowEmail.toLowerCase().trim(), { rowIndex: i, row: rows[i] });
      }
    }

    // Check each email
    for (const email of emailsToCheck) {
      const normalizedEmail = email.toLowerCase().trim();
      const match = emailMap.get(normalizedEmail);

      if (match) {
        const row = match.row;
        const rowNumber = match.rowIndex + 1; // 1-indexed for display

        // Column indices from C (where C = index 0)
        // AV is column 48 (0-indexed), but from C: AV - C = 48 - 3 = 45
        // BE is column 57 (0-indexed), but from C: BE - C = 57 - 3 = 54
        // BM is column 65 (0-indexed), but from C: BM - C = 65 - 3 = 62
        const unsubscribedTimestamp = row[45] || ''; // Column AV
        const manualStop = row[54] || '';            // Column BE
        const autoStopped = row[62] || '';           // Column BM

        let isOptedOut = false;
        let optOutReason: string | undefined;

        // Check unsubscribed timestamp (any non-empty value)
        if (unsubscribedTimestamp && unsubscribedTimestamp.toString().trim() !== '') {
          isOptedOut = true;
          optOutReason = `Unsubscribed (Column AV): ${unsubscribedTimestamp}`;
        }
        // Check manual STOP
        else if (manualStop && manualStop.toString().toUpperCase() === 'STOP') {
          isOptedOut = true;
          optOutReason = 'Manual STOP (Column BE)';
        }
        // Check auto-stopped
        else if (autoStopped && autoStopped.toString().toUpperCase() === 'YES') {
          isOptedOut = true;
          optOutReason = 'Auto-Stopped (Column BM): 3 unopened emails';
        }

        results.push({
          email,
          found: true,
          rowNumber,
          unsubscribedTimestamp: unsubscribedTimestamp || undefined,
          manualStop: manualStop || undefined,
          autoStopped: autoStopped || undefined,
          isOptedOut,
          optOutReason,
        });
      } else {
        results.push({
          email,
          found: false,
          isOptedOut: false,
          optOutReason: 'Email not found in database',
        });
      }
    }

    // Summary statistics
    const summary = {
      totalChecked: results.length,
      found: results.filter(r => r.found).length,
      notFound: results.filter(r => !r.found).length,
      optedOut: results.filter(r => r.isOptedOut).length,
      canReceiveEmails: results.filter(r => r.found && !r.isOptedOut).length,
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      results,
    });
  } catch (error) {
    console.error('Error checking opt-out status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check opt-out status',
        details: String(error)
      },
      { status: 500 }
    );
  }
}

// Also support POST with custom email list
export async function POST(request: Request) {
  // Require CRON_SECRET for authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const emailsToCheck: string[] = body.emails || [];

    if (!emailsToCheck.length) {
      return NextResponse.json(
        { success: false, error: 'No emails provided' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Home!C:BM',
    });

    const rows = response.data.values || [];
    const results: OptOutStatus[] = [];

    const emailMap = new Map<string, { rowIndex: number; row: string[] }>();

    for (let i = 1; i < rows.length; i++) {
      const rowEmail = rows[i][0];
      if (rowEmail) {
        emailMap.set(rowEmail.toLowerCase().trim(), { rowIndex: i, row: rows[i] });
      }
    }

    for (const email of emailsToCheck) {
      const normalizedEmail = email.toLowerCase().trim();
      const match = emailMap.get(normalizedEmail);

      if (match) {
        const row = match.row;
        const rowNumber = match.rowIndex + 1;

        const unsubscribedTimestamp = row[45] || '';
        const manualStop = row[54] || '';
        const autoStopped = row[62] || '';

        let isOptedOut = false;
        let optOutReason: string | undefined;

        if (unsubscribedTimestamp && unsubscribedTimestamp.toString().trim() !== '') {
          isOptedOut = true;
          optOutReason = `Unsubscribed (Column AV): ${unsubscribedTimestamp}`;
        } else if (manualStop && manualStop.toString().toUpperCase() === 'STOP') {
          isOptedOut = true;
          optOutReason = 'Manual STOP (Column BE)';
        } else if (autoStopped && autoStopped.toString().toUpperCase() === 'YES') {
          isOptedOut = true;
          optOutReason = 'Auto-Stopped (Column BM): 3 unopened emails';
        }

        results.push({
          email,
          found: true,
          rowNumber,
          unsubscribedTimestamp: unsubscribedTimestamp || undefined,
          manualStop: manualStop || undefined,
          autoStopped: autoStopped || undefined,
          isOptedOut,
          optOutReason,
        });
      } else {
        results.push({
          email,
          found: false,
          isOptedOut: false,
          optOutReason: 'Email not found in database',
        });
      }
    }

    const summary = {
      totalChecked: results.length,
      found: results.filter(r => r.found).length,
      notFound: results.filter(r => !r.found).length,
      optedOut: results.filter(r => r.isOptedOut).length,
      canReceiveEmails: results.filter(r => r.found && !r.isOptedOut).length,
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      results,
    });
  } catch (error) {
    console.error('Error checking opt-out status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check opt-out status',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
