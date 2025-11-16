'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SkeletonCard } from '@/components/skeletons'
import { Activity, Target, BarChart3, RefreshCw, Package, Settings, ChevronDown, Shield, Users, Beaker } from 'lucide-react'
import { loadProductsAndStats } from '@/lib/product-operations'
import Link from 'next/link'

interface KanbanStats {
  total: number
  inProgress: number
  paused: number
  completed: number
  blocked: number
}

interface SemiOverview {
  items: number
  inQuarantine: number
  saldoTotalKg: number
}

interface QualityOverview {
  totalTests: number
  rejectedTests: number
  openNCs: number
  approvalRate: number
}

interface DashboardMetrics {
  kanban: KanbanStats
  semi: SemiOverview
  quality: QualityOverview
}

export default function DashboardPage() {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegratedData()
  }, [])

  const loadIntegratedData = async () => {
    try {
      setLoading(true)

      // Kanban (produtos em produção)
      const { stats: kanbanStats } = await loadProductsAndStats()

      // Semi-acabados
      const semiRes = await fetch('/api/semi-finished', { cache: 'no-store' })
      let semiItems: Array<{ quantity_total: number; quantity_envasado: number }> = []
      if (semiRes.ok) {
        const json = await semiRes.json()
        semiItems = Array.isArray(json?.data) ? json.data : []
      }

      const semi: SemiOverview = {
        items: semiItems.length,
        inQuarantine: semiItems.filter((it) => Number(it.quantity_envasado) > 0).length,
        saldoTotalKg: semiItems.reduce(
          (acc, it) => acc + (Number(it.quantity_total) - Number(it.quantity_envasado)),
          0
        ),
      }

      // Qualidade (testes e NCs)
      const [testsRes, ncRes] = await Promise.all([
        fetch('/api/quality/tests', { cache: 'no-store' }),
        fetch('/api/quality/nc', { cache: 'no-store' }),
      ])

      let tests: { approved: boolean }[] = []
      if (testsRes.ok) {
        const json = await testsRes.json()
        tests = Array.isArray(json?.data) ? json.data : []
      }

      let ncs: { status: string }[] = []
      if (ncRes.ok) {
        const json = await ncRes.json()
        ncs = Array.isArray(json?.data) ? json.data : []
      }

      const totalTests = tests.length
      const rejectedTests = tests.filter((t) => !t.approved).length
      const openNCs = ncs.filter((nc) => nc.status !== 'closed').length
      const approvalRate =
        totalTests > 0 ? ((totalTests - rejectedTests) / totalTests) * 100 : 100

      const kanban: KanbanStats = {
        total: kanbanStats.total,
        inProgress: kanbanStats.inProgress,
        paused: kanbanStats.paused,
        completed: kanbanStats.completed,
        blocked: kanbanStats.blocked,
      }

      setMetrics({
        kanban,
        semi,
        quality: { totalTests, rejectedTests, openNCs, approvalRate },
      })
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getOverallHealthScore = () => {
    if (!metrics) return 0

    const completionRate =
      metrics.kanban.total > 0 ? metrics.kanban.completed / metrics.kanban.total : 0
    const qualityScore = metrics.quality.approvalRate / 100
    const quarantinePenalty =
      metrics.semi.items > 0 ? metrics.semi.inQuarantine / metrics.semi.items : 0

    const score = 0.4 * completionRate + 0.4 * qualityScore + 0.2 * (1 - quarantinePenalty)
    return Math.round(score * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  const healthScore = getOverallHealthScore()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white grid place-items-center font-bold text-lg shadow-lg shadow-slate-500/30">
                K
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Dashboard Integrado de Produção
                </h1>
                <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Sistema de Produção</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-4">
              {/* Dropdown Overview */}
              <div className="relative z-50">
                <button
                  onClick={() => setOverviewDropdownOpen(!overviewDropdownOpen)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${overviewDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {overviewDropdownOpen && (
                  <div className="fixed right-72 top-20 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999999]">
                    <Link
                      href="/hourly-control"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setOverviewDropdownOpen(false)}
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
                      onClick={() => setOverviewDropdownOpen(false)}
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
                      onClick={() => setOverviewDropdownOpen(false)}
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
                      onClick={() => setOverviewDropdownOpen(false)}
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
                      onClick={() => setOverviewDropdownOpen(false)}
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

              {/* Dropdown Admin */}
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
                        <span className="text-xs text-slate-500">Gerenciar semi-acabados</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Botão de atualização */}
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">

      {/* Score Geral de Saúde */}
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicador de Saúde Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Saúde do Sistema</span>
              <span className="text-2xl font-bold text-slate-900">{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-emerald-700">
                  {metrics?.kanban.inProgress ?? 0}
                </div>
                <div className="text-slate-600">Produtos em Produção</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-700">
                  {metrics?.quality.approvalRate.toFixed(1) ?? 0}%
                </div>
                <div className="text-slate-600">Aprovação em Qualidade</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-indigo-700">
                  {metrics?.kanban.completed ?? 0}
                </div>
                <div className="text-slate-600">Produtos Concluídos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Integradas */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Produção Kanban */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Package className="h-5 w-5" />
              Produção Kanban
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Produtos Totais:</span>
              <span className="font-mono">{metrics?.kanban.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Em Andamento:</span>
              <span className="font-mono text-blue-700">{metrics?.kanban.inProgress ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Pausados:</span>
              <span className="font-mono text-slate-700">{metrics?.kanban.paused ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Bloqueados:</span>
              <span className="font-mono text-red-700">{metrics?.kanban.blocked ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Semi-acabados & Quarentena */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Activity className="h-5 w-5" />
              Semi-acabados & Quarentena
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Itens de Semi-acabados:</span>
              <span className="font-mono">{metrics?.semi.items ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Em Quarentena:</span>
              <span className="font-mono text-amber-700">{metrics?.semi.inQuarantine ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Saldo Total (kg):</span>
              <span className="font-mono">{(metrics?.semi.saldoTotalKg ?? 0).toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Qualidade */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <BarChart3 className="h-5 w-5" />
              Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Testes Realizados:</span>
              <span className="font-mono">{metrics?.quality.totalTests ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">Reprovados:</span>
              <span className="font-mono text-red-700">{metrics?.quality.rejectedTests ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-700">RNCs Abertas:</span>
              <span className="font-mono text-amber-700">{metrics?.quality.openNCs ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  )
}
