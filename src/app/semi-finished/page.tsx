"use client"

import useSWR, { mutate } from 'swr'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Send, PackageCheck, Undo2, Loader2 } from 'lucide-react'

type SemiItem = {
  id: string
  name: string
  family: string
  op: string
  batch: string
  quantity_total: number
  quantity_envasado: number
  status: string
}

type Bucket = {
  id: string
  semiFinishedId: string
  bucketIndex: number
  originalQuantityKg: number
  currentQuantityKg: number
  status: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
  return json.data
}

function useBuckets(itemId: string) {
  const { data, isLoading, error, mutate: m } = useSWR<Bucket[]>(`/api/semi-finished/${itemId}/buckets`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 15000,
    keepPreviousData: true,
  })
  return { buckets: data || [], loading: isLoading, error, refresh: () => m() }
}

export default function SemiFinishedPage() {
  const { data, error, isLoading } = useSWR<SemiItem[]>('/api/semi-finished', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 15000,
    keepPreviousData: true,
  })

  const items = data || []
  const [selectedProduct, setSelectedProduct] = useState<SemiItem | null>(null)

  const groups = useMemo(() => {
    return items.reduce((acc, it) => {
      const k = it.family || 'Sem Família'
      if (!acc[k]) acc[k] = [] as SemiItem[]
      acc[k].push(it)
      return acc
    }, {} as Record<string, SemiItem[]>)
  }, [items])

  // Organizar produtos por família em fileiras horizontais
  const organizedGroups = useMemo(() => {
    const result: Record<string, SemiItem[][]> = {}
    const itemsPerRow = 2 // Máximo de produtos por fileira para melhor aproveitamento do espaço

    Object.entries(groups).forEach(([family, products]) => {
      result[family] = []
      for (let i = 0; i < products.length; i += itemsPerRow) {
        result[family].push(products.slice(i, i + itemsPerRow))
      }
    })

    return result
  }, [groups])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Kanban de Semi-Acabados</h1>

      {isLoading && <div className="text-slate-500">Carregando...</div>}
      {error && <div className="text-red-600">Erro: {(error as Error).message}</div>}

      <div className="space-y-6">
        {Object.entries(organizedGroups).map(([family, rows], familyIndex) => (
          <div 
            key={family} 
            className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${familyIndex * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-800">{family}</h2>
              <Badge className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 ring-1 ring-slate-200/50">
                {rows.flat().length} produto{rows.flat().length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {rows.map((rowProducts, rowIndex) => (
              <div 
                key={rowIndex} 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300"
                style={{ animationDelay: `${familyIndex * 100 + rowIndex * 50}ms` }}
              >
                {rowProducts.map((product, productIndex) => (
                  <div
                    key={product.id}
                    className="animate-in zoom-in-95 duration-200"
                    style={{ animationDelay: `${familyIndex * 100 + rowIndex * 50 + productIndex * 25}ms` }}
                  >
                    <CompactItemCard 
                      product={product} 
                      onManage={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Modal de gerenciamento detalhado */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Gerenciar: {selectedProduct.name}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedProduct(null)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full w-8 h-8 p-0 transition-all duration-200 hover:rotate-90"
              >
                ✕
              </Button>
            </div>
            <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
              <ItemRow item={selectedProduct} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}function CompactItemCard({ product, onManage }: { product: SemiItem; onManage: () => void }) {
  const { buckets, loading, error } = useBuckets(product.id)
  const saldo = Number(product.quantity_total) - Number(product.quantity_envasado)
  const soft = getFamilyColor(product.family)

  // Status simplificado baseado nos baldes
  const statusSummary = useMemo(() => {
    if (loading || error || !buckets.length) return { text: 'Carregando...', color: 'text-slate-500' }

    const packaged = buckets.filter(b => b.status === 'packaged').length
    const total = buckets.length

    if (packaged === total) return { text: 'Concluído', color: 'text-emerald-600' }
    if (packaged > 0) return { text: `${packaged}/${total} embalados`, color: 'text-amber-600' }
    return { text: `${total} pendentes`, color: 'text-slate-600' }
  }, [buckets, loading, error])

  return (
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out group">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-800 truncate text-sm leading-tight">{product.name}</div>
            <div className="text-xs text-slate-600 truncate leading-tight">
              OP: {product.op} • Lote: {product.batch}
            </div>
          </div>
          <div className="ml-1.5 flex flex-col items-end gap-0.5">
            <Badge className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 ring-1 ring-slate-200/50 text-xs px-1.5 py-0.5 font-medium">
              {saldo.toFixed(1)}kg
            </Badge>
            <div className={`text-xs font-medium ${statusSummary.color} leading-tight`}>
              {statusSummary.text}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          <div className="text-center bg-gradient-to-b from-slate-50 to-white rounded-md border border-slate-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total</div>
            <div className="font-bold text-slate-900 text-xs leading-tight">{product.quantity_total.toFixed(1)}kg</div>
          </div>
          <div className="text-center bg-gradient-to-b from-emerald-50 to-white rounded-md border border-emerald-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Envasado</div>
            <div className="font-bold text-emerald-700 text-xs leading-tight">{product.quantity_envasado.toFixed(1)}kg</div>
          </div>
          <div className="text-center bg-gradient-to-b from-slate-50 to-white rounded-md border border-slate-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Saldo</div>
            <div className="font-bold text-slate-900 text-xs leading-tight">{saldo.toFixed(1)}kg</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2.5">
          {loading ? (
            <div className="text-xs text-slate-500">Carregando baldes...</div>
          ) : error ? (
            <div className="text-xs text-red-600">Erro nos baldes</div>
          ) : buckets.length === 0 ? (
            <div className="text-xs text-slate-400">Sem baldes</div>
          ) : (
            buckets.slice(0, 6).map((bucket) => {
              const color = bucket.status === 'packaged' ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100' :
                           bucket.status === 'partial' ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200 hover:from-amber-200 hover:to-amber-100' :
                           bucket.status === 'in_packaging' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-blue-100' :
                           'bg-gradient-to-r from-slate-100 to-white text-slate-700 border-slate-200 hover:from-slate-200 hover:to-slate-50'
              return (
                <div
                  key={bucket.id}
                  className={`px-1.5 py-0.5 rounded text-xs border transition-all duration-200 hover:scale-105 ${color}`}
                  title={`Balde #${bucket.bucketIndex}: ${bucket.currentQuantityKg.toFixed(2)}kg`}
                >
                  #{bucket.bucketIndex}
                </div>
              )
            })
          )}
          {buckets.length > 6 && (
            <div className="px-1.5 py-0.5 rounded text-xs border bg-gradient-to-r from-slate-50 to-white text-slate-600 border-slate-200 hover:from-slate-100 hover:to-slate-50 transition-all duration-200">
              +{buckets.length - 6}
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-7 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 hover:scale-[1.02] group-hover:shadow-sm"
            onClick={() => {
              // Abrir modal detalhado ou navegar para detalhes
              console.log('Ver detalhes do produto:', product.id)
            }}
          >
            Detalhes
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs h-7 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            disabled={buckets.length === 0}
            onClick={onManage}
          >
            Gerenciar
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ItemRow({ item }: { item: SemiItem }) {
  const { buckets, loading, error, refresh } = useBuckets(item.id)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<null | 'send' | 'package' | 'return'>(null)

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))
  const selectedIds = Object.keys(selected).filter((k) => selected[k])

  const sendToPackaging = async () => {
    if (!selectedIds.length) return
    setBusy('send')
    await fetch(`/api/semi-finished/${item.id}/send`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucketIds: selectedIds })
    })
    await Promise.all([refresh(), mutate('/api/semi-finished')])
    setSelected({})
    setBusy(null)
  }

  const packageBucket = async () => {
    const id = selectedIds[0]
    if (!id) return
    const v = prompt('Quantidade (kg) a envasar neste balde:', '18')
    if (!v) return
    const delta = Number(v)
    if (!Number.isFinite(delta) || delta <= 0) return
    setBusy('package')
    await fetch(`/api/semi-finished/buckets/${id}/package`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deltaKg: delta }) })
    await Promise.all([refresh(), mutate('/api/semi-finished')])
    setSelected({})
    setBusy(null)
  }

  const returnBucket = async () => {
    const id = selectedIds[0]
    if (!id) return
    if (!confirm('Devolver este balde para o estoque de Semi‑Acabados?')) return
    setBusy('return')
    await fetch(`/api/semi-finished/buckets/${id}/return`, { method: 'POST' })
    await Promise.all([refresh(), mutate('/api/semi-finished')])
    setSelected({})
    setBusy(null)
  }

  const saldo = Number(item.quantity_total) - Number(item.quantity_envasado)
  const soft = getFamilyColor(item.family)

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      <div className="px-3 py-2" style={{ backgroundColor: soft }}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 truncate">{item.name}</div>
            <div className="text-[11px] text-slate-600 truncate">OP: {item.op} • Lote: {item.batch}</div>
          </div>
          <Badge className="bg-white/70 text-slate-700 ring-1 ring-slate-200">Saldo {saldo.toFixed(1)} kg</Badge>
        </div>
      </div>
      <div className="p-3">
        <div className="mb-2 grid grid-cols-3 gap-2 text-[11px] text-slate-700">
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-center">Total<br/><span className="font-semibold text-slate-900">{item.quantity_total.toFixed(1)} kg</span></div>
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-center">Envasado<br/><span className="font-semibold text-emerald-700">{item.quantity_envasado.toFixed(1)} kg</span></div>
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-center">Saldo<br/><span className="font-semibold text-slate-900">{saldo.toFixed(1)} kg</span></div>
        </div>

        <div className="mt-2">
          {loading ? (
            <div className="text-xs text-slate-500">Carregando baldes…</div>
          ) : error ? (
            <div className="text-xs text-red-600">Erro ao carregar baldes</div>
          ) : buckets.length === 0 ? (
            <div className="text-xs text-slate-400">Sem baldes</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {buckets.map((b) => {
                const color = b.status === 'packaged' ? 'from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200' : b.status === 'partial' ? 'from-amber-100 to-amber-50 text-amber-800 border-amber-200' : b.status === 'in_packaging' ? 'from-blue-100 to-blue-50 text-blue-800 border-blue-200' : b.status === 'returned' ? 'from-slate-200 to-slate-100 text-slate-700 border-slate-300' : 'from-slate-100 to-white text-slate-700 border-slate-200'
                const sel = !!selected[b.id]
                const pct = Math.round(((b.originalQuantityKg - b.currentQuantityKg) / b.originalQuantityKg) * 100)
                return (
                  <button
                    key={b.id}
                    onClick={() => toggle(b.id)}
                    className={`px-2.5 py-1.5 rounded-full text-xs border bg-gradient-to-b ${color} ${sel ? 'ring-2 ring-blue-400' : 'hover:shadow-sm'} shadow-[0_1px_0_rgba(0,0,0,0.04)] transition`}
                    title={`Balde #${b.bucketIndex} • saldo ${b.currentQuantityKg.toFixed(2)}kg`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">#{b.bucketIndex}</span>
                      <span>{b.currentQuantityKg.toFixed(1)}kg</span>
                    </div>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-white/50 overflow-hidden">
                      <div className="h-full rounded-full bg-black/20" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Button size="sm" disabled={!selectedIds.length || !!busy} onClick={sendToPackaging} className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow" title="Enviar baldes selecionados para envase">
            {busy === 'send' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />} Enviar para envase
          </Button>
          <Button size="sm" variant="secondary" disabled={selectedIds.length !== 1 || !!busy} onClick={packageBucket} className="bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow" title="Registrar envase total ou parcial no balde selecionado">
            {busy === 'package' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <PackageCheck className="h-3.5 w-3.5 mr-1" />} Registrar envase
          </Button>
          <Button size="sm" variant="ghost" disabled={selectedIds.length !== 1 || !!busy} onClick={returnBucket} className="border border-slate-300 hover:bg-slate-50" title="Devolver balde para o estoque de Semi‑Acabados">
            {busy === 'return' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Undo2 className="h-3.5 w-3.5 mr-1" />} Devolver
          </Button>
        </div>
      </div>
    </div>
  )
}

function getFamilyColor(family: string) {
  const n = (family || '').toLowerCase()
  // Paleta por família (tons suaves)
  const presets: Record<string, string> = {
    'linha pink': '#FDE7EF',
    'skincare': '#E8F0FE',
    'linha skincare': '#E8F0FE',
    'capilar': '#EAF7EF',
    'linha capilar': '#EAF7EF',
    'solar': '#FFF7DB',
    'linha solar': '#FFF7DB',
    'neutra': '#F3F4F6',
    'neutro': '#F3F4F6',
  }
  for (const key of Object.keys(presets)) {
    if (n.includes(key)) return presets[key]
  }
  // Fallback para nomes de cores simples contidos na família
  const colorHints: Record<string, string> = {
    bege: '#F6F0E4', rosa: '#FDE7EF', pink: '#FDE7EF', azul: '#E8F0FE',
    verde: '#EAF7EF', amarelo: '#FFF7DB', roxo: '#F1E9FF', laranja: '#FFF0E5', cinza: '#F3F4F6'
  }
  for (const key of Object.keys(colorHints)) if (n.includes(key)) return colorHints[key]
  // Geração determinística suave
  let h = 0
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360
  return `hsl(${h}, 70%, 95%)`
}
