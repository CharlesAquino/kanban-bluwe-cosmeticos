'use client'

import React, { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Play,
  Pause,
  AlertTriangle,
  Trash2,
  Users,
  Package,
  CheckCircle
} from 'lucide-react'
import type { Product, HourlyControl, StageHistory } from '@/lib/types'
import { STAGE_LABELS, EFFICIENCY_STATUS_COLORS, EFFICIENCY_STATUS_LABELS } from '@/lib/types'
import { getStatusUI } from '@/lib/status-utils'

interface KanbanCardProps {
  product: Product
  formatDate: (date: string) => string
  getDuration: (start: string, end: string | null) => string
  getLatestHourlyControl: (product: Product) => HourlyControl | null
  onPauseProduction: (id: string) => void
  onResumeProduction: (id: string) => void
  onBlockProduction: (id: string, reason: string) => void
  onDeleteProduct: (id: string) => void
}

const KanbanCardBase = ({
  product,
  formatDate,
  getDuration,
  getLatestHourlyControl,
  onPauseProduction,
  onResumeProduction,
  onBlockProduction,
  onDeleteProduct
}: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const currentStageInfo = product.stageHistory?.find(
    (sh: StageHistory) => sh.stage === product.currentStage
  ) || {
    stage: product.currentStage,
    startTime: new Date().toISOString(),
    endTime: null,
    mod: 1
  }

  const latestHourlyControl = getLatestHourlyControl(product)

  const handleBlockProduction = () => {
    const reason = prompt('Motivo do bloqueio:', '')
    if (reason) {
      onBlockProduction(product.id, reason)
    }
  }

  

  const handleDeleteProduct = () => {
    if (confirm(`Tem certeza que deseja remover o produto ${product.name}?`)) {
      onDeleteProduct(product.id)
    }
  }

  const handleFinalize = async () => {
    try {
      const res = await (await import('@/lib/product-operations')).finalizeProduct(product.id)
      if (!res.success) throw new Error(res.error || 'Falha ao finalizar')
      alert('Produto enviado para Semi-Acabados!')
    } catch (e) {
      alert(`Erro ao finalizar: ${e instanceof Error ? e.message : 'desconhecido'}`)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative cursor-grab active:cursor-grabbing transition-shadow duration-200 bg-white border border-slate-200 rounded-lg ${
        isDragging ? 'shadow-md ring-1 ring-blue-200' : 'shadow-sm hover:shadow-md'
      }`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        {/* Cabeçalho do card */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {product.name}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-medium truncate">OP:</span>
              <span className="truncate">{product.op}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium truncate">Lote:</span>
              <span className="truncate">{product.batch}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 ml-1"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteProduct()
            }}
            title="Excluir produto"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Informações principais */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between">
            <Badge className={`w-fit text-xs font-medium ring-1 ring-slate-200 bg-slate-50 text-slate-700`}>
              {STAGE_LABELS[product.currentStage]}
            </Badge>
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
              <span className="truncate">{product.quantity.toFixed(1)}</span>
              <span className="text-xs text-gray-500">kg</span>
            </div>
          </div>

          {currentStageInfo?.startTime && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
              <span className="truncate">Início: {formatDate(currentStageInfo.startTime)}</span>
            </div>
          )}

          {currentStageInfo?.mod > 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Users className="h-3 w-3 flex-shrink-0" />
              <span>MOD: {currentStageInfo.mod} pessoas</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
            <span className="truncate">Duração: {getDuration(currentStageInfo.startTime, currentStageInfo.endTime)}</span>
          </div>
        </div>

        {/* Controle hora a hora */}
        {latestHourlyControl ? (
          <div className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${EFFICIENCY_STATUS_COLORS[latestHourlyControl.status]} w-fit text-xs font-medium`}>
                {EFFICIENCY_STATUS_LABELS[latestHourlyControl.status]}
              </Badge>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                <span>{latestHourlyControl.efficiency}%</span>
                <span className="text-gray-500">eficiência</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div className="truncate">
                <span className="font-medium">Meta:</span> {latestHourlyControl.targetQuantity}kg
              </div>
              <div className="truncate">
                <span className="font-medium">Real:</span> {latestHourlyControl.actualQuantity}kg
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500 truncate">
              Operador: {latestHourlyControl.operator}
            </div>
          </div>
        ) : (
          <div className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200/70">
            <div className="text-xs text-gray-400 text-center">
              Nenhum controle registrado
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(() => {
              const ui = getStatusUI(product.status)
              return <Badge className={`w-fit text-xs font-medium ${ui.badgeClass}`}>{ui.icon}</Badge>
            })()}
          </div>

          {/* Ações (exceto no estágio finalizado) */}
          {product.currentStage !== 'finalizado' && (
            <div className="flex gap-1 flex-shrink-0">
              {String(product.status).toLowerCase() === 'active' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-amber-700 hover:bg-amber-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPauseProduction(product.id)
                  }}
                  title="Pausar produção"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}

              {String(product.status).toLowerCase() === 'paused' && (
                <Button
                  size="sm"
                  className="h-6 w-6 p-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onResumeProduction(product.id)
                  }}
                  title="Retomar produção"
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}

              {String(product.status).toLowerCase() !== 'blocked' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBlockProduction()
                  }}
                  title="Bloquear produção"
                >
                  <AlertTriangle className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Botão Finalizar sobreposto */}
        {product.currentStage === 'finalizado' && (
          <div className="absolute bottom-2 right-2">
            <Button
              size="sm"
              className="h-7 px-3 py-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleFinalize()
              }}
              title="Finalizar e enviar para Semi-Acabados"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Finalizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const KanbanCard = memo(KanbanCardBase)

