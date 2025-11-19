import { NextResponse } from 'next/server';
import { addSignup } from '@/app/lib/googleSheets';
import { VoucherCounter } from '@/app/utils/voucherSystem';
import { getTotalSignups } from '@/app/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const { email, name, phone, address, campaignSource } = await request.json();

    // Validate required fields - only email is required for initial submission
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get current signup count
    const totalSignups = await getTotalSignups();
    const counter = new VoucherCounter(totalSignups);
    const tier = counter.getCurrentTier();
    const batchNumber = Math.floor(totalSignups / 90) + 1;

    // Determine voucher code based on value
    const voucherCode = tier.value > 0 ? `SMILE${tier.value}` : 'FREEDRAW';

    // Add to Google Sheets
    const success = await addSignup({
      email,
      name,
      phone,
      postcode: address,
      campaignSource: campaignSource || 'direct',
      voucherValue: tier.value,
      voucherCode,
      batchNumber,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save signup' },
        { status: 500 }
      );
    }

    // Check if we should announce new batch
    const announcement = counter.shouldReleaseBatch()
      ? counter.getBatchAnnouncementMessage()
      : null;

    return NextResponse.json({
      success: true,
      voucherCode,
      voucherValue: tier.value,
      batchNumber,
      announcement,
      totalSignups: totalSignups + 1,
    });
  } catch (error) {
    console.error('Error submitting voucher:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
