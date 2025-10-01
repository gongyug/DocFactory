# DocFactory API

<p align="center">
  <strong>Lightweight Markdown to PDF/Image/Word/HTML conversion API</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#development">Development</a>
</p>

---

## Features

- ✨ **Multiple Output Formats**: PDF, PNG, JPEG, DOCX, HTML
- 🚀 **Cloudflare Pages Ready**: Deploy to Cloudflare Pages with Browser Rendering API
- 🔒 **Optional API Key Authentication**: Secure your API with custom keys
- ⚡ **Rate Limiting**: Built-in rate limiting (60 req/min by default)
- 🎨 **Custom Styling**: Support for custom CSS
- 💻 **Code Highlighting**: Syntax highlighting with highlight.js
- 📱 **GitHub Flavored Markdown**: Full GFM support
- 🌏 **Chinese Font Support**: Embedded PingFang SC font for perfect Chinese rendering
- 🔧 **TypeScript**: Fully typed codebase

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/gongyug/DocFactory.git
cd DocFactory
```

2. Install dependencies
```bash
npm install
```

3. Copy environment variables
```bash
cp .env.example .env
```

4. Run development server
```bash
npm run dev
```

Your API will be available at `http://localhost:3000`

## API Reference

### Base URL

```
https://docfactory.pages.dev/api
```

### Authentication (Optional)

API 密钥认证是可选的。如果设置了 `API_SECRET_KEY` 环境变量，所有请求都需要携带认证头。

#### 生成 API 密钥

```bash
# 方法 1: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2: 使用 OpenSSL
openssl rand -hex 32

# 输出示例: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### 设置环境变量

**Cloudflare Pages:**
```bash
# 在 Cloudflare Pages 项目设置 -> Environment Variables 中添加
API_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Docker Compose:**
```yaml
# docker-compose.yml
environment:
  - API_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**本地开发:**
```bash
# .env 文件
API_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### 使用 API 密钥

请求时在 `Authorization` 头中包含密钥：

```bash
Authorization: Bearer YOUR_API_KEY
```

### Endpoints

#### 1. Convert to PDF

```http
POST /api/convert/pdf
Content-Type: application/json

{
  "markdown": "# Hello World\n\nThis is a **test** document.",
  "options": {
    "format": "A4",
    "margin": "20px",
    "css": "body { font-family: Arial; }",
    "displayHeaderFooter": false,
    "preferCSSPageSize": false
  }
}
```

**Response**: Binary PDF file

**Options**:
- `format`: `"A4"`, `"Letter"`, `"Legal"` (default: `"A4"`)
- `margin`: CSS margin string (default: `"20px"`)
- `css`: Custom CSS styles
- `displayHeaderFooter`: Show header/footer (default: `false`)
- `preferCSSPageSize`: Use CSS page size (default: `false`)

#### 2. Convert to Image

```http
POST /api/convert/image
Content-Type: application/json

{
  "markdown": "# Hello World",
  "options": {
    "format": "png",
    "width": 800,
    "quality": 90,
    "transparent": false,
    "css": "body { padding: 20px; }"
  }
}
```

**Response**: Binary image file (PNG or JPEG)

**Options**:
- `format`: `"png"` or `"jpeg"` (default: `"png"`)
- `width`: Image width in pixels (default: viewport width)
- `quality`: JPEG quality 1-100 (default: `90`)
- `transparent`: Transparent background for PNG (default: `false`)
- `css`: Custom CSS styles

#### 3. Convert to DOCX

```http
POST /api/convert/docx
Content-Type: application/json

{
  "markdown": "# Hello World\n\nThis is **bold** text",
  "options": {
    "pageSize": "A4",
    "orientation": "portrait"
  }
}
```

**Response**: Binary DOCX file

**Options**:
- `pageSize`: `"A4"` or `"Letter"` (default: `"A4"`)
- `orientation`: `"portrait"` or `"landscape"` (default: `"portrait"`)

#### 4. Convert to HTML

```http
POST /api/convert/html
Content-Type: application/json

{
  "markdown": "# Hello World",
  "options": {
    "css": "body { font-family: Arial; }",
    "standalone": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "html": "<h1>Hello World</h1>"
  }
}
```

**Options**:
- `css`: Custom CSS styles
- `standalone`: Return full HTML document with styles (default: `true`)

#### 5. Health Check

```http
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-09-30T10:00:00Z"
}
```

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details"
  }
}
```

**Error Codes**:
- `INVALID_MARKDOWN`: Markdown content is invalid
- `FILE_TOO_LARGE`: File exceeds 500KB limit
- `CONVERSION_FAILED`: Conversion process failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_PARAMETERS`: Invalid request parameters
- `UNAUTHORIZED`: Invalid or missing API key
- `INTERNAL_ERROR`: Server error

## Usage Examples

### 不带认证的请求

#### cURL

```bash
# PDF
curl -X POST https://docfactory.pages.dev/api/convert/pdf \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World", "options": {"format": "A4"}}' \
  --output document.pdf

# Image
curl -X POST https://docfactory.pages.dev/api/convert/image \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World", "options": {"format": "png"}}' \
  --output document.png

# DOCX
curl -X POST https://docfactory.pages.dev/api/convert/docx \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World"}' \
  --output document.docx
```

### 带 API 密钥认证的请求

如果启用了 API 密钥认证，所有请求需要添加 `Authorization` 头：

#### cURL

```bash
# PDF（带认证）
curl -X POST https://docfactory.pages.dev/api/convert/pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -d '{"markdown": "# Hello World", "options": {"format": "A4"}}' \
  --output document.pdf

# 中文 PDF 示例
curl -X POST https://docfactory.pages.dev/api/convert/pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -d '{
    "markdown": "# 你好世界\n\n这是一个**中文测试**。",
    "options": {"format": "A4"}
  }' \
  --output chinese.pdf
```

#### JavaScript (fetch)

```javascript
// 带 API 密钥
const apiKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

const response = await fetch('https://docfactory.pages.dev/api/convert/pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    markdown: '# Hello World\n\nThis is a **test**.',
    options: {
      format: 'A4',
      margin: '20px'
    }
  })
});

if (!response.ok) {
  const error = await response.json();
  console.error('转换失败:', error);
  throw new Error(error.error.message);
}

const blob = await response.blob();
const url = URL.createObjectURL(blob);
window.open(url);
```

#### Python (requests)

```python
import requests

# API 密钥
api_key = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'

response = requests.post(
    'https://docfactory.pages.dev/api/convert/pdf',
    headers={
        'Authorization': f'Bearer {api_key}'
    },
    json={
        'markdown': '# Hello World\n\nThis is a **test**.',
        'options': {
            'format': 'A4',
            'margin': '20px'
        }
    }
)

if response.status_code == 200:
    with open('document.pdf', 'wb') as f:
        f.write(response.content)
    print('PDF 生成成功')
elif response.status_code == 401:
    print('认证失败: API 密钥无效')
else:
    error = response.json()
    print(f'错误: {error["error"]["message"]}')
```

#### Node.js (axios)

```javascript
const axios = require('axios');
const fs = require('fs');

const apiKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

try {
  const response = await axios.post(
    'https://docfactory.pages.dev/api/convert/pdf',
    {
      markdown: '# Hello World\n\nThis is a **test**.',
      options: {
        format: 'A4',
        margin: '20px'
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      responseType: 'arraybuffer'
    }
  );

  fs.writeFileSync('document.pdf', response.data);
  console.log('PDF 生成成功');
} catch (error) {
  if (error.response?.status === 401) {
    console.error('认证失败: API 密钥无效');
  } else {
    console.error('转换失败:', error.message);
  }
}
```

### 错误处理示例

```javascript
// 完整的错误处理
async function convertMarkdownToPdf(markdown, options = {}) {
  const apiKey = process.env.API_SECRET_KEY;

  try {
    const response = await fetch('https://docfactory.pages.dev/api/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify({ markdown, options })
    });

    if (!response.ok) {
      const error = await response.json();

      switch (error.error.code) {
        case 'UNAUTHORIZED':
          throw new Error('API 密钥无效或缺失');
        case 'RATE_LIMIT_EXCEEDED':
          throw new Error('请求过于频繁，请稍后再试');
        case 'FILE_TOO_LARGE':
          throw new Error('Markdown 内容过大（最大 500KB）');
        case 'INVALID_MARKDOWN':
          throw new Error('Markdown 格式错误');
        default:
          throw new Error(error.error.message);
      }
    }

    return await response.blob();
  } catch (error) {
    console.error('转换失败:', error);
    throw error;
  }
}

// 使用示例
try {
  const blob = await convertMarkdownToPdf('# Hello World\n\nTest');
  console.log('转换成功');
} catch (error) {
  console.error('错误:', error.message);
}
```

### 不带认证的基础示例

#### JavaScript (fetch)

```javascript
const response = await fetch('https://docfactory.pages.dev/api/convert/pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    markdown: '# Hello World\n\nThis is a **test**.',
    options: {
      format: 'A4',
      margin: '20px'
    }
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
window.open(url);
```

### Python (requests)

```python
import requests

response = requests.post(
    'https://docfactory.pages.dev/api/convert/pdf',
    json={
        'markdown': '# Hello World\n\nThis is a **test**.',
        'options': {
            'format': 'A4',
            'margin': '20px'
        }
    }
)

with open('document.pdf', 'wb') as f:
    f.write(response.content)
```

### Node.js (axios)

```javascript
const axios = require('axios');
const fs = require('fs');

const response = await axios.post(
  'https://docfactory.pages.dev/api/convert/pdf',
  {
    markdown: '# Hello World\n\nThis is a **test**.',
    options: {
      format: 'A4',
      margin: '20px'
    }
  },
  { responseType: 'arraybuffer' }
);

fs.writeFileSync('document.pdf', response.data);
```

## Deployment

### Deploy to Cloudflare Pages (Recommended)

#### Prerequisites

- Cloudflare account (Free plan supported!)
- GitHub repository

**Browser Rendering 免费额度:**
- Free plan: 10 分钟/天, 3 个并发浏览器
- Paid plan: 10 小时/月, 10 个并发浏览器 (超出后 $0.09/小时)

#### Deployment Steps

1. **Connect your repository to Cloudflare Pages**
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to "Workers & Pages" → "Pages"
   - Click "Create a project" → "Connect to Git"
   - Select your GitHub repository

2. **Configure build settings**
   - Framework preset: `Next.js`
   - Build command: `npm run build:cloudflare`
   - Build output directory: `.vercel/output/static`
   - Root directory: `/`

3. **Enable Browser Rendering**
   - Go to your Pages project → Settings → Functions
   - Add Browser Rendering binding:
     - Variable name: `BROWSER`
     - Type: Browser Rendering

4. **Set environment variables (optional)**
   - Go to Settings → Environment Variables
   - Add variables:
     - `API_SECRET_KEY`: Your API authentication key
     - `RATE_LIMIT_PER_MINUTE`: Rate limit (default: 60)
     - `NODE_ENV`: production

5. **Deploy**
   - Click "Save and Deploy"
   - Your API will be live at `https://your-project.pages.dev`

#### Local Testing with Wrangler

```bash
# Install dependencies
npm install

# Preview locally with Cloudflare environment
npm run preview

# Deploy manually
npm run deploy
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_SECRET_KEY` | API authentication key | - | No |
| `RATE_LIMIT_PER_MINUTE` | Requests per IP per minute | 60 | No |
| `NODE_ENV` | Environment | development | No |

## Development

### Project Structure

```
docfactory/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── convert/
│   │   │   │   ├── pdf/route.ts
│   │   │   │   ├── image/route.ts
│   │   │   │   ├── docx/route.ts
│   │   │   │   └── html/route.ts
│   │   │   └── health/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── rateLimit.ts
│   ├── services/
│   │   ├── markdown.ts
│   │   ├── pdf.ts
│   │   ├── image.ts
│   │   ├── docx.ts
│   │   └── html.ts
│   ├── types/
│   │   └── api.ts
│   └── utils/
│       ├── errors.ts
│       └── validation.ts
├── package.json
├── tsconfig.json
├── next.config.js
└── vercel.json
```

### Tech Stack

- **Framework**: Next.js 14 (App Router with Edge Runtime)
- **Language**: TypeScript
- **Deployment**: Cloudflare Pages
- **Browser**: @cloudflare/puppeteer + Browser Rendering API
- **Markdown Parser**: marked
- **Word**: docx
- **Code Highlighting**: highlight.js
- **Styling**: github-markdown-css

### Scripts

```bash
npm run dev                # Start development server (with Cloudflare dev platform)
npm run build              # Build for production (Next.js)
npm run build:cloudflare   # Build for Cloudflare Pages
npm run preview            # Preview with Wrangler (local Cloudflare environment)
npm run deploy             # Deploy to Cloudflare Pages
npm run start              # Start production server (Node.js)
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript check
```

### Limitations (Cloudflare Workers)

- **Execution Time**: 30 seconds max (CPU time)
- **Memory**: 128 MB
- **Response Size**: 100 MB max
- **Input Size**: 500 KB markdown max (recommended)
- **Browser Rendering**:
  - **Free plan**: 10 分钟/天, 3 个并发浏览器
  - **Paid plan**: 10 小时/月, 10 个并发浏览器
  - 超额费用: $0.09/浏览器小时

## Chinese Font Support

DocFactory includes embedded **PingFang SC** font to ensure perfect Chinese character rendering in PDF and image outputs.

### Features

- ✅ **Full Chinese Support**: Both simplified and traditional Chinese characters
- ✅ **Code Block Support**: Chinese comments and strings in code blocks
- ✅ **Embedded Font**: No external dependencies, works offline
- ✅ **Auto-detection**: Automatically uses Chinese font when needed

### Custom Font

The default font is **PingFang SC**. To use a custom font:

1. Place your `.ttf` or `.otf` font file in `src/fonts/`
2. Update `src/utils/font.ts`:
   ```typescript
   const possiblePaths = [
     path.join(process.cwd(), 'src/fonts/YourFont.ttf'),
     // ... other paths
   ];
   ```
3. Update `src/services/markdown.ts`:
   ```typescript
   font-family: 'Your Font Name', -apple-system, ...
   ```
4. Rebuild: `npm run build`

### Example

```markdown
# 中文标题

这是**中文内容**测试。

## JavaScript 代码

\`\`\`javascript
const name = "张三";
// 这是中文注释
console.log("你好，" + name);
\`\`\`
```

## Performance

- **PDF Conversion**: < 3s for documents under 1MB
- **Image Conversion**: < 2s
- **DOCX Conversion**: < 2s
- **HTML Conversion**: < 500ms
- **Concurrent Requests**: 10+

## License

MIT License - see [LICENSE](LICENSE) file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- 📖 [Documentation](https://github.com/gongyug/DocFactory)
- 🐛 [Issue Tracker](https://github.com/gongyug/DocFactory/issues)
- 💬 [Discussions](https://github.com/gongyug/DocFactory/discussions)

---

Made with ❤️ by DocFactory Team