'use client'

import useSWR from 'swr'
import { useMemo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  Package, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Send,
  FlaskConical,
  Timer,
  Activity,
  TrendingUp,
  Filter,
  Search,
  X,
  ChevronDown,
  Eye,
  Archive,
  Truck,
  BarChart3,
  Zap,
  Lock,
  Unlock,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react'
import { SemiItem, semiFinishedFetcher, getSemiFinishedFamilyColor } from '@/lib/semi-finished-lib'
import Link from 'next/link'
import { subscribeChanges } from '@/lib/bus'

export default function QuarantinePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFamily, setSelectedFamily] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)

  const { data: items, error, isLoading, mutate } = useSWR<SemiItem[]>('/api/quarantine', semiFinishedFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 10000,
  })

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
    
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.op.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFamily = selectedFamily === 'all' || item.family === selectedFamily
      return matchesSearch && matchesFamily
    })
  }, [items, searchTerm, selectedFamily])

  const families = useMemo(() => {
    if (!items) return []
    const uniqueFamilies = [...new Set(items.map(item => item.family))]
    return uniqueFamilies.filter(Boolean)
  }, [items])

  const stats = useMemo(() => {
    if (!items) return { total: 0, families: 0, avgDays: 0, totalKg: 0 }
    
    const total = items.length
    const families = new Set(items.map(item => item.family)).size
    const totalKg = items.reduce((sum, item) => sum + (item.quantity_total || 0), 0)
    
    // Calcular dias médios em quarentena
    const avgMs = items.reduce((sum, item) => {
      const created = new Date(item.manufacturingDate)
      const now = new Date()
      return sum + (now.getTime() - created.getTime())
    }, 0) / (total || 1)
    const avgDays = Math.round(avgMs / (1000 * 60 * 60 * 24))
    
    return { total, families, avgDays, totalKg }
  }, [items])

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedItems(new Set(filteredItems.map(item => item.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full bg-white/80 backdrop-blur-sm border-blue-200">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Erro ao carregar quarentena</h3>
            <p className="text-blue-700 text-sm mb-4">Não foi possível carregar os itens em quarentena</p>
            <Button onClick={() => mutate()} className="bg-blue-500 hover:bg-blue-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Centro de Quarentena</h1>
                  <p className="text-blue-100">Gestão avançada de controle de qualidade</p>
                </div>
              </div>
            </div>
            <Link href="/semi-finished">
              <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <FlaskConical className="w-4 h-4 mr-2" />
                Semi-Acabados
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Itens em Quarentena</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-indigo-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Famílias</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.families}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Archive className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-purple-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Tempo Médio</p>
                <p className="text-3xl font-bold text-purple-900">{stats.avgDays}d</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Timer className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Volume Total</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalKg}kg</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-full sm:w-64"
                />
              </div>

              {/* Family Filter */}
              <div className="relative">
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm cursor-pointer"
                  aria-label="Filtrar por família"
                  title="Filtrar produtos por família"
                >
                  <option value="all">Todas Famílias</option>
                  {families.map(family => (
                    <option key={family} value={family}>{family}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode */}
              <div className="flex bg-blue-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-blue-700 hover:bg-blue-200'
                  }`}
                  aria-label="Visualização em grade"
                  title="Exibir itens em grade"
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-blue-700 hover:bg-blue-200'
                  }`}
                  aria-label="Visualização em lista"
                  title="Exibir itens em lista"
                >
                  Lista
                </button>
              </div>

              {/* Selection Controls */}
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-lg">
                  <span className="text-blue-700 text-sm font-medium">
                    {selectedItems.size} selecionados
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Limpar seleção"
                    title="Limpar todos os itens selecionados"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Button 
                onClick={() => mutate()} 
                variant="outline" 
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-blue-600">Carregando itens em quarentena...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 p-12 text-center">
            <Shield className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              {searchTerm || selectedFamily !== 'all' ? 'Nenhum item encontrado' : 'Nenhum item em quarentena'}
            </h3>
            <p className="text-blue-600">
              {searchTerm || selectedFamily !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Todos os itens passaram pelo controle de qualidade'
              }
            </p>
          </Card>
        )}

        {/* Items Grid/List */}
        {!isLoading && filteredItems.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            : "space-y-4 mb-8"
          }>
            {filteredItems.map(item => (
              <QuarantineItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={() => toggleItemSelection(item.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente do Card de Item
function QuarantineItemCard({ 
  item, 
  isSelected, 
  onSelect, 
  viewMode 
}: { 
  item: SemiItem
  isSelected: boolean
  onSelect: () => void
  viewMode: 'grid' | 'list'
}) {
  const familyColor = getSemiFinishedFamilyColor(item.family)
  const daysInQuarantine = Math.floor(
    (new Date().getTime() - new Date(item.manufacturingDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  )

  const cardContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${familyColor} text-xs px-2 py-1 rounded-full`}>
              {item.family}
            </Badge>
            <Badge variant="outline" className="text-xs">
              OP: {item.op}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Lote: {item.batch}
            </Badge>
          </div>
        </div>
        
        <button
          onClick={onSelect}
          className={`p-2 rounded-lg transition-all ${
            isSelected 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
          aria-label={isSelected ? "Item selecionado" : "Selecionar item"}
          title={isSelected ? "Deselecionar este item" : "Selecionar este item"}
        >
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>
      </div>

      {/* Status e Métricas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-600 text-xs font-medium uppercase tracking-wide">Volume</p>
          <p className="text-blue-900 font-bold text-lg">{item.quantity_total || 0}kg</p>
        </div>
        
        <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-indigo-600 text-xs font-medium uppercase tracking-wide">Envasado</p>
          <p className="text-indigo-900 font-bold text-lg">{item.quantity_envasado || 0}kg</p>
        </div>
      </div>

      {/* Tempo em Quarentena */}
      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-purple-500" />
          <span className="text-purple-700 text-sm font-medium">Tempo em quarentena</span>
        </div>
        <span className="text-purple-900 font-bold">{daysInQuarantine} dias</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
          <Eye className="w-4 h-4 mr-2" />
          Detalhes
        </Button>
        <Button size="sm" variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <CheckCircle className="w-4 h-4 mr-2" />
          Aprovar
        </Button>
      </div>
    </>
  )

  if (viewMode === 'list') {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-blue-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-6">
          <button
            onClick={onSelect}
            className={`p-2 rounded-lg transition-all ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            aria-label={isSelected ? "Item selecionado" : "Selecionar item"}
            title={isSelected ? "Deselecionar este item" : "Selecionar este item"}
          >
            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
              <Badge className={`${familyColor} text-xs px-2 py-1 rounded-full`}>
                {item.family}
              </Badge>
              <Badge variant="outline" className="text-xs">
                OP: {item.op}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Lote: {item.batch}
              </Badge>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200 min-w-[100px]">
                <p className="text-blue-600 text-xs">Volume</p>
                <p className="text-blue-900 font-bold">{item.quantity_total || 0}kg</p>
              </div>
              
              <div className="text-center p-2 bg-indigo-50 rounded-lg border border-indigo-200 min-w-[100px]">
                <p className="text-indigo-600 text-xs">Envasado</p>
                <p className="text-indigo-900 font-bold">{item.quantity_envasado || 0}kg</p>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <Timer className="w-4 h-4 text-purple-500" />
                <span className="text-purple-700 text-sm">{daysInQuarantine} dias</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Eye className="w-4 h-4 mr-2" />
              Detalhes
            </Button>
            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
      {cardContent}
    </Card>
  )
}
