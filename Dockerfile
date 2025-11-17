# Usar Node.js 18 Alpine
FROM node:18-alpine AS base

# Instalar dependências apenas quando o package.json mudar
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependência
COPY package.json package-lock.json* ./
RUN npm ci

# Gerar Prisma client
FROM base AS prisma-generator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma/
COPY package.json ./
RUN npx prisma generate

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma-generator /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma-generator /app/prisma ./prisma
COPY . .

# Build da aplicação
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
