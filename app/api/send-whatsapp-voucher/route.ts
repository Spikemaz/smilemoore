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

    // Format phone number for WhatsApp (remove spaces, ensure starts with country code)
    let formattedPhone = phone.replace(/\s+/g, '');

    // If doesn't start with +, assume UK and add +44
    if (!formattedPhone.startsWith('+')) {
      // Remove leading 0 if present
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      formattedPhone = '+44' + formattedPhone;
    }

    // Create personalized WhatsApp message
    const message = `Hi ${firstName || 'there'}! 🎉

Thanks for entering SmileMoore's Holiday Giveaway!

Your voucher code is: *${voucherCode}*

Show this code at SmileMoore to claim your prize! 🎁

Good luck in the draw! 🍀`;

    // Use WhatsApp Business API via wa.me link format
    // This opens WhatsApp with pre-filled message - requires manual send
    const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;

    // For actual automated sending, you would integrate with:
    // - WhatsApp Business API (official, requires approval)
    // - Twilio WhatsApp API
    // - Other third-party WhatsApp services

    // For now, we'll use a service like Twilio (you'll need to add credentials)
    // Uncomment and configure when ready:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      from: `whatsapp:${twilioWhatsApp}`,
      to: `whatsapp:${formattedPhone}`,
      body: message
    });
    */

    // Log for tracking
    console.log(`📱 WhatsApp voucher ready for ${formattedPhone}: ${voucherCode}`);

    return NextResponse.json({
      success: true,
      phone: formattedPhone,
      whatsappUrl,
      message: 'WhatsApp message prepared'
    });

  } catch (error) {
    console.error('Error sending WhatsApp voucher:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp voucher' },
      { status: 500 }
    );
  }
}
