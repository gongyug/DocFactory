import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageSize,
  PageOrientation,
  BorderStyle,
} from 'docx';
import { marked } from 'marked';
import { DocxOptions } from '@/types/api';
import { AppError } from '@/utils/errors';

/**
 * Parse inline tokens to TextRun array
 * Handles bold, italic, code, links, etc.
 */
function parseInlineTokens(tokens: any[]): TextRun[] {
  const runs: TextRun[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        runs.push(new TextRun({
          text: token.text,
        }));
        break;

      case 'strong':
        // Bold text: **bold**
        if (token.tokens) {
          // Recursively parse nested tokens and apply bold
          const nestedRuns = parseInlineTokens(token.tokens);
          // Extract text from nested runs and create new bold runs
          nestedRuns.forEach((_, index) => {
            const nestedTokens = token.tokens;
            if (nestedTokens[index] && nestedTokens[index].text) {
              runs.push(new TextRun({
                text: nestedTokens[index].text,
                bold: true,
              }));
            }
          });
        } else if (token.text) {
          runs.push(new TextRun({
            text: token.text,
            bold: true,
          }));
        }
        break;

      case 'em':
        // Italic text: *italic*
        if (token.tokens) {
          const nestedRuns = parseInlineTokens(token.tokens);
          nestedRuns.forEach((_, index) => {
            const nestedTokens = token.tokens;
            if (nestedTokens[index] && nestedTokens[index].text) {
              runs.push(new TextRun({
                text: nestedTokens[index].text,
                italics: true,
              }));
            }
          });
        } else if (token.text) {
          runs.push(new TextRun({
            text: token.text,
            italics: true,
          }));
        }
        break;

      case 'codespan':
        // Inline code: `code`
        runs.push(new TextRun({
          text: token.text,
          font: 'Courier New',
          color: 'C7254E',
          shading: {
            type: 'solid',
            color: 'F9F2F4',
          },
        }));
        break;

      case 'link':
        // Link: [text](url)
        if (token.tokens) {
          const nestedRuns = parseInlineTokens(token.tokens);
          nestedRuns.forEach((_, index) => {
            const nestedTokens = token.tokens;
            if (nestedTokens[index] && nestedTokens[index].text) {
              runs.push(new TextRun({
                text: nestedTokens[index].text,
                color: '0066CC',
                underline: {},
              }));
            }
          });
        } else if (token.text) {
          runs.push(new TextRun({
            text: token.text,
            color: '0066CC',
            underline: {},
          }));
        }
        break;

      case 'br':
        // Line break
        runs.push(new TextRun({
          text: '',
          break: 1,
        }));
        break;

      case 'space':
        runs.push(new TextRun({
          text: ' ',
        }));
        break;

      default:
        // Fallback for unknown types
        if (token.text) {
          runs.push(new TextRun({
            text: token.text,
          }));
        }
    }
  }

  return runs;
}

/**
 * Parse list items recursively
 */
function parseListItems(items: any[], level: number = 0): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const item of items) {
    // Parse inline content in list item
    let runs: TextRun[] = [];

    if (item.tokens && item.tokens.length > 0) {
      // Process all tokens in the list item
      for (const itemToken of item.tokens) {
        if (itemToken.type === 'text') {
          // Text with inline formatting
          if (itemToken.tokens) {
            runs.push(...parseInlineTokens(itemToken.tokens));
          } else {
            runs.push(new TextRun(itemToken.text));
          }
        } else if (itemToken.type === 'paragraph') {
          // Paragraph inside list item
          if (itemToken.tokens) {
            runs.push(...parseInlineTokens(itemToken.tokens));
          }
        }
      }
    } else if (item.text) {
      runs.push(new TextRun(item.text));
    }

    paragraphs.push(
      new Paragraph({
        children: runs,
        bullet: { level },
        spacing: { before: 60, after: 60 },
      })
    );

    // Handle nested lists
    if (item.task !== undefined) {
      // Task list item
      const checkbox = item.checked ? '☑' : '☐';
      runs.unshift(new TextRun({ text: checkbox + ' ' }));
    }
  }

  return paragraphs;
}

/**
 * Parse markdown tokens and convert to docx elements
 */
function parseTokensToDocx(tokens: any[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        // Heading: # H1, ## H2, etc.
        const headingLevels = [
          HeadingLevel.HEADING_1,
          HeadingLevel.HEADING_2,
          HeadingLevel.HEADING_3,
          HeadingLevel.HEADING_4,
          HeadingLevel.HEADING_5,
          HeadingLevel.HEADING_6,
        ];
        const level = headingLevels[token.depth - 1] || HeadingLevel.HEADING_6;

        // Parse inline formatting in heading
        const headingRuns = token.tokens ? parseInlineTokens(token.tokens) : [new TextRun(token.text)];

        paragraphs.push(
          new Paragraph({
            children: headingRuns,
            heading: level,
            spacing: { before: 240, after: 120 },
          })
        );
        break;

      case 'paragraph':
        // Regular paragraph
        const paraRuns = token.tokens ? parseInlineTokens(token.tokens) : [new TextRun(token.text)];

        paragraphs.push(
          new Paragraph({
            children: paraRuns,
            spacing: { before: 120, after: 120 },
          })
        );
        break;

      case 'code':
        // Code block: ```language\ncode\n```
        const codeLines = token.text.split('\n');

        // Add language label if present
        if (token.lang) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[${token.lang}]`,
                  color: '999999',
                  italics: true,
                }),
              ],
              spacing: { before: 120, after: 0 },
            })
          );
        }

        // Add code content with monospace font
        for (const line of codeLines) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ', // Empty line needs at least a space
                  font: 'Courier New',
                  size: 20, // 10pt
                }),
              ],
              shading: {
                type: 'solid',
                color: 'F5F5F5',
              },
              spacing: { before: 0, after: 0 },
              indent: { left: 360 }, // Indent code block
            })
          );
        }

        // Add spacing after code block
        paragraphs.push(
          new Paragraph({
            children: [new TextRun('')],
            spacing: { before: 0, after: 120 },
          })
        );
        break;

      case 'blockquote':
        // Blockquote: > quote
        if (token.tokens) {
          const quoteParas = parseTokensToDocx(token.tokens);
          // Simply add indentation and border to blockquote paragraphs
          paragraphs.push(...quoteParas.map(p =>
            new Paragraph({
              ...p,
              indent: { left: 720 },
              border: {
                left: {
                  style: BorderStyle.SINGLE,
                  size: 6,
                  color: 'CCCCCC',
                },
              },
            })
          ));
        }
        break;

      case 'list':
        // List: - item or 1. item
        const listParas = parseListItems(token.items, 0);
        paragraphs.push(...listParas);
        break;

      case 'hr':
        // Horizontal rule: ---
        paragraphs.push(
          new Paragraph({
            children: [new TextRun('')],
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'CCCCCC',
              },
            },
            spacing: { before: 240, after: 240 },
          })
        );
        break;

      case 'space':
        // Empty line
        paragraphs.push(
          new Paragraph({
            children: [new TextRun('')],
            spacing: { before: 60, after: 60 },
          })
        );
        break;

      default:
        // Fallback for unknown types
        if (token.text) {
          paragraphs.push(
            new Paragraph({
              text: token.text,
              spacing: { before: 120, after: 120 },
            })
          );
        }
    }
  }

  return paragraphs;
}

/**
 * Convert Markdown to DOCX
 */
export async function convertToDocx(
  markdown: string,
  options: DocxOptions = {}
): Promise<Buffer> {
  try {
    // Parse markdown with full token structure
    const tokens = marked.lexer(markdown);

    // Debug: log tokens structure
    console.log('Markdown tokens:', JSON.stringify(tokens.slice(0, 3), null, 2));

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