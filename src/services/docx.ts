import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageSize,
  PageOrientation,
} from 'docx';
import { marked } from 'marked';
import { DocxOptions } from '@/types/api';
import { AppError } from '@/utils/errors';

interface DocxElement {
  type: 'paragraph' | 'heading' | 'list' | 'code';
  level?: number;
  content: TextRun[];
}

/**
 * Parse markdown tokens and convert to docx elements
 */
function parseTokensToDocx(tokens: any[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const token of tokens) {
    if (token.type === 'heading') {
      const level = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
        HeadingLevel.HEADING_5,
        HeadingLevel.HEADING_6,
      ][token.depth - 1];

      paragraphs.push(
        new Paragraph({
          text: token.text,
          heading: level,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (token.type === 'paragraph') {
      const runs = parseInlineText(token.text);
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { before: 120, after: 120 },
        })
      );
    } else if (token.type === 'code') {
      paragraphs.push(
        new Paragraph({
          text: token.text,
          style: 'code',
          spacing: { before: 120, after: 120 },
        })
      );
    } else if (token.type === 'list') {
      for (const item of token.items) {
        const itemText = item.text;
        paragraphs.push(
          new Paragraph({
            text: itemText,
            bullet: { level: 0 },
            spacing: { before: 60, after: 60 },
          })
        );
      }
    }
  }

  return paragraphs;
}

/**
 * Parse inline text formatting (bold, italic, code)
 */
function parseInlineText(text: string): TextRun[] {
  const runs: TextRun[] = [];

  // Simple regex-based parsing
  // Handle **bold**, *italic*, and `code`
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New' }));
    } else {
      runs.push(new TextRun(part));
    }
  }

  return runs.length > 0 ? runs : [new TextRun(text)];
}

/**
 * Convert Markdown to DOCX
 */
export async function convertToDocx(
  markdown: string,
  options: DocxOptions = {}
): Promise<Buffer> {
  try {
    // Parse markdown
    const tokens = marked.lexer(markdown);
    const paragraphs = parseTokensToDocx(tokens);

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation:
                  options.orientation === 'landscape'
                    ? PageOrientation.LANDSCAPE
                    : PageOrientation.PORTRAIT,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error('DOCX conversion error:', error);
    throw new AppError(
      'CONVERSION_FAILED',
      'Failed to convert markdown to DOCX',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}