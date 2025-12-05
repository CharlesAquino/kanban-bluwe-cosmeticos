# Guia de Configuração - AI System

## 🤖 AI Providers

### OpenAI (Primário) ✅ Recomendado

```bash
OPENAI_API_KEY="sk-your-api-key-here"
```

**Como obter:**
1. Acesse https://platform.openai.com/api-keys
2. Crie uma API key
3. Adicione ao `.env.local`

**Modelos suportados:**
- `gpt-3.5-turbo` (padrão, rápido e barato)
- `gpt-4` (mais inteligente, mais caro)
- `gpt-4-turbo` (balanceado)

---

### Llama (Fallback Local) 🔄 Opcional

```bash
LLAMA_ENDPOINT="http://localhost:8080/v1/chat/completions"
```

**Setup:**
1. Instale Ollama: https://ollama.ai
2. Execute: `ollama run llama-3.2-3b-instruct`
3. API disponível em `localhost:8080`

---

## 📡 Integrations

### Slack Notifications 🔔 Opcional

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

**Como configurar:**
1. Criar Incoming Webhook no Slack
2. https://api.slack.com/messaging/webhooks
3. Escolher canal (#kanban-alerts recomendado)

**Notificações enviadas:**
- Produtos finalizados
- Alertas de qualidade
- Status de baldes

---

### GitHub Issues 🐛 Opcional

```bash
GITHUB_TOKEN="ghp_your_personal_access_token_here"
```

**Como obter:**
1. GitHub → Settings → Developer settings
2. Personal access tokens → Generate new token
3. Scopes necessários: `repo`

**Uso:**
- Criação automática de issues para não-conformidades
- Tracking de problemas de qualidade

---

## 🗄️ Database

### Automático (Recomendado)

O sistema detecta automaticamente:
- **Development:** SQLite (`dev.db`)
- **Production/Staging:** PostgreSQL

### Manual Override

```bash
DB_TYPE=sqlite    # Forçar SQLite
DB_TYPE=postgres  # Forçar PostgreSQL
```

---

## ✅ Validação de Configuração

### Verificar AI Providers Disponíveis

```bash
GET http://localhost:3001/api/ai/orchestrator
```

Retorna:
```json
{
  "availableProviders": ["openai", "llama"],
  "mode": "production"
}
```

### Testar AI Orchestrator

```bash
POST http://localhost:3001/api/ai/orchestrator
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

---

## 🔧 Troubleshooting

### "Todos os provedores IA falharam"

**Causa:** Nenhum AI provider configurado

**Solução:**
1. Adicionar `OPENAI_API_KEY` ao `.env.local`
2. OU configurar `LLAMA_ENDPOINT`
3. Reiniciar servidor: `npm run dev`

---

### "OPENAI_API_KEY não configurada"

**Causa:** Variável não definida

**Solução:**
```bash
# .env.local
OPENAI_API_KEY=sk-...
```

---

### "SLACK_WEBHOOK_URL not configured"

**Impacto:** Notificações Slack não funcionam (graceful degradation)

**Solução:** Opcional - configurar webhook ou ignorar

---

## 📋 Checklist Mínimo

Para AI funcionar, você precisa de **pelo menos 1**:

- [ ] `OPENAI_API_KEY` (recomendado)
- [ ] `LLAMA_ENDPOINT` (fallback)

Para integrações (opcional):

- [ ] `SLACK_WEBHOOK_URL`
- [ ] `GITHUB_TOKEN`

---

## 🚀 Exemplo Completo

```bash
# .env.local

# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="random-secret-here"
NEXTAUTH_URL="http://localhost:3001"

# AI (obrigatório pelo menos 1)
OPENAI_API_KEY="sk-..."
# LLAMA_ENDPOINT="http://localhost:8080/v1/chat/completions"

# Integrations (opcional)
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
# GITHUB_TOKEN="ghp_..."

# Port
PORT="3001"
```

---

**Atualizado:** 05/12/2025  
**Versão AI System:** 2.0.0
