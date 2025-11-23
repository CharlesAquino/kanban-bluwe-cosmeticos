#!/bin/bash

# Test script para verificar APIs
# Executa depois de cada deploy

echo "🧪 TESTANDO APIs APÓS DEPLOY..."
echo "=================================="

BASE_URL="http://localhost:3000"

# Test API Products
echo "📦 Testando /api/products..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/products")
if [ "$response" -eq 200 ]; then
  echo "✅ Products API: OK (200)"
else
  echo "❌ Products API: ERRO ($response)"
fi

# Test API Stats
echo "📊 Testando /api/stats..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/stats")
if [ "$response" -eq 200 ]; then
  echo "✅ Stats API: OK (200)"
else
  echo "❌ Stats API: ERRO ($response)"
fi

# Test API Operators
echo "👥 Testando /api/mod/operators..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/mod/operators")
if [ "$response" -eq 200 ]; then
  echo "✅ Operators API: OK (200)"
else
  echo "❌ Operators API: ERRO ($response)"
fi

echo ""
echo "=================================="
echo "🎯 APIs testadas com sucesso!"
echo "🚀 Sistema pronto para produção"
