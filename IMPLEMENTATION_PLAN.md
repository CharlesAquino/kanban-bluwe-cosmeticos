# Plano de Ação: Estabilização e Modernização Kanban Bluwe

## 1. Contexto Atual
O projeto está em uma fase de migração de ORM (Prisma -> Drizzle) e enfrenta instabilidades (Erros 500) causados por desalinhamento entre o código da aplicação e o schema real do banco de dados PostgreSQL (Railway).

## 2. Ações de Correção Imediata (Estabilização)
**Objetivo:** Eliminar erros 500 e garantir que a aplicação rode lisamente.

- [x] **Schema Alignment**: Corrigir definições de colunas no Drizzle para CamelCase (`createdAt` vs `created_at`) em todas as tabelas, especialmente `tags` e `product_tags`.
- [x] **Validação de Tipos Enum**: Garantir que os Enums no código (ex: `UserRole`) batam com os valores no banco. Se houver divergência (ex: banco tem 'admin', código espera 'ADMIN'), padronizar.
- [x] **Verificação de Relacionamentos**: Testar se as queries com `with: { relationName: ... }` estão funcionando após as correções de nomes de colunas (FKs).

## 3. Avaliação Tecnológica: Manter vs Inovar

### O que MANTER e Corrigir (Legacy/Core)
São partes essenciais que já contêm dados valiosos ou lógica de negócio complexa. Reescrever agora seria arriscado e custoso.

1.  **Estrutura do Banco de Dados (PostgreSQL)**:
    *   *Veredito*: **Manter**.
    *   *Ação*: Não tentar migrar nomes de colunas no banco (Snake -> Camel ou vice-versa) agora. Adaptar a camada de aplicação (Drizzle) para ler o banco como ele é. É o caminho de menor resistência.

2.  **Next.js (App Router)**:
    *   *Veredito*: **Manter e Atualizar**.
    *   *Ação*: O projeto já está em Next.js. Focar em usar Server Actions para mutações de dados, aproveitando a integração com Drizzle.

### O que INOVAR (Novas Implementações)
Áreas onde a dívida técnica é alta ou a UX é pobre, justificando novas tecnologias.

1.  **Kanban Board UI (Design)**:
    *   *Status*: Básico/Funcional.
    *   *Inovação*: Implementar `@dnd-kit` ou refinar a implementação existente para uma experiência "Premium" (animações suaves, drag-and-drop robusto, feedback visual rico). Usar Tailwind avançado (glassmorphism, gradients) para o "WOW factor".

2.  **Gerenciamento de Estado (Server vs Client)**:
    *   *Inovação*: Mover o máximo de data fetching para o Server Components (RSC). Usar `React Query` ou `SWR` apenas se necessário para polling em tempo real, caso contrário, confiar no cache do Next.js e revalidação de tags (`revalidateTag`).

3.  **Logs e Observabilidade**:
    *   *Inovação*: Integrar ferramentas de log melhores (ex: Sentry ou simples logs estruturados no Railway) para não depender de "adivinhar" onde o erro 500 ocorreu.

## 4. Roteiro Sugerido (Next Steps)

1.  **Fase 1 (Concluída)**: Validar se a correção do Schema (`tags`, `productTags`) resolveu os erros de API. Testar listagem de produtos e criação de tags.
2.  **Fase 2 (Concluída)**: Implementar o Kanban Board visual com a nova UI "Premium" solicitada, garantindo que ele consuma os dados corrigidos.
3.  **Fase 3**: Refatorar Actions para tratamento de erro robusto (Try/Catch com mensagens amigáveis para o usuário, não apenas "Internal Server Error").

## 5. Decisões Pendentes pelo Usuário
- Devemos fazer uma varredura completa nos ENUMs agora?
- A prioridade é a funcionalidade de "Semi-finished Products" ou a gestão geral de "Tasks"?
