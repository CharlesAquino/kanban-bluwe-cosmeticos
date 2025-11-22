'use client'

import useSWR from 'swr'
import { useMemo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Clock, CheckCircle, Package, AlertTriangle, Loader2, RefreshCw, Send } from 'lucide-react'
import { SemiItem, Bucket, semiFinishedFetcher, useSemiFinishedBuckets, getSemiFinishedFamilyColor, sendBucketsToQuarantine, releaseBucketsFromQuarantine } from '@/lib/semi-finished-lib'
import Link from 'next/link'
import { subscribeChanges } from '@/lib/bus'

export default function QuarantinePage() {
  const [selected, setSelected] = useState<Record<string, Record<string, boolean>>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const { data: items, error, isLoading, mutate } = useSWR<SemiItem[]>('/api/semi-finished', semiFinishedFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 15000,
  })

  // Escutar eventos de mudança para atualização em tempo real
  useEffect(() => {
    const unsub = subscribeChanges((ev) => {
      if (ev.type === 'semi_finished') {
        mutate()
      }
    })
    return () => unsub()
  }, [mutate])

  // Filtrar apenas itens com baldes em quarentena
  const itemsWithQuarantine = useMemo(() => {
    if (!items) return []
    return items.filter(item => {
      // Aqui precisaríamos verificar se há baldes em quarentena
      // Por enquanto, mostramos todos os itens
      return item.status === 'aguardando'
    })
  }, [items])

  const toggle = (itemId: string, bucketId: string) => {
    setSelected((s) => ({
      ...s,
      [itemId]: {
        ...s[itemId],
        [bucketId]: !s[itemId]?.[bucketId]
      }
    }))
  }

  const sendToQuarantine = async (itemId: string) => {
    const selectedBuckets = Object.keys(selected[itemId] || {}).filter(id => selected[itemId][id])
    if (selectedBuckets.length === 0) return
    
    if (!confirm(`Enviar ${selectedBuckets.length} balde(s) para quarentena?`)) return
    
    setBusy(`quarantine-${itemId}`)
    try {
      const result = await sendBucketsToQuarantine(itemId, selectedBuckets)
      if (!result.success) {
        alert(`Erro ao enviar para quarentena: ${result.error}`)
        return
      }
      
      await mutate()
      setSelected((s) => ({ ...s, [itemId]: {} }))
      alert(`✅ ${selectedBuckets.length} balde(s) enviado(s) para quarentena!`)
    } catch (error) {
      console.error('Erro ao enviar para quarentena:', error)
      alert('Erro ao enviar baldes para quarentena. Tente novamente.')
    } finally {
      setBusy(null)
    }
  }

  const getBucketIcon = (status: string) => {
    switch (status) {
      case 'quarantine':
        return <AlertTriangle className="w-3 h-3" />
      case 'released':
        return <CheckCircle className="w-3 h-3" />
      case 'packaged':
        return <Package className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const releaseFromQuarantine = async (itemId: string) => {
    const selectedBuckets = Object.keys(selected[itemId] || {}).filter(id => selected[itemId][id])
    if (selectedBuckets.length === 0) return
    
    if (!confirm(`Liberar ${selectedBuckets.length} balde(s) da quarentena para expedição?`)) return
    
    setBusy(`release-${itemId}`)
    try {
      const result = await releaseBucketsFromQuarantine(itemId, selectedBuckets)
      if (!result.success) {
        alert(`Erro ao liberar da quarentena: ${result.error}`)
        return
      }
      
      await mutate()
      setSelected((s) => ({ ...s, [itemId]: {} }))
      alert(`✅ ${selectedBuckets.length} balde(s) liberado(s) para expedição!`)
    } catch (error) {
      console.error('Erro ao liberar da quarentena:', error)
      alert('Erro ao liberar baldes da quarentena. Tente novamente.')
    } finally {
      setBusy(null)
    }
  }

  const getBucketColor = (status: string) => {
    switch (status) {
      case 'quarantine':
        return 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
      case 'released':
        return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200'
      case 'packaged':
        return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200'
      default:
        return 'bg-gradient-to-r from-slate-100 to-white text-slate-700 border-slate-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-amber-700">Carregando sistema de quarentena...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-700">Erro ao carregar dados da quarentena</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-amber-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Quarentena</h1>
                <p className="text-sm text-amber-700">Controle de qualidade pós-envase</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/semi-finished">
                <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                  ← Semi-Acabados
                </Button>
              </Link>
              <Link href="/semi-finished-overview">
                <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                  Overview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 border-amber-200 shadow-sm">
              <div className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <div className="text-2xl font-bold text-amber-900">{itemsWithQuarantine.length}</div>
                <div className="text-sm text-amber-600">OPs em Quarentena</div>
              </div>
            </Card>
            <Card className="bg-white/80 border-amber-200 shadow-sm">
              <div className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-900">0</div>
                <div className="text-sm text-blue-600">Aguardando Liberação</div>
              </div>
            </Card>
            <Card className="bg-white/80 border-amber-200 shadow-sm">
              <div className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-2xl font-bold text-emerald-900">0</div>
                <div className="text-sm text-emerald-600">Liberados Hoje</div>
              </div>
            </Card>
            <Card className="bg-white/80 border-amber-200 shadow-sm">
              <div className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-900">0</div>
                <div className="text-sm text-red-600">Pendentes</div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {itemsWithQuarantine.length === 0 ? (
            <Card className="bg-white/80 border-amber-200 shadow-sm p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-amber-300" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Nenhum produto em quarentena</h3>
              <p className="text-amber-700 mb-4">Envase produtos para que possam entrar em quarentena</p>
              <Link href="/semi-finished">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Ir para Semi-Acabados
                </Button>
              </Link>
            </Card>
          ) : (
            itemsWithQuarantine.map((item) => (
              <QuarantineItem
                key={item.id}
                item={item}
                selected={selected[item.id] || {}}
                busy={busy}
                onToggle={(bucketId) => toggle(item.id, bucketId)}
                onSendToQuarantine={() => sendToQuarantine(item.id)}
                onReleaseFromQuarantine={() => releaseFromQuarantine(item.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function QuarantineItem({ 
  item, 
  selected, 
  busy, 
  onToggle, 
  onSendToQuarantine, 
  onReleaseFromQuarantine 
}: {
  item: SemiItem
  selected: Record<string, boolean>
  busy: string | null
  onToggle: (bucketId: string) => void
  onSendToQuarantine: () => void
  onReleaseFromQuarantine: () => void
}) {
  const { data: buckets, isLoading, error, mutate: refresh } = useSemiFinishedBuckets(item.id)
  const soft = getSemiFinishedFamilyColor(item.family)
  const selectedIds = Object.keys(selected).filter((k) => selected[k])

  // Filtrar baldes que podem ir para quarentena (status packaged)
  const bucketsForQuarantine = buckets?.filter(b => b.status === 'packaged') || []
  // Filtrar baldes em quarentena
  const bucketsInQuarantine = buckets?.filter(b => b.status === 'quarantine') || []
  // Filtrar baldes liberados
  const bucketsReleased = buckets?.filter(b => b.status === 'released') || []

  return (
    <Card className="bg-white/90 border border-amber-200 shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-amber-900 text-lg mb-2">{item.name}</div>
            <div className="text-sm text-amber-700 mb-1">OP: {item.op} • Lote: {item.batch}</div>
            <div className="text-sm text-amber-600">Família: {item.family}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {Number(item.quantity_total).toFixed(1)}kg Total
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              {Number(item.quantity_envasado).toFixed(1)}kg Envasado
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {(Number(item.quantity_total) - Number(item.quantity_envasado)).toFixed(1)}kg Saldo
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Baldes prontos para quarentena */}
          {bucketsForQuarantine.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Prontos para Quarentena ({bucketsForQuarantine.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {bucketsForQuarantine.map((bucket) => (
                  <div
                    key={bucket.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${getBucketColor(bucket.status)} ${
                      selected[bucket.id] ? 'ring-2 ring-amber-400' : ''
                    }`}
                    onClick={() => onToggle(bucket.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Balde {bucket.bucketIndex}</span>
                      {getBucketIcon(bucket.status)}
                    </div>
                    <div className="text-xs">{bucket.currentQuantityKg.toFixed(1)}kg</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  disabled={selectedIds.length === 0 || busy !== null}
                  onClick={onSendToQuarantine}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {busy === `quarantine-${item.id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Enviar para Quarentena
                </Button>
              </div>
            </div>
          )}

          {/* Baldes em quarentena */}
          {bucketsInQuarantine.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Em Quarentena ({bucketsInQuarantine.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {bucketsInQuarantine.map((bucket) => (
                  <div
                    key={bucket.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${getBucketColor(bucket.status)} ${
                      selected[bucket.id] ? 'ring-2 ring-amber-400' : ''
                    }`}
                    onClick={() => onToggle(bucket.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Balde {bucket.bucketIndex}</span>
                      {getBucketIcon(bucket.status)}
                    </div>
                    <div className="text-xs">{bucket.currentQuantityKg.toFixed(1)}kg</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  disabled={selectedIds.length === 0 || busy !== null}
                  onClick={onReleaseFromQuarantine}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {busy === `release-${item.id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Liberar para Expedição
                </Button>
              </div>
            </div>
          )}

          {/* Baldes liberados */}
          {bucketsReleased.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Liberados ({bucketsReleased.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {bucketsReleased.map((bucket) => (
                  <div
                    key={bucket.id}
                    className={`p-2 rounded-lg border ${getBucketColor(bucket.status)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Balde {bucket.bucketIndex}</span>
                      {getBucketIcon(bucket.status)}
                    </div>
                    <div className="text-xs">{bucket.currentQuantityKg.toFixed(1)}kg</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bucketsForQuarantine.length === 0 && bucketsInQuarantine.length === 0 && bucketsReleased.length === 0 && (
            <div className="text-center py-8 text-amber-600">
              <Package className="w-12 h-12 mx-auto mb-2 text-amber-300" />
              <p>Nenhum balde encontrado para este produto</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function getBucketColor(status: string) {
  switch (status) {
    case 'quarantine':
      return 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200'
    case 'released':
      return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200'
    case 'packaged':
      return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200'
    default:
      return 'bg-gradient-to-r from-slate-100 to-white text-slate-700 border-slate-200'
  }
}
