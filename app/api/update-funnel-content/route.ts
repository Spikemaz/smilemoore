import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { funnel, content } = await request.json();

    // Validate inputs
    if (!funnel || !content) {
      return NextResponse.json(
        { error: 'Missing funnel or content' },
        { status: 400 }
      );
    }

    // Determine which file to update
    const filePath = funnel === 'main'
      ? path.join(process.cwd(), 'app', 'page.tsx')
      : path.join(process.cwd(), 'app', 'earlybird', 'page.tsx');

    // Read the current file
    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // Update hero section
    if (content.hero) {
      // Update headline
      if (content.hero.headline) {
        fileContent = fileContent.replace(
          /Claim Your £50 Voucher Today!/g,
          content.hero.headline
        );
      }

      // Update subheadline
      if (content.hero.subheadline) {
        fileContent = fileContent.replace(
          /Join hundreds of local families who have already claimed their voucher\. Plus, enter our prize draw to win 1 Year of FREE Dentistry worth up to £5,000!/g,
          content.hero.subheadline
        );
      }

      // Update CTA button text
      if (content.hero.cta) {
        fileContent = fileContent.replace(
          /Claim My £50 Voucher/g,
          content.hero.cta
        );
      }
    }

    // Update prize section
    if (content.prize) {
      if (content.prize.headline) {
        fileContent = fileContent.replace(
          /Win 1 Year of FREE Dentistry!/g,
          content.prize.headline
        );
      }

      if (content.prize.description) {
        fileContent = fileContent.replace(
          /Enter our exclusive prize draw for a chance to win 1 Year of FREE Dentistry worth up to £5,000! Simply claim your voucher and answer a few quick questions to earn entries\./g,
          content.prize.description
        );
      }
    }

    // Update referral section
    if (content.referral) {
      if (content.referral.headline) {
        fileContent = fileContent.replace(
          /Share & Earn Bonus Entries!/g,
          content.referral.headline
        );
      }

      if (content.referral.description) {
        fileContent = fileContent.replace(
          /Earn \+10 bonus entries for every friend or family member who claims their voucher using your unique referral link\. The more you share, the better your chances of winning!/g,
          content.referral.description
        );
      }
    }

    // Write the updated content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `${funnel === 'main' ? 'Main' : 'Early Bird'} funnel updated successfully`,
      file: filePath
    });

  } catch (error: any) {
    console.error('Error updating funnel content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update funnel content' },
      { status: 500 }
    );
  }
}
