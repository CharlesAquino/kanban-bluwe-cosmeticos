'use client'

import React, { memo, useState } from 'react'
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
  CheckCircle,
  QrCode,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react'
import type { Product, HourlyControl, StageHistory } from '@/lib/types'
import { STAGE_LABELS, EFFICIENCY_STATUS_COLORS, EFFICIENCY_STATUS_LABELS } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import QRCode from 'react-qr-code'

interface KanbanCardProps {
  product: Product
  formatDate: (date: string) => string
  getDuration: (start: string, end: string | null) => string
  getLatestHourlyControl: (product: Product) => HourlyControl | null
  onPauseProduction: (id: string) => void
  onResumeProduction: (id: string) => void
  onBlockProduction: (id: string, reason: string) => void
  onDeleteProduct: (id: string) => void
  onFinalize: (id: string) => void
  modOperatorLabel?: string | null
  finalizingProducts?: Set<string>
}

const KanbanCardBase = ({
  product,
  formatDate,
  getDuration,
  getLatestHourlyControl,
  onPauseProduction,
  onResumeProduction,
  onBlockProduction,
  onDeleteProduct,
  onFinalize,
  modOperatorLabel,
  finalizingProducts,
}: KanbanCardProps) => {
  const productId = (product as any).id ?? (product as any).productId

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [hourlyControlExpanded, setHourlyControlExpanded] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: productId })

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

  const normalizedStage = String(product.currentStage).toUpperCase()
  const isLegacyFinalStage = normalizedStage === 'FINALIZADO'
  const isFinalizableStage = normalizedStage === 'APROVADO' || isLegacyFinalStage

  // Cores por estágio para borda lateral
  const getStageBorderColor = (stage: string) => {
    const stageColors: Record<string, string> = {
      'PRODUCAO_1KG': 'border-blue-400',
      'ANALISE_CQ_PILOTO': 'border-purple-400',
      'PRODUCAO_REATOR': 'border-indigo-400',
      'ANALISE_REATOR': 'border-pink-400',
      'APROVADO': 'border-green-400',
      'FINALIZADO': 'border-slate-400'
    }
    return stageColors[stage] || 'border-slate-300'
  }

  // Calcular progresso baseado na posição do estágio
  const calculateStageProgress = () => {
    const stageOrder = ['PRODUCAO_1KG', 'ANALISE_CQ_PILOTO', 'PRODUCAO_REATOR', 'ANALISE_REATOR', 'APROVADO', 'FINALIZADO']
    const currentIndex = stageOrder.indexOf(normalizedStage)
    if (currentIndex === -1) return 0
    return Math.round(((currentIndex + 1) / stageOrder.length) * 100)
  }

  const stageProgress = calculateStageProgress()

  const getStageBgGradient = (stage: string) => {
    const stageGradients: Record<string, string> = {
      'PRODUCAO_1KG': 'from-blue-50/50 to-white',
      'ANALISE_CQ_PILOTO': 'from-purple-50/50 to-white',
      'PRODUCAO_REATOR': 'from-indigo-50/50 to-white',
      'ANALISE_REATOR': 'from-pink-50/50 to-white',
      'APROVADO': 'from-green-50/50 to-white',
      'FINALIZADO': 'from-slate-50/50 to-white'
    }
    return stageGradients[stage] || 'from-slate-50/50 to-white'
  }

  const handleBlockProduction = () => {
    const reason = prompt('Motivo do bloqueio:', '')
    if (reason) {
      onBlockProduction(productId, reason)
    }
  }

  const handleDeleteProduct = () => {
    if (confirm(`Tem certeza que deseja remover o produto ${product.name}?`)) {
      onDeleteProduct(productId)
    }
  }

  const handleFinalize = () => {
    const confirmed = confirm('Finalizar este produto e enviar para Semi-Acabados?')
    if (confirmed) {
      onFinalize(productId)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative cursor-grab active:cursor-grabbing transition-all duration-300 bg-gradient-to-br ${getStageBgGradient(normalizedStage)} border-l-4 ${getStageBorderColor(normalizedStage)} border-slate-200 rounded-lg ${
        isDragging 
          ? 'shadow-xl ring-2 ring-slate-300 scale-[1.02] opacity-80' 
          : 'shadow-sm hover:shadow-lg hover:-translate-y-1'
      }`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        {/* Cabeçalho do card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-3 w-3 text-slate-500 flex-shrink-0" />
              <h4 className="font-semibold text-slate-900 text-sm leading-tight">
                {product.name}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium">OP:</span>
              <span>{product.op}</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium">Lote:</span>
              <span>{product.batch}</span>
            </div>
            {modOperatorLabel && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span>Responsável: {modOperatorLabel}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex-shrink-0 transition-colors"
                  title="QR Code da OP"
                >
                  <QrCode className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>QR Code da OP {product.op}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center p-4">
                  <QRCode
                    value={`${window.location.origin}/semi-finished-overview`}
                    size={200}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Escaneie para visualizar todos os Semi-Acabados
                </p>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 ml-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteProduct()
              }}
              title="Excluir produto"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Informações principais */}
        <div className="space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <Badge className="w-fit text-xs font-medium bg-slate-100 text-slate-700 ring-1 ring-slate-200 border-0">
              {STAGE_LABELS[product.currentStage]}
            </Badge>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
              <span>{product.quantity.toFixed(1)}</span>
              <span className="text-xs text-slate-500">kg</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Progresso do Estágio</span>
              </div>
              <span className="font-medium">{stageProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-slate-400 to-slate-600 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${stageProgress}%`,
                  minWidth: stageProgress > 0 ? '2px' : '0'
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
            {currentStageInfo?.startTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>Início: {formatDate(currentStageInfo.startTime)}</span>
              </div>
            )}
            
            {currentStageInfo?.mod > 1 && (
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span>MOD: {currentStageInfo.mod} pessoas</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 flex-shrink-0" />
              <span>Duração: {getDuration(currentStageInfo.startTime, currentStageInfo.endTime)}</span>
            </div>
          </div>
        </div>

        {/* Controle hora a hora - Accordion */}
        <div className="mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setHourlyControlExpanded(!hourlyControlExpanded)
            }}
            className="w-full flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200/70 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 text-slate-600" />
              <span className="text-xs font-medium text-slate-700">Controle Hora a Hora</span>
              {latestHourlyControl && (
                <Badge className={`${EFFICIENCY_STATUS_COLORS[latestHourlyControl.status]} w-fit text-[10px] font-medium`}>
                  {latestHourlyControl.efficiency}%
                </Badge>
              )}
            </div>
            {hourlyControlExpanded ? (
              <ChevronUp className="h-3 w-3 text-slate-500" />
            ) : (
              <ChevronDown className="h-3 w-3 text-slate-500" />
            )}
          </button>
          
          {hourlyControlExpanded && (
            <div className="mt-1 p-2 bg-white rounded-lg border border-slate-200/50">
              {latestHourlyControl ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${EFFICIENCY_STATUS_COLORS[latestHourlyControl.status]} w-fit text-xs font-medium`}>
                      {EFFICIENCY_STATUS_LABELS[latestHourlyControl.status]}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <span>{latestHourlyControl.efficiency}%</span>
                      <span className="text-slate-500">eficiência</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="truncate">
                      <span className="font-medium">Meta:</span> {latestHourlyControl.targetQuantity}kg
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Real:</span> {latestHourlyControl.actualQuantity}kg
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 truncate">
                    Operador: {latestHourlyControl.operator}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400 text-center py-2">
                  Nenhum controle registrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(() => {
              const status = String(product.status).toLowerCase()
              if (status === 'active') {
                return (
                  <Badge className="w-fit text-xs font-medium bg-blue-100 text-blue-700 ring-1 ring-blue-200 border-0">
                    <Play className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                )
              } else if (status === 'paused') {
                return (
                  <Badge className="w-fit text-xs font-medium bg-amber-100 text-amber-700 ring-1 ring-amber-200 border-0">
                    <Pause className="h-3 w-3 mr-1" />
                    Pausado
                  </Badge>
                )
              } else if (status === 'blocked') {
                return (
                  <Badge className="w-fit text-xs font-medium bg-red-100 text-red-700 ring-1 ring-red-200 border-0">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Bloqueado
                  </Badge>
                )
              } else if (status === 'completed') {
                return (
                  <Badge className="w-fit text-xs font-medium bg-green-100 text-green-700 ring-1 ring-green-200 border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )
              }
              return (
                <Badge className="w-fit text-xs font-medium bg-slate-100 text-slate-700 ring-1 ring-slate-200 border-0">
                  {product.status}
                </Badge>
              )
            })()}
          </div>

          {/* Ações (exceto no estágio FINALIZADO legado) */}
          {!isLegacyFinalStage && (
            <div className="flex gap-1 flex-shrink-0">
              {String(product.status).toLowerCase() === 'active' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-50 transition-colors"
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
                  className="h-6 w-6 p-0 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
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
                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 transition-colors"
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

        {/* Botão Finalizar sobreposto (estágio APROVADO ou FINALIZADO legado) */}
        {isFinalizableStage && (
          <div className="absolute bottom-2 right-2">
            <Button
              size="sm"
              className="h-7 px-3 py-0 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation()
                handleFinalize()
              }}
              disabled={finalizingProducts?.has(productId)}
              title="Finalizar e enviar para Semi-Acabados"
            >
              {finalizingProducts?.has(productId) ? (
                <>
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Finalizar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const KanbanCard = memo(KanbanCardBase)

