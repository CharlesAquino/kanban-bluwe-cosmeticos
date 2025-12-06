# 🚀 Guia de Configuração do Redis no Railway

**Objetivo:** Adicionar Redis como camada de cache para melhorar performance do sistema

---

## 📋 PRÉ-REQUISITOS

- Conta no Railway
- Projeto Kanban Bluwe já deployado no Railway
- Acesso ao dashboard do Railway

---

## 🔧 PASSO A PASSO

### 1. Adicionar Serviço Redis no Railway

1. Acesse o dashboard do Railway: https://railway.app
2. Selecione o projeto **Kanban Bluwe**
3. Clique em **"+ New"** ou **"Add Service"**
4. Selecione **"Database"** → **"Add Redis"**
5. Aguarde a criação do serviço (1-2 minutos)

---

### 2. Obter URL de Conexão do Redis

Após a criação do serviço Redis:

1. Clique no serviço **Redis** no dashboard
2. Vá para a aba **"Variables"** ou **"Connect"**
3. Copie a variável **`REDIS_URL`**

**Formato esperado:**
```
redis://default:senha_gerada@redis.railway.internal:6379
```

ou

```
redis://default:senha_gerada@containers-us-west-xxx.railway.app:6379
```

---

### 3. Configurar Variável de Ambiente

#### Opção A: Via Dashboard do Railway (Recomendado)

1. No dashboard do Railway, clique no serviço **Next.js** (aplicação principal)
2. Vá para a aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione:
   - **Nome:** `REDIS_URL`
   - **Valor:** Cole a URL copiada no passo 2
5. Clique em **"Add"**
6. O Railway irá fazer **redeploy automático**

#### Opção B: Via Railway CLI

```bash
railway variables set REDIS_URL="redis://default:senha@redis.railway.internal:6379"
```

---

### 4. Configurar Localmente (Desenvolvimento)

Para testar localmente com Redis:

#### Opção A: Usar Redis do Railway (Recomendado)

Adicione no arquivo `.env.local`:

```env
# Redis do Railway (usar URL externa)
REDIS_URL="redis://default:senha@containers-us-west-xxx.railway.app:6379"
```

#### Opção B: Usar Redis Local

1. Instalar Redis localmente:

**Windows (via Chocolatey):**
```bash
choco install redis-64
redis-server
```

**macOS (via Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

2. Adicionar no `.env.local`:
```env
REDIS_URL="redis://localhost:6379"
```

---

### 5. Verificar Conexão

Após configurar, reinicie o servidor:

```bash
npm run dev
```

**Logs esperados:**

✅ **Com Redis configurado:**
```
✅ Redis connected
💾 Cache set (Redis + Memory): products:all
```

⚠️ **Sem Redis (fallback para memória):**
```
⚠️ Redis não configurado (REDIS_URL ausente) - usando fallback sem cache
💾 Cache set (Memory only): products:all
```

---

## 🧪 TESTAR CACHE

### Teste 1: Verificar Cache Hit

1. Acesse a aplicação: http://localhost:3001
2. Aguarde carregar os produtos (primeira vez: ~10s)
3. Recarregue a página (F5)
4. **Esperado:** Carregamento instantâneo (<1s)

### Teste 2: Verificar Logs do Console

Abra o console do navegador (F12) e procure por:

```
✅ Cache set (Redis + Memory): products:all
💾 Cache hit (memory): products:all
```

### Teste 3: Verificar Estatísticas do Cache

Adicione uma rota de debug (opcional):

```typescript
// src/app/api/debug/cache/route.ts
import { NextResponse } from 'next/server'
import { CacheService } from '@/lib/services/cache-service'

export async function GET() {
  const stats = CacheService.getStats()
  return NextResponse.json(stats)
}
```

Acesse: http://localhost:3001/api/debug/cache

**Resposta esperada:**
```json
{
  "memorySize": 5,
  "redisConnected": true
}
```

---

## 📊 MÉTRICAS ESPERADAS

### Antes (Sem Redis)
- ❌ Loading: 10-15 segundos (toda vez)
- ❌ Cache: 0%
- ❌ Queries ao PostgreSQL: 100%

### Depois (Com Redis)
- ✅ Loading: 2-5 segundos (primeira vez)
- ✅ Loading: <1 segundo (cache hit)
- ✅ Cache: 80-90% hit rate
- ✅ Queries ao PostgreSQL: 10-20%

---

## 🔍 TROUBLESHOOTING

### Problema: Redis não conecta

**Sintoma:**
```
Redis Client Error [AggregateError: ] { code: 'ECONNREFUSED' }
```

**Soluções:**

1. **Verificar REDIS_URL:**
   - Confirme que a URL está correta
   - Verifique se não há espaços extras
   - Teste a conexão manualmente

2. **Verificar serviço Redis no Railway:**
   - Acesse o dashboard do Railway
   - Verifique se o serviço Redis está **"Running"**
   - Se estiver **"Crashed"**, reinicie o serviço

3. **Verificar rede:**
   - Se estiver usando URL interna (`redis.railway.internal`), só funciona no Railway
   - Para desenvolvimento local, use a URL externa

---

### Problema: Cache não está funcionando

**Sintoma:**
```
💾 Cache set (Memory only): products:all
```

**Soluções:**

1. **Verificar variável de ambiente:**
   ```bash
   # No terminal do servidor
   echo $REDIS_URL
   ```

2. **Verificar logs do servidor:**
   - Procure por `✅ Redis connected`
   - Se não aparecer, Redis não está conectado

3. **Reiniciar servidor:**
   ```bash
   # Parar servidor (Ctrl+C)
   npm run dev
   ```

---

### Problema: Performance não melhorou

**Possíveis causas:**

1. **Cache ainda não foi populado:**
   - Aguarde a primeira carga completa
   - Recarregue a página para testar cache hit

2. **TTL muito curto:**
   - Verifique os TTLs no `cache-service.ts`
   - Produtos: 5 minutos (300s)
   - Stats: 10 minutos (600s)

3. **PostgreSQL ainda em cold start:**
   - Aguarde o keep-alive fazer efeito (4 minutos)
   - Após isso, cache + keep-alive devem funcionar juntos

---

## 🎯 CONFIGURAÇÕES AVANÇADAS

### Aumentar TTL do Cache

Edite `src/lib/services/cache-service.ts`:

```typescript
static async setProductsCache(data: any) {
  await HybridCache.set(cacheKeys.products(), data, 600) // 10 minutos (antes: 300)
}
```

### Configurar Redis com Senha

Se o Redis do Railway tiver senha (padrão):

```env
REDIS_URL="redis://default:SUA_SENHA_AQUI@redis.railway.internal:6379"
```

### Configurar Redis com TLS

Se o Redis exigir TLS:

```typescript
// src/lib/cache/redis-client.ts
redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false, // Para desenvolvimento
  }
})
```

---

## 📈 MONITORAMENTO

### Verificar Uso de Memória do Redis

No dashboard do Railway:
1. Clique no serviço **Redis**
2. Vá para a aba **"Metrics"**
3. Monitore:
   - **Memory Usage:** Deve ficar abaixo de 50MB
   - **CPU Usage:** Deve ficar abaixo de 10%
   - **Network:** Deve ter tráfego constante

### Logs do Redis

Para ver logs do Redis no Railway:
1. Clique no serviço **Redis**
2. Vá para a aba **"Logs"**
3. Procure por erros ou warnings

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após configurar o Redis, verifique:

- [ ] Serviço Redis está **"Running"** no Railway
- [ ] Variável `REDIS_URL` está configurada no serviço Next.js
- [ ] Logs mostram `✅ Redis connected`
- [ ] Primeira carga: 2-5 segundos
- [ ] Segunda carga: <1 segundo (cache hit)
- [ ] Console mostra `Cache set (Redis + Memory)`
- [ ] Estatísticas do cache mostram `redisConnected: true`

---

## 🚨 IMPORTANTE

### Sobre Custos

- **Redis no Railway:** Gratuito no plano Hobby (até 100MB)
- **Uso estimado:** 10-20MB para este projeto
- **Sem risco de custo extra** no plano atual

### Sobre Fallback

- O sistema **funciona sem Redis** (usa cache in-memory)
- Redis é **opcional mas recomendado** para performance
- Se Redis falhar, o sistema continua funcionando

### Sobre Segurança

- **Nunca commite** `REDIS_URL` no Git
- Use `.env.local` para desenvolvimento
- Use variáveis de ambiente do Railway para produção

---

## 📚 RECURSOS ADICIONAIS

- [Documentação do Redis](https://redis.io/docs/)
- [Railway Redis Guide](https://docs.railway.app/databases/redis)
- [Node Redis Client](https://github.com/redis/node-redis)

---

**Próximo passo:** Após configurar o Redis, teste a performance e monitore os logs!
