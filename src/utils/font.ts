import fs from 'fs';
import path from 'path';

/**
 * Load custom font and convert to base64
 */
export function loadCustomFont(): string {
  try {
    // Try to load from different possible locations
    const possiblePaths = [
      path.join(process.cwd(), 'src/fonts/PingFangSC-Regular.ttf'),
      path.join(__dirname, '../../fonts/PingFangSC-Regular.ttf'),
      path.join(process.cwd(), '.next/standalone/src/fonts/PingFangSC-Regular.ttf'),
    ];

    for (const fontPath of possiblePaths) {
      if (fs.existsSync(fontPath)) {
        const fontBuffer = fs.readFileSync(fontPath);
        const fontBase64 = fontBuffer.toString('base64');
        return `data:font/ttf;base64,${fontBase64}`;
      }
    }

    console.warn('Custom font not found, using fallback fonts');
    return '';
  } catch (error) {
    console.error('Error loading custom font:', error);
    return '';
  }
}

/**
 * Generate @font-face CSS with custom font
 */
export function generateFontFaceCSS(): string {
  const fontData = loadCustomFont();

  if (!fontData) {
    return '';
  }

  return `
    @font-face {
      font-family: 'PingFang SC';
      font-style: normal;
      font-weight: 400;
      src: url('${fontData}') format('truetype');
    }
  `;
}