# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-30

### Added
- 🌏 **Chinese Font Support**: Embedded PingFang SC font for perfect Chinese rendering
  - Full support for simplified and traditional Chinese characters
  - Chinese characters in code blocks (strings and comments)
  - Embedded font requires no external dependencies
  - Works in both PDF and image outputs
- 🔒 **API Key Authentication**: Optional Bearer token authentication
  - Configurable via `API_SECRET_KEY` environment variable
  - Support for secure API access control
  - Comprehensive examples in multiple languages
- ⚡ **Rate Limiting**: Built-in IP-based rate limiting
  - Configurable requests per minute (default: 60)
  - Automatic cleanup of expired entries
- 📄 **Multiple Output Formats**:
  - PDF conversion with custom page sizes and margins
  - Image conversion (PNG/JPEG) with configurable dimensions
  - DOCX conversion with proper formatting
  - HTML conversion with syntax highlighting
- 💻 **Code Syntax Highlighting**:
  - Powered by highlight.js
  - GitHub-style theme
  - Support for 190+ programming languages
- 🐳 **Docker Support**:
  - Multi-stage Docker build for optimized image size
  - Docker Compose configuration included
  - Health check and auto-restart configured
  - Environment-aware Chromium configuration
- 📚 **Comprehensive Documentation**:
  - Detailed README with API reference
  - Docker deployment guide
  - API key setup and usage examples
  - Testing scripts included

### Technical Details
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Markdown Parser**: marked with GitHub Flavored Markdown
- **PDF/Image Generation**: puppeteer-core + @sparticuz/chromium
- **Word Generation**: docx library
- **Vercel Ready**: Zero-config deployment to Vercel

### Environment Support
- ✅ Vercel serverless deployment
- ✅ Docker container deployment
- ✅ Local development with Node.js 18+

### Performance
- PDF Conversion: < 3s for documents under 1MB
- Image Conversion: < 2s
- DOCX Conversion: < 2s
- HTML Conversion: < 500ms
- Concurrent Requests: 10+

### Security
- Optional API key authentication
- Rate limiting per IP address
- Input validation and sanitization
- Error handling without information leakage

[1.0.0]: https://github.com/gongyug/DocFactory/releases/tag/v1.0.0