# 🚀 Deploy do Sistema Kanban Bluwe Cosméticos

## 📋 Opções de Deploy

### 1. 🟢 Vercel (Recomendado)

#### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- GitHub conectado ao Vercel

#### Passos
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy para produção
npm run deploy:vercel
```

#### Variáveis de Ambiente no Vercel
- `DATABASE_URL`: String de conexão PostgreSQL
- `NEXTAUTH_SECRET`: Chave secreta para autenticação
- `NEXTAUTH_URL`: URL do projeto Vercel

---

### 2. 🔵 Netlify

#### Pré-requisitos
- Conta no [Netlify](https://netlify.com)
- Build configurado

#### Passos
```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Fazer login
netlify login

# 3. Deploy para produção
npm run deploy:netlify
```

---

### 3. 🐳 Docker (Mock System)

#### ⚠️ IMPORTANTE: Sistema usa Mock Data
Este projeto usa mock system temporariamente devido a problemas de permissão Prisma no Windows.

#### Pré-requisitos
- Docker instalado
- Sem necessidade de banco de dados (usa mock)

#### Passos
```bash
# 1. Build da imagem (simplificado)
docker build -t kanban-bluwe-mock .

# 2. Rodar container
docker run -p 3000:8080 kanban-bluwe-mock

# 3. Deploy com script
chmod +x scripts/deploy-docker.sh
./scripts/deploy-docker.sh
```

#### Docker Compose (Mock)
```bash
# Usar arquivo específico para mock
docker-compose -f docker-compose.mock.yml up --build
```

#### Dockerfile Simplificado
```dockerfile
# Single stage - sem Prisma
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

---

### 4. 🟦 Railway

#### Passos
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Fazer login
railway login

# 3. Criar projeto
railway new

# 4. Deploy
railway up
```

---

## 🔧 Configurações Necessárias

### Banco de Dados
- **Produção**: PostgreSQL (recomendado)
- **Desenvolvimento**: SQLite (já configurado)

### Variáveis de Ambiente
```bash
# .env.production
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Build Commands
```bash
# Produção
npm run build

# Com Prisma
prisma generate && next build
```

---

## 📊 Monitoramento

### Logs
- **Vercel**: Dashboard > Functions > Logs
- **Netlify**: Site > Functions > Logs
- **Docker**: `docker logs <container>`

### Performance
- **Vercel Analytics**: Disponível no dashboard
- **Netlify Analytics**: Configure no painel
- **Custom**: Implemente monitoring próprio

---

## 🚨 Troubleshooting

### Erros Comuns

#### 1. Build Falha
```bash
# Limpar cache
npm run clean:windows

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Tentar build novamente
npm run build
```

#### 2. Erro de Banco
```bash
# Verificar connection string
echo $DATABASE_URL

# Testar conexão
npx prisma db pull
```

#### 3. Problemas de CORS
```bash
# Verificar next.config.js
# Adicionar domains permitidos
```

---

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📱 Pós-Deploy

### Checklist
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente setadas
- [ ] Build funcionando
- [ ] APIs respondendo
- [ ] Autenticação funcionando
- [ ] Upload de arquivos funcionando
- [ ] Monitoramento ativo

### Testes
```bash
# Testar APIs
curl https://your-domain.com/api/products

# Testar frontend
curl https://your-domain.com

# Verificar headers
curl -I https://your-domain.com
```

---

## 🆘 Suporte

### Links Úteis
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Next.js Deploy](https://nextjs.org/docs/deployment)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)

### Contato
- 📧 Email: [seu-email]
- 🐛 Issues: [GitHub Issues]
- 📚 Docs: `docs/README.md`

---

**🎉 Sistema pronto para produção!** 🚀✨
