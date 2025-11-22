'use client'

import useSWR from 'swr'
import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SemiItem, semiFinishedFetcher, useSemiFinishedBuckets } from '@/lib/semi-finished-lib'
import { Layers, Droplet, Sparkles, Users, BarChart3, ChevronDown, Shield, Settings, Beaker, Package } from 'lucide-react'
import Link from 'next/link'
import { subscribeChanges } from '@/lib/bus'

export default function SemiFinishedOverviewPage() {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)
  
  const { data, error, isLoading, mutate } = useSWR<SemiItem[]>(
    '/api/semi-finished',
    semiFinishedFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // Reduzido para 10s para atualização mais frequente
      keepPreviousData: false, // Removido para forçar atualização completa
    }
  )

  const items = useMemo(() => data || [], [data])

  // Escutar eventos de mudança para atualização em tempo real
  useEffect(() => {
    const unsub = subscribeChanges((ev) => {
      if (ev.type === 'semi_finished') {
        mutate('/api/semi-finished')
      }
    })
    return () => unsub()
  }, [mutate])

  const groups = useMemo(() => {
    return items.reduce((acc, it) => {
      const key = it.family || 'Sem Família'
      if (!acc[key]) acc[key] = [] as SemiItem[]
      acc[key].push(it)
      return acc
    }, {} as Record<string, SemiItem[]>)
  }, [items])

  const organizedGroups = useMemo(() => {
    const result: Record<string, SemiItem[][]> = {}
    const perRow = 3

    Object.entries(groups).forEach(([family, products]) => {
      result[family] = []
      for (let i = 0; i < products.length; i += perRow) {
        result[family].push(products.slice(i, i + perRow))
      }
    })

    return result
  }, [groups])

  const dashboardStats = useMemo(() => {
    const totalProdutos = items.length
    const prontoEnvase = items.filter((item) => item.status === 'aguardando').length
    const saldoTotal = items.reduce((sum, item) => sum + (Number(item.quantity_total) - Number(item.quantity_envasado)), 0)
    const familias = Object.keys(groups).length

    return { totalProdutos, prontoEnvase, saldoTotal, familias }
  }, [items, groups])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white grid place-items-center font-bold text-lg shadow-lg shadow-sky-500/30">
                S
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-sky-900 bg-clip-text text-transparent">
                  Semi-Acabados Overview
                </h1>
                <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Sistema de Produção</p>
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
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
        <section className="space-y-3">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-[0.3em] text-sky-600/80">Visão Geral</p>
            <h1 className="text-3xl font-semibold text-slate-900">Overview – Semi-Acabados</h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Monitoramento em tempo real dos semi-acabados liberados. Acompanhe saldos, envasados e buckets sem precisar acessar o painel administrativo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewMetric label="Produtos ativos" value={dashboardStats.totalProdutos} icon={<Layers className="h-4 w-4" />} accent="from-sky-500/30 to-sky-500/5" />
            <OverviewMetric label="Prontos p/ envase" value={dashboardStats.prontoEnvase} icon={<Sparkles className="h-4 w-4" />} accent="from-amber-400/40 to-amber-400/10" />
            <OverviewMetric label="Saldo disponível" value={`${dashboardStats.saldoTotal.toFixed(1)} kg`} icon={<Droplet className="h-4 w-4" />} accent="from-emerald-400/40 to-emerald-400/10" />
            <OverviewMetric label="Famílias" value={dashboardStats.familias} icon={<Users className="h-4 w-4" />} accent="from-indigo-400/40 to-indigo-400/10" />
          </div>
        </section>

        {isLoading && <div className="text-sm text-slate-500">Carregando...</div>}
        {error && <div className="text-sm text-red-500">Erro: {(error as Error).message}</div>}

        <section className="space-y-6">
          {Object.entries(organizedGroups).map(([family, rows]) => (
            <div key={family} className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white/70 backdrop-blur px-4 py-3 shadow-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Família</p>
                  <h2 className="text-lg font-semibold text-slate-900">{family}</h2>
                </div>
                <Badge className="bg-sky-600/10 text-sky-700 border border-sky-200 px-2.5 py-1 text-[11px] rounded-full">
                  {rows.flat().length} produto{rows.flat().length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {rows.map((rowProducts, rowIndex) => (
                <div key={`${family}-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rowProducts.map((product) => (
                    <OverviewItemCard key={product.id} product={product} />
                  ))}
                </div>
              ))}
            </div>
          ))}

          {!isLoading && !error && items.length === 0 && (
            <div className="text-slate-500 text-sm">Nenhum semi-acabado cadastrado no momento.</div>
          )}
        </section>
      </main>
    </div>
  )
}

function OverviewItemCard({ product }: { product: SemiItem }) {
  const { buckets, loading, error } = useSemiFinishedBuckets(product.id)
  const saldo = Number(product.quantity_total) - Number(product.quantity_envasado)

  const bucketsArray = buckets || []
  const packagedCount = bucketsArray.filter((b) => b.status === 'packaged').length
  const totalBuckets = bucketsArray.length

  return (
    <Card className="bg-white/90 border border-sky-100 shadow-md">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-800 truncate text-sm leading-tight">
              {product.name}
            </div>
            <div className="text-xs text-slate-600 truncate leading-tight">
              OP: {product.op} • Lote: {product.batch}
            </div>
          </div>
          <div className="ml-1.5 flex flex-col items-end gap-0.5">
            <Badge className="bg-sky-100 text-sky-700 border border-sky-200 text-xs px-1.5 py-0.5 font-medium">
              {saldo.toFixed(1)}kg
            </Badge>
            <div className="text-xs text-slate-500">Saldo</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-gradient-to-b from-slate-50 to-white rounded-lg border border-slate-200/60 px-2 py-1.5">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total</div>
            <div className="font-bold text-slate-900 text-xs leading-tight">
              {product.quantity_total.toFixed(1)}kg
            </div>
          </div>
          <div className="text-center bg-gradient-to-b from-emerald-50 to-white rounded-lg border border-emerald-200/60 px-2 py-1.5">
            <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Envasado</div>
            <div className="font-bold text-emerald-700 text-xs leading-tight">
              {product.quantity_envasado.toFixed(1)}kg
            </div>
          </div>
          <div className="text-center bg-gradient-to-b from-slate-50 to-white rounded-lg border border-slate-200/60 px-2 py-1.5">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Saldo</div>
            <div className="font-bold text-slate-900 text-xs leading-tight">
              {saldo.toFixed(1)}kg
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            {loading
              ? 'Carregando baldes...'
              : error
              ? 'Erro ao carregar baldes'
              : totalBuckets === 0
              ? 'Sem baldes cadastrados'
              : `${totalBuckets} balde${totalBuckets !== 1 ? 's' : ''} registrados`}
          </span>
          {totalBuckets > 0 && (
            <span className="font-medium text-slate-700">
              {packagedCount}/{totalBuckets} envasados
            </span>
          )}
        </div>

        {totalBuckets > 0 && !loading && !error && (
          <div className="flex flex-wrap gap-1.5">
            {buckets.slice(0, 6).map((bucket) => {
              const color =
                bucket.status === 'packaged'
                  ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200'
                  : bucket.status === 'partial'
                  ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
                  : bucket.status === 'in_packaging'
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200'
                  : bucket.status === 'returned'
                  ? 'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-700 border-slate-300'
                  : 'bg-gradient-to-r from-slate-100 to-white text-slate-700 border-slate-200'

              return (
                <div
                  key={bucket.id}
                  className={`px-1.5 py-0.5 rounded text-[11px] border ${color}`}
                  title={`Balde #${bucket.bucketIndex}: ${bucket.currentQuantityKg.toFixed(2)}kg`}
                >
                  #{bucket.bucketIndex}
                </div>
              )}
            )}
            {buckets.length > 6 && (
              <div className="px-1.5 py-0.5 rounded text-[11px] border bg-gradient-to-r from-slate-50 to-white text-slate-600 border-slate-200">
                +{buckets.length - 6}
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="font-medium">Família:</span>
          <span className="truncate ml-2">{product.family || 'Sem família definida'}</span>
        </div>
      </div>
    </Card>
  )
}

function OverviewMetric({ label, value, icon, accent }: { label: string; value: string | number; icon: ReactNode; accent: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 shadow-lg p-4 flex items-center gap-3">
      <div className={`rounded-xl bg-gradient-to-br ${accent} text-slate-900 p-3 shadow-inner`}>{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
