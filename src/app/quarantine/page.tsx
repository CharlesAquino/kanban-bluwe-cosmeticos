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
    <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.1) 35px, rgba(59, 130, 246, 0.1) 70px)`,
        }}></div>
      </div>

      {/* Header Hero */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    Centro de Quarentena
                  </h1>
                  <p className="text-blue-100 text-lg font-medium">Gestão avançada de controle de qualidade</p>
                </div>
              </div>
            </div>
            <Link href="/semi-finished">
              <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shadow-lg">
                <FlaskConical className="w-5 h-5 mr-2" />
                Semi-Acabados
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Itens em Quarentena</p>
                  <p className="text-4xl font-bold text-blue-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Famílias</p>
                  <p className="text-4xl font-bold text-indigo-900 mt-1">{stats.families}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Archive className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-semibold uppercase tracking-wider">Tempo Médio</p>
                  <p className="text-4xl font-bold text-purple-900 mt-1">{stats.avgDays}d</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <Timer className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-slate-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">Volume Total</p>
                  <p className="text-4xl font-bold text-slate-900 mt-1">{stats.totalKg}kg</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-full sm:w-72 shadow-sm"
                />
              </div>

              {/* Family Filter */}
              <div className="relative">
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="appearance-none pl-4 pr-12 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm cursor-pointer shadow-sm"
                  aria-label="Filtrar por família"
                  title="Filtrar produtos por família"
                >
                  <option value="all">Todas Famílias</option>
                  {families.map(family => (
                    <option key={family} value={family}>{family}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode */}
              <div className="flex bg-blue-100 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-blue-700 hover:bg-blue-200'
                  }`}
                  aria-label="Visualização em grade"
                  title="Exibir itens em grade"
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-md' 
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
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl shadow-sm">
                  <span className="text-blue-700 text-sm font-semibold">
                    {selectedItems.size} selecionados
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-200 transition-colors"
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
                className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl shadow-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-blue-600 text-lg font-medium">Carregando itens em quarentena...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-16 text-center shadow-xl border border-blue-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-3">
              {searchTerm || selectedFamily !== 'all' ? 'Nenhum item encontrado' : 'Nenhum item em quarentena'}
            </h3>
            <p className="text-blue-600 text-lg">
              {searchTerm || selectedFamily !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Todos os itens passaram pelo controle de qualidade'
              }
            </p>
          </div>
        )}

        {/* Items Grid/List - Post-its Style */}
        {!isLoading && filteredItems.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            : "space-y-4 mb-8"
          }>
            {filteredItems.map(item => (
              <PostItCard
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

// Componente Post-It Card com Design Gráfico
function PostItCard({ 
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

  // Cores dinâmicas baseadas na família
  const postItColors = {
    'Gel': 'from-pink-400 to-rose-500',
    'TopCoat': 'from-amber-400 to-orange-500', 
    'Base': 'from-amber-400 to-orange-500',
    'Higienizador': 'from-cyan-400 to-blue-500',
    'Esmalte': 'from-purple-400 to-violet-500',
    'default': 'from-blue-400 to-indigo-500'
  }

  const getPostItColor = (family: string) => {
    for (const [key, color] of Object.entries(postItColors)) {
      if (family.includes(key)) return color
    }
    return postItColors.default
  }

  const currentColor = getPostItColor(item.family)

  const postItContent = (
    <>
      {/* Post-it Header com Tape Effect */}
      <div className="relative mb-4">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className={`w-16 h-8 bg-gradient-to-br ${currentColor} opacity-80 rounded-sm shadow-md transform rotate-3`}></div>
          <div className={`w-16 h-8 bg-gradient-to-br ${currentColor} opacity-60 rounded-sm shadow-md transform -rotate-3 -mt-1`}></div>
        </div>
        
        {/* Selection Checkbox */}
        <button
          onClick={onSelect}
          className={`absolute top-2 right-2 p-2 rounded-lg transition-all transform hover:scale-110 ${
            isSelected 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-400 hover:bg-white shadow-md'
          }`}
          aria-label={isSelected ? "Item selecionado" : "Selecionar item"}
          title={isSelected ? "Deselecionar este item" : "Selecionar este item"}
        >
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>

        {/* Product Name */}
        <h3 className="font-bold text-gray-800 text-lg mb-2 text-center pt-4">{item.name}</h3>
        
        {/* Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
          <Badge className={`${familyColor} text-xs px-2 py-1 rounded-full shadow-sm`}>
            {item.family}
          </Badge>
          <Badge variant="outline" className="text-xs bg-white/80 shadow-sm">
            OP: {item.op}
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-white/50">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Volume</p>
          <p className="text-gray-900 font-bold text-lg">{item.quantity_total || 0}kg</p>
        </div>
        
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-white/50">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Envasado</p>
          <p className="text-gray-900 font-bold text-lg">{item.quantity_envasado || 0}kg</p>
        </div>
      </div>

      {/* Timer Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-white/50 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700 text-sm font-bold">Tempo em quarentena</span>
          </div>
          <span className="text-gray-900 font-bold text-lg">{daysInQuarantine}d</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="flex-1 bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all"
        >
          <Eye className="w-4 h-4 mr-2" />
          Detalhes
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Aprovar
        </Button>
      </div>
    </>
  )

  if (viewMode === 'list') {
    return (
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center gap-6">
            <button
              onClick={onSelect}
              className={`p-3 rounded-xl transition-all transform hover:scale-110 ${
                isSelected 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white/80 text-gray-400 hover:bg-white shadow-md border border-gray-200'
              }`}
              aria-label={isSelected ? "Item selecionado" : "Selecionar item"}
              title={isSelected ? "Deselecionar este item" : "Selecionar este item"}
            >
              {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="font-bold text-gray-900 text-xl">{item.name}</h3>
                <Badge className={`${familyColor} text-sm px-3 py-1 rounded-full shadow-sm`}>
                  {item.family}
                </Badge>
                <Badge variant="outline" className="text-sm bg-white/80 shadow-sm">
                  OP: {item.op}
                </Badge>
                <Badge variant="outline" className="text-sm bg-white/80 shadow-sm">
                  Lote: {item.batch}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-white/50 min-w-[120px]">
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Volume</p>
                  <p className="text-gray-900 font-bold text-xl">{item.quantity_total || 0}kg</p>
                </div>
                
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-white/50 min-w-[120px]">
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Envasado</p>
                  <p className="text-gray-900 font-bold text-xl">{item.quantity_envasado || 0}kg</p>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl shadow-inner border border-white/50">
                  <Timer className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-bold">{daysInQuarantine} dias</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                size="sm" 
                className="bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                <Eye className="w-4 h-4 mr-2" />
                Detalhes
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative transform transition-all duration-300 hover:scale-105">
      {/* Post-it Shadow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-300"></div>
      
      {/* Post-it Main Card */}
      <div className={`relative bg-gradient-to-br ${currentColor} rounded-2xl p-6 shadow-2xl border border-white/30 backdrop-blur-sm overflow-hidden`}>
        
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
          }}></div>
        </div>

        {/* Folded Corner Effect */}
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] border-t-white/40 shadow-sm"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {postItContent}
        </div>
      </div>
    </div>
  )
}
