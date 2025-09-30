# Vercel 部署指南

本文档详细说明如何将 DocFactory API 部署到 Vercel。

## 前置要求

- GitHub 账号
- Vercel 账号（可使用 GitHub 登录）
- Git 已安装

## 部署步骤

### 1. 准备代码仓库

首先，将项目推送到 GitHub：

```bash
# 初始化 git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: DocFactory API v1.0"

# 添加远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/gongyug/DocFactory.git

# 推送到 GitHub
git push -u origin main
```

### 2. 在 Vercel 中导入项目

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 使用 GitHub 账号登录
3. 点击 "Import Project"
4. 选择你的 `docfactory` 仓库
5. 点击 "Import"

### 3. 配置项目

Vercel 会自动检测到这是一个 Next.js 项目。

**构建配置**（通常会自动填充）：
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. 环境变量配置（可选）

在 Vercel 项目设置中添加环境变量：

#### 4.1 API 密钥认证（可选）

如果需要 API 密钥认证：

1. 在 Vercel 项目页面，点击 "Settings" → "Environment Variables"
2. 添加变量：
   - Key: `API_SECRET_KEY`
   - Value: 你的密钥（建议使用强随机字符串）
   - Environments: 选择 `Production`, `Preview`, `Development`

生成强密钥示例：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4.2 速率限制（可选）

默认每分钟 60 次请求。如需修改：

- Key: `RATE_LIMIT_PER_MINUTE`
- Value: 你期望的限制数（如 `100`）
- Environments: 选择环境

### 5. 部署

点击 "Deploy" 按钮，Vercel 会开始构建和部署。

部署过程：
1. ✓ 安装依赖
2. ✓ 构建项目
3. ✓ 优化输出
4. ✓ 部署到全球 CDN
5. ✓ 分配域名

### 6. 验证部署

部署完成后，你会获得一个 URL，如：`https://your-project.vercel.app`

测试健康检查端点：
```bash
curl https://your-project.vercel.app/api/health
```

预期响应：
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-09-30T10:00:00.000Z"
}
```

### 7. 测试 API

测试 PDF 转换：
```bash
curl -X POST https://your-project.vercel.app/api/convert/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is a **test** document.",
    "options": {"format": "A4"}
  }' \
  --output test.pdf
```

如果启用了 API 密钥：
```bash
curl -X POST https://your-project.vercel.app/api/convert/pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -d '{
    "markdown": "# Hello World\n\nThis is a **test** document.",
    "options": {"format": "A4"}
  }' \
  --output test.pdf
```

## 自定义域名

### 添加自定义域名

1. 在 Vercel 项目页面，点击 "Settings" → "Domains"
2. 输入你的域名（如 `api.yourdomain.com`）
3. 按照提示在你的 DNS 提供商处添加记录
4. 等待 DNS 传播（通常几分钟到几小时）

### DNS 配置示例

对于 `api.yourdomain.com`：

**CNAME 记录**：
- Name: `api`
- Value: `cname.vercel-dns.com`
- TTL: `3600`

## 监控和日志

### 查看部署日志

1. 在 Vercel 项目页面，点击 "Deployments"
2. 选择一个部署
3. 点击 "Function Logs" 查看运行日志

### 监控指标

Vercel 提供以下监控功能：
- **Analytics**: 请求统计、地理分布
- **Performance**: 响应时间、TTFB
- **Errors**: 错误日志和堆栈跟踪

## 自动部署

配置完成后，每次推送到 GitHub 的 `main` 分支都会触发自动部署。

### 部署预览

推送到其他分支（如 `dev`）会创建预览部署：
```bash
git checkout -b dev
git add .
git commit -m "Test new feature"
git push origin dev
```

Vercel 会为此分支创建一个临时预览 URL。

## 性能优化

### Vercel 函数优化

在 `vercel.json` 中已配置：
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### 区域配置

默认部署到 `iad1`（美国东部）。如需更改：

```json
{
  "regions": ["sin1"]  // 新加坡
}
```

可用区域：
- `iad1` - 华盛顿特区（美国）
- `sfo1` - 旧金山（美国）
- `sin1` - 新加坡
- `hnd1` - 东京（日本）

## 升级计划

### Hobby Plan（免费）
- ✓ 执行时间：10 秒
- ✓ 内存：1024 MB
- ✓ 响应大小：4.5 MB
- ✓ 部署：无限制

### Pro Plan（付费）
- ✓ 执行时间：60 秒
- ✓ 内存：1024 MB
- ✓ 响应大小：无限制
- ✓ 更多并发
- ✓ 团队协作

## 常见问题

### Q: 为什么 PDF 生成超时？

A: Hobby 计划限制为 10 秒。如果文档太大或太复杂，考虑：
1. 减小文档大小
2. 优化图片
3. 升级到 Pro 计划

### Q: 如何增加并发请求数？

A: Hobby 计划有并发限制。升级到 Pro 计划可获得更多并发。

### Q: API 响应 413 错误

A: 请求体超过限制。当前限制为 500KB markdown 输入。

### Q: 如何备份环境变量？

A: 在 Vercel CLI 中：
```bash
vercel env pull .env.production
```

## 故障排查

### 检查构建日志

如果部署失败：
1. 查看 Vercel 构建日志
2. 确认所有依赖已正确安装
3. 本地测试 `npm run build`

### 检查函数日志

如果 API 返回错误：
1. 查看 Function Logs
2. 检查环境变量是否正确设置
3. 验证请求格式

### 本地调试

使用 Vercel CLI 本地测试：
```bash
# 安装 Vercel CLI
npm i -g vercel

# 链接项目
vercel link

# 本地开发
vercel dev
```

## 回滚部署

如果新版本有问题：

1. 在 Vercel 项目页面，点击 "Deployments"
2. 找到之前的稳定版本
3. 点击右侧的 "..." → "Promote to Production"

## 安全建议

1. **启用 API 密钥**：生产环境强烈建议启用
2. **配置 CORS**：限制允许的来源
3. **监控使用**：定期检查日志和分析
4. **速率限制**：根据需求调整限制
5. **保护环境变量**：不要将密钥提交到代码库

## 联系支持

- Vercel 文档：https://vercel.com/docs
- Vercel 支持：https://vercel.com/support
- DocFactory Issues：https://github.com/gongyug/DocFactory/issues

---

## 快速命令参考

```bash
# 本地开发
npm run dev

# 类型检查
npm run type-check

# 构建
npm run build

# 启动生产服务器
npm start

# 部署到 Vercel
vercel --prod

# 查看部署列表
vercel ls

# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add API_SECRET_KEY
```

---

完成以上步骤后，你的 DocFactory API 就成功部署到 Vercel 了！🎉