/**
 * Enhanced Post-It Card - Quarentena
 */

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckSquare, Square, Eye, CheckCircle, Timer } from 'lucide-react'
import { SemiItem, getSemiFinishedFamilyColor } from '@/lib/semi-finished-lib'
import { getFamilyPalette } from '@/lib/quarantine-design-system'
import { getFamilyIcon } from './quarantine-icons'
import { HoverScale } from './quarantine-animations'

interface EnhancedPostItCardProps {
  item: SemiItem
  isSelected: boolean
  onSelect: () => void
  viewMode: 'grid' | 'list'
}

export const EnhancedPostItCard: React.FC<EnhancedPostItCardProps> = ({
  item,
  isSelected,
  onSelect,
  viewMode,
}) => {
  const familyColor = getSemiFinishedFamilyColor(item.family)
  const palette = getFamilyPalette(item.family)
  const FamilyIcon = getFamilyIcon(item.family)

  const daysInQuarantine = Math.floor(
    (new Date().getTime() - new Date(item.manufacturingDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  const postItContent = (
    <>
      {/* Post-it Header */}
      <div className="relative mb-4">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className={`w-16 h-8 bg-gradient-to-br ${palette.gradient} opacity-80 rounded-sm shadow-md transform rotate-3`}></div>
          <div className={`w-16 h-8 bg-gradient-to-br ${palette.gradient} opacity-60 rounded-sm shadow-md transform -rotate-3 -mt-1`}></div>
        </div>

        {/* Selection Checkbox */}
        <button
          onClick={onSelect}
          className={`absolute top-2 right-2 p-2 rounded-lg transition-all transform hover:scale-110 ${
            isSelected ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/80 text-gray-400 hover:bg-white shadow-md'
          }`}
          aria-label={isSelected ? 'Item selecionado' : 'Selecionar item'}
          title={isSelected ? 'Deselecionar este item' : 'Selecionar este item'}
        >
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>

        {/* Product Name */}
        <h3 className="font-bold text-gray-800 text-lg mb-2 text-center pt-4 flex items-center justify-center gap-2">
          <FamilyIcon size={20} color={palette.primary} />
          {item.name}
        </h3>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
          <Badge className={`${familyColor} text-xs px-2 py-1 rounded-full shadow-sm`}>{item.family}</Badge>
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
        <Button size="sm" className="flex-1 bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all">
          <Eye className="w-4 h-4 mr-2" />
          Detalhes
        </Button>
        <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all">
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
              aria-label={isSelected ? 'Item selecionado' : 'Selecionar item'}
              title={isSelected ? 'Deselecionar este item' : 'Selecionar este item'}
            >
              {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="font-bold text-gray-900 text-xl">{item.name}</h3>
                <Badge className={`${familyColor} text-sm px-3 py-1 rounded-full shadow-sm`}>{item.family}</Badge>
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
              <Button size="sm" className="bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <Eye className="w-4 h-4 mr-2" />
                Detalhes
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all">
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
    <HoverScale scale={1.05}>
      <div className="group relative transform transition-all duration-300">
        {/* Post-it Shadow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-300"></div>

        {/* Post-it Main Card */}
        <div className={`relative bg-gradient-to-br ${palette.gradient} rounded-2xl p-6 shadow-2xl border border-white/30 backdrop-blur-sm overflow-hidden`}>
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
              }}
            ></div>
          </div>

          {/* Folded Corner Effect */}
          <div className="absolute top-0 right-0 w-8 h-8">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] border-t-white/40 shadow-sm"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">{postItContent}</div>
        </div>
      </div>
    </HoverScale>
  )
}

export default EnhancedPostItCard
