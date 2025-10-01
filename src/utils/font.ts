/**
 * Generate @font-face CSS with web fonts
 * Edge Runtime doesn't support fs/path, so use CDN fonts instead
 */
export function generateFontFaceCSS(): string {
  // Use CDN-hosted Chinese fonts for Edge Runtime compatibility
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

    /* Fallback to system fonts if CDN is unavailable */
    body, .markdown-body {
      font-family: 'Noto Sans SC', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif !important;
    }
  `;
}