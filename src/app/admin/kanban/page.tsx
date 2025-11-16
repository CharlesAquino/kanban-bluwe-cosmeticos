'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Package, Activity, CheckCircle, AlertTriangle, BarChart3, Settings, ChevronDown, Shield, Users, Beaker, TrendingUp, Clock, Zap, Target, CheckSquare } from 'lucide-react'
import { loadProductsAndStats } from '@/lib/product-operations'
import type { Product, ProductStage } from '@/lib/types'
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/types'
import Link from 'next/link'

export default function AdminKanbanPage() {
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

  // Função para finalizar produto e mover para semi-acabados
  const handleFinalizeProduct = async (product: Product) => {
    try {
      // 1. Mover produto para semi-acabados via API
      const semiFinishedData = {
        name: product.name,
        family: 'DEFAULT', // Pode ser ajustado conforme necessidade
        op: product.op,
        batch: product.batch,
        quantity: product.quantity,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        sourceProductId: product.id
      }

      const semiFinishedResponse = await fetch('/api/semi-finished', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(semiFinishedData)
      })

      if (!semiFinishedResponse.ok) {
        throw new Error('Erro ao criar item semi-acabado')
      }

      // 2. Atualizar status do produto para COMPLETED
      const updateResponse = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'COMPLETED',
          currentStage: 'COMPLETED'
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar status do produto')
      }

      // 3. Recarregar dados
      await fetchData()
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao finalizar produto'
      setError(msg)
    }
  }

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
                  Admin Kanban – Fluxo de OPs
                </h1>
                <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <Activity className="h-3 w-3" />
                    Ao vivo
                  </span>
                  Bluwe Cosméticos • Administração de Produção
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
                      href="/kanban-overview"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <Package className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Produção</span>
                        <span className="text-xs text-slate-500">Fluxo de OPs (visualização)</span>
                      </div>
                    </Link>
                    <Link
                      href="/admin/kanban"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 bg-indigo-50"
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-indigo-600" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-indigo-700">Admin Kanban</span>
                        <span className="text-xs text-indigo-600">Controle completo da produção</span>
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
                      href="/admin"
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
          <div className="mb-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">Erro ao carregar dados</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
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
              <h2 className="text-lg font-semibold text-slate-800">Fluxo de Produção - Controle Administrativo</h2>
              <div className="h-px bg-gradient-to-r from-indigo-200 to-purple-200 flex-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {VISIBLE_STAGES.map((stage, index) => {
                const stageProducts = productsByStage[stage] || []
                const stageLabel = STAGE_LABELS[stage]
                
                // Cores diferentes para cada estágio
                const stageColors = [
                  'from-blue-50 to-indigo-50 border-blue-100',
                  'from-emerald-50 to-green-50 border-emerald-100', 
                  'from-amber-50 to-orange-50 border-amber-100',
                  'from-purple-50 to-pink-50 border-purple-100',
                  'from-rose-50 to-red-50 border-rose-100'
                ]
                const iconColors = [
                  'text-blue-600 bg-blue-100',
                  'text-emerald-600 bg-emerald-100',
                  'text-amber-600 bg-amber-100', 
                  'text-purple-600 bg-purple-100',
                  'text-rose-600 bg-rose-100'
                ]
                const colorClass = stageColors[index % stageColors.length]
                const iconColorClass = iconColors[index % iconColors.length]

                return (
                  <Card key={stage} className={`h-full bg-gradient-to-br ${colorClass} border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl`}>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <span className={`p-2 rounded-xl ${iconColorClass} shadow-sm`}>
                            <Package className="h-5 w-5" />
                          </span>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm truncate" title={stageLabel}>
                              {stageLabel}
                            </span>
                            <span className="text-xs text-slate-500">Estágio {index + 1}</span>
                          </div>
                        </span>
                        <Badge className={`text-[11px] font-bold shadow-sm ${
                          stageProducts.length > 0 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {stageProducts.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {stageProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <Package className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-xs font-medium">Nenhum produto neste estágio</p>
                          <p className="text-[10px] mt-1">Aguardando movimentação</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[420px] overflow-y-auto pt-2 pr-1">
                          {stageProducts.map((p) => (
                            <div
                              key={p.id}
                              className="group rounded-xl border border-white/60 bg-white/80 backdrop-blur-sm px-4 py-3 text-[11px] shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-700 transition-colors" title={p.name}>
                                    {p.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-medium">
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
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] text-emerald-600 font-medium">Ativo</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3 text-slate-400" />
                                  <span className="text-[10px] text-slate-400">Em processo</span>
                                </div>
                              </div>
                              
                              {/* BOTÃO FINALIZADO - APENAS NO ESTÁGIO APROVADO */}
                              {stage === 'APROVADO' && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <Button
                                    onClick={() => handleFinalizeProduct(p)}
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 rounded-lg px-3 py-2 text-[10px] font-medium flex items-center justify-center gap-1"
                                  >
                                    <CheckSquare className="h-3 w-3" />
                                    Finalizar
                                  </Button>
                                  <p className="text-[9px] text-slate-500 mt-1 text-center">
                                    Mover para semi-acabados
                                  </p>
                                </div>
                              )}
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
