# 🚂 Deploy no Railway

Este guia mostra como fazer o deploy da aplicação Kanban no Railway.

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Repositório no GitHub/GitLab conectado ao Railway
3. Projeto já configurado para PostgreSQL

## 🚀 Passos para Deploy

### 1. Criar Projeto no Railway

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub" ou "Deploy from GitLab"
4. Conecte seu repositório `kanban-bluwe-cosmeticos`

### 2. Configurar Banco de Dados PostgreSQL

1. No seu projeto Railway, clique em "Add Plugin"
2. Selecione "PostgreSQL"
3. O Railway criará automaticamente uma instância PostgreSQL
4. Copie a `DATABASE_URL` que será gerada

### 3. Configurar Variáveis de Ambiente

No painel do Railway, vá para "Variables" e adicione:

```env
# Database (será preenchido automaticamente)
DATABASE_URL=postgresql://...

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=https://seu-projeto.up.railway.app
NODE_ENV=production

# NextAuth Configuration (gere um secret seguro)
NEXTAUTH_SECRET=seu_segredo_muito_longo_aqui
NEXTAUTH_URL=https://seu-projeto.up.railway.app

# Opcional: OAuth Providers
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret

# Opcional: Serviços Externos
GITHUB_TOKEN=seu_github_token
SLACK_WEBHOOK=sua_url_webhook
OPENAI_API_KEY=sua_chave_openai
LLAMA_ENDPOINT=http://localhost:8080/v1/chat/completions
```

### 4. Configurar Build Settings

1. Vá para "Settings" > "Build"
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Root Directory**: `/` (raiz do projeto)

### 5. Migrar Banco de Dados

Após o primeiro deploy, execute a migração do banco:

```bash
railway run npx prisma db push
```

Ou através do painel Railway:
1. Vá para "Tools" > "Run a command"
2. Execute: `npx prisma db push`

## 🔧 Configurações Técnicas

### Arquivos de Configuração

- `railway.toml` - Configurações específicas do Railway
- `prisma/schema.prisma` - Schema atualizado para PostgreSQL
- `.env.railway` - Template de variáveis de ambiente

### Comandos Úteis

```bash
# Deploy local
npm run deploy:railway

# Conectar ao banco Railway
railway connect

# Ver logs
railway logs

# Executar comandos no ambiente Railway
railway run <comando>
```

## 🚨 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão em `package.json`
- Certifique-se que o Node.js version é 20+

### Erro de Banco
- Verifique se `DATABASE_URL` está correta
- Execute `npx prisma db push` para migrar

### Erro de Variáveis
- Todas as variáveis são obrigatórias
- `NEXTAUTH_SECRET` deve ser uma string longa e aleatória

## 🌐 URLs Importantes

- **Aplicação**: `https://seu-projeto.up.railway.app`
- **Railway Dashboard**: `https://railway.app/dashboard`
- **Documentação Railway**: `https://docs.railway.app`

## 💰 Custos

- **Free Tier**: $5/mês (crédito inicial)
- **PostgreSQL**: $0/mês (primeiros 512MB)
- **Aplicação**: $0/mês (até limites do free tier)

---

**🎉 Deploy concluído!** Sua aplicação Kanban estará rodando no Railway.
