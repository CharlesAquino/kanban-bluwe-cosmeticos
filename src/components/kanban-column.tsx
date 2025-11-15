'use client'

import React, { memo } from 'react'
import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import type { Product, ProductStage, HourlyControl } from '@/lib/types'
import { KanbanCard } from './kanban-card'
import { useVirtualizer } from '@tanstack/react-virtual'
// Mantido sem constantes específicas de cor para um visual mais neutro

interface KanbanColumnProps {
  id: ProductStage
  title: string
  color: string
  products: Product[]
  formatDate: (date: string) => string
  getDuration: (start: string, end: string | null) => string
  getLatestHourlyControl: (product: Product) => HourlyControl | null
  onPauseProduction: (id: string) => void
  onResumeProduction: (id: string) => void
  onBlockProduction: (id: string, reason: string) => void
  onDeleteProduct: (id: string) => void
}

export const KanbanColumn = memo(KanbanColumnBase)


/**
 * Componente de coluna Kanban aplicando clean code:
 * - Single Responsibility: Representa uma coluna do Kanban
 * - Props Interface: Tipagem clara das props
 * - Custom Hooks: Usa useDroppable adequadamente
 * - Performance: Memoização quando necessário
 */
function KanbanColumnBase({
  id,
  title,
  color: _color,
  products,
  formatDate,
  getDuration,
  getLatestHourlyControl,
  onPauseProduction,
  onResumeProduction,
  onBlockProduction,
  onDeleteProduct
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  const parentRef = useRef<HTMLDivElement>(null)

  /**
   * Obtém cores específicas por estágio aplicando clean code:
   * - Constant Object: Dados centralizados
   * - Type Safety: Tipagem do retorno
   * - Default Value: Fallback para casos não mapeados
   */
  // Mantido para referência futura de cores por estágio, caso necessário

  /**
   * Agrupa produtos por status aplicando clean code:
   * - Functional Programming: Usa filter e reduce
   * - Immutable: Não modifica array original
   * - Type Safety: Retorna objeto tipado
   */
  const productsByStatus = products.reduce(
    (acc, product) => {
      const key = String(product.status).toLowerCase()
      acc[key] = acc[key] || []
      acc[key].push(product)
      return acc
    },
    {} as Record<string, Product[]>
  )

  // Componente virtualizado para grandes grupos de produtos
  const VirtualizedProductGroup = ({ status, icon, label, bgColor }: {
    status: string
    icon: string
    label: string
    bgColor: string
  }) => {
    const statusProducts = productsByStatus[status]
    const parentRef = useRef<HTMLDivElement>(null)

    // Sempre inicializar o hook, mesmo que não seja usado
    const rowVirtualizer = useVirtualizer({
      count: statusProducts?.length || 0,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 92,
      measureElement: (el) => el.getBoundingClientRect().height,
      getItemKey: (index) => statusProducts?.[index]?.id || `item-${index}`,
    })

    if (!statusProducts || statusProducts.length === 0) {
      return null
    }

    // Virtualize large groups to reduce DOM nodes
    const shouldVirtualize = statusProducts.length > 50

    if (!shouldVirtualize) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            {icon && <span>{icon}</span>}
            {label} ({statusProducts.length})
          </div>
          {statusProducts.map((product) => (
            <KanbanCard
              key={product.id}
              product={product}
              formatDate={formatDate}
              getDuration={getDuration}
              getLatestHourlyControl={getLatestHourlyControl}
              onPauseProduction={onPauseProduction}
              onResumeProduction={onResumeProduction}
              onBlockProduction={onBlockProduction}
              onDeleteProduct={onDeleteProduct}
            />
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
          {icon && <span>{icon}</span>}
          {label} ({statusProducts.length})
        </div>
        <div
          className="space-y-3 min-h-[260px] p-2 rounded-md bg-slate-50 border border-slate-200/60 overflow-y-auto"
        >
          <div
            className="virtual-container"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const product = statusProducts[virtualItem.index]
              return (
                <div
                  key={product.id}
                  className="virtual-item"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <KanbanCard
                    product={product}
                    formatDate={formatDate}
                    getDuration={getDuration}
                    getLatestHourlyControl={getLatestHourlyControl}
                    onPauseProduction={onPauseProduction}
                    onResumeProduction={onResumeProduction}
                    onBlockProduction={onBlockProduction}
                    onDeleteProduct={onDeleteProduct}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Render não virtualizado para grupos pequenos
  const renderProductGroup = (status: string, icon: string, label: string, bgColor: string) => {
    const statusProducts = productsByStatus[status]

    if (!statusProducts || statusProducts.length === 0) {
      return null
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
          {icon && <span>{icon}</span>}
          {label} ({statusProducts.length})
        </div>
        {statusProducts.map((product) => (
          <KanbanCard
            key={product.id}
            product={product}
            formatDate={formatDate}
            getDuration={getDuration}
            getLatestHourlyControl={getLatestHourlyControl}
            onPauseProduction={onPauseProduction}
            onResumeProduction={onResumeProduction}
            onBlockProduction={onBlockProduction}
            onDeleteProduct={onDeleteProduct}
          />
        ))}
      </div>
    )
  }

  return (
    <Card className="h-full min-h-[400px] bg-white border border-slate-200 rounded-lg shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-md bg-slate-50">
              <Package className="h-4 w-4 text-slate-600" />
            </div>
            <span className="text-sm font-semibold text-slate-800 truncate" title={title}>{title}</span>
          </div>
          <Badge className="inline-flex items-center gap-1 h-5 px-2 text-[11px] bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            <Package className="h-3 w-3 opacity-70" />
            {products.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div
          ref={(el) => {
            setNodeRef(el)
            // Parent scroll container used by virtualizer
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(parentRef as any).current = el as HTMLDivElement
          }}
          className="space-y-3 min-h-[260px] p-2 rounded-md bg-slate-50 border border-slate-200/60 overflow-y-auto"
        >
          <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {renderProductGroup('active', '', 'Em Andamento', 'text-blue-700 bg-blue-100')}
            {renderProductGroup('paused', '', 'Pausados', 'text-slate-700 bg-slate-100')}
            {renderProductGroup('blocked', '', 'Bloqueados', 'text-red-700 bg-red-100')}
            {renderProductGroup('completed', '', 'Concluídos', 'text-green-700 bg-green-100')}

            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Package className="h-6 w-6 mb-2 opacity-60" />
                <p className="text-xs">Nenhum produto</p>
              </div>
            )}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  )
}
