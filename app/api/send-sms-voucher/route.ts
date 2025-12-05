import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, voucherCode, firstName } = await request.json();

    if (!phone || !voucherCode) {
      return NextResponse.json(
        { error: 'Phone number and voucher code are required' },
        { status: 400 }
      );
    }

    // Format phone number for SMS (remove spaces, ensure starts with country code)
    let formattedPhone = phone.replace(/\s+/g, '');

    // If doesn't start with +, assume UK and add +44
    if (!formattedPhone.startsWith('+')) {
      // Remove leading 0 if present
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      formattedPhone = '+44' + formattedPhone;
    }

    // Create concise SMS message (160 character limit for best delivery)
    const message = `Hi ${firstName || 'there'}! Your SmileMoore voucher code: ${voucherCode}. Show this at SmileMoore to claim your £50 prize! Good luck in the draw!`;

    // Twilio SMS API
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.log('📱 SMS would send to:', formattedPhone);
      console.log('📝 Message:', message);
      return NextResponse.json({
        success: true,
        phone: formattedPhone,
        message: 'SMS credentials not configured - logged to console',
        messagePreview: message
      });
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhone,
        Body: message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send SMS');
    }

    console.log(`✅ SMS sent to ${formattedPhone}: ${voucherCode}`);

    return NextResponse.json({
      success: true,
      phone: formattedPhone,
      messageSid: result.sid,
      status: result.status
    });

  } catch (error) {
    console.error('Error sending SMS voucher:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS voucher' },
      { status: 500 }
    );
  }
}
