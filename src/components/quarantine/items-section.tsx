/**
 * Seção de Itens - Quarentena
 */

import React from 'react'
import { Search, ChevronDown, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardEntrance } from './quarantine-animations'

interface ItemsSectionProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedFamily: string
  onFamilyChange: (family: string) => void
  families: string[]
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  selectedCount: number
  onClearSelection: () => void
  onRefresh: () => void
}

export const ItemsFilters: React.FC<ItemsSectionProps> = ({
  searchTerm,
  onSearchChange,
  selectedFamily,
  onFamilyChange,
  families,
  viewMode,
  onViewModeChange,
  selectedCount,
  onClearSelection,
  onRefresh,
}) => {
  return (
    <CardEntrance delay={100}>
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-full sm:w-72 shadow-sm"
              />
            </div>

            {/* Family Filter */}
            <div className="relative">
              <select
                value={selectedFamily}
                onChange={(e) => onFamilyChange(e.target.value)}
                className="appearance-none pl-4 pr-12 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm cursor-pointer shadow-sm"
                aria-label="Filtrar por família"
                title="Filtrar produtos por família"
              >
                <option value="all">Todas Famílias</option>
                {families.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex bg-blue-100 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => onViewModeChange('grid')}
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
                onClick={() => onViewModeChange('list')}
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
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-blue-700 text-sm font-semibold">{selectedCount} selecionados</span>
                <button
                  onClick={onClearSelection}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-200 transition-colors"
                  aria-label="Limpar seleção"
                  title="Limpar todos os itens selecionados"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Refresh */}
            <Button
              onClick={onRefresh}
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
    </CardEntrance>
  )
}

export default ItemsFilters
