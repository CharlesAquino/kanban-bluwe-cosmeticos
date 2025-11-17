 'use client'

 import { useState, useEffect, useCallback, useMemo } from 'react'
 import useSWR from 'swr'
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
  Calendar,
  Settings,
  ChevronDown,
  Shield,
  Users,
  Beaker,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { loadProductsAndStats } from '@/lib/product-operations'
import { useProcessHistory } from '@/hooks/use-process-history'
import type { Product, StageHistory } from '@/lib/types'
import type { ProductStage, ProductStatus } from '@/lib/types-modern'
import type { ModOperator } from '@/lib/mod-types'
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

interface HourlyManualProduction {
  hour: number
  label: string
  totalKg: number
  opsCount: number
}

interface ManualProductionRecord {
  id: string
  quantity: number
  createdAt: string
  createdById?: string
  notes?: string | null
  currentStage?: string
  op?: string
  batch?: string
  name?: string
}

interface ManualOperatorSummary {
  operadorId: string
  operadorNome: string
  totalKg: number
  opsCount: number
}

const extractOperadorIdFromRecord = (record: ManualProductionRecord): string | undefined => {
  if (record.createdById) return record.createdById

  if (record.notes) {
    const match = record.notes.match(/Operador:\s*([^|]+)/i)
    if (match) {
      return match[1].trim()
    }
  }

  return undefined
}

export default function HourlyControlPage() {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showFinalReport, setShowFinalReport] = useState(false)
  const [hourlyManualData, setHourlyManualData] = useState<HourlyManualProduction[]>([])
  const [manualOperatorData, setManualOperatorData] = useState<ManualOperatorSummary[]>([])
  const [manualRecentRecords, setManualRecentRecords] = useState<ManualProductionRecord[]>([])

  const { data: modOperatorsData } = useSWR<ModOperator[]>(
    '/api/mod/operators',
    async (url: string) => {
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
      return json.data as ModOperator[]
    },
    {
      revalidateOnFocus: false,
    }
  )

  const modOperators = useMemo(() => modOperatorsData || [], [modOperatorsData])

  // Hook de histórico completo de processos
  const { summary, exportHistory } = useProcessHistory()

  const HOURLY_TARGET_KG = 50

  // Carregar dados de monitoramento
  const loadMonitoringData = useCallback(async () => {
    try {
      const { products } = await loadProductsAndStats()

      // Converter produtos em dados de monitoramento
      const monitoring: MonitoringData[] = products.map((product: Product) => {
        const currentStage = product.stageHistory?.find(
          (sh: StageHistory) => sh.stage === product.currentStage
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

  const getHourlyStatus = (performancePercent: number) => {
    if (performancePercent >= 100) {
      return {
        label: 'No prazo',
        badgeClass: 'bg-green-100 text-green-800',
        rowClass: 'bg-green-50/40'
      }
    }

    if (performancePercent >= 70) {
      return {
        label: 'Atenção',
        badgeClass: 'bg-yellow-100 text-yellow-800',
        rowClass: 'bg-yellow-50/40'
      }
    }

    return {
      label: 'Atrasado',
      badgeClass: 'bg-red-100 text-red-800',
      rowClass: 'bg-red-50/40'
    }
  }

  const loadManualHourlyData = useCallback(async () => {
    try {
      const response = await fetch('/api/mod-entry')
      const result = await response.json()

      if (!result.success || !Array.isArray(result.data)) {
        setHourlyManualData([])
        setManualOperatorData([])
        return
      }

      const records = result.data as ManualProductionRecord[]
      const today = new Date()
      const todayStr = today.toISOString().slice(0, 10)

      const buckets: Record<number, HourlyManualProduction> = {}
      const operatorBuckets: Record<string, ManualOperatorSummary> = {}
      const todayRecords: ManualProductionRecord[] = []

      const formatHourLabel = (hour: number): string => {
        const startHour = hour.toString().padStart(2, '0')
        const endHour = ((hour + 1) % 24).toString().padStart(2, '0')
        return `${startHour}:00 - ${endHour}:00`
      }

      records.forEach((record) => {
        const createdAt = new Date(record.createdAt)
        const recordDate = createdAt.toISOString().slice(0, 10)

        if (recordDate !== todayStr) return

        // Guardar registro do dia para histórico das últimas produções
        todayRecords.push(record)

        const hour = createdAt.getHours()
        if (!buckets[hour]) {
          buckets[hour] = {
            hour,
            label: formatHourLabel(hour),
            totalKg: 0,
            opsCount: 0
          }
        }

        buckets[hour].totalKg += record.quantity
        buckets[hour].opsCount += 1

        const operadorId = extractOperadorIdFromRecord(record)
        if (!operadorId) return

        if (!operatorBuckets[operadorId]) {
          const operador = modOperators.find((op) => op.id === operadorId)
          operatorBuckets[operadorId] = {
            operadorId,
            operadorNome: operador?.name ?? `Operador ${operadorId}`,
            totalKg: 0,
            opsCount: 0
          }
        }

        operatorBuckets[operadorId].totalKg += record.quantity
        operatorBuckets[operadorId].opsCount += 1
      })

      const bucketArray = Object.values(buckets).sort((a, b) => a.hour - b.hour)
      const operatorArray = Object.values(operatorBuckets).sort((a, b) => b.totalKg - a.totalKg)

      const recent = todayRecords
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)

      setHourlyManualData(bucketArray)
      setManualOperatorData(operatorArray)
      setManualRecentRecords(recent)
    } catch (error) {
      console.error('Erro ao carregar dados manuais para controle hora a hora:', error)
      setHourlyManualData([])
      setManualOperatorData([])
    }
  }, [modOperators])

  useEffect(() => {
    loadMonitoringData()
    loadManualHourlyData()

    // Auto-refresh a cada 30 segundos se habilitado
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        loadMonitoringData()
        loadManualHourlyData()
      }, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, loadMonitoringData, loadManualHourlyData])

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

  const totalManualKg = hourlyManualData.reduce((sum, slot) => sum + slot.totalKg, 0)
  const totalManualOps = hourlyManualData.reduce((sum, slot) => sum + slot.opsCount, 0)
  const hoursWithData = hourlyManualData.length
  const plannedKgForHours = hoursWithData * HOURLY_TARGET_KG
  const manualDayPerformance = plannedKgForHours > 0
    ? (totalManualKg / plannedKgForHours) * 100
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white grid place-items-center font-bold text-lg shadow-lg shadow-slate-500/30">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Controle Hora a Hora - Monitoramento
                </h1>
                <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Monitoramento Automático de Processos</p>
                <p className="text-xs text-slate-500 mt-1">Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-4">
              {/* Dropdown Overview */}
              <div className="relative z-50">
                <button
                  onClick={() => setOverviewDropdownOpen(!overviewDropdownOpen)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${overviewDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {overviewDropdownOpen && (
                  <div className="fixed right-72 top-20 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999999]">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Dashboard</span>
                        <span className="text-xs text-slate-500">Indicadores em tempo real</span>
                      </div>
                    </Link>
                    <Link
                      href="/analise-operador"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <Users className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">MOD</span>
                        <span className="text-xs text-slate-500">Análise por operador</span>
                      </div>
                    </Link>
                    <Link
                      href="/quality"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <Beaker className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Qualidade</span>
                        <span className="text-xs text-slate-500">Monitoramento CQ</span>
                      </div>
                    </Link>
                    <Link
                      href="/kanban-overview"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Produção</span>
                        <span className="text-xs text-slate-500">Visão de produção</span>
                      </div>
                    </Link>
                    <Link
                      href="/semi-finished-overview"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <Package className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Semi acabados</span>
                        <span className="text-xs text-slate-500">Visão geral semi-acabados</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Dropdown Admin */}
              <div className="relative z-50">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {adminDropdownOpen && (
                  <div className="fixed right-6 top-20 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999999]">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Admin Home</span>
                        <span className="text-xs text-slate-500">Painel administrativo</span>
                      </div>
                    </Link>
                    <Link
                      href="/admin/quality"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Beaker className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Qualidade Admin</span>
                        <span className="text-xs text-slate-500">Controle de qualidade</span>
                      </div>
                    </Link>
                    <Link
                      href="/admin/mod"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Users className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">MOD Admin</span>
                        <span className="text-xs text-slate-500">Operadores</span>
                      </div>
                    </Link>
                    <Link
                      href="/semi-finished"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Package className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Semi-acabados Admin</span>
                        <span className="text-xs text-slate-500">Categorias de semi-acabados</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Botões de controle */}
              <Button
                onClick={() => {
                  loadMonitoringData()
                  loadManualHourlyData()
                }}
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
                Relatório
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
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

        {/* Produção manual do dia por hora (dados do formulário manual) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Produção Manual do Dia por Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyManualData.length === 0 ? (
              <p className="text-sm text-gray-500">
                Ainda não há lançamentos manuais de produção para hoje.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Meta por hora:</span>{' '}
                    <span>{HOURLY_TARGET_KG.toFixed(1)} kg/h</span>
                  </div>
                  <div>
                    <span className="font-medium">Total produzido hoje (manual):</span>{' '}
                    <span>{totalManualKg.toFixed(1)} kg em {totalManualOps} OPs</span>
                  </div>
                  <div>
                    <span className="font-medium">Desempenho vs meta:</span>{' '}
                    <span className={manualDayPerformance >= 100 ? 'text-green-700' : manualDayPerformance >= 70 ? 'text-yellow-700' : 'text-red-700'}>
                      {manualDayPerformance.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faixa Horária</TableHead>
                        <TableHead>OPs</TableHead>
                        <TableHead>Produção (kg)</TableHead>
                        <TableHead>Média kg/OP</TableHead>
                        <TableHead>Status vs Meta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hourlyManualData.map((slot) => {
                        const hourPerformance = HOURLY_TARGET_KG > 0
                          ? (slot.totalKg / HOURLY_TARGET_KG) * 100
                          : 0
                        const status = getHourlyStatus(hourPerformance)

                        return (
                          <TableRow key={slot.hour} className={status.rowClass}>
                            <TableCell>{slot.label}</TableCell>
                            <TableCell>{slot.opsCount}</TableCell>
                            <TableCell>{slot.totalKg.toFixed(1)}</TableCell>
                            <TableCell>
                              {slot.opsCount > 0
                                ? (slot.totalKg / slot.opsCount).toFixed(1)
                                : '0.0'}
                            </TableCell>
                            <TableCell>
                              <Badge className={status.badgeClass}>
                                {status.label} ({hourPerformance.toFixed(0)}%)
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Histórico das últimas produções manuais (hoje) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Últimas produções manuais (hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {manualRecentRecords.length === 0 ? (
              <p className="text-sm text-gray-500">
                Ainda não há registros manuais de produção para hoje.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>OP</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Quantidade (kg)</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualRecentRecords.map((rec) => {
                      const createdAt = new Date(rec.createdAt)
                      const operadorId = extractOperadorIdFromRecord(rec)
                      const operador = operadorId
                        ? modOperators.find((op) => op.id === operadorId)
                        : undefined
                      const operadorNome = operador?.name || operadorId || '—'

                      return (
                        <TableRow key={rec.id}>
                          <TableCell>
                            {createdAt.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>{rec.op || '—'}</TableCell>
                          <TableCell>{rec.batch || '—'}</TableCell>
                          <TableCell>{operadorNome}</TableCell>
                          <TableCell>{rec.quantity.toFixed(1)}</TableCell>
                          <TableCell>{rec.currentStage || 'Manual'}</TableCell>
                          <TableCell className="max-w-xs truncate" title={rec.notes || undefined}>
                            {rec.notes || '—'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produção manual por operador (resumo do dia) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Desempenho Manual por Operador (Dia)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {manualOperatorData.length === 0 ? (
              <p className="text-sm text-gray-500">
                Ainda não há lançamentos manuais associados a operadores para hoje.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operador</TableHead>
                      <TableHead>OPs</TableHead>
                      <TableHead>Produção (kg)</TableHead>
                      <TableHead>Média kg/OP</TableHead>
                      <TableHead>% do Total Manual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualOperatorData.map((op) => {
                      const share = totalManualKg > 0 ? (op.totalKg / totalManualKg) * 100 : 0
                      const operator = modOperators.find((m) => m.id === op.operadorId)
                      const baseName = operator?.name || op.operadorNome
                      const initials = baseName
                        .split(' ')
                        .map((n) => n.trim()[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'MOD'
                      return (
                        <TableRow key={op.operadorId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-[10px] text-slate-500">
                                {operator?.photo ? (
                                  <img
                                    src={operator.photo}
                                    alt={op.operadorNome}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span>{initials}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{op.operadorNome}</div>
                                {operator?.role && (
                                  <div className="text-xs text-gray-500">{operator.role}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{op.opsCount}</TableCell>
                          <TableCell>{op.totalKg.toFixed(1)}</TableCell>
                          <TableCell>
                            {op.opsCount > 0 ? (op.totalKg / op.opsCount).toFixed(1) : '0.0'}
                          </TableCell>
                          <TableCell>{share.toFixed(1)}%</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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
