# 🏭 Sistema Kanban de Produção

**Sistema completo de controle de produção** com Next.js 15, SQLite, Prisma ORM e servidores MCP especializados. Projeto refatorado com estrutura organizada e código limpo.

## 📁 Estrutura do Projeto

```
kanban-nextjs/
├── 📚 docs/                    # Documentação completa
│   ├── README.md              # Documentação principal
│   ├── IMPLEMENTATION_REPORT.md
│   ├── SISTEMA_NEURAL_COMPLETO.md
│   └── ... (todos os arquivos .md)
├── 🔧 scripts/                 # Scripts e ferramentas
│   ├── setup-mcp.ps1          # Setup dos servidores MCP
│   ├── test-*.ps1             # Scripts de teste
│   └── ... (scripts em PowerShell e Shell)
├── 🧪 tests/                   # Arquivos de teste
│   ├── test-*.ps1             # Testes PowerShell
│   ├── test-*.sh              # Testes Shell
│   └── ... (scripts de teste)
├── 🤖 mcp-servers/             # Servidores MCP
│   ├── server.js              # Servidor principal MCP
│   ├── database.js            # Servidor banco de dados
│   ├── neural-*.js            # Servidores neurais
│   └── ... (todos os servidores MCP)
├── 🖥️ src/                     # Código fonte
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # APIs REST
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes UI (shadcn/ui)
│   │   └── ... (outros componentes)
│   ├── lib/                   # Utilitários e configurações
│   └── types/                 # Definições TypeScript
├── 🔧 Configuração            # Arquivos de configuração
│   ├── package.json           # Dependências e scripts
│   ├── tsconfig.json          # Configuração TypeScript
│   ├── next.config.js         # Configuração Next.js
│   └── ... (outros configs)
└── 📄 Arquivos principais     # Arquivos na raiz
    ├── dev.db                 # Banco SQLite
    └── README.md              # Este arquivo
```

## 🚀 Instalação e Setup

### 1. Clone o repositório
```bash
git clone <repository-url>
cd kanban-nextjs
```

### 2. Instale dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Gere o cliente Prisma
npm run prisma:generate

# Configure o banco SQLite
npm run prisma:push
```

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

## 📊 Funcionalidades Implementadas

### 🎯 Sistema de Produção
- ✅ **Gerenciamento de Produtos**: CRUD completo
- ✅ **Controle de Estágios**: Backlog → 1kg → Avaliação → 5kg → Aprovação
- ✅ **Sistema de OP**: Ordem de Produção única
- ✅ **Controle de Lotes**: Gerenciamento de quantidades
- ✅ **Status Tracking**: active, paused, blocked, completed
- ✅ **Validações Automáticas**: Business rules implementadas

### 🔌 APIs REST
- ✅ **GET /api/products** - Listar todos os produtos
- ✅ **POST /api/products** - Criar novo produto
- ✅ **GET /api/products/[id]** - Buscar produto por ID
- ✅ **PUT /api/products/[id]** - Atualizar produto
- ✅ **DELETE /api/products/[id]** - Deletar produto
- ✅ **POST /api/products/[id]/advance** - Avançar estágio
- ✅ **POST /api/products/[id]/pause** - Pausar produção
- ✅ **POST /api/products/[id]/resume** - Retomar produção
- ✅ **POST /api/products/[id]/block** - Bloquear produção

### 🗄️ Banco de Dados
- ✅ **SQLite** para desenvolvimento
- ✅ **Prisma ORM** configurado
- ✅ **Schema** otimizado
- ✅ **Migrations** automáticas
- ✅ **TypeScript** tipado

### 🎨 Interface
- ✅ **Next.js 15** com App Router
- ✅ **TypeScript** completo
- ✅ **Tailwind CSS** (configurado)
- ✅ **Componentes UI** (shadcn/ui)
- ✅ **Design Responsivo**

## 🤖 Servidores MCP

O projeto inclui **8 servidores MCP especializados**:

### 📋 Servidores Disponíveis
```bash
# Servidor principal
npm run mcp:serve

# Servidor de banco de dados
npm run mcp:database

# Servidor SQLite
npm run mcp:sqlite

# Servidor de APIs
npm run mcp:api

# Servidor de sistema de arquivos
npm run mcp:filesystem

# Servidor de fetch (HTTP requests)
npm run mcp:fetch

# Servidor Terraform (infraestrutura)
npm run mcp:terraform

# Servidor Exa (busca)
npm run mcp:exa

# Todos os servidores
npm run mcp:all
```

### 🧠 Sistema Neural
```bash
# Análise neural
npm run neural:analyze

# Sistema neural completo
npm run neural:system

# Status do sistema neural
npm run neural:status

# Orquestração neural
npm run mcp:neural-orchestrated
```

## 🧪 Testes

### Scripts de Teste
```bash
# Testes automatizados
npm run test

# Testes com cobertura
npm run test:coverage

# Testes end-to-end
npm run test:e2e

# Testes específicos
npm run test:setup    # Setup do banco para testes
```

### Arquivos de Teste
- 📄 `tests/test-*.ps1` - Testes PowerShell
- 📄 `tests/test-*.sh` - Testes Shell
- 📄 `scripts/test-*.ps1` - Scripts de teste adicionais

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run clean        # Limpar cache (Unix)
npm run clean:windows # Limpar cache (Windows)
npm run reset        # Reset completo do projeto
```

### Banco de Dados
```bash
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:push      # Aplicar schema no banco
npm run test:setup       # Setup para testes
```

### MCP
```bash
npm run mcp:install      # Instalar SDK MCP
npm run mcp:setup        # Configurar servidores MCP
npm run mcp:all          # Iniciar todos os servidores MCP
```

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

- 📖 **README.md** - Documentação principal
- 📋 **IMPLEMENTATION_REPORT.md** - Relatório de implementação
- 🧠 **SISTEMA_NEURAL_COMPLETO.md** - Sistema neural detalhado
- 🎨 **CSS_MODULES_GUIDE.md** - Guia de módulos CSS
- 📊 **MCP_*_README.md** - Documentação específica de cada servidor MCP

## 🏗️ Arquitetura

### Frontend
- **Next.js 15** com App Router
- **React 19** com TypeScript
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes

### Backend
- **SQLite** como banco de dados
- **Prisma ORM** para queries
- **APIs REST** no Next.js
- **TypeScript** para tipagem

### MCP (Model Context Protocol)
- **8 servidores especializados**
- **Orquestração neural**
- **Auto-correção automática**
- **Análise de contexto**

## 🚨 Troubleshooting

### Problemas Comuns

**1. Erro 500 no Next.js**
```bash
# Limpe o cache
npm run clean:windows

# Reinstale dependências
rm -rf node_modules package-lock.json
npm install

# Reinicie o servidor
npm run dev
```

**2. Problemas com MCP**
```bash
# Reconfigure os servidores MCP
npm run mcp:setup

# Inicie servidores individualmente
npm run mcp:serve
npm run mcp:database
```

**3. Problemas com Banco de Dados**
```bash
# Reset do banco
npm run reset

# Verifique conexão
npx prisma studio
```

## 📝 Contribuição

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. Abra um **Pull Request**

## 📄 Licença

Este projeto está licenciado sob a licença ISC.

## 🆘 Suporte

Para suporte técnico ou dúvidas:
- 📧 Email: [seu-email]
- 📚 Documentação: `docs/README.md`
- 🐛 Issues: [GitHub Issues]

---

**🎉 Sistema Kanban de Produção - Totalmente Funcional e Bem Organizado!** 🏭✨
