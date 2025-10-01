import puppeteer from '@cloudflare/puppeteer';
import { PDFOptions } from '@/types/api';
import { AppError } from '@/utils/errors';
import { parseMarkdown, generateStyledHtml } from './markdown';

// Get browser instance for Cloudflare environment
async function getBrowser(env?: any) {
  try {
    // For Cloudflare Pages/Workers with Browser Rendering
    if (env?.BROWSER) {
      console.log('Using Cloudflare Browser Rendering API');
      return await puppeteer.launch(env.BROWSER);
    }

    // For local development - use local puppeteer
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Browser Rendering not available locally');
      throw new AppError(
        'INTERNAL_ERROR',
        'Browser Rendering requires Cloudflare environment',
        'Please use `npm run preview` with wrangler for local testing'
      );
    }

    throw new AppError(
      'INTERNAL_ERROR',
      'Browser not available',
      'BROWSER binding not found. Please configure Browser Rendering in wrangler.toml'
    );
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error('Failed to initialize browser:', error);
    throw new AppError(
      'INTERNAL_ERROR',
      'Failed to initialize browser',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Convert HTML to PDF using Puppeteer
 */
export async function convertToPdf(
  markdown: string,
  options: PDFOptions = {},
  env?: any
): Promise<Buffer> {
  let browser = null;

  try {
    // Launch browser with Cloudflare Browser Rendering
    browser = await getBrowser(env);

    const page = await browser.newPage();

    // Parse markdown to HTML
    const html = await parseMarkdown(markdown);
    const styledHtml = generateStyledHtml(html, options.css || '');

    // Set content
    await page.setContent(styledHtml, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: (options.format || 'A4') as any,
      margin: {
        top: options.margin || '20px',
        right: options.margin || '20px',
        bottom: options.margin || '20px',
        left: options.margin || '20px',
      },
      displayHeaderFooter: options.displayHeaderFooter || false,
      preferCSSPageSize: options.preferCSSPageSize || false,
      printBackground: true,
    });

    return Buffer.from(pdf);
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new AppError(
      'CONVERSION_FAILED',
      'Failed to convert markdown to PDF',
      error instanceof Error ? error.message : 'Unknown error'
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}