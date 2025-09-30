import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { PDFOptions } from '@/types/api';
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
 * Convert HTML to PDF using Puppeteer
 */
export async function convertToPdf(
  markdown: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  let browser = null;

  try {
    const config = await getChromiumConfig();

    // Launch browser
    browser = await puppeteer.launch(config);

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