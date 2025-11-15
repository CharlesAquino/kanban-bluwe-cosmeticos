# 🤖 MCP Servers - Sistema Kanban

## 📋 Visão Geral

Este projeto implementa servidores MCP (Model Context Protocol) para integração com sistemas externos.

## 🔧 MCPs Disponíveis

### 1. OpenAI MCP - Assistente Inteligente
- **Função**: Processamento de linguagem natural
- **Uso**: Análise de dados, sugestões, automação

### 2. Slack MCP - Notificações
- **Função**: Envio de alertas e mensagens
- **Uso**: Notificações de produção, alertas de qualidade

### 3. GitHub MCP - Issues/PRs
- **Função**: Gerenciamento de issues e pull requests
- **Uso**: Rastreamento de bugs, feature requests

### 4. Playwright MCP - Screenshots
- **Função**: Captura de screenshots e validação visual
- **Uso**: Testes visuais, documentação

## 🚀 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```bash
# OpenAI MCP - para assistente inteligente
OPENAI_API_KEY=seu_token_aqui

# Playwright MCP - para screenshots/validações visuais
PLAYWRIGHT_URL=http://localhost:3001

# GitHub MCP - para criar issues/PRs
GITHUB_TOKEN=seu_token_github_aqui

# Slack MCP - para notificações/alertas
SLACK_WEBHOOK=https://hooks.slack.com/services/xxxxxxxx/xxxxxxxx/xxxxxxxx
```

### 2. Instalar MCPs Reais

```bash
# Instalar clientes MCP
npm install @modelcontextprotocol/sdk
# Ou pacotes específicos para cada MCP
npm install @mcp/playwright @mcp/github @mcp/slack
```

## 🎯 Como Usar

### Iniciar Servidores MCP

```bash
# Todos os servidores
npm run mcp:all

# Servidores individuais
npm run mcp:serve
npm run mcp:database
npm run mcp:api
npm run mcp:sqlite
npm run mcp:filesystem
npm run mcp:fetch
npm run mcp:terraform
npm run mcp:exa
```

### Exemplo de Uso

```javascript
import { OpenAIMCP } from '@mcp/openai'
import { SlackMCP } from '@mcp/slack'

const mcp = new OpenAIMCP({ apiKey: process.env.OPENAI_API_KEY })
const response = await mcp.ask("Analisar dados de produção")

const slack = new SlackMCP({ webhook: process.env.SLACK_WEBHOOK })
await slack.sendNotification({ message: "Produção atualizada" })
```

## 📊 Monitoramento

### Logs dos MCPs
- Arquivo: `logs/mcp.log`
- Níveis: INFO, WARN, ERROR
- Rotação automática

### Status Dashboard
- URL: `http://localhost:3002/mcp-status`
- Status em tempo real
- Métricas de performance

## 🛠️ Troubleshooting

### Problema: "MCP connection timeout"
**Solução:** Verifique se servidor MCP está rodando

### Problema: "API key invalid"
**Solução:** Verifique variáveis de ambiente no `.env.local`

### Problema: "Rate limit exceeded"
**Solução:** Implemente rate limiting ou upgrade plano

## 🔒 Segurança

- Use variáveis de ambiente para secrets
- Implemente rate limiting
- Valide todas as entradas
- Use HTTPS para comunicações

---

**🎉 MCP Servers configurados e operando!** 🤖✨
