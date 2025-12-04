import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, householdVouchers, primaryName, customerId } = await request.json();

    if (!email || !householdVouchers || householdVouchers.length === 0) {
      return NextResponse.json(
        { error: 'Email and household vouchers are required' },
        { status: 400 }
      );
    }

    // Generate referral link using primary person's name + Customer ID for tracking
    const referralName = primaryName || householdVouchers[0]?.name || 'Friend';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const cidParam = customerId ? `&cid=${customerId}` : '';
    const referralLink = `https://smilemoore.co.uk?ref=${encodeURIComponent(referralName.split(' ')[0])}-${randomNum}${cidParam}`;

    // Build HTML for voucher codes table
    const voucherRows = householdVouchers.map((member: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #1f3a33;">
          ${member.name}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #70d490; text-align: center;">
          ${member.voucherCode}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Family Vouchers - SmileMoore Dental</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1f3a33; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Family Vouchers Claimed!</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            Congratulations! You've successfully claimed vouchers for your entire household. Here are all your voucher codes:
          </p>

          <!-- Vouchers Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #f0f8f4; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #cfe8d7;">
                <th style="padding: 15px; text-align: left; color: #1f3a33; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Name
                </th>
                <th style="padding: 15px; text-align: center; color: #1f3a33; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Voucher Code
                </th>
              </tr>
            </thead>
            <tbody>
              ${voucherRows}
            </tbody>
          </table>

          <!-- Important Info Box -->
          <div style="background-color: #fff7e6; border-left: 4px solid #ffd700; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1f3a33; font-size: 16px;">
              📋 Important Information:
            </p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666; line-height: 1.8;">
              <li>Each voucher code is worth <strong>£50</strong> towards dental treatment</li>
              <li>Valid for 12 months from today</li>
              <li>Can be used towards any dental treatment or service</li>
              <li>One voucher per person, per visit</li>
            </ul>
          </div>

          <!-- How to Redeem -->
          <div style="margin: 30px 0;">
            <h2 style="color: #1f3a33; font-size: 20px; margin-bottom: 15px;">How to Redeem:</h2>
            <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li>Book an appointment by calling us or visiting our website</li>
              <li>Mention your voucher code when booking</li>
              <li>Present your voucher code at your appointment</li>
              <li>Enjoy £50 off your treatment!</li>
            </ol>
          </div>

          <!-- Prize Draw Reminder -->
          <div style="background-color: #f0f8f4; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #1f3a33;">
              🏆 <strong>Each family member has 3 entries</strong> in our draw to win 1 Year of FREE Dentistry worth up to £5,000!
            </p>
          </div>

          <!-- Referral Section -->
          <div style="background-color: #cfe8d7; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #1f3a33; font-size: 20px; margin: 0 0 15px 0; text-align: center;">
              🎄 Share with Friends & Family
            </h2>
            <p style="font-size: 15px; color: #1f3a33; margin-bottom: 15px; text-align: center;">
              Give them the chance to win and get a £50 voucher before Christmas!
            </p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #1f3a33;">Your referral link:</p>
              <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 14px; color: #1f3a33; word-break: break-all;">
                ${referralLink}
              </p>
            </div>
            <p style="font-size: 13px; color: #1f3a33; margin: 10px 0 0 0; text-align: center; font-weight: 600;">
              ⭐ Bonus: Receive +10 extra prize draw entries for every friend who claims their voucher!
            </p>
          </div>

          <!-- What Happens Next -->
          <div style="margin: 30px 0;">
            <h2 style="color: #1f3a33; font-size: 20px; margin-bottom: 15px;">📋 What Happens Next?</h2>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li><strong>Keep this voucher code safe</strong> - you'll need it when we open!</li>
              <li>We'll keep you updated as we complete our CQC approval process</li>
              <li>You'll receive updates throughout our practice fit-out</li>
              <li>Once we're ready to see our first patients, we'll send you a booking link</li>
              <li>Use your voucher code when booking to redeem your £50 discount</li>
              <li><strong>Bonus:</strong> Receive +100 prize draw entries when you redeem your voucher!</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://smilemoore.co.uk" style="display: inline-block; background-color: #1f3a33; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Visit SmileMoore Dental
            </a>
          </div>

          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px; line-height: 1.6;">
            Questions? Contact us at info@smilemoore.co.uk or call 01234 567890
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} SmileMoore Dental. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email
    const data = await resend.emails.send({
      from: 'SmileMoore Dental <noreply@smilemoore.co.uk>',
      to: [email],
      subject: `🎉 Your Family Vouchers - ${householdVouchers.length} x £50 Codes Inside!`,
      html: htmlContent,
    });

    console.log(`✅ Family voucher email sent to ${email} with ${householdVouchers.length} codes`);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending family voucher email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
