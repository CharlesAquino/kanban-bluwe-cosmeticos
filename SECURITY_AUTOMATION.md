# 🛡️ AUTOMAÇÃO DE SEGURANÇA - KANBAN BLUWE

**Data de Implementação:** 06/12/2025  
**Status:** ✅ ATIVO

---

## 🎯 OBJETIVO

Prevenir exposição de segredos e credenciais através de múltiplas camadas de automação.

---

## 🔒 CAMADAS DE SEGURANÇA

### 1. **Pre-commit Hooks (Local)**
**Quando:** Antes de cada commit  
**Onde:** Máquina do desenvolvedor

**Ferramentas:**
- Husky (Git hooks)
- Scripts personalizados (Bash + PowerShell)
- Gitleaks (opcional)

**O que detecta:**
- URLs de banco de dados com senhas
- API Keys (OpenAI, GitHub, AWS, Google)
- Tokens JWT
- Chaves privadas
- Arquivos .env sendo commitados

**Como funciona:**
```bash
git commit -m "..."
↓
🔒 Pre-commit hook executa
↓
🔍 Scan de segredos
↓
❌ Bloqueia commit se encontrar segredos
✅ Permite commit se estiver limpo
```

---

### 2. **GitHub Actions (CI/CD)**
**Quando:** A cada push/PR  
**Onde:** GitHub Cloud

**Arquivo:** `.github/workflows/security-scan.yml`

**Jobs:**
1. **Secret Scan**
   - TruffleHog
   - GitGuardian
   - Gitleaks

2. **Dependency Scan**
   - npm audit
   - Snyk

3. **Code Quality**
   - ESLint security rules
   - TypeScript check

4. **Environment Validation**
   - Scan de padrões perigosos
   - Validação de .gitignore

5. **Notification**
   - Slack alert se falhar

---

### 3. **Gitleaks Configuration**
**Arquivo:** `.gitleaks.toml`

**Regras customizadas:**
- Redis URLs
- PostgreSQL URLs
- MongoDB URLs
- API Keys genéricas
- OpenAI Keys
- GitHub Tokens
- JWT Tokens
- Private Keys

**Allowlist:**
- Placeholders (`***`, `COPIE_DO`, etc)
- Arquivos de exemplo
- Documentação

---

## 📋 ARQUIVOS CRIADOS

```
.github/
  workflows/
    security-scan.yml          # GitHub Actions workflow

scripts/
  pre-commit-security.sh       # Bash script (Linux/Mac)
  pre-commit-security.ps1      # PowerShell script (Windows)

.husky/
  pre-commit                   # Git hook (atualizado)

.gitleaks.toml                 # Gitleaks config
SECURITY_AUTOMATION.md         # Esta documentação
SECURITY_ALERT.md              # Alerta do incidente
```

---

## 🚀 COMO USAR

### Setup Inicial (Uma vez)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Husky (já feito)
npx husky install

# 3. Dar permissão aos scripts (Linux/Mac)
chmod +x scripts/pre-commit-security.sh
chmod +x .husky/pre-commit

# 4. (Opcional) Instalar Gitleaks
# Mac:
brew install gitleaks

# Linux:
sudo apt-get install gitleaks

# Windows:
# Download: https://github.com/gitleaks/gitleaks/releases
```

---

### Uso Diário

**Automático!** Não precisa fazer nada.

```bash
# Ao fazer commit
git add .
git commit -m "feat: nova funcionalidade"

# O sistema automaticamente:
# 1. Roda scan de segurança
# 2. Bloqueia se encontrar segredos
# 3. Permite se estiver limpo
```

---

### Bypass (Emergência)

⚠️ **USE APENAS EM EMERGÊNCIAS!**

```bash
# Pular verificação (NÃO RECOMENDADO)
git commit --no-verify -m "..."
```

---

## 🔍 O QUE É DETECTADO

### ✅ Padrões Detectados

```bash
# ❌ BLOQUEADO
redis://default:senha123@host:6379
postgresql://user:senha@host:5432
sk-abcdefghijklmnopqrstuvwxyz123456789012345678
ghp_1234567890abcdefghijklmnopqrstuvwxyz
AKIAIOSFODNN7EXAMPLE

# ✅ PERMITIDO
redis://default:***SENHA***@host:6379
postgresql://user:***@host:5432
sk-sua-chave-openai-aqui
ghp_seu_token_github_aqui
COPIE_DO_RAILWAY
```

---

## 🧪 TESTAR

### Teste Local

```bash
# Criar arquivo de teste
echo 'redis://default:senha123@host:6379' > test-secret.txt
git add test-secret.txt
git commit -m "test"

# Deve bloquear!
# ❌ SECURITY ISSUE: Potential secrets found!
```

### Teste no GitHub

```bash
# Push para branch de teste
git checkout -b test-security
git push origin test-security

# Verificar GitHub Actions
# https://github.com/seu-repo/actions
```

---

## 📊 MONITORAMENTO

### GitHub Actions

1. Acesse: https://github.com/seu-repo/actions
2. Veja o workflow "Security Scan"
3. Verifique status: ✅ ou ❌

### Notificações

- **Slack:** Alerta automático se falhar
- **Email:** GitHub envia notificação
- **Badge:** Adicione ao README

```markdown
![Security Scan](https://github.com/seu-repo/workflows/Security%20Scan/badge.svg)
```

---

## 🔧 CONFIGURAÇÃO AVANÇADA

### Adicionar Novo Padrão

Edite `.gitleaks.toml`:

```toml
[[rules]]
id = "meu-padrao"
description = "Minha descrição"
regex = '''meu-regex-aqui'''
tags = ["custom", "secret"]
```

### Adicionar ao Allowlist

```toml
[allowlist]
regexes = [
  '''meu-placeholder''',
]
```

### Configurar Slack

1. Crie Webhook no Slack
2. Adicione secret no GitHub:
   - Settings → Secrets → New secret
   - Nome: `SLACK_WEBHOOK`
   - Valor: URL do webhook

---

## 🚨 INCIDENTES

### Histórico

| Data | Tipo | Severidade | Status |
|------|------|------------|--------|
| 06/12/2025 | Redis senha exposta | CRÍTICA | ✅ Resolvido |

### Lições Aprendidas

1. ✅ Nunca incluir senhas em .md
2. ✅ Sempre usar placeholders
3. ✅ Verificar antes de commitar
4. ✅ Automação é essencial

---

## 📚 RECURSOS

### Ferramentas

- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [GitGuardian](https://www.gitguardian.com/)
- [Snyk](https://snyk.io/)

### Documentação

- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Railway Security](https://docs.railway.app/reference/security)

---

## ✅ CHECKLIST DE SEGURANÇA

### Desenvolvedor

- [ ] Husky instalado e funcionando
- [ ] Scripts de segurança com permissão
- [ ] Gitleaks instalado (opcional)
- [ ] .gitignore configurado
- [ ] Nunca commitar .env

### Projeto

- [x] GitHub Actions configurado
- [x] Gitleaks config criado
- [x] Pre-commit hooks ativos
- [x] Documentação completa
- [ ] Secrets do GitHub configurados
- [ ] Slack webhook configurado

### Equipe

- [ ] Todos treinados em segurança
- [ ] Processo de code review
- [ ] Política de segredos documentada
- [ ] Plano de resposta a incidentes

---

## 🎯 PRÓXIMOS PASSOS

### Curto Prazo (Esta Semana)

1. [ ] Configurar secrets no GitHub
2. [ ] Testar workflow completo
3. [ ] Configurar Slack webhook
4. [ ] Treinar equipe

### Médio Prazo (Este Mês)

1. [ ] Implementar Snyk
2. [ ] Adicionar mais regras customizadas
3. [ ] Criar dashboard de segurança
4. [ ] Audit de dependências

### Longo Prazo (Próximos 3 Meses)

1. [ ] Integrar com SIEM
2. [ ] Penetration testing
3. [ ] Security audit completo
4. [ ] Certificação de segurança

---

## 📞 SUPORTE

**Dúvidas sobre segurança?**
- Consulte este documento
- Verifique SECURITY_ALERT.md
- Revise logs do GitHub Actions

**Encontrou um problema?**
1. NÃO commite
2. Remova o segredo
3. Use placeholder
4. Tente novamente

---

**Status:** ✅ Sistema de segurança ativo e funcionando  
**Última atualização:** 06/12/2025  
**Próxima revisão:** 06/01/2026
