"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dashboard, DashboardStats } from '@/components/dashboard'
import { ProductForm } from '@/components/product-form'
import { ProductTable } from '@/components/product-table'
import { TimelineComponent } from '@/components/timeline'
import {
  loadProductsAndStats,
  advanceProductStage,
  pauseProduct,
  resumeProduct,
  blockProduct,
  deleteProduct,
  finalizeProduct,
} from '@/lib/product-operations'
import type { Product, ProductStage } from '@/lib/types'
import { BarChart3, Package, Clock } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

export default function Home() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    inProgress: 0,
    paused: 0,
    completed: 0,
    blocked: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showTimeline, setShowTimeline] = useState(false)
  const [modOperators, setModOperators] = useState<{ id: string; name: string; role?: string | null; isActive?: boolean }[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { products, stats } = await loadProductsAndStats()
      setProducts(products)
      setStats(stats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadOperators = async () => {
      try {
        const res = await fetch('/api/mod/operators')
        if (!res.ok) return
        const json = await res.json()
        if (json?.success && Array.isArray(json.data)) {
          setModOperators(json.data)
        }
      } catch {
        // falha silenciosa, Home continua funcionando sem operadores
      }
    }
    loadOperators()
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdvance = async (productId: string, nextStage: ProductStage, mod: number) => {
    try {
      const res = await advanceProductStage({ productId, nextStage, mod })
      if (!res.success) throw new Error(res.error || 'Falha ao avançar')
      showToast('Estágio avançado com sucesso', 'success')
      await fetchData()
    } catch (e) {
      showToast(`Erro ao avançar: ${e instanceof Error ? e.message : 'desconhecido'}`, 'error')
    }
  }

  const handlePause = async (productId: string) => {
    try {
      const res = await pauseProduct(productId)
      if (!res.success) throw new Error(res.error || 'Falha ao pausar')
      showToast('Produção pausada', 'info')
      await fetchData()
    } catch (e) {
      showToast(`Erro ao pausar: ${e instanceof Error ? e.message : 'desconhecido'}`, 'error')
    }
  }

  const handleResume = async (productId: string) => {
    try {
      const res = await resumeProduct(productId)
      if (!res.success) throw new Error(res.error || 'Falha ao retomar')
      showToast('Produção retomada', 'success')
      await fetchData()
    } catch (e) {
      showToast(`Erro ao retomar: ${e instanceof Error ? e.message : 'desconhecido'}`, 'error')
    }
  }

  const handleBlock = async (productId: string, reason: string) => {
    try {
      const res = await blockProduct({ productId, reason })
      if (!res.success) throw new Error(res.error || 'Falha ao bloquear')
      showToast('Produção bloqueada', 'info')
      await fetchData()
    } catch (e) {
      showToast(`Erro ao bloquear: ${e instanceof Error ? e.message : 'desconhecido'}`, 'error')
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      const res = await deleteProduct(productId)
      if (!res.success) throw new Error(res.error || 'Falha ao excluir')
      showToast('Produto excluído', 'success')
      await fetchData()
    } catch (e) {
      showToast(`Erro ao excluir: ${e instanceof Error ? e.message : 'desconhecido'}`, 'error')
    }
  }

  const handleFinalize = async (productId: string) => {
    try {
      const res = await finalizeProduct(productId)
      if (!res.success) throw new Error(res.error || 'Falha ao finalizar')
      showToast('Produto finalizado e enviado para Semi-Acabados', 'success')
      await fetchData()
    } catch (e) {
      showToast(`Erro ao finalizar: ${e instanceof Error ? e.message : 'desconhecido'}`, 'error')
    }
  }

  const header = useMemo(() => (
    <header className="bg-white/70 backdrop-blur-xl border border-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-blue-800 text-white grid place-items-center font-bold text-lg shadow-lg">
                K
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Kanban de Insumos
              </h1>
              <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Sistema de Produção</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-3">
            {/* Abas de navegação (ambiente administrativo) */}
            <Link
              href="/"
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-900 bg-slate-900 text-slate-50 shadow-sm hover:border-blue-500 hover:bg-slate-950 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
            >
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-blue-300" />
              <span>Produção Admin</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-800 bg-slate-800/90 text-slate-100 hover:border-blue-500 hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/quality"
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-800 bg-slate-800/90 text-slate-100 hover:border-blue-500 hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>Qualidade Admin</span>
            </Link>
            <Link
              href="/admin/mod"
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-800 bg-slate-800/90 text-slate-100 hover:border-blue-500 hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>MOD Admin</span>
            </Link>
            <Link
              href="/semi-finished"
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-800 bg-slate-800/90 text-slate-100 hover:border-blue-500 hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>Semi-Acabados</span>
            </Link>
            <button
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover-lift ${
                showTimeline 
                  ? 'bg-blue-800 text-white shadow-lg hover:bg-blue-700' 
                  : 'bg-white/70 backdrop-blur-xl border border-slate-200 text-slate-700 hover:bg-white/80'
              }`}
              onClick={() => setShowTimeline((v) => !v)}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Timeline
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                Online
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  ), [showTimeline])

  return (
    <div className="min-h-screen bg-slate-50">
      {header}
      
      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="space-y-8">
            {/* Skeleton Dashboard */}
            <section className="mb-12">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            </section>

            {/* Skeleton Form */}
            <section>
              <div className="rounded-3xl p-8 border border-slate-200 bg-white">
                <div className="h-6 w-48 bg-slate-200 rounded-md mb-6 animate-pulse" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-200 rounded-md animate-pulse" />
                  ))}
                </div>
              </div>
            </section>

            {/* Skeleton Kanban */}
            <section>
              <div className="rounded-3xl p-8 border border-slate-200 bg-white">
                <div className="h-6 w-64 bg-slate-200 rounded-md mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-72 bg-slate-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center py-8">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Visão Geral da Produção
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Monitore e gerencie todos os produtos em tempo real com nosso sistema inteligente
              </p>
            </section>

            {/* Dashboard Stats */}
            <section className="mb-12">
              <Dashboard stats={stats} />
            </section>

            {/* Timeline (conditional) */}
            {showTimeline && (
              <section className="rounded-3xl p-8 shadow-smooth hover-lift bg-white/70 backdrop-blur-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-slate-700 rounded-xl grid place-items-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Timeline de Produção</h3>
                </div>
                <TimelineComponent
                  history={[]}
                  onExport={() => {}}
                />
              </section>
            )}

            {/* Formulário: ocupa a largura total */}
            <section>
              <div className="rounded-3xl p-8 shadow-smooth hover-lift bg-white/70 backdrop-blur-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl grid place-items-center bg-blue-800">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Novo Produto</h3>
                </div>
                <ProductForm onProductCreated={fetchData} />
              </div>
            </section>

            {/* Produtos em Produção: largura total, abaixo do formulário */}
            <section>
              <div className="rounded-3xl p-8 shadow-smooth hover-lift bg-white/70 backdrop-blur-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-slate-700 rounded-xl grid place-items-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Produtos em Produção</h3>
                </div>
                <ProductTable
                  products={products}
                  onAdvanceStage={handleAdvance}
                  onPauseProduction={handlePause}
                  onResumeProduction={handleResume}
                  onBlockProduction={handleBlock}
                  onDeleteProduct={handleDelete}
                  onFinalizeProduct={handleFinalize}
                  modOperators={modOperators}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
