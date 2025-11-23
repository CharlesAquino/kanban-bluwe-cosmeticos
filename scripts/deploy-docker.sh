#!/bin/bash

# Deploy script para Docker
# Uso: ./scripts/deploy-docker.sh [tag]

set -e

TAG=${1:-latest}
IMAGE_NAME="kanban-bluwe-cosmeticos"
CONTAINER_NAME="kanban-bluwe-app"

echo "🚀 Iniciando deploy Docker..."

# Parar container existente
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    echo "🛑 Parando container existente..."
    docker stop $CONTAINER_NAME
fi

# Remover container existente
if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
    echo "🗑️ Removendo container existente..."
    docker rm $CONTAINER_NAME
fi

# Remover imagem antiga (opcional)
echo "🏗️ Build da nova imagem..."
docker build -t $IMAGE_NAME:$TAG .

# Iniciar novo container
echo "▶️ Iniciando novo container..."
docker run -d \
    --name $CONTAINER_NAME \
    -p 3000:8080 \
    --restart unless-stopped \
    -e NODE_ENV=production \
    -e NEXT_TELEMETRY_DISABLED=1 \
    $IMAGE_NAME:$TAG

echo "✅ Deploy concluído!"
echo "🌐 Acesse: http://localhost:3000"
echo "📊 Logs: docker logs -f $CONTAINER_NAME"
