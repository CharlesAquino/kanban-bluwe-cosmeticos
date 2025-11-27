# Sessão de Implementação: API Monitoring

**Data:** 27 de Novembro de 2025  
**Persona Técnica:** SRE/Infraestrutura  
**Item do Plano:** `api-monitoring`

---

## 📊 Objetivo da Sessão

Implementar sistema de **monitoramento de APIs** com coleta de métricas de latência, taxa de erro e alertas automáticos.

---

## ✅ O Que Foi Implementado

### 1. Sistema de Coleta de Métricas
**Arquivo:** `src/lib/metrics.ts` (180 linhas)

#### Características:
- **Métrica Registrada:** `ApiMetric` com:
  - `endpoint`, `method`, `statusCode`, `duration`, `timestamp`, `error`, `userId`
  
- **Estatísticas Calculadas:**
  - Total de requisições por endpoint
  - Taxa de erro (%)
  - Latência média, mínima, máxima
  - **P95 latência** (percentil 95)
  - Contagem de erros

- **Alertas Automáticos:**
  - ⚠️ **Warning:** Taxa de erro > 5%
  - ⚠️ **Warning:** P95 latência > 1000ms
  - 🔴 **Critical:** Taxa de erro > 10%

- **Preparado para Integração:**
  - Placeholder para DataDog, New Relic, Elastic
  - Apenas em produção (`ENV.isProd`)

#### Exemplo de Uso:
```typescript
metricsCollector.recordMetric({
  endpoint: '/api/products',
  method: 'GET',
  statusCode: 200,
  duration: 45,
  timestamp: new Date().toISOString()
})

// Obter estatísticas
const stats = metricsCollector.getEndpointStats('GET', '/api/products')
// {
//   endpoint: '/api/products',
//   method: 'GET',
//   totalRequests: 150,
//   errorCount: 3,
//   errorRate: 0.02,
//   avgLatency: 52.3,
//   p95Latency: 89.5,
//   ...
// }

// Verificar alertas
const alerts = metricsCollector.checkAlerts()
```

---

### 2. Middleware para Rastreamento
**Arquivo:** `src/middleware.ts` (NOVO - 40 linhas)

#### Funcionalidades:
- ✅ Adiciona headers de segurança:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`

- ✅ Gera Request ID único para rastreamento:
  - Formato: `${timestamp}-${random}`
  - Headers: `X-Request-ID`, `X-Correlation-ID`

- ✅ Processa todas as rotas `/api/*`

#### Benefício:
- Correlação de logs entre middleware e handlers
- Rastreamento de requisições em produção
- Segurança adicional via headers

---

### 3. Rota de Monitoramento
**Arquivo:** `src/app/api/monitoring/stats/route.ts` (NOVO - 50 linhas)

#### Endpoint:
```
GET /api/monitoring/stats
```

#### Response:
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "endpoint": "/api/products",
        "method": "GET",
        "totalRequests": 150,
        "errorCount": 3,
        "errorRate": 0.02,
        "avgLatency": 52.3,
        "p95Latency": 89.5,
        "minLatency": 12,
        "maxLatency": 234,
        "lastUpdated": "2025-11-27T16:30:00Z"
      }
    ],
    "alerts": [
      {
        "severity": "warning",
        "type": "high_latency",
        "endpoint": "/api/stats",
        "message": "/api/stats p95 latência é 1245ms",
        "value": 1245
      }
    ],
    "summary": {
      "totalEndpoints": 4,
      "totalAlerts": 2,
      "criticalAlerts": 0,
      "warningAlerts": 2
    }
  },
  "meta": {
    "timestamp": "2025-11-27T16:30:00Z"
  }
}
```

---

### 4. Helper para Integração Fácil
**Arquivo:** `src/lib/api-metrics-wrapper.ts` (NOVO - 65 linhas)

#### Uso:
```typescript
import { withMetrics } from '@/lib/api-metrics-wrapper'

const handler = async (request: NextRequest) => {
  // sua lógica
  return NextResponse.json({ data })
}

export const GET = withMetrics('GET', '/api/products', handler)
```

#### O que faz:
- ✅ Captura duração automaticamente
- ✅ Registra métrica (sucesso ou erro)
- ✅ Loga estruturado
- ✅ Retorna erro padronizado em caso de exceção

---

## 📐 Arquitetura de Monitoramento

```
Request
  ↓
Middleware (src/middleware.ts)
  ├─ Adiciona headers de segurança
  ├─ Gera Request ID
  └─ Passa para handler
    ↓
API Handler (com logger)
  ├─ logger.apiRequest()
  ├─ Executa lógica
  ├─ logger.apiSuccess() ou logger.apiError()
  └─ Retorna response
    ↓
Métricas Capturadas (src/lib/metrics.ts)
  ├─ Registra duração, status, erro
  ├─ Calcula estatísticas
  ├─ Verifica alertas
  └─ Envia para serviço externo (em prod)
    ↓
Dashboard de Monitoramento
  └─ GET /api/monitoring/stats
```

---

## 📊 Métricas da Sessão

### Arquivos Criados
- `src/lib/metrics.ts` (180 linhas) - Coleta e análise de métricas
- `src/middleware.ts` (40 linhas) - Middleware de rastreamento
- `src/app/api/monitoring/stats/route.ts` (50 linhas) - Rota de estatísticas
- `src/lib/api-metrics-wrapper.ts` (65 linhas) - Helper de integração

### Total
- **335 linhas de código novo**
- **4 novos arquivos**
- **0 arquivos modificados** (integração é opcional via wrapper)

---

## 🚀 Próximos Passos (Sugeridos)

### 1. Integrar Métricas nas APIs Existentes
Refatorar as 4 APIs críticas para usar `withMetrics`:

```typescript
// Antes
export async function GET() { ... }

// Depois
const getHandler = async () => { ... }
export const GET = withMetrics('GET', '/api/products', getHandler)
```

### 2. Integração com Serviço Externo
Implementar em `metrics.ts`:
```typescript
private sendToMonitoringService() {
  if (ENV.isProd) {
    // DataDog
    datadog.gauge('api.latency', metric.duration)
    datadog.increment('api.requests', 1)
    
    // OU New Relic
    newrelic.recordMetric('api.latency', metric.duration)
    
    // OU Elastic
    elasticsearch.index({ index: 'api-metrics', body: metric })
  }
}
```

### 3. Dashboard de Observabilidade
Criar página `/admin/monitoring` que:
- Exibe dados de `/api/monitoring/stats`
- Mostra gráficos de latência (Chart.js, Recharts)
- Exibe alertas em tempo real
- Permite filtrar por endpoint/período

### 4. Alertas em Tempo Real
Configurar webhooks:
- Slack: notificar quando `critical_error_rate`
- Email: alertas diários de performance
- PagerDuty: escalação de incidentes críticos

---

## 🔐 Commits (Não Realizados - Aguardando Aprovação)

Mudanças staged mas **NÃO commitadas**:
- `src/lib/metrics.ts` (novo)
- `src/middleware.ts` (novo)
- `src/app/api/monitoring/stats/route.ts` (novo)
- `src/lib/api-metrics-wrapper.ts` (novo)

**Razão:** Seguindo governança - aguardando aprovação do usuário para commit.

---

## ✅ Status dos Itens do Plano

| Item | Status | Observações |
|------|--------|-------------|
| `env-matrix` | ✅ COMPLETO | Sessão 1 |
| `no-mock-prod` | ✅ COMPLETO | Sessão 1 |
| `structured-logging` | ✅ COMPLETO | Sessão 2 |
| `api-monitoring` | ✅ COMPLETO | **ESTA SESSÃO** |

---

## 🎯 Resumo Executivo

**Missão Cumplida:**
- ✅ Sistema de coleta de métricas implementado
- ✅ Middleware de rastreamento adicionado
- ✅ Rota de monitoramento criada
- ✅ Helper para integração fácil
- ✅ Alertas automáticos configurados
- ✅ Build passando sem erros
- ✅ Preparado para integração com serviços externos

**Próximo:**
- Integrar `withMetrics` nas 4 APIs críticas
- Conectar com DataDog/New Relic/Elastic
- Criar dashboard de observabilidade

**Tempo de Sessão:** ~25 minutos  
**Complexidade:** Média (novo sistema, sem refatoração de existentes)  
**Risco:** Baixo (código isolado, não afeta APIs existentes)

---

## 📝 Notas Técnicas

### Por que P95 Latência?
- Melhor métrica que média (menos sensível a outliers)
- Padrão da indústria para SLOs
- Exemplo: "99% das requisições < 100ms"

### Por que Limites Específicos?
- **5% erro rate:** Tolerância razoável em produção
- **1000ms latência:** Limite de UX aceitável
- **10% erro rate:** Crítico, requer ação imediata

### Escalabilidade
- Mantém últimas 1000 métricas em memória
- Últimas 100 latências por endpoint
- Adequado para monitoramento em tempo real
- Para histórico, integrar com banco de dados

---

## 🔗 Integração Futura

### DataDog
```typescript
import { StatsD } from 'node-statsd'
const statsd = new StatsD()
statsd.gauge('api.latency', duration, { endpoint })
```

### New Relic
```typescript
import newrelic from 'newrelic'
newrelic.recordMetric('Custom/API/Latency', duration)
```

### Elastic
```typescript
const client = new Client({ node: 'http://localhost:9200' })
await client.index({ index: 'api-metrics', body: metric })
```

---

## ✨ Fase 1 Completa

**Infraestrutura & Observabilidade:**
- ✅ `env-matrix` - Ambientes configurados
- ✅ `no-mock-prod` - Mocks removidos
- ✅ `structured-logging` - Logs estruturados
- ✅ `api-monitoring` - Monitoramento implementado

**Próxima Fase:** Produção & Operações
- `prod-state-machine` - Máquina de estados
- `event-log` - Auditoria de eventos
- `ops-dashboards` - Painéis operacionais
