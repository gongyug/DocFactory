import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { ImageOptions } from '@/types/api';
import { AppError } from '@/utils/errors';
import { parseMarkdown, generateStyledHtml } from './markdown';

// Chromium configuration based on environment
async function getChromiumConfig() {
  // In Docker/local environment, use system chromium
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    console.log('Using system chromium:', process.env.PUPPETEER_EXECUTABLE_PATH);
    return {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
      headless: true,
    };
  }

  // In Vercel/serverless, use @sparticuz/chromium
  console.log('Loading @sparticuz/chromium for serverless environment');
  try {
    const executablePath = await chromium.executablePath();
    console.log('Chromium executable path:', executablePath);

    return {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
    };
  } catch (error) {
    console.error('Failed to load @sparticuz/chromium:', error);
    throw new AppError(
      'INTERNAL_ERROR',
      'Failed to initialize browser',
      'Chromium binary could not be loaded. This API requires a serverless-compatible browser.'
    );
  }
}

/**
 * Convert HTML to Image using Puppeteer
 */
export async function convertToImage(
  markdown: string,
  options: ImageOptions = {}
): Promise<Buffer> {
  let browser = null;

  try {
    const config = await getChromiumConfig();

    // Launch browser
    browser = await puppeteer.launch(config);

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