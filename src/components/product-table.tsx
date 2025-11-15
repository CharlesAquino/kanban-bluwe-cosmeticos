'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Play, Pause, CheckCircle } from 'lucide-react'
import type { Product, ProductStage, HourlyControl } from '@/lib/types'
import { STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from '@/lib/types'
import { KanbanColumn } from './kanban-column'
import { Carousel } from '@/components/ui/carousel'

interface ProductTableProps {
  products: Product[]
  onAdvanceStage: (id: string, nextStage: ProductStage, mod: number) => void
  onPauseProduction: (id: string) => void
  onResumeProduction: (id: string) => void
  onBlockProduction: (id: string, reason: string) => void
  onDeleteProduct: (id: string) => void
}

export function ProductTable({
  products,
  onAdvanceStage,
  onPauseProduction,
  onResumeProduction,
  onBlockProduction,
  onDeleteProduct
}: ProductTableProps) {
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDuration = (start: string, end: string | null) => {
    if (!start) return '-'
    if (!end) return 'Em andamento'

    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getLatestHourlyControl = (product: Product): HourlyControl | null => {
    return product.hourlyControls && product.hourlyControls.length > 0
      ? product.hourlyControls[0]
      : null
  }

  const getProductsByStage = (stage: ProductStage) => {
    const filtered = products.filter(product => product.currentStage === stage)
    return filtered
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const product = products.find(p => p.id === active.id)
    if (product) {
      setDraggedProduct(product)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setDraggedProduct(null)
      return
    }

    const productId = active.id as string
    const newStage = over.id as ProductStage

    // Verificar se o novo estágio é válido
    const currentProduct = products.find(p => p.id === productId)
    if (!currentProduct) {
      setDraggedProduct(null)
      return
    }

    const currentIndex = STAGE_ORDER.indexOf(currentProduct.currentStage)
    const newIndex = STAGE_ORDER.indexOf(newStage)

    // Só permitir mover para frente ou para o estágio atual
    if (newIndex <= currentIndex && newStage !== currentProduct.currentStage) {
      alert('Não é possível mover o produto para um estágio anterior!')
      setDraggedProduct(null)
      return
    }

    // Avançar para o próximo estágio
    if (newStage !== currentProduct.currentStage) {
      const modInput = prompt('Quantas pessoas trabalharam neste estágio? (1 ou -1)', '1')
      if (modInput) {
        const mod = Number(modInput)
        if (!isNaN(mod) && (mod === 1 || mod === -1)) {
          onAdvanceStage(productId, newStage, mod)
        } else {
          alert('Valor inválido! Deve ser 1 ou -1.')
        }
      }
    }

    setDraggedProduct(null)
  }

  if (products.length === 0) {
    return (
      <Card className="card-modern animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Use o formulário acima para adicionar produtos e começar a acompanhar a produção.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl text-slate-900">
            <span className="inline-flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-50 ring-1 ring-slate-200">
                <Package className="h-5 w-5 text-slate-600" />
              </div>
              Kanban de Produção
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Fluxo em tempo real</span>
          </CardTitle>
          <p className="text-slate-600 mt-1 text-sm">
            Arraste os produtos entre as colunas para avançar os estágios de produção
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-600">Total de Produtos</div>
                <div className="h-7 w-7 rounded-md bg-slate-100 grid place-items-center">
                  <Package className="h-3.5 w-3.5 text-slate-700" />
                </div>
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{products.length}</div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-blue-50 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-600">Em Andamento</div>
                <div className="h-7 w-7 rounded-md bg-blue-100 grid place-items-center">
                  <Play className="h-3.5 w-3.5 text-blue-700" />
                </div>
              </div>
              <div className="mt-1 text-2xl font-semibold text-blue-700">{products.filter(p => p.status === 'active').length}</div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-amber-50 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-600">Pausados</div>
                <div className="h-7 w-7 rounded-md bg-amber-100 grid place-items-center">
                  <Pause className="h-3.5 w-3.5 text-amber-700" />
                </div>
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-800">{products.filter(p => p.status === 'paused').length}</div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-emerald-50 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-600">Concluídos</div>
                <div className="h-7 w-7 rounded-md bg-emerald-100 grid place-items-center">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                </div>
              </div>
              <div className="mt-1 text-2xl font-semibold text-emerald-700">{products.filter(p => p.status === 'completed').length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Board com rolagem horizontal e colunas proporcionais */}
        <div className="w-full overflow-x-auto">
          <div
            className="grid grid-flow-col auto-cols-[15rem] sm:auto-cols-[16rem] gap-3 pr-2"
          >
            {STAGE_ORDER.map((stage) => {
              const stageProducts = getProductsByStage(stage)
              const stageLabel = STAGE_LABELS[stage]
              const stageColor = STAGE_COLORS[stage]

              return (
                <KanbanColumn
                  key={stage}
                  id={stage}
                  title={stageLabel}
                  color={stageColor}
                  products={stageProducts}
                  formatDate={formatDate}
                  getDuration={getDuration}
                  getLatestHourlyControl={getLatestHourlyControl}
                  onPauseProduction={onPauseProduction}
                  onResumeProduction={onResumeProduction}
                  onBlockProduction={onBlockProduction}
                  onDeleteProduct={onDeleteProduct}
                />
              )
            })}
          </div>
        </div>

        <DragOverlay>
          {draggedProduct ? (
            <Card className="w-80 shadow-xl border-2 border-blue-500 rotate-3 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 ${STAGE_COLORS[draggedProduct.currentStage]} rounded-lg`}>
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{draggedProduct.name}</h4>
                    <p className="text-sm text-gray-500">OP: {draggedProduct.op}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={`${STAGE_COLORS[draggedProduct.currentStage]} w-fit`}>
                    {STAGE_LABELS[draggedProduct.currentStage]}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    {draggedProduct.quantity.toFixed(2)} kg
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Estatísticas por estágio (Carousel) */}
      <Carousel className="carousel-center">
        {STAGE_ORDER.map((stage) => {
          const count = getProductsByStage(stage).length
          return (
            <div
              key={`stats-${stage}`}
              className="min-w-[12rem] sm:min-w-[13rem] md:min-w-[14rem]"
            >
              <Card className="text-center h-28 md:h-32 bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-3 flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-1 md:gap-1.5">
                    <div className="inline-flex p-2 rounded-md bg-slate-50">
                      <Package className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="text-2xl md:text-3xl font-semibold text-slate-900 leading-none">{count}</div>
                    <div className="text-[11px] md:text-xs text-slate-600 truncate max-w-[10rem]">
                      {STAGE_LABELS[stage]}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </Carousel>
    </div>
  )
}
