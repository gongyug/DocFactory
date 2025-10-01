import { marked } from 'marked';
import hljs from 'highlight.js';
import { AppError } from '@/utils/errors';
import { generateFontFaceCSS } from '@/utils/font';

/**
 * Configure marked with syntax highlighting
 */
marked.setOptions({
  breaks: true,
  gfm: true, // GitHub Flavored Markdown
});

// Custom renderer for code highlighting
const renderer = new marked.Renderer();
const originalCode = renderer.code.bind(renderer);
renderer.code = function (code: string, language: string | undefined, escaped: boolean) {
  if (language && hljs.getLanguage(language)) {
    try {
      const highlighted = hljs.highlight(code, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    } catch (err) {
      console.error('Highlight error:', err);
    }
  }
  return originalCode(code, language, escaped);
};

marked.use({ renderer });

/**
 * Parse Markdown to HTML
 */
export async function parseMarkdown(markdown: string): Promise<string> {
  try {
    const html = await marked.parse(markdown);
    return html;
  } catch (error) {
    throw new AppError(
      'INVALID_MARKDOWN',
      'Failed to parse markdown',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Generate styled HTML document
 */
export function generateStyledHtml(
  html: string,
  customCss: string = '',
  standalone: boolean = true
): string {
  if (!standalone) {
    return html;
  }

  // Load custom font
  const fontFaceCSS = generateFontFaceCSS();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css">
  <style>
    ${fontFaceCSS}

    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    .markdown-body {
      box-sizing: border-box;
    }
    /* Code blocks with Chinese font support */
    pre, code, .hljs {
      font-family: 'Noto Sans SC', 'PingFang SC', 'Source Code Pro', 'Monaco', 'Menlo', 'Consolas', monospace !important;
    }
    @media (max-width: 767px) {
      body {
        padding: 15px;
      }
    }
    ${customCss}
  </style>
</head>
<body>
  <article class="markdown-body">
    ${html}
  </article>
</body>
</html>`;
}