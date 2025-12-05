/**
 * NEURAL ORCHESTRATOR - Sistema Neural Centralizado
 * 
 * Coordena todos os MCPs (Model Context Protocol) e eventos do sistema
 * Fornece IA integrada para tomada de decisões e automações
 */

import { chatCompletion } from '@/mcp/openai'
// import { screenshot } from '@/mcp/playwright' // Temporarily disabled
import { sendNotification } from '@/mcp/slack'
import { createIssue } from '@/mcp/github'
import { logInfo } from '@/mcp/fetch'

// ========================================
// TIPOS E INTERFACES
// ========================================

export type EventType =
  | 'product_created'
  | 'product_advanced'
  | 'product_finalized'
  | 'bucket_created'
  | 'bucket_packaged'
  | 'bucket_returned'
  | 'quality_test_failed'
  | 'non_conformity_created'
  | 'system_error'

export interface NeuralEvent {
  type: EventType
  timestamp: string
  payload: Record<string, any>
  source: string
}

export interface NeuralDecision {
  action: string
  confidence: number
  reasoning: string
  mcpsUsed: string[]
}

// ========================================
// SISTEMA DE REGRAS E AUTOMAÇÕES
// ========================================

class NeuralOrchestrator {
  private eventLog: NeuralEvent[] = []
  private decisions: NeuralDecision[] = []

  /**
   * Processa evento e toma decisão inteligente
   */
  async processEvent(event: NeuralEvent): Promise<NeuralDecision> {
    this.eventLog.push(event)
    console.log(`[Neural] Processando evento: ${event.type}`)

    // Análise contextual com IA
    const context = await this.analyzeContext(event)

    // Decisão baseada em regras + IA
    const decision = await this.makeDecision(event, context)

    this.decisions.push(decision)

    // Executar ações
    await this.executeDecision(decision, event)

    return decision
  }

  /**
   * Analisa contexto usando IA (OpenAI)
   */
  private async analyzeContext(event: NeuralEvent): Promise<string> {
    const recentEvents = this.eventLog.slice(-10)

    const { response } = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: `Você é um analista de produção de cosméticos. Analise eventos e sugira ações.
          
Contexto do Sistema:
- Fluxo: producao_1kg → reator → finalizado → semi-acabados
- Baldes: 18kg cada, envasados parcial ou total
- Qualidade: pH, viscosidade, cor, densidade devem estar dentro da tolerância
- Não conformidades: critical/major/minor

Você deve:
1. Identificar padrões e anomalias
2. Sugerir ações preventivas
3. Priorizar segurança e qualidade`
        },
        {
          role: 'user',
          content: `Novo evento: ${event.type}
Payload: ${JSON.stringify(event.payload, null, 2)}

Eventos recentes (últimos 10):
${recentEvents.map(e => `- ${e.type}: ${e.source}`).join('\n')}

Análise e recomendação:`
        }
      ],
      maxTokens: 300
    })

    return response
  }

  /**
   * Toma decisão baseada em regras + IA
   */
  private async makeDecision(event: NeuralEvent, aiContext: string): Promise<NeuralDecision> {
    const mcpsUsed: string[] = ['openai']
    let action = 'none'
    let confidence = 0.5
    let reasoning = aiContext

    // REGRAS ESPECÍFICAS POR TIPO DE EVENTO
    switch (event.type) {
      case 'quality_test_failed':
        action = 'alert_quality_team'
        confidence = 0.95
        mcpsUsed.push('slack', 'github')
        reasoning = `Análise reprovada detectada. ${aiContext}`
        break

      case 'product_finalized':
        action = 'screenshot_and_validate'
        confidence = 0.9
        mcpsUsed.push('playwright')
        reasoning = `Produto finalizado. Capturando estado para auditoria.`
        break

      case 'bucket_returned':
        action = 'notify_supervisor'
        confidence = 0.85
        mcpsUsed.push('slack')
        reasoning = `Balde devolvido. Possível problema de qualidade.`
        break

      case 'non_conformity_created':
        const severity = event.payload.severity
        if (severity === 'critical') {
          action = 'emergency_alert'
          confidence = 1.0
          mcpsUsed.push('slack', 'github')
          reasoning = `NC CRÍTICA. Ação imediata necessária.`
        } else {
          action = 'create_tracking_issue'
          confidence = 0.8
          mcpsUsed.push('github')
          reasoning = `NC registrada. Criando issue para rastreamento.`
        }
        break

      case 'bucket_packaged':
        // Análise de eficiência
        const quantityKg = event.payload.quantityKg || 0
        if (quantityKg < 18 * 0.5) {
          action = 'warn_low_efficiency'
          confidence = 0.7
          mcpsUsed.push('slack')
          reasoning = `Envase parcial muito baixo (${quantityKg}kg). Revisar processo.`
        }
        break

      case 'system_error':
        action = 'create_incident'
        confidence = 0.95
        mcpsUsed.push('github', 'slack')
        reasoning = `Erro de sistema detectado. Criando incident.`
        break

      default:
        action = 'log_only'
        confidence = 0.6
        reasoning = `Evento monitorado. ${aiContext}`
    }

    return {
      action,
      confidence,
      reasoning,
      mcpsUsed
    }
  }

  /**
   * Executa ações decididas
   */
  private async executeDecision(decision: NeuralDecision, event: NeuralEvent) {
    console.log(`[Neural] Executando: ${decision.action} (confiança: ${decision.confidence})`)

    try {
      switch (decision.action) {
        case 'alert_quality_team':
          await this.alertQualityTeam(event, decision)
          break

        case 'screenshot_and_validate':
          await this.screenshotAndValidate(event)
          break

        case 'notify_supervisor':
          await this.notifySupervisor(event, decision)
          break

        case 'emergency_alert':
          await this.emergencyAlert(event, decision)
          break

        case 'create_tracking_issue':
          await this.createTrackingIssue(event, decision)
          break

        case 'warn_low_efficiency':
          await this.warnLowEfficiency(event)
          break

        case 'create_incident':
          await this.createIncident(event, decision)
          break

        case 'log_only':
          await logInfo('neural_decision', { event, decision })
          break
      }
    } catch (error) {
      console.error(`[Neural] Erro ao executar ${decision.action}:`, error)
      await logInfo('neural_error', { action: decision.action, error: String(error) })
    }
  }

  // ========================================
  // AÇÕES ESPECÍFICAS
  // ========================================

  private async alertQualityTeam(event: NeuralEvent, decision: NeuralDecision) {
    const { productName, parameter, measuredValue, tolerance } = event.payload

    // Slack
    await sendNotification({
      message: `🔴 ALERTA DE QUALIDADE\n\nProduto: ${productName}\nParâmetro: ${parameter}\nValor: ${measuredValue}\nTolerância: ${tolerance?.min}-${tolerance?.max}\n\nAnálise IA: ${decision.reasoning}`,
      channel: 'quality-alerts'
    })

    // GitHub Issue
    await createIssue({
      title: `Análise de Qualidade Reprovada: ${productName} - ${parameter}`,
      body: `## Detalhes da Análise\n\n- **Produto**: ${productName}\n- **Parâmetro**: ${parameter}\n- **Valor Medido**: ${measuredValue}\n- **Tolerância**: ${tolerance?.min}-${tolerance?.max}\n\n## Análise Neural\n\n${decision.reasoning}\n\n## Ação Requerida\n\n- [ ] Investigar causa raiz\n- [ ] Ajustar processo se necessário\n- [ ] Atualizar especificações\n- [ ] Registrar ações corretivas`,
      labels: ['quality', 'urgent']
    })
  }

  private async screenshotAndValidate(event: NeuralEvent) {
    const productId = event.payload.productId || 'unknown'

    // Temporarily disabled - Playwright not available
    // await screenshot({
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/semi-finished`,
    //   name: `product-${productId}-finalized-${Date.now()}`
    // })

    await logInfo('screenshot_planned', {
      productId,
      timestamp: new Date().toISOString(),
      note: 'Screenshot disabled - Playwright not configured'
    })
  }

  private async notifySupervisor(event: NeuralEvent, decision: NeuralDecision) {
    const { productName, bucketIndex, quantityKg } = event.payload

    await sendNotification({
      message: `⚠️ BALDE DEVOLVIDO\n\nProduto: ${productName}\nBalde: #${bucketIndex}\nQuantidade: ${quantityKg}kg\n\nAnálise: ${decision.reasoning}`,
      channel: 'production-supervisor'
    })
  }

  private async emergencyAlert(event: NeuralEvent, decision: NeuralDecision) {
    const { productName, description, severity } = event.payload

    // Slack com @channel
    await sendNotification({
      message: `🚨 ALERTA CRÍTICO - NÃO CONFORMIDADE\n\n@channel\n\nProduto: ${productName}\nSeveridade: ${severity}\nDescrição: ${description}\n\n⚠️ AÇÃO IMEDIATA NECESSÁRIA`,
      channel: 'critical-alerts'
    })

    // GitHub Issue prioritário
    await createIssue({
      title: `[CRÍTICO] NC: ${productName} - ${description}`,
      body: `## ⚠️ NÃO CONFORMIDADE CRÍTICA\n\n- **Produto**: ${productName}\n- **Descrição**: ${description}\n- **Severidade**: ${severity}\n- **Timestamp**: ${event.timestamp}\n\n## Análise Neural\n\n${decision.reasoning}\n\n## Ações Imediatas\n\n- [ ] Parar produção se necessário\n- [ ] Isolar produto afetado\n- [ ] Investigar causa raiz\n- [ ] Implementar CAPA\n- [ ] Notificar qualidade/regulatório`,
      labels: ['critical', 'non-conformity', 'urgent']
    })
  }

  private async createTrackingIssue(event: NeuralEvent, decision: NeuralDecision) {
    const { productName, type, description } = event.payload

    await createIssue({
      title: `NC Tracking: ${productName} - ${type}`,
      body: `## Não Conformidade\n\n- **Produto**: ${productName}\n- **Tipo**: ${type}\n- **Descrição**: ${description}\n\n## Análise\n\n${decision.reasoning}\n\n## Ações de Acompanhamento\n\n- [ ] Revisar processo\n- [ ] Documentar lições aprendidas\n- [ ] Atualizar procedimentos`,
      labels: ['non-conformity', 'tracking']
    })
  }

  private async warnLowEfficiency(event: NeuralEvent) {
    const { productName, quantityKg } = event.payload

    await sendNotification({
      message: `📊 ALERTA DE EFICIÊNCIA\n\nProduto: ${productName}\nEnvase parcial: ${quantityKg}kg (< 50% do balde)\n\nRevisar processo de envase para otimizar eficiência.`,
      channel: 'production-metrics'
    })
  }

  private async createIncident(event: NeuralEvent, decision: NeuralDecision) {
    const { error, source } = event.payload

    await createIssue({
      title: `[INCIDENT] Erro de Sistema: ${source}`,
      body: `## Erro de Sistema\n\n- **Fonte**: ${source}\n- **Erro**: ${error}\n- **Timestamp**: ${event.timestamp}\n\n## Análise\n\n${decision.reasoning}\n\n## Investigação\n\n- [ ] Reproduzir erro\n- [ ] Identificar causa raiz\n- [ ] Implementar correção\n- [ ] Adicionar testes`,
      labels: ['bug', 'incident', 'high-priority']
    })

    await sendNotification({
      message: `🐛 INCIDENT CRIADO\n\nFonte: ${source}\nErro: ${error}\n\nIssue criada para rastreamento.`,
      channel: 'dev-alerts'
    })
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  getEventLog() {
    return this.eventLog
  }

  getDecisions() {
    return this.decisions
  }

  async getInsights() {
    const { response } = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Você é um analista de dados de produção. Gere insights baseados nos eventos.'
        },
        {
          role: 'user',
          content: `Eventos recentes (${this.eventLog.length} total):\n${this.eventLog.slice(-20).map(e => `- ${e.type} (${e.source})`).join('\n')}\n\nGere 3 insights principais:`
        }
      ],
      maxTokens: 200
    })

    return response
  }
}

// ========================================
// SINGLETON EXPORT
// ========================================

export const neural = new NeuralOrchestrator()
