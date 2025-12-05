# Health Check & Testing Guide

## 🏥 Health Check API

### Endpoint
```
GET /api/health
```

### O que verifica

✅ **Database** - SQLite ou PostgreSQL funcional  
✅ **AI Providers** - OpenAI e/ou Llama configurados  
✅ **Slack** - Webhook configurado (opcional)  
✅ **GitHub** - Token configurado (opcional)  

### Status Codes

- **200** - Sistema saudável ou degradado (operacional)
- **503** - Sistema não operacional (crítico)

### Response Example

```json
{
  "status": "healthy",
  "timestamp": "2025-12-05T19:45:00.000Z",
  "responseTime": "45ms",
  "services": {
    "database": {
      "available": true,
      "provider": "postgres",
      "message": "Using PostgreSQL (Drizzle ORM) in production"
    },
    "ai": {
      "available": true,
      "provider": "openai",
      "message": "1 provider(s) configured"
    },
    "integrations": {
      "slack": {
        "available": true,
        "message": "Webhook configured"
      },
      "github": {
        "available": false,
        "message": "Not configured (optional)"
      }
    }
  },
  "metadata": {
    "environment": "production",
    "version": "2.0.0"
  }
}
```

### Status Types

| Status | Significado |
|--------|-------------|
| `healthy` | DB ✅ + AI ✅ |
| `degraded` | DB ✅ + AI ❌ (ainda funciona) |
| `unhealthy` | DB ❌ (sistema inoperante) |

### Uso em Produção

#### Monitoring
```bash
# Curl para verificar health
curl http://localhost:3001/api/health

# Com jq para filtrar status
curl -s http://localhost:3001/api/health | jq '.status'
```

#### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1
```

#### Kubernetes Probe
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 30
```

---

## 🧪 E2E Tests - AI Orchestrator

### Localização
```
src/__tests__/ai-orchestrator.e2e.test.ts
```

### O que testa

✅ API info (GET /api/ai/orchestrator)  
✅ Validação de input  
✅ OpenAI integration  
✅ Llama fallback  
✅ Error handling  
✅ Health check integration  

### Como Executar

#### Setup
```bash
# 1. Configurar OpenAI (recomendado)
echo 'OPENAI_API_KEY=sk-your-key' >> .env.local

# 2. Iniciar servidor
npm run dev

# 3. Em outro terminal, executar testes
npm test -- ai-orchestrator.e2e.test.ts
```

#### Sem OpenAI (Teste Error Handling)
```bash
# Testes de error handling funcionam sem API key
npm test -- ai-orchestrator.e2e.test.ts
```

### Expected Results

#### Com OpenAI Configurado
```
✓ should return API information
✓ should require messages array
✓ should handle simple message with Open AI (8.5s)
⚠ Skipping Llama fallback test - not configured
✓ should report AI status in health check

Test Suites: 1 passed, 1 total
Tests: 4 passed, 4 total
```

#### Sem Providers
```
✓ should return API information
✓ should require messages array
⚠ Skipping OpenAI test - not configured
⚠ Skipping Llama fallback test - not configured
✓ should handle error when no providers available
✓ should report AI status in health check

Test Suites: 1 passed, 1 total  
Tests: 4 passed (2 skipped), 4 total
```

### Test Coverage

| Scenario | Covered |
|----------|---------|
| GET endpoint | ✅ |
| Input validation | ✅ |
| OpenAI success | ✅ |
| Llama fallback | ✅ |
| No providers error | ✅ |
| Health integration | ✅ |

---

## 🚀 Before Production Checklist

### Health Check
- [ ] GET /api/health retorna 200
- [ ] Database status: available=true
- [ ] AI status: available=true
- [ ] Response time < 100ms

### E2E Tests
- [ ] Todos os testes passando
- [ ] OpenAI test com resposta real
- [ ] Error handling validado
- [ ] Health check integrado

### Configuration
- [ ] OPENAI_API_KEY configurado
- [ ] DATABASE_URL configurado
- [ ] NEXTAUTH_SECRET configurado
- [ ] Variáveis opcionais decididas (Slack, GitHub)

---

## 📊 Monitoring in Production

### Alerting Rules

```yaml
# Example: Prometheus/Alertmanager

- alert: HealthCheckDegraded
  expr: health_status{status="degraded"} > 0
  for: 5m
  annotations:
    summary: "AI providers unavailable"
    
- alert: HealthCheckUnhealthy
  expr: health_status{status="unhealthy"} > 0
  for: 1m
  annotations:
    summary: "CRITICAL: Database unavailable"
```

### Uptime Monitoring

```bash
# Simple cron job (every 5 min)
*/5 * * * * curl -f http://your-domain.com/api/health || echo "Health check failed" | mail -s "Alert" ops@company.com
```

---

**Atualizado:** 05/12/2025  
**Versão:** 2.0.0
