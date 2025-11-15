'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SkeletonCard } from '@/components/skeletons'
import {
  Activity,
  TrendingUp,
  Target,
  BarChart3,
  RefreshCw,
  Package,
  Workflow,
  AlertTriangle,
} from 'lucide-react'
import { BPMService, BPMMetrics } from '@/lib/bpm-service'
import type { ProcessDefinition } from '@/lib/types'
import Link from 'next/link'

interface IntegratedMetrics {
  bpm: BPMMetrics
  cep: {
    totalCharts: number
    activeAnalyses: number
    avgEfficiency: number
    qualityScore: number
  }
  kanban: {
    totalProducts: number
    inProgress: number
    completed: number
    blocked: number
  }
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<IntegratedMetrics | null>(null)
  const [processes, setProcesses] = useState<ProcessDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegratedData()
  }, [])

  const loadIntegratedData = async () => {
    try {
      setLoading(true)

      // Carregar dados BPM
      const [processesData, bpmMetricsData] = await Promise.all([
        BPMService.getProcessDefinitions(),
        BPMService.calculateBPMMetrics()
      ])

      // Valores neutros para CEP e Kanban (sem mock) até integrar serviços reais
      const cepData = {
        totalCharts: 0,
        activeAnalyses: 0,
        avgEfficiency: 0,
        qualityScore: 0
      }

      const kanbanData = {
        totalProducts: 0,
        inProgress: 0,
        completed: 0,
        blocked: 0
      }

      setProcesses(processesData)
      setMetrics({
        bpm: bpmMetricsData,
        cep: cepData,
        kanban: kanbanData
      })

    } catch (error) {
      console.error('Erro ao carregar dados integrados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOverallHealthScore = () => {
    if (!metrics) return 0

    // Cálculo composto: BPM (40%) + CEP (35%) + Kanban (25%)
    const bpmScore = (metrics.bpm.throughput / 10) * 40 // Normalizado para 10
    const cepScore = (metrics.cep.qualityScore / 5) * 35 // Normalizado para 5
    const kanbanScore = ((metrics.kanban.completed / metrics.kanban.totalProducts) * 100 / 100) * 25

    return Math.round(bpmScore + cepScore + kanbanScore)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const healthScore = getOverallHealthScore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Integrado - BPM + Kanban + CEP
          </h1>
          <p className="text-slate-500">
            Monitoramento completo e integrado de processos de negócio, produção e qualidade
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${healthScore >= 80 ? 'bg-green-100 text-green-800' : healthScore >= 60 ? 'bg-slate-100 text-slate-800' : 'bg-red-100 text-red-800'}`}>
            Saúde: {healthScore}%
          </Badge>
          <Button variant="outline" onClick={loadIntegratedData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Score Geral de Saúde */}
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicador de Saúde Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Saúde do Sistema</span>
              <span className="text-2xl font-bold text-slate-900">{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-emerald-700">
                  {metrics?.bpm.activeProcesses || 0}
                </div>
                <div className="text-slate-600">Processos Ativos</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-700">
                  {metrics?.cep.avgEfficiency.toFixed(1) || 0}%
                </div>
                <div className="text-slate-600">Eficiência Média</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-indigo-700">
                  {metrics?.kanban.completed || 0}
                </div>
                <div className="text-slate-600">Produtos Concluídos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Integradas */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* BPM Metrics */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Workflow className="h-5 w-5" />
              Business Process Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Processos Ativos:</span>
              <span className="font-mono">{metrics?.bpm.activeProcesses || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Tempo Médio de Ciclo:</span>
              <span className="font-mono">{metrics?.bpm.avgCycleTime.toFixed(1) || 0}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Vazão:</span>
              <span className="font-mono">{metrics?.bpm.throughput.toFixed(1) || 0}/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Taxa de Defeitos:</span>
              <span className="font-mono text-red-700">{metrics?.bpm.defectRate.toFixed(1) || 0}%</span>
            </div>
          </CardContent>
        </Card>

        {/* CEP Metrics */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <BarChart3 className="h-5 w-5" />
              Controle Estatístico de Processos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Cartas Ativas:</span>
              <span className="font-mono">{metrics?.cep.totalCharts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Análises Ativas:</span>
              <span className="font-mono">{metrics?.cep.activeAnalyses || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Eficiência Média:</span>
              <span className="font-mono text-emerald-700">{metrics?.cep.avgEfficiency.toFixed(1) || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Qualidade:</span>
              <span className="font-mono">{metrics?.cep.qualityScore.toFixed(1) || 0}/5</span>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Metrics */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Package className="h-5 w-5" />
              Sistema Kanban
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Produtos Totais:</span>
              <span className="font-mono">{metrics?.kanban.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Em Andamento:</span>
              <span className="font-mono text-blue-700">{metrics?.kanban.inProgress || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Concluídos:</span>
              <span className="font-mono text-emerald-700">{metrics?.kanban.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Bloqueados:</span>
              <span className="font-mono text-red-700">{metrics?.kanban.blocked || 0}</span>
            </div>
          </CardContent>
        </Card>
        
      </div>

    {/* Processos BPM Ativos */}
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Processos BPM em Execução
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {processes.filter(p => p.status === 'active').map((process) => (
            <div key={process.id} className="p-4 border border-slate-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-900">{process.name}</h3>
                <Badge className="bg-green-100 text-green-800 text-xs">Ativo</Badge>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Instâncias:</span>
                  <span>{process.totalInstances}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Concluídas:</span>
                  <span>{process.completedInstances}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tempo Médio:</span>
                  <span>{process.avgExecutionTime?.toFixed(1) || 'N/A'}h</span>
                </div>
              </div>
            </div>
          ))}

          {processes.filter(p => p.status === 'active').length === 0 && (
            <div className="text-center text-slate-500 py-8">
              Nenhum processo ativo no momento
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Alertas e Recomendações */}
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
            <div className="text-sm text-amber-800">
              <strong>Gargalo Detectado:</strong> Atividade de mistura apresenta tempo de espera elevado
            </div>
          </div>

          <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="text-sm text-blue-800">
              <strong>Oportunidade:</strong> Eficiência pode ser melhorada com otimização de recursos
            </div>
          </div>

          <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
            <div className="text-sm text-green-800">
              <strong>Meta Alcançada:</strong> Taxa de defeitos abaixo da meta estabelecida
            </div>
          </div>
        </CardContent>
      </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-700" />
              Recomendações de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Prioridade Alta:</strong> Implementar automação na atividade de mistura
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Otimização:</strong> Redistribuir recursos entre atividades críticas
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="text-sm text-indigo-800">
                <strong>Treinamento:</strong> Capacitar operadores em técnicas avançadas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-center gap-4">
        <Link href="/bpm" className="inline-flex">
          <Button>
            <Workflow className="h-4 w-4 mr-2" />
            Gerenciar BPM
          </Button>
        </Link>
        <Link href="/cep-integration" className="inline-flex">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análise CEP
          </Button>
        </Link>
        <Link href="/" className="inline-flex">
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Kanban
          </Button>
        </Link>
      </div>
    </div>
  )
}
