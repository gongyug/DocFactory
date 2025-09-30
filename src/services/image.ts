import puppeteer from 'puppeteer-core';
import { ImageOptions } from '@/types/api';
import { AppError } from '@/utils/errors';
import { parseMarkdown, generateStyledHtml } from './markdown';

// Chromium configuration based on environment
async function getChromiumConfig() {
  // In Docker/local environment, use system chromium
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
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
  try {
    const chromium = require('@sparticuz/chromium');
    return {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    };
  } catch (error) {
    console.error('Failed to load @sparticuz/chromium:', error);
    // Fallback to system chromium
    return {
      executablePath: '/usr/bin/chromium-browser',
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