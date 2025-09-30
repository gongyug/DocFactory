# DocFactory API 产品需求文档 (PRD)

## 1. 项目概述

### 1.1 项目名称
DocFactory - Markdown 文档格式转换 API 服务

### 1.2 项目描述
一个轻量级的 API 服务，支持将 Markdown 文档转换为多种格式（PDF、图片、Word 等），可在 Vercel 上一键部署。

### 1.3 项目目标
- 提供简单易用的 RESTful API 接口
- 支持多种输出格式转换
- 零配置部署到 Vercel
- 高性能、低延迟响应
- 开源且可扩展

## 2. 目标用户

- 需要批量转换文档的开发者
- 构建文档系统的团队
- 需要自动化文档生成的项目
- 个人博客或笔记工具开发者

## 3. 核心功能

### 3.1 功能列表

#### P0 (必须实现)
1. **Markdown to PDF**
   - 支持标准 Markdown 语法
   - 支持代码高亮
   - 支持自定义样式（CSS）
   - 支持中文字体

2. **Markdown to Image (PNG/JPG)**
   - 支持生成全页截图
   - 支持自定义尺寸
   - 支持透明背景

3. **Markdown to DOCX**
   - 支持标准 Word 格式
   - 保留格式（标题、列表、粗体、斜体等）
   - 支持图片嵌入

#### P1 (重要但非必需)
4. **Markdown to HTML**
   - 支持自定义 CSS 样式
   - 支持主题切换

5. **批量转换**
   - 支持一次性转换多个文档

#### P2 (未来可扩展)
6. **模板系统**
   - 预设多种文档模板
   - 支持自定义模板

7. **Webhook 通知**
   - 转换完成后回调通知

## 4. API 设计

### 4.1 基础 URL
```
https://docfactory.vercel.app/api
```

### 4.2 API 端点

#### 4.2.1 转换为 PDF
```http
POST /api/convert/pdf
Content-Type: application/json

{
  "markdown": "# Hello World\nThis is a test",
  "options": {
    "format": "A4",
    "margin": "20px",
    "css": "body { font-family: Arial; }",
    "displayHeaderFooter": false,
    "preferCSSPageSize": false
  }
}

Response:
- Content-Type: application/pdf
- Binary PDF file
```

#### 4.2.2 转换为图片
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

Response:
- Content-Type: image/png or image/jpeg
- Binary image file
```

#### 4.2.3 转换为 Word
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

Response:
- Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Binary DOCX file
```

#### 4.2.4 转换为 HTML
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

Response:
- Content-Type: application/json
{
  "html": "<h1>Hello World</h1>",
  "success": true
}
```

#### 4.2.5 健康检查
```http
GET /api/health

Response:
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-09-30T10:00:00Z"
}
```

## 5. 技术要求

### 5.1 技术栈
- **运行环境**: Node.js 18+
- **框架**: Next.js 14+ (API Routes)
- **部署平台**: Vercel
- **语言**: TypeScript

### 5.2 核心依赖库（开源成熟方案）

#### Markdown 解析
- `marked` - 高性能 Markdown 解析器
- `markdown-it` - 可扩展的 Markdown 解析器（备选）

#### PDF 生成
- `@react-pdf/renderer` - React 组件生成 PDF（轻量级）
- `puppeteer-core` + `@sparticuz/chromium` - 适用于 Serverless（功能完整）

#### 图片生成
- `puppeteer-core` - 浏览器截图
- `sharp` - 图片处理和优化

#### Word 生成
- `docx` - 纯 JavaScript 生成 DOCX
- `html-docx-js` - HTML 转 DOCX（备选）

#### 代码高亮
- `highlight.js` - 代码语法高亮
- `prismjs` - 轻量级语法高亮（备选）

#### 样式
- `github-markdown-css` - GitHub 风格样式

### 5.3 架构设计
```
┌─────────────────────────────────────┐
│         客户端请求                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Vercel Edge Network (CDN)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   API Route Handler (Next.js)       │
│   - 参数验证                         │
│   - 格式检测                         │
│   - 错误处理                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   转换服务层                         │
│   ┌──────────────────────────────┐  │
│   │ Markdown Parser (marked)     │  │
│   └──────────┬───────────────────┘  │
│              │                       │
│   ┌──────────▼───────────────────┐  │
│   │ Format Converter             │  │
│   │ - PDFConverter               │  │
│   │ - ImageConverter             │  │
│   │ - DocxConverter              │  │
│   │ - HtmlConverter              │  │
│   └──────────┬───────────────────┘  │
└──────────────┼──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         返回结果                     │
│   - Binary File                     │
│   - Error Response                  │
└─────────────────────────────────────┘
```

## 6. 性能要求

### 6.1 Vercel 平台限制
- **执行时间**: Hobby 计划 10s，Pro 计划 60s
- **内存**: 1024 MB
- **响应大小**: 4.5 MB (Hobby), 无限制 (Pro)
- **并发**: 根据计划不同

### 6.2 性能目标
- **响应时间**:
  - PDF (< 1MB): < 3s
  - Image: < 2s
  - DOCX: < 2s
  - HTML: < 500ms

- **并发处理**: 支持至少 10 个并发请求

- **文档大小限制**:
  - Markdown 输入: 最大 500KB
  - PDF 输出: 最大 4MB (Hobby)
  - Image 输出: 最大 2MB
  - DOCX 输出: 最大 4MB

### 6.3 优化策略
- 使用流式响应
- 实现请求队列
- 缓存常用样式和字体
- 压缩输出文件

## 7. 安全要求

### 7.1 安全措施
- **Rate Limiting**: 限制每 IP 每分钟请求次数（60 次/分钟）
- **输入验证**: 严格验证 Markdown 内容和参数
- **XSS 防护**: 过滤恶意脚本
- **API Key**: 可选的 API 密钥认证
- **CORS**: 配置跨域策略

### 7.2 内容限制
- 禁止执行 JavaScript（PDF/Image 生成时）
- 限制外部资源加载
- 验证文件大小

## 8. 部署要求

### 8.1 环境变量
```env
# 可选：API 认证密钥
API_SECRET_KEY=your-secret-key

# 可选：自定义字体 URL
CUSTOM_FONT_URL=https://...

# 可选：速率限制配置
RATE_LIMIT_PER_MINUTE=60
```

### 8.2 部署步骤
1. Fork 项目到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（可选）
4. 自动部署

### 8.3 监控和日志
- Vercel Analytics 集成
- 错误日志记录
- 性能监控

## 9. 错误处理

### 9.1 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "INVALID_MARKDOWN",
    "message": "The provided markdown is invalid",
    "details": "..."
  }
}
```

### 9.2 错误码定义
- `INVALID_MARKDOWN`: Markdown 格式错误
- `FILE_TOO_LARGE`: 文件超过大小限制
- `CONVERSION_FAILED`: 转换失败
- `RATE_LIMIT_EXCEEDED`: 超过速率限制
- `INVALID_PARAMETERS`: 参数无效
- `INTERNAL_ERROR`: 服务器内部错误

## 10. 文档要求

### 10.1 文档内容
- README.md: 项目介绍、快速开始
- API.md: API 使用文档和示例
- DEPLOYMENT.md: 部署指南
- CONTRIBUTING.md: 贡献指南

### 10.2 示例代码
提供多语言调用示例：
- cURL
- JavaScript (fetch)
- Python (requests)
- Node.js (axios)

## 11. 测试要求

### 11.1 测试类型
- 单元测试: 核心转换逻辑
- 集成测试: API 端点测试
- 性能测试: 负载测试

### 11.2 测试覆盖率
- 目标: > 80%

## 12. 项目里程碑

### Phase 1 - MVP (Week 1-2)
- [ ] 搭建 Next.js 项目基础架构
- [ ] 实现 Markdown to PDF 转换
- [ ] 实现 Markdown to Image 转换
- [ ] 基础错误处理
- [ ] Vercel 部署配置

### Phase 2 - 功能完善 (Week 3)
- [ ] 实现 Markdown to DOCX 转换
- [ ] 实现 Markdown to HTML 转换
- [ ] 添加速率限制
- [ ] 优化性能
- [ ] 完善文档

### Phase 3 - 优化和发布 (Week 4)
- [ ] 添加单元测试
- [ ] 性能优化
- [ ] 安全加固
- [ ] 发布 v1.0.0

## 13. 开源许可
MIT License

## 14. 参考资源

### 开源项目参考
- [md-to-pdf](https://github.com/simonhaenisch/md-to-pdf)
- [markdown-pdf](https://github.com/alanshaw/markdown-pdf)
- [mdpdf](https://github.com/BlueHatbRit/mdpdf)

### 技术文档
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Puppeteer for Serverless](https://github.com/Sparticuz/chromium)

---

**文档版本**: v1.0
**最后更新**: 2025-09-30
**作者**: DocFactory Team