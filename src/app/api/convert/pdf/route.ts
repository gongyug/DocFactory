import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middleware/auth';
import { checkRateLimit } from '@/middleware/rateLimit';
import { handleError } from '@/utils/errors';
import { validateMarkdown, validateOptions } from '@/utils/validation';
import { convertToPdf } from '@/services/pdf';
import { PDFOptions } from '@/types/api';

export const runtime = 'nodejs';
export const maxDuration = 10; // 10 seconds for Hobby plan

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
    const validOptions = validateOptions<PDFOptions>(options, [
      'format',
      'margin',
      'css',
      'displayHeaderFooter',
      'preferCSSPageSize',
    ]);

    // Convert to PDF
    const pdfBuffer = await convertToPdf(markdown, validOptions);

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}