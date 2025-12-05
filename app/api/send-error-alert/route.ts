import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { type, error, data } = await request.json();

    // Send alert email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'info@smilemoore.co.uk';

    let subject = '';
    let message = '';

    switch (type) {
      case 'household_voucher_failed':
        subject = '🚨 URGENT: Household Voucher Creation Failed';
        message = `
          <h2>Household Voucher Creation Failed</h2>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Household Member:</strong> ${data.memberName}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Action Required:</strong> Manually create voucher for this household member</p>
        `;
        break;

      case 'customer_id_duplicate':
        subject = '⚠️ WARNING: Potential Duplicate Customer ID';
        message = `
          <h2>Duplicate Customer ID Detected</h2>
          <p><strong>Customer ID:</strong> ${data.customerId}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `;
        break;

      case 'sheets_update_failed':
        subject = '🔴 CRITICAL: Google Sheets Update Failed';
        message = `
          <h2>Google Sheets Update Failed</h2>
          <p><strong>Operation:</strong> ${data.operation}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Impact:</strong> Data may be incomplete for this user</p>
        `;
        break;

      default:
        subject = '⚠️ System Error Alert';
        message = `
          <h2>System Error</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Data:</strong> ${JSON.stringify(data)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `;
    }

    // Send email alert
    await resend.emails.send({
      from: 'SmileMoore Alerts <alerts@smilemoore.co.uk>',
      to: [adminEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${message}
          </div>
        </body>
        </html>
      `,
    });

    console.log(`📧 Error alert sent: ${type}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send error alert:', error);
    return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 });
  }
}
