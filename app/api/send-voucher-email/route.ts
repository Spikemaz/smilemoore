import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { email, name, voucherCode, voucherValue } = await request.json();

    if (!email || !name || !voucherCode || !voucherValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - email not sent');
      return NextResponse.json({
        success: false,
        message: 'Email service not configured',
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Smile Moore Reception <reception@smilemoore.co.uk>',
      to: [email],
      replyTo: 'reception@smilemoore.co.uk',
      subject: `Your £${voucherValue} Smile Moore Voucher - ${voucherCode}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Smile Moore Voucher</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(to right, #1f3a33, #70d490); padding: 40px 20px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Smile Moore</h1>
                      </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f3a33; font-size: 24px;">Congratulations, ${name}! 🎉</h2>

                        <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 24px;">
                          Thank you for claiming your voucher! Your £${voucherValue} voucher is confirmed and ready to use.
                        </p>

                        <!-- Voucher Code Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td style="background-color: #cfe8d7; border-radius: 8px; padding: 30px; text-align: center;">
                              <p style="margin: 0 0 10px 0; color: #1f3a33; font-size: 14px; font-weight: bold;">YOUR VOUCHER CODE</p>
                              <p style="margin: 0; color: #1f3a33; font-size: 36px; font-weight: bold; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                                ${voucherCode}
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 24px;">
                          <strong>What Happens Next?</strong>
                        </p>

                        <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 28px;">
                          <li>Keep this voucher code safe - you'll need it when we open!</li>
                          <li>We'll keep you updated as we complete our CQC approval process</li>
                          <li>You'll receive updates throughout our practice fit-out</li>
                          <li>Once we're ready to see our first patients, we'll send you a booking link</li>
                          <li>Use your voucher code when booking to redeem your £${voucherValue} discount</li>
                        </ul>

                        <!-- Prize Draw Section -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td style="background-color: #cfe8d7; border-radius: 8px; padding: 25px; text-align: center;">
                              <h3 style="margin: 0 0 15px 0; color: #1f3a33; font-size: 20px;">🎁 You're Entered to Win!</h3>
                              <p style="margin: 0 0 15px 0; color: #1f3a33; font-size: 16px; line-height: 24px;">
                                You have <strong>3 entries</strong> in our draw to win <strong>1 Year of FREE Dentistry worth £2,000!</strong>
                              </p>
                              <p style="margin: 0; color: #1f3a33; font-size: 16px; line-height: 24px;">
                                Want <strong>+10 bonus entries?</strong> Share your unique referral link with friends!
                              </p>
                            </td>
                          </tr>
                        </table>

                        <!-- Referral Link Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #cfe8d7;">
                              <p style="margin: 0 0 10px 0; color: #1f3a33; font-size: 14px; font-weight: bold;">YOUR REFERRAL LINK</p>
                              <p style="margin: 0 0 15px 0; color: #1f3a33; font-size: 14px; word-break: break-all;">
                                https://smilemoore.co.uk?ref=${encodeURIComponent(name)}-${Math.floor(100 + Math.random() * 900)}
                              </p>
                              <p style="margin: 0; color: #666666; font-size: 13px; line-height: 20px;">
                                Share this link and get <strong>+10 entries</strong> for every friend who claims their voucher!
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                          If you have any questions, please reply to this email and we'll be happy to help.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                          © ${new Date().getFullYear()} Smile Moore. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #999999; font-size: 12px;">
                          This email was sent because you claimed a voucher on our website.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Voucher email sent successfully',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Error sending voucher email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
