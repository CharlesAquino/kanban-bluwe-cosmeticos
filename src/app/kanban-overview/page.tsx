'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Package, Activity, CheckCircle, AlertTriangle, BarChart3, Settings, ChevronDown, Shield, Users, Beaker } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white grid place-items-center font-bold text-lg shadow-lg shadow-slate-500/30">
                K
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Produção – Fluxo de OPs
                </h1>
                <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Sistema de Produção</p>
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
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">OPs Totais</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.total}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Em Produção</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.inProduction}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Concluídas</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.completed}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Bloqueadas</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.blocked}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {VISIBLE_STAGES.map((stage) => {
              const stageProducts = productsByStage[stage] || []
              const stageLabel = STAGE_LABELS[stage]

              return (
                <Card key={stage} className="h-full bg-white border border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="p-1.5 rounded-md bg-slate-50">
                          <Package className="h-4 w-4 text-slate-600" />
                        </span>
                        <span className="font-semibold text-slate-800 truncate" title={stageLabel}>
                          {stageLabel}
                        </span>
                      </span>
                      <Badge className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {stageProducts.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stageProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-xs">
                        Nenhum produto neste estágio
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pt-1">
                        {stageProducts.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="font-semibold text-slate-900 truncate" title={p.name}>
                                {p.name}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {p.quantity.toFixed(1)} kg
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">
                                OP: {p.op} • Lote: {p.batch}
                              </span>
                              <span className="text-[10px] text-slate-500 capitalize">
                                {p.status}
                              </span>
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
        )}

        {!loading && !error && products.length === 0 && (
          <div className="mt-6 text-sm text-slate-500">
            Nenhum produto cadastrado no Kanban no momento.
          </div>
        )}
      </main>
    </div>
  )
}
