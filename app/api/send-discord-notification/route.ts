import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log('Discord webhook not configured - skipping notification');
      return NextResponse.json({ success: false, message: 'Webhook not configured' });
    }

    let embed;
    let content = '';

    switch (type) {
      case 'stage_1_email':
        embed = {
          title: '📧 Stage 1: Email Submitted',
          color: 0x70d490, // Green
          fields: [
            { name: 'Email', value: data.email, inline: false },
            { name: 'Campaign Source', value: data.campaignSource || 'Unknown', inline: true },
            { name: 'Total Signups', value: data.totalSignups?.toString() || '?', inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'SmileMoore Campaign Tracker' }
        };
        break;

      case 'stage_2_name':
        embed = {
          title: '👤 Stage 2: Name Added',
          color: 0x4a90e2, // Blue
          fields: [
            { name: 'Name', value: data.name, inline: true },
            { name: 'Email', value: data.email, inline: true },
            { name: 'Customer ID', value: data.customerId || '?', inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'SmileMoore Campaign Tracker' }
        };
        break;

      case 'stage_3_phone':
        embed = {
          title: '📱 Stage 3: Phone & Address Complete',
          color: 0xf39c12, // Orange
          fields: [
            { name: 'Name', value: data.name, inline: true },
            { name: 'Phone', value: data.phone, inline: true },
            { name: 'Voucher Code', value: `**${data.voucherCode}**`, inline: true },
            { name: 'Voucher Value', value: `£${data.voucherValue}`, inline: true },
            { name: 'Address', value: data.address || 'N/A', inline: false },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'SmileMoore Campaign Tracker' }
        };
        break;

      case 'stage_4_questions':
        embed = {
          title: '✅ Stage 4: First 5 Questions Complete',
          color: 0x9b59b6, // Purple
          fields: [
            { name: 'Name', value: data.name, inline: true },
            { name: 'Email', value: data.email, inline: true },
            { name: 'Draw Entries', value: '2 entries', inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'SmileMoore Campaign Tracker' }
        };
        break;

      case 'stage_5_extended':
        embed = {
          title: '🏆 Stage 5: ALL 10 Questions Complete!',
          color: 0xe74c3c, // Red
          fields: [
            { name: 'Name', value: data.name, inline: true },
            { name: 'Email', value: data.email, inline: true },
            { name: 'Draw Entries', value: '**3 ENTRIES**', inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'SmileMoore Campaign Tracker' }
        };
        break;

      case 'milestone_10':
        content = '🎉 **MILESTONE REACHED!**';
        embed = {
          title: `🎯 ${data.totalSignups} Total Signups!`,
          description: `You just hit **${data.totalSignups}** signups! Keep the momentum going! 🚀`,
          color: 0xffd700, // Gold
          fields: [
            { name: 'Latest Signup', value: data.latestName || 'Unknown', inline: true },
            { name: 'Campaign Source', value: data.campaignSource || 'Unknown', inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'SmileMoore Campaign Tracker' }
        };
        break;

      case 'household_members':
        embed = {
          title: '👨‍👩‍👧‍👦 Family Signups Added!',
          color: 0x3498db, // Light Blue
          fields: [
            { name: 'Primary Member', value: data.primaryName, inline: true },
            { name: 'Family Members', value: data.householdCount?.toString() || '?', inline: true },
            { name: 'Total Vouchers', value: (data.householdCount + 1)?.toString() || '?', inline: true },
          ],
          description: `Family members: ${data.householdNames?.join(', ') || 'Unknown'}`,
          timestamp: new Date().toISOString(),
          footer: { text: 'SmileMoore Campaign Tracker' }
        };
        break;

      default:
        return NextResponse.json({ success: false, message: 'Unknown notification type' });
    }

    // Send to Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content || undefined,
        embeds: [embed],
        username: 'SmileMoore Campaign Bot',
        avatar_url: 'https://smilemoore.co.uk/favicon.ico', // Optional: Add your logo URL
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    console.log(`✅ Discord notification sent: ${type}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return NextResponse.json(
      { error: 'Failed to send Discord notification' },
      { status: 500 }
    );
  }
}
