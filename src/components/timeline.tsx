/**
 * Componente de timeline em tempo real aplicando clean code:
 * - Single Responsibility: Apenas exibir timeline de processos
 * - Performance: Memoização adequada para eventos em tempo real
 * - Type Safety: Tipagem robusta
 * - UX: Interface clara e informativa com indicadores visuais
 */

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  FileText,
  BarChart3
} from 'lucide-react'
import type { ProcessHistoryEntry } from '@/hooks/use-process-history'

interface TimelineComponentProps {
  history: ProcessHistoryEntry[]
  onRefresh?: () => void
  onExport?: () => void
  isLoading?: boolean
}

const ACTION_ICONS = {
  product_create: Package,
  stage_advance: TrendingUp,
  stage_pause: Pause,
  stage_resume: Play,
  stage_block: AlertTriangle,
  hourly_control: Clock,
  bottleneck_analysis: BarChart3,
}

const ACTION_COLORS = {
  product_create: 'bg-green-100 text-green-800 border-green-200',
  stage_advance: 'bg-blue-100 text-blue-800 border-blue-200',
  stage_pause: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  stage_resume: 'bg-green-100 text-green-800 border-green-200',
  stage_block: 'bg-red-100 text-red-800 border-red-200',
  hourly_control: 'bg-purple-100 text-purple-800 border-purple-200',
  bottleneck_analysis: 'bg-orange-100 text-orange-800 border-orange-200',
}

const ACTION_LABELS = {
  product_create: 'Produto Criado',
  stage_advance: 'Estágio Avançado',
  stage_pause: 'Produção Pausada',
  stage_resume: 'Produção Retomada',
  stage_block: 'Produção Bloqueada',
  hourly_control: 'Controle Hora a Hora',
  bottleneck_analysis: 'Análise de Gargalo',
}

export function TimelineComponent({ history, onRefresh, onExport, isLoading }: TimelineComponentProps) {
  // Ordenar histórico por timestamp (mais recente primeiro)
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [history])

  // Estatísticas rápidas
  const stats = useMemo(() => {
    if (sortedHistory.length === 0) {
      return {
        totalActions: 0,
        last24h: 0,
        efficiency: 0,
        productsActive: 0
      }
    }

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentActions = sortedHistory.filter(entry => new Date(entry.timestamp) >= last24h)

    const efficiencyEntries = sortedHistory.filter(h => h.efficiency !== undefined)
    const averageEfficiency = efficiencyEntries.length > 0
      ? efficiencyEntries.reduce((acc, entry) => acc + (entry.efficiency || 0), 0) / efficiencyEntries.length
      : 0

    const uniqueProducts = new Set(sortedHistory.map(h => h.productId)).size

    return {
      totalActions: sortedHistory.length,
      last24h: recentActions.length,
      efficiency: averageEfficiency,
      productsActive: uniqueProducts
    }
  }, [sortedHistory])

  // Formatação de duração
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  // Formatação relativa de tempo
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const entryTime = new Date(timestamp)
    const diffMinutes = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return 'Agora mesmo'
    if (diffMinutes < 60) return `${diffMinutes}m atrás`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h atrás`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d atrás`
  }

  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando timeline...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <Card className="card-modern">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              📊 Timeline em Tempo Real
            </CardTitle>
            <div className="flex gap-2">
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              )}
              {onExport && (
                <Button onClick={onExport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalActions}</div>
              <div className="text-sm text-gray-600">Total de Ações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.last24h}</div>
              <div className="text-sm text-gray-600">Últimas 24h</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                stats.efficiency >= 90 ? 'text-green-600' :
                stats.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(stats.efficiency)}%
              </div>
              <div className="text-sm text-gray-600">Eficiência Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.productsActive}</div>
              <div className="text-sm text-gray-600">Produtos Ativos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de eventos */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5" />
            Linha do Tempo dos Processos
          </CardTitle>
          <p className="text-sm text-gray-600">
            Histórico completo de todas as ações realizadas no sistema
          </p>
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento registrado ainda.</p>
              <p className="text-sm">As ações aparecerão aqui conforme você usar o sistema.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sortedHistory.map((entry, index) => {
                const IconComponent = ACTION_ICONS[entry.action] || Activity
                const isLast = index === sortedHistory.length - 1

                return (
                  <div key={entry.id} className="flex items-start gap-4 relative">
                    {/* Linha vertical conectando eventos */}
                    {!isLast && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -z-10"></div>
                    )}

                    {/* Ícone da ação */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${ACTION_COLORS[entry.action]} border-2 flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Conteúdo do evento */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${ACTION_COLORS[entry.action]} w-fit`}>
                          {ACTION_LABELS[entry.action]}
                        </Badge>
                        <span className="text-xs text-gray-500 font-mono">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {entry.productName}
                        </p>

                        {(entry.fromStage || entry.toStage) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {entry.fromStage && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {entry.fromStage.replace('_', ' ')}
                              </span>
                            )}
                            {entry.fromStage && entry.toStage && (
                              <span className="text-gray-400">→</span>
                            )}
                            {entry.toStage && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {entry.toStage.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {entry.operator && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {entry.operator}
                            </span>
                          )}
                          {entry.shift && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {entry.shift}
                            </span>
                          )}
                          {entry.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(entry.duration)}
                            </span>
                          )}
                          {entry.efficiency !== undefined && (
                            <span className={`flex items-center gap-1 ${
                              entry.efficiency >= 90 ? 'text-green-600' :
                              entry.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              <CheckCircle className="h-3 w-3" />
                              {Math.round(entry.efficiency)}%
                            </span>
                          )}
                        </div>

                        {entry.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-4 border-gray-300">
                            <FileText className="h-3 w-3 inline mr-1" />
                            {entry.notes}
                          </p>
                        )}

                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                              Detalhes técnicos
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Timestamp detalhado */}
                    <div className="text-xs text-gray-400 font-mono whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
