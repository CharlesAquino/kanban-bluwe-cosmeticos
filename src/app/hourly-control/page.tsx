'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  RefreshCw,
  Eye,
  Timer,
  BarChart3,
  FileText,
  Download,
  Calendar
} from 'lucide-react'
import { loadProductsAndStats } from '@/lib/product-operations'
import { useProcessHistory } from '@/hooks/use-process-history'
import type { Product } from '@/lib/types'
import type { ProductStage, ProductStatus } from '@/lib/types-modern'
import { SkeletonTable } from '@/components/skeletons'

interface MonitoringData {
  productId: string
  productName: string
  currentStage: ProductStage | string
  status: ProductStatus | string
  startTime: string
  elapsedTime: number
  targetTime?: number
  efficiency: number
  lastUpdate: string
}

export default function HourlyControlPage() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showFinalReport, setShowFinalReport] = useState(false)

  // Hook de histórico completo de processos
  const { summary, exportHistory } = useProcessHistory()

  // Carregar dados de monitoramento
  const loadMonitoringData = useCallback(async () => {
    try {
      const { products } = await loadProductsAndStats()

      // Converter produtos em dados de monitoramento
      const monitoring: MonitoringData[] = products.map((product: Product) => {
        const currentStage = product.stagesHistory?.find(
          sh => sh.stage === product.currentStage
        )

        const startTime = currentStage?.startTime || product.createdAt
        const elapsedTime = Math.floor(
          (new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60) // em minutos
        )

        // Calcular eficiência baseada no tempo decorrido vs tempo esperado
        const targetTime = getTargetTimeForStage(product.currentStage)
        const efficiency = targetTime ? Math.max(0, Math.min(100, (targetTime / elapsedTime) * 100)) : 100

        return {
          productId: product.id,
          productName: product.name,
          currentStage: product.currentStage,
          status: product.status,
          startTime,
          elapsedTime,
          targetTime,
          efficiency,
          lastUpdate: product.updatedAt
        }
      })

      setMonitoringData(monitoring)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Função para obter tempo esperado por estágio (em minutos)
  const getTargetTimeForStage = (stage: ProductStage | string): number => {
    // Mapeamento usando enums modernos; mantém fallback para valores legados
    const targetTimes: Partial<Record<ProductStage, number>> & Record<string, number> = {
      PRODUCAO_1KG: 60,
      AVALIACAO_COR: 30,
      PRODUCAO_5KG: 120,
      AVALIACAO_FINAL: 30,
      APROVADO: 15,
      REJEITADO: 15,
      // legacy lowercase fallbacks
      producao_1kg: 60,
      avaliacao_cor: 30,
      testes_cq: 45,
      producao_reator: 120,
      avaliacao_cor_reator: 30,
      testes_performance_reator: 60,
      aprovado: 15
    }
    return targetTimes[stage] ?? 60
  }

  // Função para obter cor baseada na eficiência
  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Função para obter status do produto
  const getStatusInfo = (status: ProductStatus | string) => {
    switch (status) {
      case 'in_progress': // legacy
      case 'ACTIVE':
        return { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' }
      case 'paused': // legacy
      case 'PAUSED':
        return { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800' }
      case 'completed': // legacy
      case 'COMPLETED':
        return { label: 'Concluído', color: 'bg-green-100 text-green-800' }
      case 'blocked': // legacy
      case 'BLOCKED':
        return { label: 'Bloqueado', color: 'bg-red-100 text-red-800' }
      case 'CANCELLED':
        return { label: 'Cancelado', color: 'bg-gray-200 text-gray-800' }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' }
    }
  }

  useEffect(() => {
    loadMonitoringData()

    // Auto-refresh a cada 30 segundos se habilitado
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(loadMonitoringData, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, loadMonitoringData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Controle Hora a Hora - Monitoramento</h1>
                <p className="text-gray-600">Carregando monitoramento em tempo real...</p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonTable rows={10} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Controle Hora a Hora - Monitoramento
              </h1>
              <p className="text-gray-600">
                Monitoramento Automático de Processos - Bluwe Cosméticos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </div>
              <Button
                onClick={loadMonitoringData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Timer className="h-4 w-4" />
                {autoRefresh ? 'Auto' : 'Manual'}
              </Button>
              <Button
                onClick={() => setShowFinalReport(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Relatório Final
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Monitorados</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monitoringData.length}</div>
              <p className="text-xs text-muted-foreground">
                Em produção ativa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                monitoringData.length > 0
                  ? getEfficiencyColor(monitoringData.reduce((acc, m) => acc + m.efficiency, 0) / monitoringData.length)
                  : 'text-gray-600'
              }`}>
                {monitoringData.length > 0
                  ? Math.round(monitoringData.reduce((acc, m) => acc + m.efficiency, 0) / monitoringData.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Tempo vs meta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Prazo</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {monitoringData.filter(m => m.efficiency >= 90).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Dentro do prazo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {monitoringData.filter(m => m.efficiency < 70).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Acima do prazo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Relatório Final - aparece quando ativado */}
        {showFinalReport && (
          <div className="mb-8 animate-slide-in-up">
            <Card className="card-modern">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    📊 Relatório Final - Controle Hora a Hora
                  </CardTitle>
                  <Button
                    onClick={() => setShowFinalReport(false)}
                    variant="outline"
                    size="sm"
                  >
                    Fechar
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Relatório completo com todas as métricas históricas de produção
                </p>
              </CardHeader>
              <CardContent>
                {/* Resumo Geral */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500 rounded-full">
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Total de Ações</p>
                          <p className="text-2xl font-bold text-blue-900">{summary.totalActions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500 rounded-full">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Eficiência Média</p>
                          <p className="text-2xl font-bold text-green-900">
                            {Math.round(summary.averageEfficiency)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500 rounded-full">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-700">Produtos Ativos</p>
                          <p className="text-2xl font-bold text-purple-900">{summary.totalProducts}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detalhamento por Ação */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ações por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(summary.actionsByType).map(([action, count]) => (
                          <div key={action} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {action.replace('_', ' ')}
                            </span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tendência de Eficiência</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${
                          summary.efficiencyTrend === 'up' ? 'bg-green-100' :
                          summary.efficiencyTrend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <TrendingUp className={`h-5 w-5 ${
                            summary.efficiencyTrend === 'up' ? 'text-green-600' :
                            summary.efficiencyTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {summary.efficiencyTrend === 'up' ? 'Melhorando' :
                             summary.efficiencyTrend === 'down' ? 'Piorando' : 'Estável'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Comparação com período anterior
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Últimas 24 Horas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Atividade das Últimas 24 Horas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {summary.last24Hours.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Nenhuma atividade nas últimas 24 horas
                        </p>
                      ) : (
                        summary.last24Hours.map((entry) => (
                          <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{entry.productName}</p>
                              <p className="text-xs text-gray-600 capitalize">
                                {entry.action.replace('_', ' ')}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Botão de Exportar */}
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => {
                      const dataStr = exportHistory()
                      const dataBlob = new Blob([dataStr], { type: 'application/json' })
                      const url = URL.createObjectURL(dataBlob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `relatorio-final-${new Date().toISOString().split('T')[0]}.json`
                      link.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Relatório Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de Monitoramento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Monitoramento em Tempo Real de Processos
            </CardTitle>
            <p className="text-sm text-gray-600">
              Acompanhamento automático baseado nas ações realizadas no sistema Kanban principal
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estágio Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tempo Decorrido</TableHead>
                    <TableHead>Tempo Meta</TableHead>
                    <TableHead>Eficiência</TableHead>
                    <TableHead>Última Atualização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoringData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum produto em produção ativa para monitorar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    monitoringData.map((item) => {
                      const statusInfo = getStatusInfo(item.status)
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500">{item.productId.slice(0, 8)}...</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.currentStage.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            {Math.floor(item.elapsedTime / 60)}h {item.elapsedTime % 60}m
                          </TableCell>
                          <TableCell className="font-mono">
                            {item.targetTime ? `${Math.floor(item.targetTime / 60)}h ${item.targetTime % 60}m` : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getEfficiencyColor(item.efficiency)}`}>
                              {Math.round(item.efficiency)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(item.lastUpdate).toLocaleTimeString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Informações sobre o monitoramento */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sobre o Monitoramento Automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Como Funciona:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Monitora automaticamente produtos ativos no Kanban</li>
                  <li>• Registra tempo decorrido desde o início de cada estágio</li>
                  <li>• Calcula eficiência baseada no tempo meta vs real</li>
                  <li>• Atualiza em tempo real conforme ações no sistema</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Indicadores:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <span className="text-green-600 font-medium">Verde:</span> Dentro do prazo (≥90%)</li>
                  <li>• <span className="text-yellow-600 font-medium">Amarelo:</span> Atenção (70-89%)</li>
                  <li>• <span className="text-red-600 font-medium">Vermelho:</span> Atrasado (&lt;70%)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
