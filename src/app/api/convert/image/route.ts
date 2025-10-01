import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { validateApiKey } from '@/middleware/auth';
import { checkRateLimit } from '@/middleware/rateLimit';
import { handleError } from '@/utils/errors';
import { validateMarkdown, validateOptions } from '@/utils/validation';
import { convertToImage } from '@/services/image';
import { ImageOptions } from '@/types/api';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Apply middleware
    validateApiKey(request);
    checkRateLimit(request);

    // Parse request body
    const body = await request.json();
    const { markdown, options } = body;

    // Validate input
    validateMarkdown(markdown);
    const validOptions = validateOptions<ImageOptions>(options, [
      'format',
      'width',
      'quality',
      'transparent',
      'css',
    ]);

    // Get Cloudflare env for Browser Rendering
    const { env } = getRequestContext();

    // Convert to image
    const imageBuffer = await convertToImage(markdown, validOptions, env);

    // Determine content type
    const contentType =
      validOptions.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = validOptions.format === 'jpeg' ? 'jpg' : 'png';

    // Return image
    return new NextResponse(imageBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="document.${ext}"`,
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}