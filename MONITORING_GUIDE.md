# Guia de Monitoramento - Kanban Bluwe

## 📊 Como Monitorar as Abas em Produção

### 1. Aba de Qualidade (`/quality`)

**O que verificar:**
- Página carrega sem erros
- Formulários de "Teste de Qualidade" e "Não-Conformidade" aparecem
- Dados de testes aparecem na tabela
- Dados de NCs aparecem na tabela

**Logs esperados:**
```
✅ GET /api/quality/tests - 200 OK
✅ GET /api/quality/nc - 200 OK
```

**Erros comuns:**
- `503 Service Unavailable` - Rota desativada (tabelas não criadas)
- `500 Internal Server Error` - Erro na query ao banco

---

### 2. Dashboard (`/dashboard`)

**O que verificar:**
- Card de Qualidade mostra:
  - Total de testes
  - Testes rejeitados
  - NCs abertas
  - Taxa de aprovação

**Logs esperados:**
```
✅ GET /api/quality/tests - 200 OK
✅ GET /api/quality/nc - 200 OK
✅ GET /api/semi-finished - 200 OK
```

---

### 3. Admin Quality (`/admin/quality`)

**O que verificar:**
- Página carrega sem erros
- Tabelas de testes e NCs aparecem
- Filtros funcionam

---

## 🔍 Como Monitorar Logs

### Local (Desenvolvimento)

**Terminal 1 - Iniciar servidor:**
```bash
npm run dev
```

**Terminal 2 - Rodar testes:**
```bash
node scripts/test-apis.cjs
```

**Verificar logs:**
```bash
# Ver logs de erro
npm run dev 2>&1 | grep -i error

# Ver logs de API
npm run dev 2>&1 | grep -i "GET\|POST"
```

---

### Produção (Railway)

**Acessar logs:**
1. Ir para Railway dashboard
2. Selecionar projeto "kanban-bluwe-cosmeticos"
3. Clicar em "Logs"
4. Filtrar por:
   - `error` - Erros
   - `GET /api/quality` - Requisições de qualidade
   - `GET /api/audit` - Requisições de auditoria
   - `GET /api/monitoring` - Requisições de monitoramento

**Comandos úteis:**
```bash
# Ver últimos 100 logs
railway logs -n 100

# Ver logs em tempo real
railway logs -f

# Filtrar por erro
railway logs | grep -i error
```

---

## ✅ Checklist de Validação

### Antes de Ir para Produção

- [ ] Migrations executadas no banco local
- [ ] Testes locais passam: `node scripts/test-apis.cjs`
- [ ] Aba Qualidade carrega dados
- [ ] Dashboard mostra métricas
- [ ] Sem erros 500 nos logs

### Após Deploy em Produção

- [ ] Verificar logs do Railway
- [ ] Testar `/api/quality/tests` (GET)
- [ ] Testar `/api/quality/nc` (GET)
- [ ] Testar `/api/monitoring/stats` (GET)
- [ ] Testar `/api/audit/events` (GET)
- [ ] Aba Qualidade carrega dados
- [ ] Dashboard mostra métricas
- [ ] Sem erros 500 nos logs

---

## 🚨 Troubleshooting

### Erro: "Table does not exist"

**Causa:** Migrations não foram executadas no banco de produção

**Solução:**
```bash
# Conectar ao banco de produção
psql $DATABASE_URL < src/lib/db/migrations/001_create_quality_tables.sql

# OU usar o script
node scripts/run-migrations.cjs
```

---

### Erro: "Module not found: '@/lib/prisma'"

**Causa:** Ainda há rotas com imports de Prisma antigo

**Solução:**
```bash
# Remover rotas obsoletas
git clean -fd src/app/api/

# Fazer rebuild
npm run build
```

---

### Erro: "Connection refused"

**Causa:** PostgreSQL não está rodando ou DATABASE_URL está incorreta

**Solução:**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"
```

---

## 📈 Métricas para Monitorar

### Performance

- **Tempo de resposta das APIs:**
  - `/api/quality/tests` - Deve ser < 200ms
  - `/api/quality/nc` - Deve ser < 200ms
  - `/api/monitoring/stats` - Deve ser < 200ms
  - `/api/audit/events` - Deve ser < 500ms (pode ter muitos dados)

- **Taxa de erro:**
  - Deve ser < 1%
  - Alertar se > 5%

### Dados

- **Quantidade de registros:**
  - Monitorar crescimento de `quality_tests`
  - Monitorar crescimento de `non_conformities`
  - Limpar dados antigos regularmente

---

## 🧹 Limpeza de Dados Antigos

Para manter performance, limpar dados antigos regularmente:

```bash
# Limpar testes de qualidade com mais de 90 dias
DELETE FROM quality_tests WHERE created_at < NOW() - INTERVAL '90 days';

# Limpar NCs fechadas com mais de 180 dias
DELETE FROM non_conformities WHERE status = 'closed' AND created_at < NOW() - INTERVAL '180 days';

# Limpar eventos de auditoria com mais de 365 dias
DELETE FROM audit_events WHERE created_at < NOW() - INTERVAL '365 days';

# Limpar métricas com mais de 30 dias
DELETE FROM monitoring_stats WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 📞 Contato e Suporte

Se encontrar problemas:

1. Verificar logs: `railway logs -f`
2. Rodar testes locais: `node scripts/test-apis.cjs`
3. Verificar migrations: `psql $DATABASE_URL -c "\dt"`
4. Consultar `SETUP_MIGRATIONS.md` para mais detalhes

---

**Última atualização:** 2025-11-27
**Status:** ✅ Pronto para produção
