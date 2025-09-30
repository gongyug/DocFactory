# DocFactory Docker 部署指南

本指南介绍如何使用 Docker 在本地部署和测试 DocFactory API。

## 前置要求

- Docker Desktop 或 Docker Engine (推荐版本 20.10+)
- Docker Compose (推荐版本 2.0+)

检查是否已安装：
```bash
docker --version
docker-compose --version
```

## 快速开始

### 方式 1: 使用 Docker Compose (推荐)

1. **构建并启动容器**
```bash
docker-compose up -d --build
```

2. **查看日志**
```bash
docker-compose logs -f
```

3. **验证服务**
```bash
curl http://localhost:3000/api/health
```

4. **运行测试**
```bash
./test-docker.sh
```

5. **停止服务**
```bash
docker-compose down
```

### 方式 2: 使用 Docker 命令

1. **构建镜像**
```bash
docker build -t docfactory:latest .
```

2. **运行容器**
```bash
docker run -d \
  --name docfactory-api \
  -p 3000:3000 \
  docfactory:latest
```

3. **查看日志**
```bash
docker logs -f docfactory-api
```

4. **停止和删除容器**
```bash
docker stop docfactory-api
docker rm docfactory-api
```

## 配置选项

### 环境变量

在 `docker-compose.yml` 中配置环境变量：

```yaml
environment:
  # API 密钥认证（可选）
  - API_SECRET_KEY=your-secret-key-here

  # 速率限制（可选，默认 60）
  - RATE_LIMIT_PER_MINUTE=100

  # Node 环境
  - NODE_ENV=production
```

或使用 `.env` 文件：

```bash
# 创建 .env 文件
cat > .env << EOF
API_SECRET_KEY=your-secret-key-here
RATE_LIMIT_PER_MINUTE=60
NODE_ENV=production
EOF
```

然后在 `docker-compose.yml` 中引用：
```yaml
services:
  docfactory:
    env_file:
      - .env
```

### 端口映射

默认映射到 `3000` 端口，如需更改：

```yaml
ports:
  - "8080:3000"  # 本地 8080 -> 容器 3000
```

## 测试 API

### 使用自动化测试脚本

```bash
# 运行完整测试套件
./test-docker.sh
```

测试脚本会自动测试：
- ✓ 健康检查
- ✓ PDF 转换
- ✓ PNG 转换
- ✓ DOCX 转换
- ✓ HTML 转换
- ✓ 错误处理
- ✓ 性能测试

生成的文件保存在 `./test-output/` 目录。

### 手动测试

#### 1. 健康检查
```bash
curl http://localhost:3000/api/health
```

#### 2. 转换 PDF
```bash
curl -X POST http://localhost:3000/api/convert/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello Docker\n\nThis is a **test**.",
    "options": {"format": "A4"}
  }' \
  --output test.pdf
```

#### 3. 转换图片
```bash
curl -X POST http://localhost:3000/api/convert/image \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello Docker",
    "options": {"format": "png", "width": 800}
  }' \
  --output test.png
```

#### 4. 转换 DOCX
```bash
curl -X POST http://localhost:3000/api/convert/docx \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello **Docker**\n\n- Item 1\n- Item 2"
  }' \
  --output test.docx
```

#### 5. 转换 HTML
```bash
curl -X POST http://localhost:3000/api/convert/html \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello Docker",
    "options": {"standalone": true}
  }' | jq '.'
```

### 中文支持测试

DocFactory 内置了 **PingFang SC** 字体，完美支持中文渲染。

#### 测试中文 PDF
```bash
curl -X POST http://localhost:3000/api/convert/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 中文标题测试\n\n这是一个**中文内容**测试。\n\n## 代码示例\n\n```javascript\nconst name = \"张三\";\n// 这是中文注释\nconsole.log(\"你好，\" + name);\n```",
    "options": {"format": "A4"}
  }' \
  --output test-chinese.pdf
```

#### 测试中文图片
```bash
curl -X POST http://localhost:3000/api/convert/image \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 你好世界\n\n这是**中文图片**测试。",
    "options": {"format": "png", "width": 800}
  }' \
  --output test-chinese.png
```

**特性说明：**
- ✅ 正文中文正常显示
- ✅ 代码块中的中文字符串和注释正常显示
- ✅ 字体已嵌入，无需外部依赖
- ✅ 支持简体和繁体中文

## Docker 管理命令

### 查看容器状态
```bash
docker-compose ps
```

### 查看实时日志
```bash
docker-compose logs -f docfactory
```

### 重启服务
```bash
docker-compose restart
```

### 进入容器
```bash
docker-compose exec docfactory sh
```

### 查看资源使用
```bash
docker stats docfactory-api
```

### 清理资源
```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker rmi docfactory:latest

# 清理所有未使用的资源
docker system prune -a
```

## 性能优化

### 构建优化

使用 BuildKit 加速构建：
```bash
DOCKER_BUILDKIT=1 docker-compose build
```

### 多阶段构建

Dockerfile 已使用多阶段构建，减小镜像大小：
- Base stage: 基础依赖
- Deps stage: 安装依赖
- Builder stage: 构建应用
- Runner stage: 运行时环境

### 镜像大小

查看镜像大小：
```bash
docker images docfactory
```

优化后的镜像约 200-300MB。

## 故障排查

### 容器无法启动

1. **检查日志**
```bash
docker-compose logs docfactory
```

2. **检查端口占用**
```bash
lsof -i :3000
```

3. **重新构建**
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

### PDF 生成失败

检查 Chromium 是否正确安装：
```bash
docker-compose exec docfactory sh
chromium-browser --version
```

### 权限问题

确保容器内用户有正确权限：
```bash
docker-compose exec docfactory ls -la /app
```

### 内存不足

增加 Docker 内存限制：

```yaml
services:
  docfactory:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

## 生产部署建议

### 1. 使用环境变量文件

```bash
# 生产环境变量
cat > .env.production << EOF
NODE_ENV=production
API_SECRET_KEY=$(openssl rand -hex 32)
RATE_LIMIT_PER_MINUTE=100
EOF
```

### 2. 启用健康检查

docker-compose.yml 已配置健康检查：
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 3. 配置重启策略

```yaml
restart: unless-stopped  # 已配置
```

### 4. 添加日志管理

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 5. 使用 Docker Secrets

```bash
echo "my-secret-key" | docker secret create api_key -
```

```yaml
secrets:
  api_key:
    external: true
```

## 监控和维护

### Prometheus 监控

添加 Prometheus exporter：
```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

### 日志聚合

使用 ELK Stack 或 Loki 收集日志。

### 备份策略

定期备份环境变量和配置文件：
```bash
docker-compose config > backup-$(date +%Y%m%d).yml
```

## 安全建议

1. **不要在镜像中硬编码密钥**
2. **使用非 root 用户运行**（已配置）
3. **限制容器权限**
4. **定期更新基础镜像**
5. **扫描镜像漏洞**

```bash
docker scan docfactory:latest
```

## 常用命令速查

| 操作 | 命令 |
|------|------|
| 启动服务 | `docker-compose up -d` |
| 停止服务 | `docker-compose down` |
| 查看日志 | `docker-compose logs -f` |
| 重启服务 | `docker-compose restart` |
| 重新构建 | `docker-compose up -d --build` |
| 进入容器 | `docker-compose exec docfactory sh` |
| 查看状态 | `docker-compose ps` |
| 运行测试 | `./test-docker.sh` |

## 下一步

- [API 使用文档](README.md)
- [Vercel 部署指南](DEPLOYMENT.md)
- [产品需求文档](PRD.md)

---

**需要帮助？** 在 [GitHub Issues](https://github.com/yourusername/docfactory/issues) 提问