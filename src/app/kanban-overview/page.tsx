'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Package, Activity, CheckCircle, AlertTriangle, BarChart3, Settings, ChevronDown, Shield, Users, Beaker, TrendingUp, Clock, Zap, Target } from 'lucide-react'
import { loadProductsAndStats } from '@/lib/product-operations'
import type { Product, ProductStage } from '@/lib/types'
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/types'
import Link from 'next/link'

export default function KanbanOverviewPage() {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [semiFinishedCount, setSemiFinishedCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { products } = await loadProductsAndStats()
      setProducts(products)

      // Carregar quantidade de itens já finalizados (Semi-Acabados)
      try {
        const res = await fetch('/api/semi-finished', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const items = Array.isArray(json?.data) ? json.data : []
          setSemiFinishedCount(items.length)
        } else {
          setSemiFinishedCount(0)
        }
      } catch {
        setSemiFinishedCount(0)
      }

      setLastUpdate(new Date())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar dados do Kanban'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const productsByStage = useMemo(() => {
    const map: Record<ProductStage, Product[]> = {} as Record<ProductStage, Product[]>
    for (const stage of STAGE_ORDER) {
      map[stage] = []
    }
    for (const p of products) {
      const stage = String(p.currentStage).toUpperCase() as ProductStage
      if (!map[stage]) continue
      map[stage].push(p)
    }
    return map
  }, [products])

  const VISIBLE_STAGES = STAGE_ORDER.filter(
    (stage) => stage !== 'BACKLOG' && stage !== 'REJEITADO'
  )

  const stats = useMemo(
    () => {
      const total = products.length
      const inProduction = products.filter((p) => String(p.status).toUpperCase() === 'ACTIVE').length
      const completedFromProducts = products.filter((p) => String(p.status).toUpperCase() === 'COMPLETED').length
      const completed = completedFromProducts + semiFinishedCount
      const blocked = products.filter((p) => String(p.status).toUpperCase() === 'BLOCKED').length
      return { total, inProduction, completed, blocked }
    },
    [products, semiFinishedCount]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-indigo-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Produção – Fluxo de OPs
                </h1>
                <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <Activity className="h-3 w-3" />
                    Ao vivo
                  </span>
                  Bluwe Cosméticos • Sistema de Produção
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {lastUpdate
                    ? `Período: ${lastUpdate.toLocaleDateString('pt-BR')} ${lastUpdate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Período: —'}
                </p>
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
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Hora a Hora</span>
                        <span className="text-xs text-slate-500">Controle horário</span>
                      </div>
                    </Link>
                    <Link
                      href="/mod-analysis"
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

              {/* Botão de atualização */}
              <Button
                onClick={fetchData}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-lg flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">Indicadores de Produção</h2>
              <div className="h-px bg-gradient-to-r from-indigo-200 to-purple-200 flex-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      OPs Totais
                    </p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    <p className="text-xs text-blue-600 mt-1">Todas as ordens</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Em Produção
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">{stats.inProduction}</p>
                    <p className="text-xs text-emerald-600 mt-1">Ativas no momento</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Concluídas
                    </p>
                    <p className="text-2xl font-bold text-indigo-900">{stats.completed}</p>
                    <p className="text-xs text-indigo-600 mt-1">Finalizadas</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Bloqueadas
                    </p>
                    <p className="text-2xl font-bold text-red-900">{stats.blocked}</p>
                    <p className="text-xs text-red-600 mt-1">Requerem atenção</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">Fluxo de Produção</h2>
              <div className="h-px bg-gradient-to-r from-indigo-200 to-purple-200 flex-1" />
            </div>
            <div className="grid grid-cols-5 gap-4">
            {VISIBLE_STAGES.map((stage) => {
              const stageProducts = productsByStage[stage] || []
              const stageLabel = STAGE_LABELS[stage]
              
              // Aplicar cor apenas se houver processos em andamento
              const hasActiveProcesses = stageProducts.length > 0
              const activeColorClass = hasActiveProcesses 
                ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
                : 'bg-white border-slate-200 shadow-sm'
              const activeIconClass = hasActiveProcesses
                ? 'text-indigo-600 bg-indigo-100'
                : 'text-slate-500 bg-slate-100'

              return (
                <Card key={stage} className={`h-full ${activeColorClass} rounded-xl`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <span className={`p-2 rounded-xl ${activeIconClass} shadow-sm`}>
                          <Package className="h-5 w-5" />
                        </span>
                        <span className="font-bold text-slate-800 text-sm truncate" title={stageLabel}>
                          {stageLabel}
                        </span>
                      </span>
                      <Badge className={`text-[11px] font-bold shadow-sm ${
                        hasActiveProcesses 
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {stageProducts.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stageProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <Package className="h-6 w-6 mb-1 opacity-50" />
                        <p className="text-[10px] font-medium">Vazio</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pt-1 pr-1">
                        {stageProducts.map((p) => (
                          <div
                            key={p.id}
                            className="group rounded-lg border border-white/60 bg-white/80 backdrop-blur-sm px-3 py-2 text-[10px] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-700 transition-colors" title={p.name}>
                                  {p.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-medium">
                                    <Zap className="h-2.5 w-2.5" />
                                    {p.quantity.toFixed(1)} kg
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Clock className="h-3 w-3" />
                                  OP: {p.op}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Lote: {p.batch}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                              <div className="flex items-center gap-1">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] text-emerald-600 font-medium">Ativo</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Activity className="h-2.5 w-2.5 text-slate-400" />
                                <span className="text-[9px] text-slate-400">Processo</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="mt-12">
            <div className="text-center py-16">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum produto no fluxo</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Não há ordens de produção cadastradas no Kanban no momento. 
                Inicie uma nova OP para começar a acompanhar o fluxo de produção.
              </p>
              <Button
                onClick={fetchData}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-6 py-3 font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar dados
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
