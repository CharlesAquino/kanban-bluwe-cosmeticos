# Auditoria de Requisitos da Plataforma

> Documento de referência para decisões de arquitetura, desenvolvimento e operação.
>
> **Prioridade absoluta:** Item 4 (Infraestrutura & Observabilidade) e Item 5 (Produção & Operações).

---

## 1. Visão Geral

### 1.1 Objetivo
- Consolidar uma visão de requisitos sob múltiplas perspectivas:
  - Engenharia de Software
  - Engenharia de Dados
  - Engenharia de Infraestrutura / SRE
  - Engenharia de Produção / Operações
  - Arquitetura de Sistemas
  - Dev Senior Full Stack
- Servir como **parâmetro de desenvolvimento** daqui para frente.

### 1.2 Eixos Avaliados
1. Arquitetura & Engenharia de Software  
2. Dados & Analytics  
3. Segurança & Governança  
4. **Infraestrutura & Observabilidade (PRIORIDADE)**  
5. **Produção & Operações (PRIORIDADE)**  
6. Experiência de Desenvolvimento (DX) & Processos  
7. Produto & Experiência do Usuário (alto nível)

---

## 2. Arquitetura & Engenharia de Software

### 2.1 Estado Esperado
- Camadas claras:
  - Interface (Next.js / React)
  - Domínio (regras de negócio, serviços, casos de uso)
  - Acesso a dados (Prisma / repositórios)
  - Integrações externas (IA, serviços terceiros)
- Contratos bem definidos (DTOs para requests/responses).
- Testes em níveis: unidade, integração (APIs), e2e para fluxos críticos.

### 2.2 Requisitos
- Criar `src/domain` (ou `src/core`) com:
  - `entities` (Product, SemiFinishedItem, Operator, Task, etc.)
  - `services` (ProductService, TaskBoardService, etc.)
  - `use-cases` (CreateProduct, MoveTaskStage, etc.).
- API routes devem chamar **casos de uso**, não conter lógica pesada.
- Padronizar DTOs em `src/types/api`.
- Eliminar mocks em produção (usar apenas em dev/testes).

### 2.3 Métricas de Qualidade
- % de rotas que usam casos de uso em vez de lógica inline.  
- Cobertura mínima de testes em casos de uso críticos.

---

## 3. Dados & Analytics

### 3.1 Estado Esperado
- Modelagem coerente com o domínio (OP, lote, estágios, operadores).
- Eventos relevantes registrados (mudanças de status, movimentações, aprovações).
- Base preparada para BI / relatórios operacionais.

### 3.2 Requisitos
- Tabela de eventos (`EventLog`): `entityType`, `entityId`, `eventType`, `payload`, `createdAt`, `actorId`.
- Modelagem para analytics:
  - Fatos: `ProductionMovement`, `TaskMovement`.
  - Dimensões: `Product`, `Operator`, `Stage`, `Time`.
- Centralizar enums de domínio (ProductStage, ProductStatus, etc.).

### 3.3 Métricas
- % de operações críticas gerando evento em `EventLog`.  
- Tempo médio para responder perguntas de produção (ex.: OPs atrasadas, gargalos).

---

## 4. Infraestrutura & Observabilidade (**PRIORIDADE**) 

### 4.1 Estado Esperado
- Ambientes separados e claros:
  - `dev` (experimentos, dados falsos ou sanitizados)
  - `staging` (espelho de produção)
  - `prod` (travado, alterações apenas via pipeline)
- Infraestrutura definida como código (IaC): Docker, config de providers versionada.
- Observabilidade mínima:
  - Logs estruturados
  - Métricas (latência, taxa de erro, throughput)
  - Alertas (ex.: aumento de 5xx nas APIs críticas)

### 4.2 Requisitos Concretos
- **4.2.1 Estrutura de diretórios de infra**
  - Criar `/infra` com:
    - `Dockerfile`
    - `docker-compose.yml`
    - `railway.toml`, `fly.toml`, `netlify.toml`, `vercel.json` (quando aplicável)
  - Documentar no `/docs` os fluxos:
    - Como subir dev local com Docker.
    - Como subir/stressar um ambiente de staging.

- **4.2.2 Ambientes**
  - Definir variáveis de ambiente por ambiente (`.env.local`, `.env.staging`, `.env.production`).
  - Garantir que **produção nunca** use mocks (somente fallback controlado para erro).

- **4.2.3 Logging estruturado**
  - Padronizar logs com campos:
    - `requestId`, `userId`, `entityType`, `entityId`, `stage`, `severity`.
  - Substituir `console.log` disperso por uma camada de logging.

- **4.2.4 Monitoramento & Alertas**
  - Definir métricas mínimas:
    - Taxa de 5xx por rota (`/api/products`, `/api/stats`, `/api/mod/operators`, `/api/semi-finished`…).
    - Latência p95 por rota.
  - Configurar alertas quando:
    - 5xx por minuto ultrapassar limite definido.

### 4.3 Critérios de Pronto ("Definition of Done" de Infra/Obs)
- Nenhuma rota crítica retornando mock em produção.  
- Logs estruturados presentes em todos os fluxos críticos.  
- Pelo menos 1 alerta configurado para 5xx em APIs principais.

---

## 5. Produção & Operações (**PRIORIDADE**)

### 5.1 Estado Esperado
- Rastreabilidade completa do fluxo produtivo:
  - OP → lote → estágios → responsáveis → status.
- Regras claras de transição de estágio (state machine). 
- Visão operacional da carga de trabalho (boards/filas por estágio, célula, operador).

### 5.2 Requisitos de Domínio
- **5.2.1 Modelagem orientada a fluxo**
  - Entidades principais:
    - `Product` / `Order` (OP + lote + quantidade)
    - `Stage` (PRODUCAO_1KG, PRODUCAO_5KG, APROVACAO, etc.)
    - `Operator` (MOD, operador de linha, QA)
    - `ProductionTask` ou `ProductionMovement`.

- **5.2.2 Regras de transição**
  - Definir *state machine* para Produto/Tarefa:
    - De quais estágios pode ir para quais.
    - Quais transições exigem aprovação, bloqueio ou justificativa.
  - Registrar cada transição em `EventLog`.

- **5.2.3 Restrições de Negócio**
  - Unicidade de OP + lote (Production x SemiFinished).
  - Estados especiais: `QUARENTENA`, `REJEITADO`, `PAUSADO`.
  - WIP limits por estágio (opcional, mas desejável).

- **5.2.4 Painéis Operacionais**
  - Boards e visões específicas:
    - Produção em andamento por estágio.
    - Itens bloqueados / em quarentena.
    - Itens aguardando aprovação.

### 5.3 Critérios de Pronto
- Todo produto/OP tem histórico de estágios e responsáveis.  
- Não é possível criar OP+lote duplicado sem tratamento explícito.  
- Telas de operação mostram claramente:
  - o que está em cada estágio;
  - quem é o responsável;
  - o que está bloqueado e por quê.

---

## 6. Experiência de Desenvolvimento (DX) & Processos

### 6.1 Requisitos
- Fluxo Git:
  - `main` (produção, protegido)
  - `develop` (staging)
  - `feat/*`, `fix/*`, `chore/*`.
- PRs com:
  - descrição de objetivo
  - escopo
  - checklist de testes e impacto.
- CI:
  - Rodar `lint`, `test`, `build` em cada PR.

### 6.2 Critérios de Pronto
- Ninguém faz push direto em `main`.
- Toda mudança relevante passa por PR + CI com sucesso.

---

## 7. Produto & Experiência do Usuário (Resumo)

### 7.1 Diretrizes
- Focar em UX para operação:
  - baixa fricção para registrar informação
  - clareza máxima de status e próximos passos.
- Garantir que as telas principais respondam às perguntas do dia a dia:
  - o que eu tenho que fazer agora?
  - o que está atrasado?
  - onde está o gargalo?

---

## 8. Roadmap Resumido (Ligado a Este Documento)

### Fase 0 – Estabilização
- Eliminar mocks em produção.  
- Corrigir 5xx em APIs críticas.  
- Proteger `main` e desligar qualquer deploy automático perigoso.

### Fase 1 – Governança & Organização
- Estruturar `/infra`, `/docs`, `/scripts`, `/src/domain`.  
- Formalizar state machine de produção (item 5).  
- Padronizar logs e DTOs.

### Fase 2 – Observabilidade & Dados
- Implementar logging estruturado e `EventLog`.  
- Criar dashboards básicos e alertas.  
- Ajustar modelo de dados para analytics (Produção & Operações).

### Fase 3 – Inovação
- IA aplicada a diagnósticos (gargalos, prioridades de OP).  
- Automação de decisões simples (sugestão de replanejamento, redistribuição de carga).

---

## 9. Uso Deste Documento

- Toda nova feature ou refatoração deve ser avaliada contra estes itens, **principalmente**:
  - 4. Infraestrutura & Observabilidade  
  - 5. Produção & Operações
- Mudanças grandes devem indicar explicitamente:
  - quais requisitos deste documento estão sendo atendidos;
  - quais ficarão para fases futuras.
