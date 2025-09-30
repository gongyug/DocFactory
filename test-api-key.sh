#!/bin/bash

# API 密钥测试脚本
# 演示如何使用 API_SECRET_KEY 进行认证

BASE_URL="http://localhost:3000"
API_KEY="test-secret-key-12345"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================"
echo "API 密钥认证测试"
echo "======================================"
echo ""

echo -e "${BLUE}API 密钥: ${API_KEY}${NC}"
echo ""

# 测试 1: 不带认证（如果未启用 API_SECRET_KEY，应该成功）
echo -e "${YELLOW}[测试 1] 不带 API 密钥的请求${NC}"
response=$(curl -X POST "$BASE_URL/api/health" \
  -w "\n%{http_code}" \
  -s)

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 请求成功（未启用 API 密钥认证）${NC}"
else
    echo -e "${RED}✗ 请求失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试 2: 带正确的 API 密钥
echo -e "${YELLOW}[测试 2] 带正确 API 密钥的 PDF 转换${NC}"
curl -X POST "$BASE_URL/api/convert/pdf" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "markdown": "# API 密钥测试\n\n这个请求**使用了 API 密钥**认证。",
    "options": {"format": "A4"}
  }' \
  -o ./test-output/test-with-auth.pdf \
  -w "\nHTTP Code: %{http_code}\n" \
  -s

if [ -f "./test-output/test-with-auth.pdf" ] && [ -s "./test-output/test-with-auth.pdf" ]; then
    size=$(du -h "./test-output/test-with-auth.pdf" | cut -f1)
    echo -e "${GREEN}✓ 带认证的请求成功${NC} (大小: $size)"
else
    echo -e "${RED}✗ 带认证的请求失败${NC}"
fi
echo ""

# 测试 3: 带错误的 API 密钥
echo -e "${YELLOW}[测试 3] 带错误 API 密钥的请求（应该失败）${NC}"
response=$(curl -X POST "$BASE_URL/api/convert/pdf" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong-api-key" \
  -d '{"markdown": "# Test"}' \
  -w "\n%{http_code}" \
  -s)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 401 ]; then
    echo -e "${GREEN}✓ 正确拒绝了错误的 API 密钥 (HTTP 401)${NC}"
    echo "错误响应: $body" | jq '.' 2>/dev/null || echo "$body"
elif [ "$http_code" -eq 200 ]; then
    echo -e "${YELLOW}⚠ 注意: API_SECRET_KEY 未启用，请求成功${NC}"
else
    echo -e "${RED}✗ 意外的响应码: $http_code${NC}"
fi
echo ""

# 测试 4: 缺少 Authorization 头
echo -e "${YELLOW}[测试 4] 缺少 Authorization 头（应该失败）${NC}"
response=$(curl -X POST "$BASE_URL/api/convert/pdf" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test"}' \
  -w "\n%{http_code}" \
  -s)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 401 ]; then
    echo -e "${GREEN}✓ 正确拒绝了缺少认证头的请求 (HTTP 401)${NC}"
    echo "错误响应: $body" | jq '.' 2>/dev/null || echo "$body"
elif [ "$http_code" -eq 200 ]; then
    echo -e "${YELLOW}⚠ 注意: API_SECRET_KEY 未启用，请求成功${NC}"
else
    echo -e "${RED}✗ 意外的响应码: $http_code${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}测试完成！${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}如何启用 API 密钥认证：${NC}"
echo ""
echo "1. 生成一个安全的密钥："
echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
echo "2. 在 docker-compose.yml 中设置环境变量："
echo "   environment:"
echo "     - API_SECRET_KEY=your-generated-key"
echo ""
echo "3. 重启容器："
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "4. 在请求中使用 API 密钥："
echo "   curl -H \"Authorization: Bearer your-generated-key\" ..."
echo ""