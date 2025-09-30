#!/bin/bash

# DocFactory Docker API 测试脚本
# 用于测试 Docker 容器中运行的 API

BASE_URL="http://localhost:3000"
OUTPUT_DIR="./test-output"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "======================================"
echo "DocFactory API Docker 测试"
echo "======================================"
echo ""

# 测试 1: 健康检查
echo -e "${YELLOW}[测试 1] 健康检查端点${NC}"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 健康检查通过${NC}"
    echo "响应: $body"
else
    echo -e "${RED}✗ 健康检查失败 (HTTP $http_code)${NC}"
    exit 1
fi
echo ""

# 测试 2: Markdown to PDF
echo -e "${YELLOW}[测试 2] Markdown 转 PDF${NC}"
curl -X POST "$BASE_URL/api/convert/pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# DocFactory 测试文档\n\n这是一个**测试**文档。\n\n## 功能列表\n\n- PDF 转换\n- 图片转换\n- DOCX 转换\n\n## 代码示例\n\n```javascript\nconst hello = \"world\";\nconsole.log(hello);\n```",
    "options": {
      "format": "A4",
      "margin": "20px"
    }
  }' \
  -o "$OUTPUT_DIR/test-docker.pdf" \
  -w "\n%{http_code}\n" \
  -s

if [ -f "$OUTPUT_DIR/test-docker.pdf" ] && [ -s "$OUTPUT_DIR/test-docker.pdf" ]; then
    size=$(du -h "$OUTPUT_DIR/test-docker.pdf" | cut -f1)
    echo -e "${GREEN}✓ PDF 生成成功${NC} (大小: $size)"
    echo "输出文件: $OUTPUT_DIR/test-docker.pdf"
else
    echo -e "${RED}✗ PDF 生成失败${NC}"
fi
echo ""

# 测试 3: Markdown to PNG
echo -e "${YELLOW}[测试 3] Markdown 转 PNG${NC}"
curl -X POST "$BASE_URL/api/convert/image" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello from Docker!\n\nThis is an **image** test.",
    "options": {
      "format": "png",
      "width": 800
    }
  }' \
  -o "$OUTPUT_DIR/test-docker.png" \
  -w "\n%{http_code}\n" \
  -s

if [ -f "$OUTPUT_DIR/test-docker.png" ] && [ -s "$OUTPUT_DIR/test-docker.png" ]; then
    size=$(du -h "$OUTPUT_DIR/test-docker.png" | cut -f1)
    echo -e "${GREEN}✓ PNG 生成成功${NC} (大小: $size)"
    echo "输出文件: $OUTPUT_DIR/test-docker.png"
else
    echo -e "${RED}✗ PNG 生成失败${NC}"
fi
echo ""

# 测试 4: Markdown to DOCX
echo -e "${YELLOW}[测试 4] Markdown 转 DOCX${NC}"
curl -X POST "$BASE_URL/api/convert/docx" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# DocFactory\n\nThis is a **Word** document.\n\n- Item 1\n- Item 2",
    "options": {
      "pageSize": "A4",
      "orientation": "portrait"
    }
  }' \
  -o "$OUTPUT_DIR/test-docker.docx" \
  -w "\n%{http_code}\n" \
  -s

if [ -f "$OUTPUT_DIR/test-docker.docx" ] && [ -s "$OUTPUT_DIR/test-docker.docx" ]; then
    size=$(du -h "$OUTPUT_DIR/test-docker.docx" | cut -f1)
    echo -e "${GREEN}✓ DOCX 生成成功${NC} (大小: $size)"
    echo "输出文件: $OUTPUT_DIR/test-docker.docx"
else
    echo -e "${RED}✗ DOCX 生成失败${NC}"
fi
echo ""

# 测试 5: Markdown to HTML
echo -e "${YELLOW}[测试 5] Markdown 转 HTML${NC}"
response=$(curl -X POST "$BASE_URL/api/convert/html" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello HTML\n\nThis is a **test**.",
    "options": {
      "standalone": false
    }
  }' \
  -w "\n%{http_code}" \
  -s)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ HTML 转换成功${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}✗ HTML 转换失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试 6: 错误处理 - 空 Markdown
echo -e "${YELLOW}[测试 6] 错误处理 - 空内容${NC}"
response=$(curl -X POST "$BASE_URL/api/convert/pdf" \
  -H "Content-Type: application/json" \
  -d '{"markdown": ""}' \
  -w "\n%{http_code}" \
  -s)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ 错误处理正确${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}✗ 错误处理失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试 7: 性能测试 - 响应时间
echo -e "${YELLOW}[测试 7] 性能测试 - PDF 生成响应时间${NC}"
time_total=$(curl -X POST "$BASE_URL/api/convert/pdf" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Performance Test"}' \
  -o /dev/null \
  -w "%{time_total}" \
  -s)

echo -e "响应时间: ${time_total}s"
if (( $(echo "$time_total < 5" | bc -l) )); then
    echo -e "${GREEN}✓ 性能测试通过 (< 5s)${NC}"
else
    echo -e "${YELLOW}⚠ 响应时间较慢 (> 5s)${NC}"
fi
echo ""

# 汇总
echo "======================================"
echo -e "${GREEN}测试完成！${NC}"
echo "======================================"
echo ""
echo "生成的文件位于: $OUTPUT_DIR/"
ls -lh "$OUTPUT_DIR/"
echo ""
echo "提示："
echo "- 打开 PDF: open $OUTPUT_DIR/test-docker.pdf"
echo "- 打开 PNG: open $OUTPUT_DIR/test-docker.png"
echo "- 打开 DOCX: open $OUTPUT_DIR/test-docker.docx"
echo ""