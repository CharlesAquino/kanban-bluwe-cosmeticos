// Serviço de Business Process Management (BPM)
// Gerencia processos de negócio, workflows e execução de atividades

import type {
  ProcessDefinition,
  ProcessInstance,
  ActivityDefinition,
  ActivityInstance,
  WorkflowTransition,
  ProcessMetrics,
  ProcessDefinitionInput,
  ActivityDefinitionInput,
  ProcessInstanceInput,
  ActivityInstanceInput,
  ProcessStatus,
  ActivityType,
  InstanceStatus
} from './types'

export interface BPMMetrics {
  totalProcesses: number
  activeProcesses: number
  completedProcesses: number
  avgCycleTime: number
  avgLeadTime: number
  defectRate: number
  throughput: number
  bottleneckIndex: number
}

export interface WorkflowPath {
  activities: ActivityDefinition[]
  transitions: WorkflowTransition[]
  estimatedDuration: number
  criticalPath: boolean
}

export class BPMService {

  /**
   * Cria uma nova definição de processo
   */
  static async createProcessDefinition(data: ProcessDefinitionInput): Promise<ProcessDefinition> {
    try {
      // Por enquanto, retorna dados simulados até resolver geração Prisma
      const process: ProcessDefinition = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        version: '1.0',
        status: 'draft',
        productId: data.productId,
        stage: data.stage,
        isActive: false,
        priority: data.priority || 1,
        slaHours: data.slaHours,
        totalInstances: 0,
        completedInstances: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return process
    } catch (error) {
      console.error('Erro ao criar definição de processo:', error)
      throw error
    }
  }

  /**
   * Busca definições de processos
   */
  static async getProcessDefinitions(
    productId?: string,
    stage?: string,
    status?: ProcessStatus
  ): Promise<ProcessDefinition[]> {
    try {
      // Dados simulados para demonstração
      const processes: ProcessDefinition[] = [
        {
          id: '1',
          name: 'Produção de Produto X - Estágio 1',
          description: 'Processo completo de produção para o produto X',
          version: '1.0',
          status: 'active',
          productId: productId,
          stage: stage || 'producao_1kg',
          isActive: true,
          priority: 1,
          slaHours: 8,
          totalInstances: 25,
          completedInstances: 23,
          avgExecutionTime: 6.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Controle de Qualidade - Produto X',
          description: 'Processo de controle de qualidade',
          version: '1.0',
          status: 'active',
          productId: productId,
          stage: stage || 'testes_cq',
          isActive: true,
          priority: 2,
          slaHours: 4,
          totalInstances: 18,
          completedInstances: 16,
          avgExecutionTime: 3.2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      return processes.filter(p =>
        (!productId || p.productId === productId) &&
        (!stage || p.stage === stage) &&
        (!status || p.status === status)
      )
    } catch (error) {
      console.error('Erro ao buscar definições de processos:', error)
      throw error
    }
  }

  /**
   * Cria uma nova atividade para um processo
   */
  static async createActivityDefinition(data: ActivityDefinitionInput): Promise<ActivityDefinition> {
    try {
      const activity: ActivityDefinition = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        type: data.type,
        order: data.order,
        requiredSkills: data.requiredSkills || [],
        estimatedDuration: data.estimatedDuration,
        requiredEquipment: data.requiredEquipment || [],
        qualityGates: data.qualityGates,
        inspectionPoints: data.inspectionPoints,
        processId: data.processId
      }

      return activity
    } catch (error) {
      console.error('Erro ao criar atividade:', error)
      throw error
    }
  }

  /**
   * Busca atividades de um processo
   */
  static async getProcessActivities(processId: string): Promise<ActivityDefinition[]> {
    try {
      // Dados simulados
      const activities: ActivityDefinition[] = [
        {
          id: '1',
          name: 'Preparar Ingredientes',
          description: 'Preparar e pesar todos os ingredientes necessários',
          type: 'manual_task',
          order: 1,
          requiredSkills: ['operador_producao'],
          estimatedDuration: 30,
          requiredEquipment: ['balanca', 'recipientes'],
          processId: processId
        },
        {
          id: '2',
          name: 'Misturar Componentes',
          description: 'Misturar ingredientes na proporção correta',
          type: 'user_task',
          order: 2,
          requiredSkills: ['operador_mistura'],
          estimatedDuration: 45,
          requiredEquipment: ['misturador', 'recipientes'],
          processId: processId
        },
        {
          id: '3',
          name: 'Controle de Qualidade',
          description: 'Verificar qualidade do produto final',
          type: 'user_task',
          order: 3,
          requiredSkills: ['inspetor_qualidade'],
          estimatedDuration: 20,
          requiredEquipment: ['medidor_viscosidade', 'balanca'],
          processId: processId
        }
      ]

      return activities.filter(a => a.processId === processId)
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
      throw error
    }
  }

  /**
   * Inicia uma nova instância de processo
   */
  static async startProcessInstance(data: ProcessInstanceInput): Promise<ProcessInstance> {
    try {
      const instance: ProcessInstance = {
        id: Date.now().toString(),
        processId: data.processId,
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined
      }

      return instance
    } catch (error) {
      console.error('Erro ao iniciar instância de processo:', error)
      throw error
    }
  }

  /**
   * Busca instâncias de processo
   */
  static async getProcessInstances(
    processId?: string,
    status?: InstanceStatus
  ): Promise<ProcessInstance[]> {
    try {
      // Dados simulados
      const instances: ProcessInstance[] = [
        {
          id: '1',
          processId: processId || '1',
          status: 'running',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
          dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // daqui 6 horas
        },
        {
          id: '2',
          processId: processId || '1',
          status: 'completed',
          startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 horas atrás
          completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 horas atrás
        }
      ]

      return instances.filter(i =>
        (!processId || i.processId === processId) &&
        (!status || i.status === status)
      )
    } catch (error) {
      console.error('Erro ao buscar instâncias de processo:', error)
      throw error
    }
  }

  /**
   * Calcula métricas BPM agregadas
   */
  static async calculateBPMMetrics(
    productId?: string,
    stage?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BPMMetrics> {
    try {
      // Buscar dados simulados para demonstração
      const processes = await this.getProcessDefinitions(productId, stage)
      const instances = await this.getProcessInstances()

      const completedInstances = instances.filter(i => i.status === 'completed')
      const activeInstances = instances.filter(i => i.status === 'running')

      // Calcular métricas básicas
      const totalProcesses = processes.length
      const activeProcesses = processes.filter(p => p.status === 'active').length
      const completedProcessCount = processes.reduce((sum, p) => sum + p.completedInstances, 0)

      // Calcular tempos médios (simulado)
      const avgCycleTime = 4.5 // horas
      const avgLeadTime = 6.2  // horas
      const defectRate = 2.1   // %
      const throughput = 8.5   // unidades/hora
      const bottleneckIndex = 1.2 // índice

      return {
        totalProcesses,
        activeProcesses,
        completedProcesses: completedProcessCount,
        avgCycleTime,
        avgLeadTime,
        defectRate,
        throughput,
        bottleneckIndex
      }
    } catch (error) {
      console.error('Erro ao calcular métricas BPM:', error)
      throw error
    }
  }

  /**
   * Identifica gargalos no processo
   */
  static async identifyBottlenecks(processId: string): Promise<{
    bottlenecks: Array<{
      activity: ActivityDefinition
      bottleneckScore: number
      avgWaitTime: number
      utilization: number
    }>
    recommendations: string[]
  }> {
    try {
      const activities = await this.getProcessActivities(processId)

      // Simulação de identificação de gargalos
      const bottlenecks = activities.map(activity => ({
        activity,
        bottleneckScore: Math.random() * 100, // Score simulado
        avgWaitTime: Math.random() * 2, // Horas
        utilization: 70 + Math.random() * 30 // %
      })).sort((a, b) => b.bottleneckScore - a.bottleneckScore)

      const recommendations = [
        'Aumentar capacidade da atividade com maior bottleneck',
        'Redistribuir recursos entre atividades',
        'Implementar automação para atividades críticas',
        'Revisar sequência de atividades para otimizar fluxo'
      ]

      return { bottlenecks, recommendations }
    } catch (error) {
      console.error('Erro ao identificar gargalos:', error)
      throw error
    }
  }

  /**
   * Gera relatório de performance BPM
   */
  static async generateBPMReport(
    processId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    summary: BPMMetrics
    trends: Array<{
      date: string
      throughput: number
      cycleTime: number
      defectRate: number
    }>
    topIssues: string[]
    improvements: string[]
  }> {
    try {
      const metrics = await this.calculateBPMMetrics(processId, undefined, startDate, endDate)

      // Dados de tendência simulados
      const trends = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        throughput: 8 + Math.random() * 2,
        cycleTime: 4 + Math.random() * 1,
        defectRate: 2 + Math.random() * 1
      })).reverse()

      const topIssues = [
        'Tempo de espera elevado na atividade de mistura',
        'Taxa de retrabalho acima da meta',
        'Utilização irregular de equipamentos'
      ]

      const improvements = [
        'Otimizar sequência de produção',
        'Implementar sistema de agendamento',
        'Treinar operadores em técnicas avançadas'
      ]

      return {
        summary: metrics,
        trends,
        topIssues,
        improvements
      }
    } catch (error) {
      console.error('Erro ao gerar relatório BPM:', error)
      throw error
    }
  }

  /**
   * Valida definição de processo
   */
  static validateProcessDefinition(process: ProcessDefinitionInput): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!process.name || process.name.trim().length < 3) {
      errors.push('Nome do processo deve ter pelo menos 3 caracteres')
    }

    if (process.priority && (process.priority < 1 || process.priority > 10)) {
      errors.push('Prioridade deve estar entre 1 e 10')
    }

    if (process.slaHours && process.slaHours <= 0) {
      errors.push('SLA deve ser maior que zero')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Simula execução de processo
   */
  static simulateProcessExecution(processId: string, durationHours: number = 8): {
    steps: Array<{
      time: number
      activity: string
      status: string
      metrics: any
    }>
    finalMetrics: BPMMetrics
  } {
    const steps = []
    const activities = ['Preparação', 'Mistura', 'Controle Qualidade', 'Embalagem', 'Expedição']

    activities.forEach((activity, index) => {
      const time = index * (durationHours * 60 / activities.length)
      steps.push({
        time,
        activity,
        status: index < activities.length - 1 ? 'completed' : 'running',
        metrics: {
          duration: 30 + Math.random() * 60,
          quality: 90 + Math.random() * 10
        }
      })
    })

    const finalMetrics: BPMMetrics = {
      totalProcesses: 1,
      activeProcesses: 1,
      completedProcesses: 1,
      avgCycleTime: 4.2,
      avgLeadTime: 6.1,
      defectRate: 1.8,
      throughput: 9.2,
      bottleneckIndex: 1.1
    }

    return { steps, finalMetrics }
  }
}
