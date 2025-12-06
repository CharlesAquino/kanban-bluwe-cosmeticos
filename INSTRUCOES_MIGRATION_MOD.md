# 🔧 MIGRATION NECESSÁRIA: Adicionar MOD_OPERATOR

## Problema Identificado

O enum `user_role` no banco de dados PostgreSQL não tem o valor `MOD_OPERATOR`, que é necessário para cadastrar operadores MOD.

---

## ✅ SOLUÇÃO

### Opção 1: Via Railway Dashboard (Recomendado)

1. Acesse o Railway: https://railway.app
2. Clique no serviço **Postgres**
3. Vá para a aba **"Data"** ou **"Query"**
4. Execute este SQL:

```sql
-- Adicionar MOD_OPERATOR ao enum user_role
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'MOD_OPERATOR';
```

5. Verifique se foi adicionado:

```sql
-- Verificar valores do enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'user_role'
)
ORDER BY enumlabel;
```

**Resultado esperado:**
```
ADMIN
MANAGER
MOD_OPERATOR  ← Novo!
OPERATOR
VIEWER
```

---

### Opção 2: Via psql (Terminal)

Se você tiver acesso ao psql:

```bash
# Conectar ao PostgreSQL do Railway
psql postgresql://postgres:OVfLRiilIWYosrJVEaUSUbAqImKThDyJ@switchback.proxy.rlwy.net:20669/railway

# Executar migration
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'MOD_OPERATOR';

# Verificar
\dT+ user_role
```

---

### Opção 3: Via Script (Após corrigir conexão)

```bash
npx tsx scripts/apply-mod-operator-migration.ts
```

---

## 📋 VERIFICAÇÃO

Após executar a migration, teste cadastrando um operador:

1. Acesse: http://localhost:3001/admin/mod
2. Clique em "Novo MOD"
3. Preencha:
   - Nome: "Teste MOD"
   - Email: "teste@empresa.com"
   - Função: "Operador de Teste"
4. Salvar

**Se funcionar:** ✅ Migration aplicada com sucesso!  
**Se der erro:** ❌ Execute a migration novamente

---

## 🚨 IMPORTANTE

Esta migration precisa ser executada **ANTES** de cadastrar operadores MOD no sistema.

Sem ela, você verá erros como:
```
invalid input value for enum user_role: "MOD_OPERATOR"
```

---

## 📝 ARQUIVOS CRIADOS

- `src/lib/db/migrations/002_add_mod_operator_role.sql` - Migration SQL
- `scripts/apply-mod-operator-migration.ts` - Script de aplicação
- `INSTRUCOES_MIGRATION_MOD.md` - Este arquivo

---

**Próximo passo:** Execute a migration via Railway Dashboard (Opção 1)
