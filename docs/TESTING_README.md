# 🧪 Sistema de Testes - Kanban Next.js

Este documento descreve o sistema completo de testes implementado para o projeto Kanban Next.js.

## 📋 Visão Geral

O sistema de testes foi implementado com múltiplas camadas para garantir a qualidade e confiabilidade do código:

- **Testes Unitários** (Jest + Testing Library)
- **Testes de Integração** (Jest)
- **Testes End-to-End** (Playwright)
- **Testes de API** (Playwright)

## 🚀 Executando os Testes

### Testes Unitários e de Integração
```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:coverage
```

### Testes End-to-End
```bash
# Instalar navegadores do Playwright (primeira vez)
npx playwright install

# Executar todos os testes E2E
npm run test:e2e

# Executar com interface visual
npm run test:e2e:ui

# Executar em modo headed (visual)
npm run test:e2e:headed
```

## 📁 Estrutura dos Testes

```
src/
├── __tests__/
│   ├── setup.ts                    # Configuração global dos testes
│   └── e2e/                       # Testes End-to-End
│       ├── home.spec.ts           # Testes da página inicial
│       ├── dashboard.spec.ts      # Testes do dashboard
│       └── api.spec.ts            # Testes das APIs
├── components/
│   └── __tests__/                 # Testes de componentes
│       ├── dashboard.test.tsx
│       └── product-form.test.tsx
└── lib/
    └── __tests__/                 # Testes de lógica de negócio
        ├── product-service.test.ts
        └── integration-service.test.ts

# Configurações
├── jest.config.js                 # Configuração do Jest
├── playwright.config.ts           # Configuração do Playwright
└── src/app/api/*/                # Testes de APIs
    └── __tests__/
        └── route.test.ts
```

## 🧪 Tipos de Testes

### Testes Unitários
- **Localização**: `src/lib/__tests__/` e `src/components/__tests__/`
- **Framework**: Jest + Testing Library
- **Cobertura**: Lógica de negócio e componentes isolados
- **Mocks**: Prisma, APIs externas, timers

### Testes de Integração
- **Localização**: `src/app/api/**/__tests__/`
- **Framework**: Jest
- **Cobertura**: APIs REST, integração com banco de dados
- **Mocks**: Database operations

### Testes End-to-End
- **Localização**: `src/__tests__/e2e/`
- **Framework**: Playwright
- **Cobertura**: Fluxos completos do usuário
- **Ambientes**: Chromium, Firefox, WebKit, Mobile

## 🔧 Configurações

### Jest
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
  ],
}
```

### Playwright
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './src/__tests__/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' },
  ],
})
```

## 📊 Cobertura de Testes

Os testes cobrem as seguintes funcionalidades:

### ✅ Funcionalidades Testadas
- [x] **ProductService**: CRUD de produtos
- [x] **IntegrationService**: Controle hora a hora
- [x] **Dashboard**: Exibição de estatísticas
- [x] **ProductForm**: Validação e criação
- [x] **APIs**: GET /api/products, POST /api/products, GET /api/stats
- [x] **Interface**: Responsividade, loading states
- [x] **Validações**: Campos obrigatórios, formatos, limites

### 🔄 Fluxos Testados
- [x] Criação de produtos via formulário
- [x] Validação de formulários
- [x] Carregamento de dados do dashboard
- [x] Tratamento de erros
- [x] Estados de loading
- [x] Responsividade mobile

## 🐛 Testes de Tratamento de Erros

### Erros Testados
- [x] Campos obrigatórios não preenchidos
- [x] Formatos inválidos (OP alfanumérica)
- [x] Quantidades negativas/zero
- [x] Duplicação de produtos
- [x] Falhas de API
- [x] Problemas de conectividade

### Cenários de Erro
- [x] Database connection failures
- [x] Invalid JSON payloads
- [x] Missing required fields
- [x] Constraint violations
- [x] Network timeouts

## 🎯 Boas Práticas Implementadas

### Testes Unitários
- ✅ **AAA Pattern**: Arrange, Act, Assert
- ✅ **Isolamento**: Mocks adequados
- ✅ **Descrições**: Testes auto-documentados
- ✅ **Coverage**: Múltiplos cenários por função

### Testes E2E
- ✅ **Fluxos Completos**: Do usuário à API
- ✅ **Multi-browser**: Cross-browser testing
- ✅ **Mobile**: Testes responsivos
- ✅ **Visual**: Screenshots em falhas

### Manutenção
- ✅ **DRY**: Reutilização de helpers
- ✅ **Organização**: Estrutura clara
- ✅ **Documentação**: README atualizado
- ✅ **CI/CD Ready**: Scripts configurados

## 📈 Métricas de Qualidade

### Cobertura Esperada
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

### Performance
- **Testes Unitários**: < 5s
- **Testes E2E**: < 30s
- **Coverage Report**: < 10s

## 🚨 Executando em CI/CD

### GitHub Actions (exemplo)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## 🔍 Debugging

### Testes Unitários
```bash
# Debug individual
npm test -- --testNamePattern="should create product"

# Debug com logs
npm test -- --verbose
```

### Testes E2E
```bash
# Visual debugging
npm run test:e2e:headed

# UI debugging
npm run test:e2e:ui

# Generate code
npx playwright codegen localhost:3000
```

## 📋 Checklist de Testes

Antes de fazer deploy:

- [ ] Todos os testes unitários passam
- [ ] Cobertura > 80%
- [ ] Testes E2E passam em todos os browsers
- [ ] Testes de API respondem corretamente
- [ ] Validações de formulário funcionam
- [ ] Estados de loading são exibidos
- [ ] Responsividade funciona em mobile

## 🆘 Suporte

Para problemas com os testes:

1. **Testes falhando**: Verificar logs detalhados
2. **Coverage baixa**: Adicionar mais cenários
3. **Performance**: Otimizar mocks
4. **Flakiness**: Revisar waits e timeouts

## 📚 Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
