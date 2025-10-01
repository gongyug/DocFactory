import puppeteer from '@cloudflare/puppeteer';
import { ImageOptions } from '@/types/api';
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
 * Convert HTML to Image using Puppeteer
 */
export async function convertToImage(
  markdown: string,
  options: ImageOptions = {},
  env?: any
): Promise<Buffer> {
  let browser = null;

  try {
    // Launch browser with Cloudflare Browser Rendering
    browser = await getBrowser(env);

    const page = await browser.newPage();

    // Set viewport if width is specified
    if (options.width) {
      await page.setViewport({
        width: options.width,
        height: 1080, // Will be adjusted to content
        deviceScaleFactor: 2, // For better quality
      });
    }

    // Parse markdown to HTML
    const html = await parseMarkdown(markdown);
    const styledHtml = generateStyledHtml(html, options.css || '');

    // Set content
    await page.setContent(styledHtml, {
      waitUntil: 'networkidle0',
    });

    // Take screenshot
    const screenshot = await page.screenshot({
      type: options.format === 'jpeg' ? 'jpeg' : 'png',
      fullPage: true,
      omitBackground: options.transparent || false,
      quality: options.format === 'jpeg' ? options.quality || 90 : undefined,
    });

    return Buffer.from(screenshot);
  } catch (error) {
    console.error('Image conversion error:', error);
    throw new AppError(
      'CONVERSION_FAILED',
      'Failed to convert markdown to image',
      error instanceof Error ? error.message : 'Unknown error'
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}