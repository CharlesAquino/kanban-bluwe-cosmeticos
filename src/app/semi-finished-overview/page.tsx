'use client'

import useSWR from 'swr'
import { useMemo, type ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SemiItem, semiFinishedFetcher, useSemiFinishedBuckets } from '@/lib/semi-finished-lib'
import { Layers, Droplet, Sparkles, Users } from 'lucide-react'

export default function SemiFinishedOverviewPage() {
  const { data, error, isLoading } = useSWR<SemiItem[]>(
    '/api/semi-finished',
    semiFinishedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 15000,
      keepPreviousData: true,
    }
  )

  const items = useMemo(() => data || [], [data])

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
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
      </div>
    </div>
  )
}

function OverviewItemCard({ product }: { product: SemiItem }) {
  const { buckets, loading, error } = useSemiFinishedBuckets(product.id)
  const saldo = Number(product.quantity_total) - Number(product.quantity_envasado)

  const packagedCount = buckets.filter((b) => b.status === 'packaged').length
  const totalBuckets = buckets.length

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
