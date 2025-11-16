'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SkeletonCard } from '@/components/skeletons'
import { Activity, Target, BarChart3, RefreshCw, Package } from 'lucide-react'
import { loadProductsAndStats } from '@/lib/product-operations'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Integrado de Produção
          </h1>
          <p className="text-slate-500">
            Visão consolidada de Produção, Semi-acabados / Quarentena e Qualidade
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`${
              healthScore >= 80
                ? 'bg-green-100 text-green-800'
                : healthScore >= 60
                ? 'bg-slate-100 text-slate-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            Saúde: {healthScore}%
          </Badge>
          <Button variant="outline" onClick={loadIntegratedData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

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
    </div>
  )
}
