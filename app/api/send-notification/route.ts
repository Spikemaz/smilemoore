import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();

    const WEBHOOK_URL = process.env.NOTIFICATION_WEBHOOK_URL;

    if (!WEBHOOK_URL) {
      console.log('Notification webhook not configured');
      return NextResponse.json({ success: false, message: 'Webhook not configured' });
    }

    let message = '';
    let color = 0x70d490; // Default green

    switch (type) {
      case 'email_submitted':
        message = `🎉 New Email Signup!\n\nEmail: ${data.email}\nVoucher: £${data.voucherValue}\nCode: ${data.voucherCode}\nTotal Signups: ${data.totalSignups}`;
        color = 0x1f3a33;
        break;

      case 'survey_4q_completed':
        message = `📋 4 Questions Completed!\n\nName: ${data.name}\nEmail: ${data.email}\nEntries: 2\nTime to complete: ${data.timeToComplete} minutes`;
        color = 0x70d490;
        break;

      case 'survey_10q_completed':
        message = `✅ Full Survey Completed!\n\nName: ${data.name}\nEmail: ${data.email}\nEntries: 3\nDevice: ${data.device}\nTotal time: ${data.totalTime} minutes`;
        color = 0xffd700;
        break;

      case 'referral_conversion':
        message = `🎁 Referral Converted!\n\nReferrer: ${data.referrerName}\nNew signup: ${data.newEmail}\nReferrer now has: ${data.totalReferrals} referrals\nBonus entries: +10 (${data.totalEntries} total)`;
        color = 0xff6b6b;
        break;

      default:
        message = `📢 Event: ${type}\n\nData: ${JSON.stringify(data, null, 2)}`;
    }

    // Send to Discord/Slack webhook format
    const payload = {
      embeds: [{
        title: getTitle(type),
        description: message,
        color: color,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Smile Moore Dashboard',
        },
      }],
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

function getTitle(type: string): string {
  const titles: Record<string, string> = {
    'email_submitted': '📧 New Email Signup',
    'survey_4q_completed': '📋 Survey Progress',
    'survey_10q_completed': '✅ Full Survey Complete',
    'referral_conversion': '🎁 Referral Success',
  };
  return titles[type] || '📢 System Notification';
}
