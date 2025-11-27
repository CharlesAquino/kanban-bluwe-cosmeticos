# Setup de Migrations - Kanban Bluwe

## 📋 Tabelas Criadas

Foram criadas 4 novas tabelas no PostgreSQL para suportar as funcionalidades restauradas:

### 1. `quality_tests`
Armazena testes de qualidade de produtos.

```sql
CREATE TABLE quality_tests (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255),
  product_name VARCHAR(255),
  batch VARCHAR(255),
  stage VARCHAR(100),
  parameter VARCHAR(100),
  target_value DECIMAL(10, 2),
  tol_min DECIMAL(10, 2),
  tol_max DECIMAL(10, 2),
  measured_value DECIMAL(10, 2),
  unit VARCHAR(50),
  operator VARCHAR(255),
  approved BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `non_conformities`
Armazena não-conformidades (NCs) de produtos.

```sql
CREATE TABLE non_conformities (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255),
  product_name VARCHAR(255),
  batch VARCHAR(255),
  stage VARCHAR(100),
  type VARCHAR(100),
  severity VARCHAR(50),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  responsible VARCHAR(255),
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `audit_events`
Armazena eventos de auditoria do sistema.

```sql
CREATE TABLE audit_events (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. `monitoring_stats`
Armazena métricas de monitoramento do sistema.

```sql
CREATE TABLE monitoring_stats (
  id VARCHAR(255) PRIMARY KEY,
  metric_name VARCHAR(100),
  metric_value DECIMAL(15, 2),
  unit VARCHAR(50),
  category VARCHAR(100),
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Como Executar as Migrations

### Opção 1: Executar SQL Manualmente

1. Conecte ao seu banco PostgreSQL
2. Abra o arquivo: `src/lib/db/migrations/001_create_quality_tables.sql`
3. Execute todo o conteúdo no seu cliente SQL (pgAdmin, DBeaver, etc.)

### Opção 2: Usar o Script TypeScript

```bash
# Instalar dependências (se não tiver)
npm install

# Executar migrations
npx ts-node scripts/run-migrations.ts
```

### Opção 3: Executar via psql (CLI)

```bash
psql -U seu_usuario -d seu_banco -f src/lib/db/migrations/001_create_quality_tables.sql
```

---

## 📡 APIs Restauradas

### 1. Qualidade

**GET /api/quality/tests**
```bash
curl http://localhost:3000/api/quality/tests
curl http://localhost:3000/api/quality/tests?productId=prod_123
```

**POST /api/quality/tests**
```bash
curl -X POST http://localhost:3000/api/quality/tests \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "productName": "Gel Construtor",
    "batch": "LOTE-001",
    "stage": "PRODUCAO_5KG",
    "parameter": "pH",
    "targetValue": 7.0,
    "tolMin": 6.5,
    "tolMax": 7.5,
    "measuredValue": 7.2,
    "unit": "pH",
    "operator": "João Silva",
    "notes": "Teste OK"
  }'
```

**GET /api/quality/nc**
```bash
curl http://localhost:3000/api/quality/nc
curl http://localhost:3000/api/quality/nc?status=open
```

**POST /api/quality/nc**
```bash
curl -X POST http://localhost:3000/api/quality/nc \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "productName": "Gel Construtor",
    "batch": "LOTE-001",
    "stage": "PRODUCAO_5KG",
    "type": "qualidade",
    "severity": "major",
    "description": "pH fora da especificação",
    "responsible": "João Silva",
    "deadline": "2025-11-30T23:59:59Z"
  }'
```

### 2. Monitoramento

**GET /api/monitoring/stats**
```bash
curl http://localhost:3000/api/monitoring/stats?metricName=cpu_usage
curl http://localhost:3000/api/monitoring/stats?category=performance&aggregated=true
```

**POST /api/monitoring/stats**
```bash
curl -X POST http://localhost:3000/api/monitoring/stats \
  -H "Content-Type: application/json" \
  -d '{
    "metricName": "cpu_usage",
    "metricValue": 45.5,
    "unit": "%",
    "category": "performance",
    "tags": { "server": "prod-1", "region": "us-east" }
  }'
```

### 3. Auditoria

**GET /api/audit/events**
```bash
curl http://localhost:3000/api/audit/events
curl http://localhost:3000/api/audit/events?userId=user_123
curl http://localhost:3000/api/audit/events?entityType=product&entityId=prod_123
curl http://localhost:3000/api/audit/events?action=create&limit=50
```

**POST /api/audit/events**
```bash
curl -X POST http://localhost:3000/api/audit/events \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "entityType": "product",
    "entityId": "prod_123",
    "userId": "user_456",
    "userName": "João Silva",
    "newValues": { "name": "Gel Construtor", "quantity": 100 },
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }'
```

---

## ✅ Checklist de Setup

- [ ] Executar migrations SQL no banco
- [ ] Testar `/api/quality/tests` (GET e POST)
- [ ] Testar `/api/quality/nc` (GET e POST)
- [ ] Testar `/api/monitoring/stats` (GET e POST)
- [ ] Testar `/api/audit/events` (GET e POST)
- [ ] Validar que as abas de Qualidade carregam dados
- [ ] Validar que o Dashboard mostra métricas de qualidade

---

## 🔧 Troubleshooting

### Erro: "Table does not exist"
- Certifique-se de que as migrations foram executadas
- Verifique se o banco está correto em `DATABASE_URL`

### Erro: "Connection refused"
- Verifique se PostgreSQL está rodando
- Verifique a string de conexão em `.env`

### Erro: "Permission denied"
- Verifique permissões do usuário PostgreSQL
- Certifique-se de que o usuário pode criar tabelas

---

## 📝 Notas

- As migrations são idempotentes (podem ser executadas múltiplas vezes)
- Índices foram criados para melhorar performance
- Timestamps são automáticos (created_at, updated_at)
- Dados antigos podem ser limpados com os métodos `cleanOldMetrics()` e `cleanOldEvents()`

---

**Status:** ✅ Pronto para produção após executar as migrations
