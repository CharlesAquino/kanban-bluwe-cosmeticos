'use client'

import useSWR from 'swr'
import { useMemo, useState, useEffect } from 'react'
import { Shield, FlaskConical, AlertCircle, RefreshCw } from 'lucide-react'
import { SemiItem, semiFinishedFetcher } from '@/lib/semi-finished-lib'
import Link from 'next/link'
import { subscribeChanges } from '@/lib/bus'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Importar componentes modulares
import { StatsDashboard, StatusDistribution } from '@/components/quarantine/stats-dashboard'
import { ItemsFilters } from '@/components/quarantine/items-section'
import { AnalyticsSection } from '@/components/quarantine/analytics-section'
import { EnhancedPostItCard } from '@/components/quarantine/enhanced-postit-card'

// Importar animações
import { CardEntrance, Glow } from '@/components/quarantine/quarantine-animations'
import { EmptyQuarantineIcon, LoadingIcon } from '@/components/quarantine/quarantine-icons'

export default function QuarantinePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFamily, setSelectedFamily] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'analytics'>('overview')

  const { data: items, error, isLoading, mutate } = useSWR<SemiItem[]>(
    '/api/quarantine',
    semiFinishedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 10000,
    }
  )

  useEffect(() => {
    const unsub = subscribeChanges((ev) => {
      if (ev.type === 'semi_finished') {
        mutate()
      }
    })
    return () => unsub()
  }, [mutate])

  const filteredItems = useMemo(() => {
    if (!items) return []

    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.op.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFamily = selectedFamily === 'all' || item.family === selectedFamily
      return matchesSearch && matchesFamily
    })
  }, [items, searchTerm, selectedFamily])

  const families = useMemo(() => {
    if (!items) return []
    const uniqueFamilies = [...new Set(items.map((item) => item.family))]
    return uniqueFamilies.filter(Boolean)
  }, [items])

  const stats = useMemo(() => {
    if (!items) return { total: 0, families: 0, avgDays: 0, totalKg: 0, byStatus: {} }

    const total = items.length
    const familiesCount = new Set(items.map((item) => item.family)).size
    const totalKg = items.reduce((sum, item) => sum + (item.quantity_total || 0), 0)

    const avgMs =
      items.reduce((sum, item) => {
        const created = new Date(item.manufacturingDate)
        const now = new Date()
        return sum + (now.getTime() - created.getTime())
      }, 0) / (total || 1)
    const avgDays = Math.round(avgMs / (1000 * 60 * 60 * 24))

    const byStatus = {
      quarantine: Math.round(total * 0.6),
      released: Math.round(total * 0.25),
      pending: Math.round(total * 0.15),
    }

    return { total, families: familiesCount, avgDays, totalKg, byStatus }
  }, [items])

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <CardEntrance>
          <Card className="p-8 max-w-md w-full bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Erro ao carregar quarentena</h3>
              <p className="text-blue-700 text-sm mb-4">Não foi possível carregar os itens</p>
              <Button onClick={() => mutate()} className="bg-blue-500 hover:bg-blue-600 w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </Card>
        </CardEntrance>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.1) 35px, rgba(59, 130, 246, 0.1) 70px)`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Hero */}
        <CardEntrance>
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl shadow-2xl mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 px-8 py-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Glow color="blue" intensity="high">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                  </Glow>
                  <div>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                      Centro de Quarentena
                    </h1>
                    <p className="text-blue-100 text-lg font-medium">Gestão avançada de controle de qualidade</p>
                  </div>
                </div>
                <Link href="/semi-finished">
                  <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shadow-lg">
                    Semi-Acabados
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardEntrance>

        {/* Tabs */}
        <CardEntrance delay={100}>
          <div className="flex gap-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-blue-100">
            {(['overview', 'items', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                {tab === 'overview' && '📊 Visão Geral'}
                {tab === 'items' && '📦 Itens'}
                {tab === 'analytics' && '📈 Análise'}
              </button>
            ))}
          </div>
        </CardEntrance>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <StatsDashboard
              total={stats.total}
              families={stats.families}
              avgDays={stats.avgDays}
              totalKg={stats.totalKg}
              byStatus={stats.byStatus}
            />
            <StatusDistribution byStatus={stats.byStatus} total={stats.total} />
          </>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <>
            <ItemsFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedFamily={selectedFamily}
              onFamilyChange={setSelectedFamily}
              families={families}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectedCount={selectedItems.size}
              onClearSelection={clearSelection}
              onRefresh={() => mutate()}
            />

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <LoadingIcon size={48} color="#3B82F6" />
                  <p className="text-blue-600 text-lg font-medium mt-4">Carregando itens em quarentena...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredItems.length === 0 && (
              <CardEntrance>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-16 text-center shadow-xl border border-blue-100">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <EmptyQuarantineIcon size={48} color="#3B82F6" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">
                    {searchTerm || selectedFamily !== 'all' ? 'Nenhum item encontrado' : 'Nenhum item em quarentena'}
                  </h3>
                  <p className="text-blue-600 text-lg">
                    {searchTerm || selectedFamily !== 'all'
                      ? 'Tente ajustar os filtros de busca'
                      : 'Todos os itens passaram pelo controle de qualidade'}
                  </p>
                </div>
              </CardEntrance>
            )}

            {/* Items Grid/List */}
            {!isLoading && filteredItems.length > 0 && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'
                    : 'space-y-4 mb-8'
                }
              >
                {filteredItems.map((item, index) => (
                  <CardEntrance key={item.id} delay={index * 50}>
                    <EnhancedPostItCard
                      item={item}
                      isSelected={selectedItems.has(item.id)}
                      onSelect={() => toggleItemSelection(item.id)}
                      viewMode={viewMode}
                    />
                  </CardEntrance>
                ))}
              </div>
            )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsSection items={items || []} families={families} />}
      </div>
    </div>
  )
}
