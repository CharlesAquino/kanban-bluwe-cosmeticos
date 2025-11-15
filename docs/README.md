# Kanban de Insumos - Sistema de Controle de Produção

## **Projeto Recriado com Next.js**

Este projeto foi completamente reconstruído usando **Next.js** com **React**, **TypeScript** e **Tailwind CSS** após problemas críticos com a versão anterior em Astro.

## **Funcionalidades Implementadas**

### **Sistema de Controle de Produção**
- **Cadastro de Produtos** com nome, OP, lote e quantidade
- **7 Estágios de Produção**:
  1. Produção de 1,00 kg
  2. Avaliação de Cor
  3. Testes do C.Q.
  4. Produção do Reator
  5. Avaliação de Cor Reator
  6. Testes de Performance Reator
  7. Produto Aprovado
- **Controle de Status**: Em Andamento, Pausado, Concluído, Bloqueado
- **Histórico de Estágios** com tempos e MOD (mão de obra)
- **Avanço Manual** entre estágios com controle de pessoas

### **Dashboard e Estatísticas**
- **Cards de Estatísticas** em tempo real
- **Contadores** por status
- **Tabela Responsiva** com todos os produtos
- **Resumo de Tempos** por estágio

### **Arquitetura Técnica**
- **Next.js 14** com App Router
- **TypeScript** para type safety
- **Prisma** + SQLite para banco de dados
- **Tailwind CSS** para estilização
- **API Routes** para operações CRUD
- **Componentes React** reutilizáveis

## **Estrutura do Banco de Dados**

```sql
-- Produtos principais
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  op TEXT NOT NULL,
  batch TEXT NOT NULL,
  quantity REAL NOT NULL,
  currentStage TEXT NOT NULL DEFAULT 'producao_1kg',
  status TEXT NOT NULL DEFAULT 'in_progress',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de estágios
CREATE TABLE stage_history (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME,
  mod INTEGER DEFAULT 1,
  notes TEXT,
  productId TEXT NOT NULL,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

## **Como Executar**

### Pré-requisitos
```bash
Node.js 18+
npm ou yarn
```

### Instalação
```bash
# Navegar para o diretório
cd kanban-nextjs

# Instalar dependências
npm install

# Configurar banco de dados
npx prisma generate
npx prisma db push

# Iniciar servidor de desenvolvimento
npm run dev
```

### Acesso
- **Aplicação:** http://localhost:3000/
- **API de Produtos:** http://localhost:3000/api/products
- **API de Estatísticas:** http://localhost:3000/api/stats

## **Estrutura do Projeto**

```
kanban-nextjs/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   │   ├── products/   # CRUD de produtos
│   │   │   └── stats/      # Estatísticas
│   │   ├── globals.css     # Estilos globais
│   │   └── page.tsx        # Página principal
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base
│   │   ├── dashboard.tsx  # Dashboard de estatísticas
│   │   ├── product-form.tsx # Formulário de produtos
│   │   └── product-table.tsx # Tabela de produtos
│   ├── lib/               # Utilitários e configurações
│   │   ├── prisma.ts      # Cliente Prisma
│   │   ├── product-service.ts # Lógica de produtos
│   │   ├── types.ts       # Definições de tipos
│   │   └── utils.ts       # Funções auxiliares
│   └── types/             # Tipos compartilhados
├── prisma/               # Configuração do banco
│   └── schema.prisma     # Esquema do banco
└── package.json         # Dependências
```

## **Funcionalidades por Estágio**

### **Produção de 1,00 kg** (Estágio Inicial)
- Produto criado automaticamente neste estágio
- Controle de quantidade inicial
- Início do controle de tempo

### **Avaliação de Cor**
- Controle de qualidade visual
- Possível bloqueio por problemas de cor

### **Testes do C.Q.**
- Testes de controle de qualidade
- Validação de especificações

### **Produção do Reator**
- Processo de produção principal
- Controle de recursos e tempo

### **Avaliação de Cor Reator**
- Segunda avaliação de cor pós-produção
- Controle de qualidade final

### **Testes de Performance Reator**
- Testes de funcionamento
- Validação técnica

### **Produto Aprovado** (Estágio Final)
- Produto liberado para uso
- Fim do ciclo de produção

## **Status do Projeto**

### **Implementado e Funcionando:**
- **Banco de dados** com Prisma + SQLite
- **API REST** completa para produtos
- **Interface React** responsiva
- **Sistema de estágios** com histórico
- **Controle de status** e ações
- **Dashboard** com estatísticas em tempo real
- **Formulário** de criação de produtos

### **Para Implementar (Futuro):**
- **Sistema de usuários** e autenticação
- **Relatórios avançados** e gráficos
- **Aplicativo móvel** (PWA)
- **Sincronização** em tempo real
- **Sistema de notificações**

## **Resultado Final**

**Aplicação Kanban completamente funcional e operacional!**

- **Framework:** Next.js 14 (React + TypeScript)
- **Banco:** Prisma + SQLite
- **Styling:** Tailwind CSS
- **Estado:** Gerenciado localmente
- **Deploy:** Pronto para Vercel/Netlify

**A aplicação está 100% operacional e pronta para uso em produção!**
