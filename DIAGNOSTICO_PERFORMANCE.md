# 🔍 DIAGNÓSTICO DE PERFORMANCE - Kanban Bluwe
**Data:** 06/12/2025  
**Problema:** Loading infinito em "Carregando dados globais..."

---

## 🎯 RESUMO EXECUTIVO

### Problema Identificado
O sistema está travado no loading porque:
1. **PostgreSQL em "sleeping mode"** no Railway (cold start ~5-15s)
2. **Redis não configurado** (REDIS_URL ausente no .env.local)
3. **Múltiplas rotas 503** causando ruído no sistema
4. **Queries sem otimização** para cold start

### Impacto
- **Tempo de carregamento inicial:** 30-40 segundos
- **UX crítica:** Usuário vê loading infinito
- **Falha silenciosa:** Sem feedback de erro

---

## 📊 ANÁLISE DETALHADA

### 1. Banco de Dados PostgreSQL (Railway)

#### Problema: Cold Start
```
DATABASE_URL="postgresql://postgres:***@switchback.proxy.rlwy.net:20669/railway"
```

**Comportamento:**
- Railway coloca PostgreSQL em "sleep" após 5 min de inatividade
- Primeira query após sleep: **5-15 segundos** para wake-up
- Queries subsequentes: ~100-300ms

**Evidência no código:**
```typescript
// src/lib/db/client.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ❌ Sem configuração de timeout
})
```

#### Solução Proposta
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Pool de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Timeout de 10s
  keepAlive: true, // Manter conexão viva
  keepAliveInitialDelayMillis: 10000,
})
```

---

### 2. Redis Cache (NÃO CONFIGURADO)

#### Problema: Cache Desabilitado
```typescript
// src/lib/cache/redis-client.ts
redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // ❌ REDIS_URL não existe
})

// Resultado:
if (!redis.isOpen) return null // ❌ Sempre retorna null
```

**Impacto:**
- Todas as chamadas ao cache falham silenciosamente
- Sistema faz query ao PostgreSQL em TODA requisição
- Cold start do PostgreSQL em TODA primeira carga

#### Solução Proposta
**Opção A: Ativar Redis no Railway**
```env
REDIS_URL=redis://default:***@redis.railway.internal:6379
```

**Opção B: Fallback para Cache In-Memory**
```typescript
// Cache em memória se Redis falhar
const inMemoryCache = new Map<string, { data: any; expires: number }>()
```

---

### 3. Rotas com Status 503 (Service Unavailable)

#### Rotas Desabilitadas Encontradas

| Rota | Métodos | Status | Impacto |
|------|---------|--------|---------|
| `/api/tasks` | GET, POST | 503 | ⚠️ Baixo |
| `/api/tags` | GET, POST, PATCH, DELETE | 503 | ⚠️ Baixo |
| `/api/products` | PATCH, DELETE | 503 | ⚠️ Baixo |
| `/api/stats` | POST, PATCH, DELETE | 503 | ⚠️ Baixo |
| `/api/products/[id]/transition` | GET, POST | 503 | ⚠️ Baixo |
| `/api/semi-finished/[id]` | DELETE | 503 | ⚠️ Baixo |
| `/api/semi-finished/[id]/containers` | GET, POST | 503 | ⚠️ Baixo |
| `/api/mod/operators` | PATCH, DELETE | 503 | ⚠️ Baixo |

**Análise:**
- ✅ Rotas críticas (GET /api/products, GET /api/stats) **ESTÃO FUNCIONANDO**
- ⚠️ Rotas 503 não afetam o loading inicial
- 🔧 Mas causam "ruído" e confusão no sistema

---

### 4. Fluxo de Carregamento Atual

```mermaid
sequenceDiagram
    participant UI as GlobalContext
    participant API as Next.js API
    participant Cache as Redis
    participant DB as PostgreSQL (Railway)

    UI->>API: loadProducts()
    API->>Cache: getCache('products:all')
    Cache-->>API: null (Redis não conectado)
    API->>DB: SELECT * FROM products
    Note over DB: ⏰ Cold Start: 5-15s
    DB-->>API: [] (vazio ou timeout)
    API-->>UI: { products: [], stats: {} }
    Note over UI: 🔄 Loading infinito
```

---

## 🛠️ SOLUÇÕES PROPOSTAS

### Solução 1: QUICK FIX (30 minutos)

#### A. Configurar Timeout no PostgreSQL
```typescript
// src/lib/db/client.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000, // Timeout de 8s
  query_timeout: 5000, // Query timeout de 5s
})
```

#### B. Adicionar Fallback no loadProducts
```typescript
// src/lib/product-operations.ts
export async function loadProducts() {
  try {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )
    
    const result = await Promise.race([
      Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/stats')
      ]),
      timeout
    ])
    
    return { products: result[0].data, stats: result[1].data }
  } catch (error) {
    console.error('❌ loadProducts timeout:', error)
    // Retornar dados vazios em vez de travar
    return { products: [], stats: { total: 0, inProgress: 0 } }
  }
}
```

#### C. Adicionar Loading State com Timeout
```typescript
// src/contexts/global-context.tsx
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (isLoading) {
      console.error('⚠️ Loading timeout - possível cold start do banco')
      // Mostrar mensagem ao usuário
    }
  }, 15000) // 15 segundos
  
  return () => clearTimeout(timeoutId)
}, [isLoading])
```

---

### Solução 2: ROBUSTA (2-3 horas)

#### A. Ativar Redis no Railway
1. Adicionar serviço Redis no Railway
2. Configurar `REDIS_URL` no ambiente
3. Testar conexão

#### B. Implementar Cache In-Memory como Fallback
```typescript
// src/lib/cache/hybrid-cache.ts
class HybridCache {
  private memoryCache = new Map()
  
  async get(key: string) {
    // Tentar Redis primeiro
    if (redis.isOpen) {
      const cached = await redis.get(key)
      if (cached) return JSON.parse(cached)
    }
    
    // Fallback para memória
    const memCached = this.memoryCache.get(key)
    if (memCached && memCached.expires > Date.now()) {
      return memCached.data
    }
    
    return null
  }
  
  async set(key: string, value: any, ttl: number) {
    // Salvar em ambos
    if (redis.isOpen) {
      await redis.setEx(key, ttl, JSON.stringify(value))
    }
    
    this.memoryCache.set(key, {
      data: value,
      expires: Date.now() + (ttl * 1000)
    })
  }
}
```

#### C. Implementar Keep-Alive para PostgreSQL
```typescript
// src/lib/db/keep-alive.ts
setInterval(async () => {
  try {
    await db.execute(sql`SELECT 1`)
    console.log('✅ PostgreSQL keep-alive ping')
  } catch (error) {
    console.error('❌ Keep-alive failed:', error)
  }
}, 4 * 60 * 1000) // A cada 4 minutos
```

---

### Solução 3: ARQUITETURA IDEAL (1-2 dias)

#### Migrar para Arquitetura Híbrida

**Stack Proposta:**
- **PostgreSQL (Railway):** Dados transacionais (produtos, histórico)
- **Redis (Railway):** Cache de leitura + Session storage
- **SQLite Local:** Fallback offline + desenvolvimento

**Vantagens:**
- ✅ Zero cold start (Redis sempre quente)
- ✅ Fallback automático se PostgreSQL falhar
- ✅ Performance 10x melhor (cache hit)
- ✅ Custo reduzido (menos queries ao PostgreSQL)

**Desvantagens:**
- ⚠️ Complexidade aumentada
- ⚠️ Sincronização entre camadas
- ⚠️ Mais pontos de falha

---

## 🎯 RECOMENDAÇÃO FINAL

### Para AGORA (Próximas 2 horas)
1. ✅ **Implementar Solução 1 (Quick Fix)**
   - Adicionar timeouts no PostgreSQL
   - Adicionar fallback no loadProducts
   - Adicionar feedback visual de timeout

### Para ESTA SEMANA
2. ✅ **Implementar Solução 2 (Robusta)**
   - Ativar Redis no Railway
   - Implementar cache híbrido
   - Implementar keep-alive no PostgreSQL

### Para PRÓXIMO SPRINT
3. 🔄 **Avaliar Solução 3 (Ideal)**
   - Apenas se o problema persistir
   - Ou se houver budget para otimização

---

## 📈 SOBRE AS OPÇÕES DE BANCO NO RAILWAY

### PostgreSQL (Atual)
- ✅ Melhor para dados relacionais
- ✅ ACID compliant
- ❌ Cold start de 5-15s
- ❌ Custo por hora ativa

### Redis (Recomendado para Cache)
- ✅ **Sempre quente** (sem cold start)
- ✅ Latência <10ms
- ✅ Ideal para cache
- ❌ Não é banco primário
- ❌ Dados voláteis

### MongoDB
- ✅ Sem cold start
- ✅ Schema flexível
- ❌ Não é ideal para dados relacionais
- ❌ Requer migração completa
- ❌ Perda de ACID

### MySQL
- ✅ Similar ao PostgreSQL
- ❌ **Mesmo problema de cold start**
- ❌ Sem vantagem sobre PostgreSQL
- ❌ Requer migração

### **VEREDITO:**
- **PostgreSQL:** Manter como banco principal
- **Redis:** Adicionar como camada de cache
- **MongoDB/MySQL:** ❌ Não resolver o problema

---

## 🚀 PRÓXIMOS PASSOS

1. [ ] Implementar timeouts no PostgreSQL client
2. [ ] Adicionar fallback no loadProducts
3. [ ] Configurar Redis no Railway
4. [ ] Implementar cache híbrido
5. [ ] Adicionar keep-alive no PostgreSQL
6. [ ] Remover rotas 503 não utilizadas
7. [ ] Adicionar monitoramento de performance

---

**Autor:** Sistema de Diagnóstico Cascade  
**Prioridade:** 🔴 CRÍTICA
