"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProductForm } from '@/components/product-form'
import { ProductTable } from '@/components/product-table'
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
import { BarChart3, Package, Beaker, Settings, ChevronDown, Users, Shield } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { usePathname } from 'next/navigation'

export default function Home() {
  const { showToast } = useToast()
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [modOperators, setModOperators] = useState<{ id: string; name: string; role?: string | null; isActive?: boolean }[]>([])
  const [finalizingProducts, setFinalizingProducts] = useState<Set<string>>(new Set())
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false)

  // Detectar tipo de página para navegação contextual
  const isAdminPage = pathname.startsWith('/admin')
  const isHomePage = pathname === '/'
  const overviewRoutes = [
    '/',
    '/dashboard',
    '/hourly-control',
    '/analise-operador',
    '/quality',
    '/kanban-overview',
    '/semi-finished-overview',
  ] as const
  const isOverviewPage = overviewRoutes.includes(pathname as (typeof overviewRoutes)[number])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Força atualização sem cache para garantir produtos finalizados sejam removidos
      const { products } = await loadProductsAndStats()
      setProducts(products)
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    // Prevenir múltiplas finalizações do mesmo produto
    if (finalizingProducts.has(productId)) {
      return
    }

    try {
      // Adicionar produto ao conjunto de finalizações em andamento
      setFinalizingProducts(prev => new Set(prev).add(productId))
      
      // Atualização otimista: remover produto imediatamente do estado local
      setProducts(prev => prev.filter(p => p.id !== productId))
      showToast('Finalizando produto...', 'info')
      
      const res = await finalizeProduct(productId)
      if (!res.success) {
        // Se falhar, restaurar o produto no estado local
        const productToRestore = products.find(p => p.id === productId)
        if (productToRestore) {
          setProducts(prev => [...prev, productToRestore])
        }
        throw new Error(res.error || 'Falha ao finalizar')
      }
      
      // Força recarga completa para garantir sincronia
      await fetchData()
      showToast('Produto finalizado e enviado para Semi-Acabados', 'success')
    } catch (e) {
      showToast(`Erro ao finalizar: ${e instanceof Error ? e.message : 'desconhecido'}`, 'error')
    } finally {
      // Remover produto do conjunto de finalizações em andamento
      setFinalizingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const header = useMemo(() => (
    <header className={`transition-all duration-300 ${
      isScrolled 
        ? 'fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm' 
        : 'relative z-10 bg-white/70 backdrop-blur-xl border border-slate-200'
    }`}>
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white grid place-items-center font-bold text-lg shadow-lg shadow-slate-500/30">
                K
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Kanban de Insumos
              </h1>
              <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Sistema de Produção</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            {/* Navegação Contextual baseada na página */}
            {isAdminPage && (
              /* Páginas Admin: apenas navegação entre páginas Admin */
              <>
                <Link
                  href="/admin/quality"
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-600 bg-slate-600 text-white shadow-sm hover:border-slate-700 hover:bg-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                  <Beaker className="h-4 w-4" />
                  <span>Qualidade</span>
                </Link>
                <Link
                  href="/admin/mod"
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>MOD</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </>
            )}
            
            {isHomePage && (
              /* Home: dropdown Overview com todas as rotas de monitoramento */
              <div className="relative z-50">
                <button
                  onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${dashboardDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dashboardDropdownOpen && (
                  // Dropdown posicionado ao lado do botão Overview
                  <div className="fixed right-72 top-20 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999999]">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Dashboard</span>
                        <span className="text-xs text-slate-500">Indicadores em tempo real</span>
                      </div>
                    </Link>
                    <Link
                      href="/hourly-control"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Hora a Hora</span>
                        <span className="text-xs text-slate-500">Controle horário</span>
                      </div>
                    </Link>
                    <Link
                      href="/analise-operador"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      <Users className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">MOD</span>
                        <span className="text-xs text-slate-500">Análise por operador</span>
                      </div>
                    </Link>
                    <Link
                      href="/quality"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      <Beaker className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Qualidade</span>
                        <span className="text-xs text-slate-500">Monitoramento CQ</span>
                      </div>
                    </Link>
                    <Link
                      href="/kanban-overview"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Produção</span>
                        <span className="text-xs text-slate-500">Visão de produção</span>
                      </div>
                    </Link>
                    <Link
                      href="/semi-finished-overview"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      <Package className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Semi acabados</span>
                        <span className="text-xs text-slate-500">Visão geral semi-acabados</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {isOverviewPage && (
              /* Overview pages: botão Admin com z-index corrigido */
              <div className="relative z-50">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {adminDropdownOpen && (
                  <div className="fixed right-6 top-20 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999999]">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Admin Home</span>
                        <span className="text-xs text-slate-500">Painel administrativo</span>
                      </div>
                    </Link>
                    <Link
                      href="/admin/quality"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Beaker className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Qualidade Admin</span>
                        <span className="text-xs text-slate-500">Controle de qualidade</span>
                      </div>
                    </Link>
                    <Link
                      href="/admin/mod"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Users className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">MOD Admin</span>
                        <span className="text-xs text-slate-500">Operadores</span>
                      </div>
                    </Link>
                    <Link
                      href="/semi-finished"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <Package className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Semi-acabados Admin</span>
                        <span className="text-xs text-slate-500">Categorias de semi-acabados</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  ), [isScrolled, adminDropdownOpen, dashboardDropdownOpen, isAdminPage, isHomePage, isOverviewPage])

  return (
    <div className="min-h-screen bg-slate-50">
      {header}
      
      <main className="w-full px-6 py-8">
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
          <div className="space-y-6">
            {/* Formulário: ocupa a largura total */}
            <section>
              <div className="rounded-2xl p-6 shadow-smooth hover-lift bg-white/70 backdrop-blur-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg grid place-items-center bg-slate-600">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Novo Produto</h3>
                </div>
                <ProductForm onProductCreated={fetchData} />
              </div>
            </section>

            {/* Produtos em Produção: largura total, abaixo do formulário */}
            <section>
              <div className="rounded-2xl p-6 shadow-smooth hover-lift bg-white/70 backdrop-blur-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-slate-600 rounded-lg grid place-items-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Produtos em Produção</h3>
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
                  finalizingProducts={finalizingProducts}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
