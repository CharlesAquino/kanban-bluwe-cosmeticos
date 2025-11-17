'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Beaker,
  FileText,
  RefreshCw,
  BarChart3,
  Settings,
} from 'lucide-react'
import { useGlobalData, useGlobalActions } from '@/contexts/global-context'
import { QualityTestForm } from '@/components/quality/quality-test-form'
import { NonConformityForm } from '@/components/quality/non-conformity-form'
import { QualityParameter, NonConformity } from '@/lib/quality-types'

export default function QualityAdminPage() {
  const { products } = useGlobalData()
  const { refreshData } = useGlobalActions()
  const [qualityData, setQualityData] = useState<QualityParameter[]>([])
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([])

  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [filterParameter, setFilterParameter] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchQualityTests = async () => {
    try {
      const res = await fetch('/api/quality/tests', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao buscar análises')
      const json = await res.json()
      setQualityData(Array.isArray(json?.data) ? json.data : [])
    } catch (e) {
      console.error('Erro ao carregar quality tests', e)
      setQualityData([])
    }
  }

  const fetchNonConformities = async () => {
    try {
      const res = await fetch('/api/quality/nc', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao buscar NCs')
      const json = await res.json()
      setNonConformities(Array.isArray(json?.data) ? json.data : [])
    } catch (e) {
      console.error('Erro ao carregar NCs', e)
      setNonConformities([])
    }
  }

  const reloadAll = async () => {
    await Promise.all([fetchQualityTests(), fetchNonConformities()])
  }

  const filteredQualityData = qualityData.filter((test) => {
    if (filterProduct !== 'all' && test.productId !== filterProduct) return false
    if (filterParameter !== 'all' && test.parameter !== filterParameter) return false
    if (filterStatus === 'approved' && !test.approved) return false
    if (filterStatus === 'rejected' && test.approved) return false
    return true
  })

  const qualityStats = {
    totalTests: filteredQualityData.length,
    approvedTests: filteredQualityData.filter((q) => q.approved).length,
    rejectedTests: filteredQualityData.filter((q) => !q.approved).length,
    approvalRate:
      filteredQualityData.length > 0
        ? (filteredQualityData.filter((q) => q.approved).length / filteredQualityData.length) * 100
        : 0,
    openNonConformities: nonConformities.filter((nc) => nc.status !== 'closed').length,
  }

  const getTestVisualStatus = (test: QualityParameter) => {
    if (!test.approved) return 'rejected'

    if (test.tolerance) {
      const span = test.tolerance.max - test.tolerance.min
      const threshold = span * 0.1 // 10% das bordas de tolerância como zona de alerta
      const nearMin = test.measuredValue <= test.tolerance.min + threshold
      const nearMax = test.measuredValue >= test.tolerance.max - threshold
      if (nearMin || nearMax) return 'warning'
    }

    return 'approved'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'major':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getParameterIcon = (parameter: string) => {
    switch (parameter) {
      case 'pH':
        return '🧪'
      case 'viscosidade':
        return '🌊'
      case 'cor':
        return '🎨'
      case 'densidade':
        return '⚖️'
      default:
        return '📊'
    }
  }

  useEffect(() => {
    reloadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[linear-gradient(to-br,oklch(91.7%_0.08_205.041),oklch(98.4%_0.019_200.873))] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
        {/* Título da Página */}
        <section className="space-y-4">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Administração de Qualidade</h1>
              <p className="text-lg text-slate-600 mt-2">Sistema Integrado de Qualidade</p>
            </div>
          </div>
        </section>

      {/* Alertas de Análises Reprovadas */}
      {qualityData.filter((q) => !q.approved).length > 0 && (
        <Card className="rounded-2xl border border-red-100 bg-white/80 backdrop-blur-lg shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
              <div className="rounded-xl bg-gradient-to-br from-red-400/20 to-red-400/5 text-red-700 p-2 shadow-inner">
                <AlertTriangle className="h-4 w-4" />
              </div>
              Alertas de Qualidade ({qualityData.filter((q) => !q.approved).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qualityData
                .filter((q) => !q.approved)
                .slice(0, 3)
                .map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100 text-sm hover:bg-red-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-gray-900">{test.productName}</p>
                        <p className="text-xs text-gray-600">
                          {test.parameter}: {test.measuredValue} {test.unit} (Esperado: {test.tolerance?.min || 'N/A'}-{test.tolerance?.max || 'N/A'})
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-50 text-red-700 border border-red-200 text-xs">
                      Reprovado
                    </Badge>
                  </div>
                ))}
              {qualityData.filter((q) => !q.approved).length > 3 && (
                <p className="text-xs text-red-700 text-center pt-2">
                  +{qualityData.filter((q) => !q.approved).length - 3} análises reprovadas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-lg shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 p-3 shadow-inner">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Taxa de aprovação</p>
                <p className="text-xl font-semibold text-slate-900">
                  {Math.round(qualityStats.approvalRate)}%
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {qualityStats.approvedTests}/{qualityStats.totalTests} testes aprovados
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-lg shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 p-3 shadow-inner">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Não conformidades</p>
                <p className="text-xl font-semibold text-slate-900">
                  {qualityStats.openNonConformities}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">abertas para resolução</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-lg shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 p-3 shadow-inner">
                <Beaker className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Testes hoje</p>
                <p className="text-xl font-semibold text-slate-900">{qualityStats.totalTests}</p>
                <p className="text-xs text-slate-600 mt-0.5">análises realizadas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-lg shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 p-3 shadow-inner">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Alertas de qualidade</p>
                <p className="text-xl font-semibold text-slate-900">
                  {qualityData.filter(q => !q.approved).length}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {qualityData.filter(q => !q.approved).length === 0
                    ? 'nenhum alerta ativo'
                    : 'análises reprovadas'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="space-y-4">
        <Tabs defaultValue="quality-control" className="space-y-6">
          <TabsList className="w-full grid grid-cols-4 rounded-2xl bg-slate-50/60 backdrop-blur border border-slate-200/80 shadow-sm px-1 py-1">
            <TabsTrigger
              value="quality-control"
              className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-medium text-slate-700/70 hover:text-slate-900 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.01] rounded-xl px-3 py-2.5 transition-all duration-200"
            >
              <Beaker className="h-4 w-4" />
              Controle da Qualidade
            </TabsTrigger>
            <TabsTrigger
              value="non-conformities"
              className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-medium text-slate-700/70 hover:text-slate-900 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.01] rounded-xl px-3 py-2.5 transition-all duration-200"
            >
              <AlertTriangle className="h-4 w-4" />
              Não Conformidades
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-medium text-slate-700/70 hover:text-slate-900 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.01] rounded-xl px-3 py-2.5 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              Especificações
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-medium text-slate-700/70 hover:text-slate-900 data-[state=active]:bg-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.01] rounded-xl px-3 py-2.5 transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

        {/* Controle da Qualidade */}
        <TabsContent value="quality-control" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-400/20 to-indigo-400/5 text-indigo-700 p-2 shadow-inner">
                    <Beaker className="h-5 w-5" />
                  </div>
                  <span className="bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent font-semibold">
                    Análises de Controle da Qualidade
                  </span>
                </CardTitle>
                <QualityTestForm onTestAdded={reloadAll} />
              </div>
              <p className="text-sm text-gray-600">
                Registro e monitoramento de parâmetros críticos: pH, viscosidade, cor, densidade
              </p>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              {qualityData.length > 0 && (
                <div className="mb-6 p-6 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-200/50 shadow-lg shadow-slate-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                      <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                        Filtros Inteligentes
                      </span>
                    </h4>
                    <div className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                      {filteredQualityData.length} resultados
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="filter-product" className="text-xs font-medium text-slate-700 mb-2 block">Produto</Label>
                      <Select value={filterProduct} onValueChange={setFilterProduct}>
                        <SelectTrigger id="filter-product" className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl">
                          <SelectItem value="all" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                              Todos os produtos
                            </div>
                          </SelectItem>
                          {Array.from(new Set(qualityData.map((t) => t.productId))).map((productId) => {
                            const product = products.find((p) => p.id === productId)
                            return (
                              <SelectItem key={productId} value={productId} className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                                {product?.name || productId}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-parameter" className="text-xs font-medium text-slate-700 mb-2 block">Parâmetro</Label>
                      <Select value={filterParameter} onValueChange={setFilterParameter}>
                        <SelectTrigger id="filter-parameter" className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl">
                          <SelectItem value="all" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                              Todos os parâmetros
                            </div>
                          </SelectItem>
                          <SelectItem value="pH" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">🧪 pH</SelectItem>
                          <SelectItem value="viscosidade" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">🌊 Viscosidade</SelectItem>
                          <SelectItem value="cor" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">🎨 Cor</SelectItem>
                          <SelectItem value="densidade" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">⚖️ Densidade</SelectItem>
                          <SelectItem value="estabilidade" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">🔄 Estabilidade</SelectItem>
                          <SelectItem value="pureza" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">💎 Pureza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-status" className="text-xs font-medium text-slate-700 mb-2 block">Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger id="filter-status" className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl">
                          <SelectItem value="all" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                              Todos os status
                            </div>
                          </SelectItem>
                          <SelectItem value="approved" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Aprovados
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Reprovados
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(filterProduct !== 'all' || filterParameter !== 'all' || filterStatus !== 'all') && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>
                          Filtros ativos
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all duration-200 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setFilterProduct('all')
                          setFilterParameter('all')
                          setFilterStatus('all')
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="rounded-md bg-slate-100 p-0.5">
                            <RefreshCw className="h-2.5 w-2.5 text-slate-600" />
                          </div>
                          <span>Limpar filtros</span>
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {filteredQualityData.length === 0 && qualityData.length > 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Nenhuma análise encontrada</p>
                  <p className="text-sm mt-1">Ajuste os filtros para ver resultados</p>
                </div>
              ) : qualityData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Nenhuma análise registrada</p>
                  <p className="text-sm mt-1">
                    Clique em &quot;Nova Análise&quot; para registrar a primeira análise de qualidade
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {filteredQualityData.map((test) => {
                    const visualStatus = getTestVisualStatus(test)
                    const valueColor =
                      visualStatus === 'approved'
                        ? 'text-emerald-600'
                        : visualStatus === 'warning'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    const badgeClass =
                      visualStatus === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : visualStatus === 'warning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    const badgeLabel =
                      visualStatus === 'approved'
                        ? 'Aprovado'
                        : visualStatus === 'warning'
                        ? 'Em Alerta'
                        : 'Reprovado'

                    return (
                      <div
                        key={test.id}
                        className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getParameterIcon(test.parameter)}</div>
                          <div>
                            <p className="font-semibold text-gray-900">{test.productName}</p>
                            <p className="text-sm text-gray-600">
                              {test.parameter} • Lote {test.batch} • {test.stage.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              Operador: {test.operator} • {new Date(test.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-right">
                            <div className="font-mono text-sm">
                              <span className={valueColor}>{test.measuredValue}</span>
                              <span className="text-gray-500"> / {test.targetValue} {test.unit}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Tolerância:{' '}
                              {test.tolerance
                                ? `${test.tolerance.min}-${test.tolerance.max}`
                                : 'não definida'}
                            </div>
                          </div>
                          <Badge className={badgeClass}>{badgeLabel}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registros de Não Conformidades */}
        <TabsContent value="non-conformities" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify_between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sistema de RNC – Registros de Não Conformidades
                </CardTitle>
                <NonConformityForm onNCAdded={reloadAll} />
              </div>
              <p className="text-sm text-gray-600">
                CAPA - Corrective and Preventive Actions • Conformidade ANVISA
              </p>
            </CardHeader>
            <CardContent>
              {nonConformities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Nenhuma RNC registrada</p>
                  <p className="text-sm mt-1">
                    Sistema CAPA (Corrective and Preventive Actions) pronto para uso
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nonConformities.map((nc) => (
                    <div
                      key={nc.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(nc.severity)}>{nc.severity.toUpperCase()}</Badge>
                            <Badge variant="outline">{nc.type}</Badge>
                            <Badge
                              variant={
                                nc.status === 'open'
                                  ? 'destructive'
                                  : nc.status === 'investigating'
                                  ? 'default'
                                  : nc.status === 'resolved'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {nc.status === 'open'
                                ? 'Aberto'
                                : nc.status === 'investigating'
                                ? 'Investigando'
                                : nc.status === 'resolved'
                                ? 'Resolvido'
                                : 'Fechado'}
                            </Badge>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {nc.productName} - {nc.batch}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{nc.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Criado: {new Date(nc.createdAt).toLocaleDateString('pt-BR')}</span>
                        {nc.responsible && <span>Responsável: {nc.responsible}</span>}
                        {nc.deadline && (
                          <span>Prazo: {new Date(nc.deadline).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Especificações */}
        <TabsContent value="specifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Especificações de Qualidade
              </CardTitle>
              <p className="text-sm text-gray-600">
                Controle de fórmulas e parâmetros técnicos por produto
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">Especificações Técnicas</p>
                <p className="text-sm mt-1">Sistema de gestão de fórmulas em desenvolvimento</p>
                <Button className="mt-4" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Especificações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios de Qualidade
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análises e relatórios para conformidade regulatória
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">Relatórios de Qualidade</p>
                <p className="text-sm mt-1">Sistema de relatórios em desenvolvimento</p>
                <Button className="mt-4" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </section>
      </div>
    </div>
  )
}
