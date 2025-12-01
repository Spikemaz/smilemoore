import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { templateType, variation, field, value } = await request.json();

    if (!templateType || !field || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine which file to update
    let filePath: string;
    let searchPattern: RegExp;
    let replacePattern: string;

    if (templateType === '4q' || templateType === '10q' || templateType === 'christmas') {
      // Follow-up emails
      filePath = join(process.cwd(), 'app', 'api', 'send-follow-ups', 'route.ts');
      const fileContent = readFileSync(filePath, 'utf-8');

      if (templateType === 'christmas') {
        // Christmas email
        if (field === 'subject') {
          searchPattern = /subject:\s*"🎄[^"]*"/;
          replacePattern = `subject: "${value}"`;
        } else if (field === 'body') {
          // Escape special characters for regex
          const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          searchPattern = /body:\s*\(name:\s*string,\s*voucherValue:\s*number\)\s*=>\s*`[^`]*`/s;
          replacePattern = `body: (name: string, voucherValue: number) => \`${value}\``;
        }
      } else {
        // 4Q or 10Q variations
        const arrayName = templateType === '4q' ? 'fourQuestionVariations' : 'tenQuestionVariations';
        const index = parseInt(variation || '0');

        if (field === 'subject') {
          // Find the specific variation and update subject
          const variationPattern = new RegExp(
            `(const ${arrayName} = \\[(?:[\\s\\S]*?\\{[\\s\\S]*?){${index}}[\\s\\S]*?subject:\\s*)"[^"]*"`,
            ''
          );
          replacePattern = `$1"${value}"`;
          searchPattern = variationPattern;
        } else if (field === 'body') {
          // Find the specific variation and update body
          const variationPattern = new RegExp(
            `(const ${arrayName} = \\[(?:[\\s\\S]*?\\{[\\s\\S]*?){${index}}[\\s\\S]*?body:[\\s\\S]*?=>[\\s\\S]*?\`)[^\\`]*(\`[\\s\\S]*?\\})`,
            ''
          );
          replacePattern = `$1${value}$2`;
          searchPattern = variationPattern;
        }
      }

      // Apply the update
      const updatedContent = fileContent.replace(searchPattern, replacePattern);

      if (updatedContent === fileContent) {
        return NextResponse.json(
          { error: 'Pattern not found - template may have changed' },
          { status: 400 }
        );
      }

      writeFileSync(filePath, updatedContent, 'utf-8');

      return NextResponse.json({
        success: true,
        message: 'Template updated successfully',
        filePath: 'app/api/send-follow-ups/route.ts',
      });
    }

    return NextResponse.json(
      { error: 'Invalid template type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { error: 'Failed to update template', details: String(error) },
      { status: 500 }
    );
  }
}
