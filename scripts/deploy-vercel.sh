#!/bin/bash

# Deploy script para Vercel
# Uso: ./scripts/deploy-vercel.sh [prod|preview]

set -e

ENVIRONMENT=${1:-preview}
PROJECT_NAME="kanban-bluwe-cosmeticos"

echo "🚀 Iniciando deploy Vercel ($ENVIRONMENT)..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instale com: npm i -g vercel"
    exit 1
fi

# Build da aplicação
echo "🏗️ Build da aplicação..."
npm run build

# Deploy para Vercel
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "🌐 Deploy para produção..."
    vercel --prod
else
    echo "👀 Deploy para preview..."
    vercel
fi

echo "✅ Deploy Vercel concluído!"
