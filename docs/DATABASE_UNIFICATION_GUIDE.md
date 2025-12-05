# Database Unification Guide

## 📋 Problema Identificado

O projeto tinha **dualidade de bancos** de dados:
- **SQLite** via `better-sqlite3` em `src/lib/db.ts`
- **PostgreSQL** via `Drizzle ORM` em `src/lib/db/schema.ts`

Isso causava confusão e potencial inconsistência de dados.

## ✅ Solução Implementada

Criado **cliente unificado** em `src/lib/db-unified.ts` que:
- Detecta ambiente automaticamente
- Usa **SQLite** apenas em development
- Usa **PostgreSQL (Drizzle)** em staging/production
- Permite forçar via `DB_TYPE` env variable

## 🔧 Como Usar

### Opção 1: Cliente Unificado (Recomendado)

```typescript
import { getUnifiedDb } from '@/lib/db-unified'

const { client, type, orm } = getUnifiedDb()

if (type === 'sqlite') {
  // Usar better-sqlite3 API
  const stmt = client.prepare('SELECT * FROM products')
  const products = stmt.all()
} else {
  // Usar Drizzle ORM
  const products = await client.select().from(productsTable)
}
```

### Opção 2: Sempre Drizzle (Mais Simples)

```typescript
import { getDrizzleClient } from '@/lib/db-unified'
import { products } from '@/lib/db/schema'

const db = getDrizzleClient()
const allProducts = await db.select().from(products)
```

### Opção 3: Info do Database

```typescript
import { getDbInfo } from '@/lib/db-unified'

const info = getDbInfo()
console.log(info)
// {
//   type: 'sqlite' | 'postgres',
//   environment: 'development' | 'production' | 'staging',
//   message: 'Using SQLite (dev.db) in development'
// }
```

## 🌍 Variáveis de Ambiente

### Automático (Recomendado)
```bash
# Development
NODE_ENV=development  # → SQLite

# Staging
RAILWAY_ENVIRONMENT=staging  # → PostgreSQL

# Production
NODE_ENV=production  # → PostgreSQL
```

### Manual (Override)
```bash
# Forçar SQLite (apenas dev)
DB_TYPE=sqlite

# Forçar PostgreSQL
DB_TYPE=postgres
```

## 📊 Migração Gradual

### Services já usando Drizzle
✅ Não precisa mudar nada:
- `ProductService`
- `IntegrationService`
- Todos os `queries/*`

### APIs usando SQLite direto
⚠️ Migrar para queries Drizzle:

**Antes:**
```typescript
import { getDb } from '@/lib/db'

const db = getDb()
const stmt = db.prepare('SELECT * FROM products')
```

**Depois:**
```typescript
import { getDrizzleClient } from '@/lib/db-unified'
import { products } from '@/lib/db/schema'

const db = getDrizzleClient()
const allProducts = await db.select().from(products)
```

## 🎯 Próximos Passos

1. ✅ Cliente unificado criado
2. ⏳ Atualizar .env.example com DB_TYPE
3. ⏳ Documentar no README
4. ⏳ Migrar APIs restantes para Drizzle (gradual)
5. ⏳ Considerar remover better-sqlite3 (futuro)

## 💡 Benefícios

- ✅ **Consistência**: Um único ponto de acesso ao banco
- ✅ **Flexibilidade**: Suporta SQLite (dev) e PostgreSQL (prod)
- ✅ **Type Safety**: Drizzle ORM com TypeScript completo
- ✅ **Migração Gradual**: Não quebra código existente
- ✅ **Performance**: PostgreSQL em produção

## 🔍 Troubleshooting

### Erro: "SQLite client only available in development"
**Causa**: Tentou usar `getSqliteClient()` em produção  
**Solução**: Usar `getDrizzleClient()` ou `getUnifiedDb()`

### Dados inconsistentes
**Causa**: Mistura de SQLite e PostgreSQL  
**Solução**: Usar sempre o cliente unificado

### DATABASE_URL não configurada
**Causa**: Falta variável de ambiente  
**Solução**: Configurar DATABASE_URL no .env
