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
      // 1. Email submitted (first contact)
      case 'email_submitted':
        message = `📧 **New Email Signup!**

Email: ${data.email}
Source: ${data.campaignSource || 'Unknown'}
Total Signups: ${data.totalSignups}`;
        color = 0x70d490; // Green
        break;

      // 2. Phone & Address complete (voucher claimed)
      case 'voucher_claimed':
        message = `✅ **Voucher Claimed!**

Name: ${data.name}
Phone: ${data.phone}
Address: ${data.address}
Voucher: ${data.voucherCode} (£${data.voucherValue})`;
        color = 0x4a90e2; // Blue
        break;

      // 3. First 5 questions completed
      case 'survey_4q_completed':
        message = `📋 **5 Questions Complete!**

Name: ${data.name}
Email: ${data.email}
Draw Entries: 2
Time: ${data.timeToComplete} min`;
        color = 0xf39c12; // Orange
        break;

      // 4. All 10 questions completed
      case 'survey_10q_completed':
        message = `🏆 **FULL SURVEY COMPLETE!**

Name: ${data.name}
Email: ${data.email}
Draw Entries: 3
Device: ${data.device}
Total Time: ${data.totalTime} min`;
        color = 0x9b59b6; // Purple
        break;

      // 5. Milestone every 10 signups
      case 'milestone_signups':
        message = `🎯 **MILESTONE: ${data.totalSignups} SIGNUPS!**

Latest: ${data.latestName}
Source: ${data.campaignSource}

🚀 Keep going!`;
        color = 0xffd700; // Gold
        break;

      // 6. Referral conversion
      case 'referral_conversion':
        message = `🎁 **Referral Success!**

Referrer: ${data.referrerName}
New Signup: ${data.newEmail}
Total Referrals: ${data.totalReferrals}
Bonus Entries: +10 (${data.totalEntries} total)`;
        color = 0xff6b6b; // Red
        break;

      default:
        message = `📢 Event: ${type}

Data: ${JSON.stringify(data, null, 2)}`;
    }

    // Send to Discord webhook
    const payload = {
      embeds: [{
        title: getTitle(type),
        description: message,
        color: color,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SmileMoore Campaign Tracker',
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
    'email_submitted': '📧 New Email',
    'voucher_claimed': '✅ Voucher Claimed',
    'survey_4q_completed': '📋 5 Questions Done',
    'survey_10q_completed': '🏆 Full Survey Complete',
    'milestone_signups': '🎯 MILESTONE!',
    'referral_conversion': '🎁 Referral',
  };
  return titles[type] || '📢 Notification';
}
