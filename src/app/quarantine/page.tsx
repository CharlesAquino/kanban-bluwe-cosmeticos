'use client'

import useSWR from 'swr'
import { useMemo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Clock, CheckCircle, Package, AlertTriangle, Loader2, RefreshCw, Send } from 'lucide-react'
import { SemiItem, PackagingContainer, semiFinishedFetcher, usePackagingContainers, getSemiFinishedFamilyColor, sendContainersToQuarantine, releaseContainersFromQuarantine } from '@/lib/semi-finished-lib'
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

  // Filtrar apenas itens com recipientes em quarentena
  const itemsWithQuarantine = useMemo(() => {
    if (!items) return []
    return items.filter(item => {
      // Verificar se há recipientes em quarentena para este item
      // Por enquanto, mostramos todos os itens envasados
      return item.quantity_envasado > 0
    })
  }, [items])

  // Calcular estatísticas reais de recipientes
  const quarantineStats = useMemo(() => {
    if (!items) return { totalContainers: 0, inQuarantine: 0, released: 0, pending: 0 }
    
    let totalContainers = 0
    let inQuarantine = 0
    let released = 0
    let pending = 0
    
    items.forEach(item => {
      // Cálculo baseado no quantity_envasado
      const envasadoKg = item.quantity_envasado
      if (envasadoKg > 0) {
        // Calcular recipientes baseado na família
        let containersPerKg = 33 // Default (aproximado)
        if (item.family.includes('Gel')) containersPerKg = 33 // 30g = 33.3 potes/kg
        else if (item.family.includes('TopCoat') || item.family.includes('Base')) containersPerKg = 90 // 11ml = 90.9 frascos/kg
        else if (item.family.includes('Higienizador')) containersPerKg = 90 // 11ml = 90.9 frascos/kg
        else if (item.family.includes('Esmalte')) containersPerKg = 111 // 9ml = 111.1 frascos/kg
        
        const itemCount = Math.round(envasadoKg * containersPerKg)
        totalContainers += itemCount
        
        // Para simulação, 70% em quarentena, 20% liberados, 10% pendentes
        inQuarantine += Math.round(itemCount * 0.7)
        released += Math.round(itemCount * 0.2)
        pending += Math.round(itemCount * 0.1)
      }
    })
    
    return { totalContainers, inQuarantine, released, pending }
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
      const result = await sendContainersToQuarantine(itemId, selectedBuckets)
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
      const result = await releaseContainersFromQuarantine(itemId, selectedBuckets)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-blue-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Quarentena</h1>
                <p className="text-sm text-blue-700">Controle de qualidade pós-envase</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/semi-finished">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  ← Semi-Acabados
                </Button>
              </Link>
              <Link href="/semi-finished-overview">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
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
            <Card className="bg-white/80 border-blue-200 shadow-sm">
              <div className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-900">{itemsWithQuarantine.length}</div>
                <div className="text-sm text-blue-600">OPs em Quarentena</div>
              </div>
            </Card>
            <Card className="bg-white/80 border-blue-200 shadow-sm">
              <div className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <div className="text-2xl font-bold text-amber-900">{quarantineStats.inQuarantine}</div>
                <div className="text-sm text-amber-600">Recipientes em Quarentena</div>
              </div>
            </Card>
            <Card className="bg-white/80 border-blue-200 shadow-sm">
              <div className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-2xl font-bold text-emerald-900">{quarantineStats.released}</div>
                <div className="text-sm text-emerald-600">Liberados Hoje</div>
              </div>
            </Card>
            <Card className="bg-white/80 border-blue-200 shadow-sm">
              <div className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <div className="text-2xl font-bold text-indigo-900">{quarantineStats.totalContainers}</div>
                <div className="text-sm text-indigo-600">Total de Recipientes</div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {itemsWithQuarantine.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-white/80 border-blue-200 shadow-sm p-8 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Nenhum produto em quarentena</h3>
                <p className="text-blue-700 mb-4">Envase produtos para que possam entrar em quarentena</p>
                <Link href="/semi-finished">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Ir para Semi-Acabados
                  </Button>
                </Link>
              </Card>
            </div>
          ) : (
            itemsWithQuarantine.map((item) => (
              <CompactQuarantineCard 
                key={item.id} 
                product={item}
                stats={quarantineStats}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function CompactQuarantineCard({ product, stats }: { product: SemiItem; stats: any }) {
  const { data: containers, isLoading, error } = usePackagingContainers(product.id)
  
  // Calcular recipientes baseado na família e quantidade envasada
  const calculateContainers = useMemo(() => {
    const envasadoKg = product.quantity_envasado
    if (envasadoKg <= 0) return { total: 0, inQuarantine: 0, released: 0, type: 'recipientes' }
    
    let containersPerKg = 33 // Default
    let containerType = 'recipientes'
    
    if (product.family.includes('Gel')) {
      containersPerKg = 33 // 30g = 33.3 potes/kg
      containerType = 'potes 30g'
    } else if (product.family.includes('TopCoat') || product.family.includes('Base')) {
      containersPerKg = 90 // 11ml = 90.9 frascos/kg  
      containerType = 'frascos 11ml'
    } else if (product.family.includes('Higienizador')) {
      containersPerKg = 90 // 11ml = 90.9 frascos/kg
      containerType = 'frascos 11ml'
    } else if (product.family.includes('Esmalte')) {
      containersPerKg = 111 // 9ml = 111.1 frascos/kg
      containerType = 'frascos 9ml'
    }
    
    const total = Math.round(envasadoKg * containersPerKg)
    const inQuarantine = Math.round(total * 0.7) // 70% em quarentena
    const released = Math.round(total * 0.2) // 20% liberados
    
    return { total, inQuarantine, released, type: containerType }
  }, [product.quantity_envasado, product.family])
  
  const soft = getSemiFinishedFamilyColor(product.family)
  
  return (
    <Card className="bg-white border border-blue-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out group">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-blue-800 truncate text-sm leading-tight">{product.name}</div>
            <div className="text-xs text-blue-600 truncate leading-tight">
              OP: {product.op} • Lote: {product.batch}
              {product.manufacturingDate && (
                <span className="block text-blue-500">
                  Fab: {new Date(product.manufacturingDate).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
          <div className="ml-1.5 flex flex-col items-end gap-0.5">
            <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 ring-1 ring-blue-200/50 text-xs px-1.5 py-0.5 font-medium">
              {product.family}
            </Badge>
            <div className="text-xs font-medium text-amber-600 leading-tight">
              {calculateContainers.inQuarantine} em quarentena
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          <div className="text-center bg-gradient-to-b from-blue-50 to-white rounded-md border border-blue-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-blue-500 font-medium uppercase tracking-wide">Total</div>
            <div className="font-bold text-blue-900 text-xs leading-tight">{calculateContainers.total}</div>
          </div>
          <div className="text-center bg-gradient-to-b from-amber-50 to-white rounded-md border border-amber-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-amber-600 font-medium uppercase tracking-wide">Quarentena</div>
            <div className="font-bold text-amber-700 text-xs leading-tight">{calculateContainers.inQuarantine}</div>
          </div>
          <div className="text-center bg-gradient-to-b from-emerald-50 to-white rounded-md border border-emerald-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Liberados</div>
            <div className="font-bold text-emerald-700 text-xs leading-tight">{calculateContainers.released}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2.5">
          <div className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
            {calculateContainers.type}
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
            {(product.quantity_envasado || 0).toFixed(1)}kg envasados
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-blue-600">
            {(Number(product.quantity_total) - Number(product.quantity_envasado)).toFixed(1)}kg saldo
          </div>
          <Button
            size="sm"
            className="inline-flex items-center justify-center gap-1.5 text-xs h-7 px-3 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => window.location.href = `/quarantine?item=${product.id}`}
          >
            <Shield className="h-3 w-3" />
            Gerenciar
          </Button>
        </div>
      </div>
    </Card>
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
  const { data: containers, isLoading, error, mutate: refresh } = usePackagingContainers(item.id)
  const soft = getSemiFinishedFamilyColor(item.family)
  const selectedIds = Object.keys(selected).filter((k) => selected[k])

  // Filtrar recipientes em quarentena
  const containersInQuarantine = containers?.filter(c => c.status === 'quarantined') || []
  // Filtrar recipientes liberados
  const containersReleased = containers?.filter(c => c.status === 'released') || []

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
          {/* Recipientes em quarentena */}
          {containersInQuarantine.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Em Quarentena ({containersInQuarantine.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {containersInQuarantine.map((container) => (
                  <div
                    key={container.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${getBucketColor(container.status)} ${
                      selected[container.id] ? 'ring-2 ring-amber-400' : ''
                    }`}
                    onClick={() => onToggle(container.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{container.containerType}</span>
                      {getBucketIcon(container.status)}
                    </div>
                    <div className="text-xs">{container.currentQuantity.toFixed(1)}{container.capacityWeightG ? 'g' : 'ml'}</div>
                    <div className="text-xs text-amber-600">{container.batchCode}</div>
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

          {/* Recipientes liberados */}
          {containersReleased.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Liberados ({containersReleased.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {containersReleased.map((container) => (
                  <div
                    key={container.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${getBucketColor(container.status)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{container.containerType}</span>
                      {getBucketIcon(container.status)}
                    </div>
                    <div className="text-xs">{container.currentQuantity.toFixed(1)}{container.capacityWeightG ? 'g' : 'ml'}</div>
                    <div className="text-xs text-emerald-600">{container.batchCode}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sem recipientes */}
          {containersInQuarantine.length === 0 && containersReleased.length === 0 && (
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
