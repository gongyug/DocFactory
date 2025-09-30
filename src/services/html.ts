import { HtmlOptions } from '@/types/api';
import { parseMarkdown, generateStyledHtml } from './markdown';

/**
 * Convert Markdown to HTML
 */
export async function convertToHtml(
  markdown: string,
  options: HtmlOptions = {}
): Promise<string> {
  const html = await parseMarkdown(markdown);

  if (options.standalone) {
    return generateStyledHtml(html, options.css || '');
  }

  return html;
}