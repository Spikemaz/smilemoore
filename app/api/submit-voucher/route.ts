import { NextResponse } from 'next/server';
import { addSignup } from '@/app/lib/googleSheets';
import { VoucherCounter } from '@/app/utils/voucherSystem';
import { getTotalSignups } from '@/app/lib/googleSheets';
import { updateVisitorStatus } from '@/app/lib/visitorTracking';

export async function POST(request: Request) {
  try {
    const { email, name, phone, address, campaignSource, timeToSubmit, scrollDepth } = await request.json();

    // Validate required fields - only email is required for initial submission
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get IP address from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

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
      ipAddress: ip,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save signup' },
        { status: 500 }
      );
    }

    // Get Customer ID for linking (it's totalSignups + 1, formatted)
    const customerId = (totalSignups + 1).toString().padStart(5, '0');

    // Update visitor status to "Email Submitted" with time and scroll metrics
    await updateVisitorStatus(
      ip,
      email,
      customerId,
      'Email Submitted',
      timeToSubmit,
      scrollDepth
    );

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
