#!/bin/bash

# Deploy rápido para Railway
# Faz push das correções de APIs

echo "🚀 DEPLOY RÁPIDO - Correções APIs..."
echo "===================================="

# Verificar se temos mudanças para commitar
if [ -n "$(git status --porcelain)" ]; then
  echo "📝 Fazendo commit das correções..."
  git add .
  git commit -m "🚀 DEPLOY: Correções APIs mock para produção"
  git push origin main
else
  echo "✅ Nenhuma mudança pendente"
fi

echo ""
echo "🎯 Deploy concluído!"
echo "Aguardar Railway rebuild automático"
echo ""
echo "🌐 URLs para testar:"
echo "- https://kanban-mm-production.up.railway.app/"
echo "- https://kanban-mm-production.up.railway.app/clickup-test"
