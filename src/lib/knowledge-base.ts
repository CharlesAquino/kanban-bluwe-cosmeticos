export const KANBAN_KNOWLEDGE_BASE = {
  system: {
    name: "Kanban de Insumos - Bluwe Cosméticos",
    version: "1.0.0",
    description: "Sistema de controle de produção de cosméticos com kanban visual",
    architecture: "Next.js 15 + TypeScript + SQLite + TailwindCSS"
  },

  entities: {
    products: {
      fields: ["id", "name", "family", "op", "batch", "quantity", "currentStage", "status"],
      stages: ["PRODUCAO_1KG", "AVALIACAO_COR", "PRODUCAO_5KG", "AVALIACAO_FINAL", "APROVADO"],
      statuses: ["active", "paused", "blocked", "completed"],
      families: ["Linha Pink", "Linha SkinCare", "Capilar", "Solar", "Neutra"]
    },

    product_buckets: {
      fields: ["id", "productId", "bucketIndex", "capacityKg", "originalQuantityKg", "currentQuantityKg", "status"],
      capacity: "18kg por balde",
      statuses: ["created", "moved_to_semi", "in_packaging", "partial", "packaged", "returned"]
    },

    semi_finished_items: {
      fields: ["id", "productId", "name", "family", "op", "batch", "quantity_total", "quantity_envasado", "status"],
      statuses: ["aguardando", "em_envase", "parcial", "concluido"]
    },

    semi_finished_buckets: {
      fields: ["id", "semiFinishedId", "sourceBucketId", "bucketIndex", "originalQuantityKg", "currentQuantityKg", "status"]
    },

    packaging_logs: {
      fields: ["id", "semiFinishedId", "semiFinishedBucketId", "action", "deltaKg", "previousQty", "newQty", "user", "timestamp", "notes"],
      actions: ["sent_to_packaging", "packaged", "returned"]
    }
  },

  workflows: {
    production: [
      "1. Criar produto com família, OP, lote e quantidade",
      "2. Produto avança pelos estágios: Produção 1kg → Análise C.Q. → Produção Reator → Análise Reator → Aprovado",
      "3. No card 'Aprovado', clicar 'Finalizar' para mover ao Semi-Acabados",
      "4. Sistema gera automaticamente baldes de 18kg"
    ],

    packaging: [
      "1. Em Semi-Acabados, selecionar baldes e clicar 'Enviar para envase'",
      "2. Baldes ficam em status 'in_packaging'",
      "3. Para registrar envase: selecionar balde + 'Registrar envase' + informar kg",
      "4. Sistema calcula saldo automático e atualiza métricas",
      "5. Balde pode ser devolvido se necessário"
    ]
  },

  features: [
    "Kanban visual com arrastar e soltar",
    "Controle automático de baldes (18kg)",
    "Sistema de famílias com cores distintas",
    "Métricas em tempo real (Total/Envasado/Saldo)",
    "Assistente inteligente integrado",
    "Integração com MCPs (GitHub, Slack, Playwright, OpenAI)",
    "Histórico de envase e auditoria"
  ],

  ui_components: {
    main: ["Dashboard", "Kanban", "Semi-Acabados", "Controle Hora a Hora", "CEP", "BPM"],
    actions: [
      "Criar produto",
      "Avançar estágio",
      "Pausar/Retomar produção",
      "Bloquear produção",
      "Finalizar produto",
      "Enviar para envase",
      "Registrar envase",
      "Devolver balde"
    ]
  },

  metrics: {
    dashboard: ["Total de produtos", "Em andamento", "Pausados", "Concluídos", "Bloqueados"],
    semi_finished: ["Total kg", "Envasado kg", "Saldo kg", "Baldes por status"]
  },

  security: {
    features: [
      "Autenticação (planejada)",
      "Logs de auditoria",
      "Validação de dados",
      "Rate limiting em APIs",
      "Chaves API protegidas"
    ]
  },

  integrations: {
    mcps: ["GitHub (issues)", "Slack (notificações)", "Playwright (screenshots)", "OpenAI (assistente)"],
    apis: ["RESTful API", "Database (SQLite)", "File system (logs)"]
  }
} as const
