#!/bin/bash

# Script de configuração para produção
# Configura PostgreSQL e migra dados

set -e

echo "🚀 INICIANDO CONFIGURAÇÃO DE PRODUÇÃO..."
echo "========================================"

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não configurada"
  echo "Configure a variável de ambiente DATABASE_URL"
  exit 1
fi

echo "📊 Database URL configurada: ${DATABASE_URL}"

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# Push do schema para produção
echo "📤 Fazendo push do schema..."
npx prisma db push --force-reset

# Seed inicial (opcional)
echo "🌱 Executando seed..."
if [ -f "prisma/seed.ts" ]; then
  npx tsx prisma/seed.ts
fi

# Testar APIs após deploy
echo "🧪 Testando APIs..."
bash scripts/test-apis.sh

echo "✅ Configuração de produção concluída!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Configure NEXTAUTH_SECRET e NEXTAUTH_URL"
echo "2. Configure APIs de IA (OPENAI_API_KEY, etc.)"
echo "3. Execute: npm run build"
echo "4. Deploy para produção"
