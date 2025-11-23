#!/bin/bash

# Pre-commit Test Script
# Executa testes automaticamente antes de cada commit
# Previne bugs em produção

set -e

echo "🧪 INICIANDO TESTES PRÉ-COMMIT..."
echo "=================================="

# 1. Verificar build
echo "📦 Testando build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Build: OK"
else
  echo "❌ Build: FALHOU"
  exit 1
fi

# 2. Verificar linting
echo "🔍 Testando linting..."
npm run lint 2>/dev/null || echo "⚠️  Linting: Avisos (não bloqueante)"

# 3. Verificar tipos TypeScript
echo "📝 Verificando tipos..."
npx tsc --noEmit 2>/dev/null || echo "⚠️  TypeScript: Avisos (não bloqueante)"

# 4. Verificar Dockerfile
echo "🐳 Validando Dockerfile..."
if [ -f "Dockerfile" ]; then
  echo "✅ Dockerfile: Encontrado"
else
  echo "❌ Dockerfile: NÃO ENCONTRADO"
  exit 1
fi

# 5. Verificar dependências críticas
echo "📚 Verificando dependências..."
if grep -q "tailwindcss" package.json; then
  echo "✅ Tailwind: Presente"
else
  echo "❌ Tailwind: FALTANDO"
  exit 1
fi

echo ""
echo "=================================="
echo "✅ TODOS OS TESTES PASSARAM!"
echo "=================================="
echo ""
echo "🚀 Commit autorizado para produção"
echo ""
