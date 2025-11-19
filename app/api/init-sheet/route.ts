import { NextResponse } from 'next/server';
import { initializeSheet } from '@/app/lib/googleSheets';

// This endpoint initializes the Google Sheet with headers
// Run this once to set up your sheet
export async function POST() {
  try {
    const success = await initializeSheet();

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Google Sheet initialized successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to initialize sheet' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
