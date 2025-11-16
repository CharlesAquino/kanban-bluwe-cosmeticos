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
  BarChart3,
  Settings,
  RefreshCw,
  ChevronDown,
  Users,
  Package
} from 'lucide-react'
import { useGlobalData, useGlobalActions } from '@/contexts/global-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Tipos específicos para controle da qualidade de cosméticos
interface QualityParameter {
  id: string
  productId: string
  productName: string
  batch: string
  stage: string
  parameter: 'pH' | 'viscosidade' | 'cor' | 'densidade' | 'estabilidade' | 'pureza'
  targetValue: number
  tolerance: { min: number, max: number }
  measuredValue: number
  unit: string
  operator: string
  timestamp: string
  approved: boolean
  notes?: string
}

interface NonConformity {
  id: string
  productId: string
  productName: string
  batch: string
  stage: string
  type: 'qualidade' | 'processo' | 'material' | 'equipamento'
  severity: 'critical' | 'major' | 'minor'
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  createdAt: string
  responsible?: string
  deadline?: string
}

// Sem dados mockados: integrações reais virão das APIs/Contexto

export default function QualityPage() {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)
  const { products } = useGlobalData()
  const { refreshData } = useGlobalActions()
  const [qualityData, setQualityData] = useState<QualityParameter[]>([])
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Filtros
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

  const handleRefresh = async () => {
    setIsLoading(true)
    await refreshData()
    await reloadAll()
    setIsLoading(false)
  }

  // Filtrar dados
  const filteredQualityData = qualityData.filter(test => {
    if (filterProduct !== 'all' && test.productId !== filterProduct) return false
    if (filterParameter !== 'all' && test.parameter !== filterParameter) return false
    if (filterStatus === 'approved' && !test.approved) return false
    if (filterStatus === 'rejected' && test.approved) return false
    return true
  })

  // Cálculos para dashboard
  const qualityStats = {
    totalTests: filteredQualityData.length,
    approvedTests: filteredQualityData.filter(q => q.approved).length,
    rejectedTests: filteredQualityData.filter(q => !q.approved).length,
    approvalRate: filteredQualityData.length > 0 ? (filteredQualityData.filter(q => q.approved).length / filteredQualityData.length) * 100 : 0,
    openNonConformities: nonConformities.filter(nc => nc.status !== 'closed').length
  }

  
  const getParameterIcon = (parameter: string) => {
    switch (parameter) {
      case 'pH': return '🧪'
      case 'viscosidade': return '🌊'
      case 'cor': return '🎨'
      case 'densidade': return '⚖️'
      default: return '📊'
    }
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

  useEffect(() => {
    reloadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[linear-gradient(to-br,oklch(91.7%_0.08_205.041),oklch(98.4%_0.019_200.873))] text-slate-900">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white grid place-items-center font-bold text-lg shadow-lg shadow-indigo-500/30">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent">
                  Sistema Integrado de Qualidade
                </h1>
                <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Overview de Qualidade</p>
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
                      href="/hourly-control"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
                    >
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Hora a Hora</span>
                        <span className="text-xs text-slate-500">Controle horário</span>
                      </div>
                    </Link>
                    <Link
                      href="/analise-operador"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
                    >
                      <Users className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">MOD</span>
                        <span className="text-xs text-slate-500">Análise por operador</span>
                      </div>
                    </Link>
                    <Link
                      href="/kanban-overview"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setAdminDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
                    >
                      <Shield className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Admin Home</span>
                        <span className="text-xs text-slate-500">Página inicial</span>
                      </div>
                    </Link>
                    <Link
                      href="/admin/quality"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={(e) => {
                        setAdminDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setAdminDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                        <span className="text-xs text-slate-500">Gerenciar semi-acabados</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Botão de atualização */}
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin"></div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-indigo-400/20 p-1">
                      <RefreshCw className="h-3 w-3 text-indigo-200" />
                    </div>
                  )}
                  <span>Atualizar</span>
                </div>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">

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

        {/* Controle da Qualidade (Overview somente leitura) */}
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
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visão geral dos parâmetros críticos (pH, viscosidade, cor, densidade) em modo somente leitura.
              </p>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              {qualityData.length > 0 && (
                <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-50/80 backdrop-blur-sm border border-slate-200/50 shadow-lg shadow-slate-500/10">
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
                          {Array.from(new Set(qualityData.map(t => t.productId))).map(productId => {
                            const product = products.find(p => p.id === productId)
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
                <div className="text-center py-12 text-slate-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold text-slate-700 text-lg">Nenhuma análise encontrada</p>
                  <p className="text-sm mt-1 text-slate-600 leading-relaxed">Ajuste os filtros para ver resultados</p>
                </div>
              ) : qualityData.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold text-slate-700 text-lg">Nenhuma análise registrada</p>
                  <p className="text-sm mt-1 text-slate-600 leading-relaxed">Clique em &quot;Nova Análise&quot; para registrar a primeira análise de qualidade</p>
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

        {/* Não Conformidades */}
        <TabsContent value="non-conformities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="rounded-xl bg-gradient-to-br from-red-400/20 to-red-400/5 text-red-700 p-2 shadow-inner">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent font-semibold">
                  Registros de Não Conformidades
                </span>
              </CardTitle>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sistema CAPA (Corrective and Preventive Actions) para gestão de não conformidades.
              </p>
            </CardHeader>
            <CardContent>
              {nonConformities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Nenhuma não conformidade registrada</p>
                  <p className="text-sm mt-1">Não há não conformidades abertas no momento</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {nonConformities.map((nc) => (
                    <div
                      key={nc.id}
                      className="flex flex-col gap-3 p-4 rounded-2xl border border-red-50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {nc.type === 'qualidade' && <Beaker />}
                          {nc.type === 'processo' && <Settings />}
                          {nc.type === 'material' && <FileText />}
                          {nc.type === 'equipamento' && <BarChart3 />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{nc.productName}</p>
                          <p className="text-sm text-gray-600">
                            {nc.type} • Lote {nc.batch} • {nc.stage.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(nc.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            <span className={
                              nc.severity === 'critical' ? 'text-red-600' :
                              nc.severity === 'major' ? 'text-orange-600' :
                              'text-yellow-600'
                            }>
                              {nc.severity === 'critical' ? 'Crítico' :
                               nc.severity === 'major' ? 'Major' : 'Menor'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {nc.status === 'open' ? 'Aberto' :
                             nc.status === 'investigating' ? 'Investigando' :
                             nc.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                          </div>
                        </div>
                        <Badge className={
                          nc.severity === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                          nc.severity === 'major' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }>
                          {nc.severity === 'critical' ? 'Crítico' :
                           nc.severity === 'major' ? 'Major' : 'Menor'}
                        </Badge>
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
                <div className="rounded-xl bg-gradient-to-br from-sky-400/20 to-sky-400/5 text-sky-700 p-2 shadow-inner">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-sky-700 to-sky-900 bg-clip-text text-transparent font-semibold">
                  Especificações Técnicas
                </span>
              </CardTitle>
              <p className="text-sm text-slate-600 leading-relaxed">
                Documentação de especificações e parâmetros técnicos para produtos cosméticos.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">Especificações Técnicas</p>
                <p className="text-sm mt-1">Sistema de gestão de fórmulas em desenvolvimento</p>
                <Button className="mt-6 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-400/20 p-1.5">
                      <Settings className="h-4 w-4 text-indigo-200" />
                    </div>
                    <span>Configurar Especificações</span>
                  </div>
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
                <div className="rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-400/5 text-purple-700 p-2 shadow-inner">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent font-semibold">
                  Relatórios de Qualidade
                </span>
              </CardTitle>
              <p className="text-sm text-slate-600 leading-relaxed">
                Análises e relatórios para conformidade regulatória e tomada de decisões.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl scale-150"></div>
                  <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-4 shadow-xl shadow-purple-500/30">
                    <BarChart3 className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="mt-8 text-center max-w-md">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Relatórios de Qualidade</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Sistema inteligente de análise e relatórios para conformidade regulatória e tomada de decisões estratégicas.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-400/20 p-1">
                          <TrendingUp className="h-3.5 w-3.5 text-indigo-200" />
                        </div>
                        <span>Gerar Relatório</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 rounded-xl px-4 py-2 font-medium hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-100 p-1">
                          <FileText className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <span>Ver Modelos</span>
                      </div>
                    </Button>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 border border-emerald-200/50 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BarChart3 className="h-16 w-16 text-emerald-600" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 text-emerald-700 p-2">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                          Hoje
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-emerald-900 mb-1">0</div>
                      <div className="text-sm text-emerald-700 font-medium">Relatórios Gerados</div>
                      <div className="text-xs text-emerald-600 mt-1">+0% vs semana anterior</div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 border border-blue-200/50 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <TrendingUp className="h-16 w-16 text-blue-600" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-400/5 text-blue-700 p-2">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Ativo
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-blue-900 mb-1">0</div>
                      <div className="text-sm text-blue-700 font-medium">Análises Concluídas</div>
                      <div className="text-xs text-blue-600 mt-1">Tempo médio: 0min</div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 border border-purple-200/50 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <CheckCircle className="h-16 w-16 text-purple-600" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-400/5 text-purple-700 p-2">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          Excelente
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-purple-900 mb-1">100%</div>
                      <div className="text-sm text-purple-700 font-medium">Conformidade</div>
                      <div className="text-xs text-purple-600 mt-1">Todos os padrões atendidos</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </section>
      </main>
    </div>
  )
}
