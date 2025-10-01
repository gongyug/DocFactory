import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middleware/auth';
import { checkRateLimit } from '@/middleware/rateLimit';
import { handleError } from '@/utils/errors';
import { validateMarkdown, validateOptions } from '@/utils/validation';
import { convertToHtml } from '@/services/html';
import { HtmlOptions } from '@/types/api';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(request: NextRequest) {
  try {
    // Apply middleware
    validateApiKey(request);
    checkRateLimit(request);

    // Parse request body
    const body = await request.json() as { markdown?: string; options?: HtmlOptions };
    const { markdown, options } = body;

    // Validate input
    validateMarkdown(markdown);
    const validOptions = validateOptions<HtmlOptions>(options, [
      'css',
      'standalone',
    ]);

    // Convert to HTML
    const html = await convertToHtml(markdown, validOptions);

    // Return HTML as JSON
    return NextResponse.json(
      {
        success: true,
        data: {
          html,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}