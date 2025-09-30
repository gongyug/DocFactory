import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middleware/auth';
import { checkRateLimit } from '@/middleware/rateLimit';
import { handleError } from '@/utils/errors';
import { validateMarkdown, validateOptions } from '@/utils/validation';
import { convertToDocx } from '@/services/docx';
import { DocxOptions } from '@/types/api';

export const runtime = 'nodejs';
export const maxDuration = 10;

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
    const validOptions = validateOptions<DocxOptions>(options, [
      'pageSize',
      'orientation',
    ]);

    // Convert to DOCX
    const docxBuffer = await convertToDocx(markdown, validOptions);

    // Return DOCX
    return new NextResponse(docxBuffer as any, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="document.docx"',
        'Content-Length': docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}