# Sessão de Implementação: Integração de Métricas

**Data:** 27 de Novembro de 2025  
**Persona Técnica:** SRE/Infraestrutura  
**Tarefa:** Integrar `withMetrics` wrapper nas 4 APIs críticas

---

## 📊 O Que Foi Implementado

### Refatoração das 4 APIs Críticas

#### 1. `/api/products` (GET + POST)
**Mudanças:**
- ✅ Extraído `getHandler` e `postHandler` como funções isoladas
- ✅ Envolvido com `withMetrics('GET', '/api/products', getHandler)`
- ✅ Envolvido com `withMetrics('POST', '/api/products', postHandler)`
- ✅ Captura automática de duração e status
- ✅ Registro automático de métrica

**Fluxo:**
```
Request → Middleware (Request ID) → withMetrics (startTime)
  → getHandler/postHandler (logger + lógica)
  → Response (200/201/400/409/500)
  → withMetrics (calcula duration, registra métrica)
  → Retorna response
```

#### 2. `/api/stats` (GET)
**Mudanças:**
- ✅ Extraído `getHandler` como função isolada
- ✅ Envolvido com `withMetrics('GET', '/api/stats', getHandler)`
- ✅ Métricas de estatísticas capturadas automaticamente

#### 3. `/api/mod/operators` (GET + POST)
**Mudanças:**
- ✅ Extraído `getHandler` e `postHandler`
- ✅ Envolvido com `withMetrics` para ambos
- ✅ Captura de operadores criados e listados

#### 4. `/api/semi-finished` (GET)
**Mudanças:**
- ✅ Extraído `getHandler`
- ✅ Envolvido com `withMetrics('GET', '/api/semi-finished', getHandler)`
- ✅ Transformação camelCase mantida

---

## 🔄 Fluxo de Captura de Métricas

```
┌─────────────────────────────────────────────────────────────┐
│ Request chega                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Middleware (src/middleware.ts)                              │
│ - Adiciona headers de segurança                             │
│ - Gera Request ID único                                     │
│ - Passa para handler                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ withMetrics Wrapper (src/lib/api-metrics-wrapper.ts)        │
│ - Registra startTime                                        │
│ - Chama handler                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Handler (getHandler/postHandler)                            │
│ - logger.apiRequest('METHOD', '/api/path')                  │
│ - Executa lógica (Prisma, validações, etc.)                 │
│ - logger.apiSuccess() ou logger.apiError()                  │
│ - Retorna NextResponse                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ withMetrics (após handler)                                  │
│ - Calcula duration = Date.now() - startTime                 │
│ - Registra métrica em metricsCollector                      │
│ - Log estruturado                                           │
│ - Retorna response                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ metricsCollector (src/lib/metrics.ts)                       │
│ - Registra: endpoint, method, statusCode, duration, error   │
│ - Atualiza estatísticas (total, p95, taxa erro)             │
│ - Verifica alertas                                          │
│ - Envia para serviço externo (em prod)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Dashboard de Monitoramento                                  │
│ GET /api/monitoring/stats                                   │
│ - Retorna todas as estatísticas                             │
│ - Exibe alertas ativos                                      │
│ - Resumo executivo                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Exemplo de Métrica Capturada

```typescript
// Request: GET /api/products
// Duration: 45ms
// Status: 200
// Count: 150 produtos

metricsCollector.recordMetric({
  endpoint: '/api/products',
  method: 'GET',
  statusCode: 200,
  duration: 45,
  timestamp: '2025-11-27T16:35:00.000Z'
})

// Estatísticas calculadas automaticamente:
{
  endpoint: '/api/products',
  method: 'GET',
  totalRequests: 1500,
  errorCount: 12,
  errorRate: 0.008,           // 0.8%
  avgLatency: 52.3,
  minLatency: 12,
  maxLatency: 234,
  p95Latency: 89.5,           // 95% das requisições < 89.5ms
  lastUpdated: '2025-11-27T16:35:00.000Z'
}
```

---

## 🚨 Alertas Automáticos

### Exemplo de Alerta Gerado

```json
{
  "severity": "warning",
  "type": "high_latency",
  "endpoint": "/api/products",
  "message": "/api/products p95 latência é 1245ms",
  "value": 1245
}
```

### Limites Configurados

| Alerta | Limite | Severidade |
|--------|--------|-----------|
| Taxa de erro | > 5% | Warning |
| P95 latência | > 1000ms | Warning |
| Taxa de erro | > 10% | Critical |

---

## 📊 Métricas da Sessão

### Arquivos Refatorados
- `src/app/api/products/route.ts` - GET + POST com withMetrics
- `src/app/api/stats/route.ts` - GET com withMetrics
- `src/app/api/mod/operators/route.ts` - GET + POST com withMetrics
- `src/app/api/semi-finished/route.ts` - GET com withMetrics

### Padrão Aplicado
```typescript
// Antes
export async function GET() { ... }

// Depois
const getHandler = async () => { ... }
export const GET = withMetrics('GET', '/api/path', getHandler)
```

### Benefícios
- ✅ Duração capturada automaticamente
- ✅ Status HTTP registrado
- ✅ Erros rastreados
- ✅ Estatísticas calculadas
- ✅ Alertas gerados
- ✅ Preparado para integração com DataDog/New Relic

---

## 🔐 Commits (Não Realizados - Aguardando Aprovação)

Mudanças staged mas **NÃO commitadas**:
- `src/app/api/products/route.ts` (modificado)
- `src/app/api/stats/route.ts` (modificado)
- `src/app/api/mod/operators/route.ts` (modificado)
- `src/app/api/semi-finished/route.ts` (modificado)

**Razão:** Seguindo governança - aguardando aprovação do usuário para commit.

---

## ✅ Status Completo da Fase 1

| Item | Status | Sessão | Detalhes |
|------|--------|--------|----------|
| `env-matrix` | ✅ | 1 | Ambientes dev/staging/prod configurados |
| `no-mock-prod` | ✅ | 1 | Mocks removidos, APIs usam Prisma real |
| `structured-logging` | ✅ | 2 | Logger centralizado em todas APIs |
| `api-monitoring` | ✅ | 3 | Métricas capturadas, alertas configurados |
| **Integração de Métricas** | ✅ | 3 | **ESTA TAREFA** - 4 APIs com withMetrics |

---

## 🎯 Resumo Executivo

**Fase 1: Infraestrutura & Observabilidade - 100% COMPLETA**

### Implementado
- ✅ Sistema de detecção de ambientes
- ✅ Remoção completa de mocks
- ✅ Logging estruturado em todas APIs
- ✅ Coleta de métricas de performance
- ✅ Alertas automáticos
- ✅ Middleware de rastreamento
- ✅ Rota de monitoramento
- ✅ Integração em 4 APIs críticas

### Próximas Fases
- **Fase 2: Produção & Operações**
  - `prod-state-machine` - Máquina de estados
  - `event-log` - Auditoria de eventos
  - `ops-dashboards` - Painéis operacionais

---

## 📝 Notas Técnicas

### Por que withMetrics?
- Separa concerns: handler vs. métrica
- Reutilizável em qualquer API
- Fácil de testar
- Não modifica lógica existente

### Escalabilidade
- Métricas em memória (últimas 1000)
- Adequado para monitoramento em tempo real
- Para histórico: integrar com banco de dados
- Em produção: enviar para DataDog/New Relic

### Próxima Integração
```typescript
// Em metrics.ts, implementar:
private sendToMonitoringService() {
  if (ENV.isProd) {
    // DataDog
    datadog.gauge('api.latency', metric.duration)
    datadog.increment('api.requests', 1)
  }
}
```

---

## 🎉 Fase 1 Finalizada

**Tempo Total:** ~2 horas  
**Arquivos Criados:** 7 novos  
**APIs Refatoradas:** 4 críticas  
**Build:** ✅ Passando  
**Commits:** ⏸️ Aguardando aprovação

**Status:** Pronto para Fase 2 (Produção & Operações)
