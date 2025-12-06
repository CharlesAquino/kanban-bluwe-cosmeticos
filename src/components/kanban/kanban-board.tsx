'use client'

import { useState } from 'react'
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Play, Pause, CheckCircle, TrendingUp } from 'lucide-react'
import type { Product, ProductStage, HourlyControl } from '@/lib/types'
import { STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from '@/lib/types'
import { KanbanColumn } from './kanban-column' // Sibling in src/components/kanban
import { ProductEditDialog } from '../product-edit-dialog' // Parent in src/components
import { Carousel } from '@/components/ui/carousel'

interface KanbanBoardProps {
    products: Product[]
    onAdvanceStage: (id: string, nextStage: ProductStage, mod: number) => void
    onPauseProduction: (id: string) => void
    onResumeProduction: (id: string) => void
    onBlockProduction: (id: string, reason: string) => void
    onDeleteProduct: (id: string) => void
    onFinalizeProduct: (id: string) => void
    modOperators?: { id: string; name: string; role?: string | null; isActive?: boolean }[]
    finalizingProducts?: Set<string>
    onProductUpdated?: () => void
}

export function KanbanBoard({
    products,
    onAdvanceStage,
    onPauseProduction,
    onResumeProduction,
    onBlockProduction,
    onDeleteProduct,
    onFinalizeProduct,
    modOperators,
    finalizingProducts,
    onProductUpdated,
}: KanbanBoardProps) {
    const [draggedProduct, setDraggedProduct] = useState<Product | null>(null)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    // Estágios visíveis no board (oculta Backlog e Rejeitado apenas na UI)
    const VISIBLE_STAGES = STAGE_ORDER.filter(
        (stage) => stage !== 'BACKLOG' && stage !== 'REJEITADO'
    )

    const sensors = useSensors(
        // Mouse / pointer (desktop)
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        // Toque (mobile/tablet)
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5,
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

    const handleEditProduct = (id: string) => {
        const product = products.find((p) => p.id === id)
        if (product) {
            setEditingProduct(product)
        }
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
        const filtered = products.filter(product => {
            const currentStage = String(product.currentStage).toUpperCase() as ProductStage
            return currentStage === stage
        })
        return filtered
    }

    const getModOperatorLabel = (product: Product): string | null => {
        if (!product.createdById || !modOperators || modOperators.length === 0) return null
        const op = modOperators.find((o) => o.id === product.createdById)
        if (!op) return null
        return op.role ? `${op.name} (${op.role})` : op.name
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

        const currentStageNormalized = String(currentProduct.currentStage).toUpperCase() as ProductStage
        const currentIndex = STAGE_ORDER.indexOf(currentStageNormalized)
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
            <Card className="card-modern animate-fade-in bg-white/50 backdrop-blur-sm border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">
                        Nenhum produto em produção
                    </h3>
                    <p className="text-slate-500 text-center max-w-md">
                        Adicione novos produtos através do formulário para iniciar o fluxo.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header com estatísticas */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-xl text-slate-900">
                        <span className="inline-flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                Kanban Board
                            </span>
                        </span>
                        <Badge variant="outline" className="font-normal text-slate-500 gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Ao vivo
                        </Badge>
                    </CardTitle>
                    <p className="text-slate-500 mt-1 text-sm pl-12">
                        Gerencie o fluxo de produção arrastando os cards entre as colunas
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm group hover:shadow-md transition-all duration-300">
                            <div className="absolute right-0 top-0 h-16 w-16 -mr-4 -mt-4 rounded-full bg-slate-50 opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</div>
                                <Package className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="mt-2 text-3xl font-bold text-slate-700">{products.length}</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-blue-50/30 p-4 shadow-sm group hover:shadow-md transition-all duration-300">
                            <div className="absolute right-0 top-0 h-16 w-16 -mr-4 -mt-4 rounded-full bg-blue-100 opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Em Andamento</div>
                                <Play className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="mt-2 text-3xl font-bold text-blue-700">
                                {products.filter(p => String(p.status).toUpperCase() === 'ACTIVE').length}
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-amber-100 bg-amber-50/30 p-4 shadow-sm group hover:shadow-md transition-all duration-300">
                            <div className="absolute right-0 top-0 h-16 w-16 -mr-4 -mt-4 rounded-full bg-amber-100 opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pausados</div>
                                <Pause className="h-4 w-4 text-amber-500" />
                            </div>
                            <div className="mt-2 text-3xl font-bold text-amber-700">
                                {products.filter(p => String(p.status).toUpperCase() === 'PAUSED').length}
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-sm group hover:shadow-md transition-all duration-300">
                            <div className="absolute right-0 top-0 h-16 w-16 -mr-4 -mt-4 rounded-full bg-emerald-100 opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Concluídos</div>
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="mt-2 text-3xl font-bold text-emerald-700">
                                {products.filter(p => String(p.status).toUpperCase() === 'COMPLETED').length}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="w-full overflow-x-auto pb-4">
                    <div className="grid grid-cols-5 gap-4 min-w-[1200px] xl:min-w-full items-stretch min-h-[600px]">
                        {VISIBLE_STAGES.map((stage) => {
                            const stageProducts = getProductsByStage(stage)
                            const stageLabel = STAGE_LABELS[stage]
                            const stageColor = STAGE_COLORS[stage]

                            return (
                                <div key={stage} className="h-full">
                                    <KanbanColumn
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
                                        onFinalizeProduct={onFinalizeProduct}
                                        onEditProduct={handleEditProduct}
                                        getModOperatorLabel={getModOperatorLabel}
                                        finalizingProducts={finalizingProducts}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>

                <DragOverlay>
                    {draggedProduct ? (
                        <Card className="w-80 shadow-2xl border-2 border-indigo-400 rotate-2 bg-gradient-to-br from-white to-indigo-50/50 backdrop-blur-md scale-105 opacity-90 cursor-grabbing">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-3 ${String(draggedProduct.currentStage).toUpperCase() === 'PRODUCAO_1KG' ? 'bg-blue-500' :
                                            String(draggedProduct.currentStage).toUpperCase() === 'ANALISE_CQ_PILOTO' ? 'bg-purple-500' :
                                                String(draggedProduct.currentStage).toUpperCase() === 'PRODUCAO_REATOR' ? 'bg-indigo-500' :
                                                    String(draggedProduct.currentStage).toUpperCase() === 'ANALISE_REATOR' ? 'bg-pink-500' :
                                                        String(draggedProduct.currentStage).toUpperCase() === 'APROVADO' ? 'bg-green-500' :
                                                            'bg-slate-500'
                                        } rounded-lg shadow-lg`}>
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{draggedProduct.name}</h4>
                                        <p className="text-xs text-slate-600 truncate">{draggedProduct.op} • {draggedProduct.batch}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                                        <span className="font-semibold bg-slate-100 px-1.5 py-0.5 rounded">{draggedProduct.quantity}kg</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-slate-100 text-slate-700 text-xs border-slate-200">
                                        {STAGE_LABELS[draggedProduct.currentStage]}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                                        <span>Movendo...</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <ProductEditDialog
                product={editingProduct}
                open={!!editingProduct}
                onOpenChange={(open) => {
                    if (!open) setEditingProduct(null)
                }}
                onSaved={() => {
                    if (onProductUpdated) {
                        onProductUpdated()
                    }
                }}
            />
        </div>
    )
}
