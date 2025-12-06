# 🚀 PLANO DE AÇÃO - Correção de Performance

**Data:** 06/12/2025  
**Status:** ✅ Quick Fix Implementado

---

## ✅ IMPLEMENTADO AGORA (Quick Fix)

### 1. Timeout e Pool no PostgreSQL
**Arquivo:** `src/lib/db/client.ts`

```typescript
✅ max: 20 conexões no pool
✅ connectionTimeoutMillis: 10000 (10s)
✅ query_timeout: 8000 (8s)
✅ keepAlive: true
```

**Resultado esperado:** Reduzir impacto do cold start de 15s → 10s

---

### 2. Fallback no loadProducts
**Arquivo:** `src/lib/product-operations.ts`

```typescript
✅ Timeout de 15 segundos
✅ Retorna dados vazios em caso de falha
✅ Não trava mais o sistema
```

**Resultado esperado:** Sistema carrega mesmo com banco lento

---

### 3. Monitoramento de Timeout
**Arquivo:** `src/contexts/global-context.tsx`

```typescript
✅ Alerta no console após 12s
✅ retry: 2 tentativas
```

**Resultado esperado:** Feedback visual do problema

---

### 4. Keep-Alive do PostgreSQL
**Arquivo:** `src/lib/db/keep-alive.ts` (NOVO)

```typescript
✅ Ping a cada 4 minutos
✅ Evita sleeping mode
✅ Auto-start em produção
```

**Resultado esperado:** Banco sempre "quente" após primeira carga

---

## 🔄 PRÓXIMOS PASSOS (Esta Semana)

### 1. Configurar Redis no Railway
**Prioridade:** 🔴 ALTA

**Ações:**
1. [ ] Criar serviço Redis no Railway
2. [ ] Adicionar `REDIS_URL` no .env.local
3. [ ] Testar conexão Redis
4. [ ] Verificar cache funcionando

**Tempo estimado:** 30 minutos

---

### 2. Implementar Cache Híbrido
**Prioridade:** 🟡 MÉDIA

**Arquivo:** `src/lib/cache/hybrid-cache.ts` (NOVO)

**Funcionalidades:**
- [ ] Tentar Redis primeiro
- [ ] Fallback para memória se Redis falhar
- [ ] TTL configurável
- [ ] Invalidação inteligente

**Tempo estimado:** 1-2 horas

---

### 3. Limpar Rotas 503
**Prioridade:** 🟢 BAIXA

**Rotas para avaliar:**
- [ ] `/api/tasks` - Remover ou implementar?
- [ ] `/api/tags` - Remover ou implementar?
- [ ] `/api/products/[id]/transition` - Remover ou implementar?
- [ ] `/api/semi-finished/[id]/containers` - Remover ou implementar?

**Tempo estimado:** 1 hora

---

## 📊 MÉTRICAS DE SUCESSO

### Antes (Atual)
- ❌ Loading: 30-40 segundos
- ❌ Cold start: 15 segundos
- ❌ Cache: 0% (Redis não configurado)
- ❌ UX: Loading infinito

### Depois (Esperado - Quick Fix)
- ✅ Loading: 10-15 segundos (primeira carga)
- ✅ Cold start: 10 segundos (com timeout)
- ⚠️ Cache: 0% (ainda não configurado)
- ✅ UX: Carrega com dados vazios se falhar

### Depois (Esperado - Com Redis)
- ✅ Loading: 2-5 segundos (primeira carga)
- ✅ Loading: <1 segundo (cache hit)
- ✅ Cold start: Irrelevante (cache)
- ✅ Cache: 80-90% hit rate
- ✅ UX: Instantâneo

---

## 🧪 COMO TESTAR

### 1. Testar Quick Fix (AGORA)
```bash
# Reiniciar servidor
npm run dev

# Abrir http://localhost:3001
# Observar console do navegador
# Verificar se carrega em até 15 segundos
```

**Sinais de sucesso:**
- ✅ Página carrega (mesmo que vazia)
- ✅ Console mostra warning após 12s
- ✅ Não trava infinitamente

---

### 2. Testar Keep-Alive (Após 5 minutos)
```bash
# Aguardar 5 minutos sem usar o sistema
# Recarregar a página
# Verificar se carrega mais rápido (sem cold start)
```

**Sinais de sucesso:**
- ✅ Carrega em <5 segundos
- ✅ Console do servidor mostra "PostgreSQL keep-alive ping - OK"

---

### 3. Testar com Redis (Após configuração)
```bash
# Configurar REDIS_URL
# Reiniciar servidor
# Carregar página 2x
```

**Sinais de sucesso:**
- ✅ Primeira carga: 5-10 segundos
- ✅ Segunda carga: <1 segundo
- ✅ Console mostra "Redis connected"

---

## 🎯 DECISÕES SOBRE BANCO DE DADOS

### PostgreSQL (Manter)
- ✅ **Decisão:** Manter como banco principal
- ✅ **Motivo:** Melhor para dados relacionais + ACID
- ✅ **Otimização:** Keep-alive + pool de conexões

### Redis (Adicionar)
- ✅ **Decisão:** Adicionar como camada de cache
- ✅ **Motivo:** Zero cold start + latência <10ms
- ✅ **Uso:** Cache de leitura + session storage

### MongoDB (Não usar)
- ❌ **Decisão:** Não migrar
- ❌ **Motivo:** Não resolve cold start + requer migração completa
- ❌ **Alternativa:** Redis para cache é suficiente

### MySQL (Não usar)
- ❌ **Decisão:** Não migrar
- ❌ **Motivo:** Mesmo problema de cold start do PostgreSQL
- ❌ **Alternativa:** Otimizar PostgreSQL atual

---

## 📝 NOTAS IMPORTANTES

### Sobre Cold Start
- Railway coloca PostgreSQL em "sleep" após 5 min de inatividade
- Primeira query após sleep: 5-15 segundos
- Keep-alive resolve isso fazendo ping a cada 4 minutos
- Redis nunca entra em sleep (sempre quente)

### Sobre Cache
- Redis é ESSENCIAL para performance
- Cache in-memory é fallback temporário
- 80-90% das queries podem vir do cache
- TTL de 5 minutos é ideal para dados de produção

### Sobre Rotas 503
- Não afetam o loading inicial
- Mas causam confusão e "ruído" no sistema
- Devem ser removidas ou implementadas
- Prioridade baixa (não urgente)

---

## 🚨 ALERTAS

### Se o problema persistir após Quick Fix
1. Verificar logs do Railway (PostgreSQL)
2. Verificar se DATABASE_URL está correta
3. Testar conexão direta ao banco
4. Considerar aumentar timeout para 20s

### Se Redis não conectar
1. Verificar REDIS_URL no .env.local
2. Verificar serviço Redis no Railway
3. Usar cache in-memory como fallback
4. Não bloquear o sistema por falta de Redis

---

**Próxima revisão:** Após testar Quick Fix (hoje)  
**Próxima implementação:** Redis + Cache Híbrido (esta semana)
