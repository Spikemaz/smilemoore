import { NextResponse } from 'next/server';
import { getCurrentVoucherState } from '@/app/utils/voucherSystem';
import { getTotalSignups } from '@/app/lib/googleSheets';

export async function GET() {
  try {
    // Get real count from Google Sheets
    const totalSignups = await getTotalSignups();
    const state = getCurrentVoucherState(totalSignups);

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching voucher status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voucher status' },
      { status: 500 }
    );
  }
}
