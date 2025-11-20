import { NextResponse } from 'next/server';
import { addSignup } from '@/app/lib/googleSheets';
import { VoucherCounter } from '@/app/utils/voucherSystem';
import { getTotalSignups } from '@/app/lib/googleSheets';
import { updateVisitorStatus } from '@/app/lib/visitorTracking';

export async function POST(request: Request) {
  try {
    const { email, name, phone, address, campaignSource, timeToSubmit, scrollDepth, referredBy } = await request.json();

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

    // Generate random alphanumeric voucher code
    const customerId = totalSignups + 1;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 for clarity
    let code = '';

    // Generate random 6-character code (e.g., SMILEA4N21K)
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    const voucherCode = `SMILE${code}`;

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
      referredBy: referredBy || '',
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save signup' },
        { status: 500 }
      );
    }

    // Update visitor status to "Email Submitted" with time and scroll metrics
    await updateVisitorStatus(
      ip,
      email,
      customerId.toString().padStart(5, '0'),
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
