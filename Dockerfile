# Dockerfile minimal - sem dependências complexas
# Funciona apenas com componentes básicos

FROM node:20-alpine

WORKDIR /app

# Instalar dependências básicas do sistema
RUN apk add --no-cache libc6-compat

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar TODAS as dependências (incluindo dev para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Remover dependências de desenvolvimento após build
RUN npm prune --omit=dev

# Expor porta
EXPOSE 8080

# Variáveis de ambiente
ENV NODE_ENV production
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# Iniciar aplicação
CMD ["npm", "start"]
