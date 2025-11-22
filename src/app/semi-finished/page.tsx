"use client"

import useSWR, { mutate } from 'swr'
import { useMemo, useState, type ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send, PackageCheck, Undo2, Loader2, Trash2, Settings2, Layers, Droplet, TrendingUp, BarChart3, Settings, ChevronDown, Shield, Users, Beaker, Package, Clock, Brain } from 'lucide-react'
import { SemiItem, Bucket, semiFinishedFetcher, useSemiFinishedBuckets, getSemiFinishedFamilyColor, deleteSemiFinished, createSemiFinished } from '@/lib/semi-finished-lib'
import Link from 'next/link'

export default function SemiFinishedPage() {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  
  const { data, error, isLoading } = useSWR<SemiItem[]>('/api/semi-finished', semiFinishedFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 15000,
    keepPreviousData: true,
  })
  const items = useMemo(() => data || [], [data])
  const [selectedProduct, setSelectedProduct] = useState<SemiItem | null>(null)
  const [legacyName, setLegacyName] = useState('')
  const [legacyFamily, setLegacyFamily] = useState('')
  const [legacyOp, setLegacyOp] = useState('')
  const [legacyBatch, setLegacyBatch] = useState('')
  const [legacyQty, setLegacyQty] = useState('')
  const [legacyBusy, setLegacyBusy] = useState(false)
  const [legacyError, setLegacyError] = useState<string | null>(null)

  const generateAiAnalysis = async () => {
    setAiLoading(true)
    setAiError('')
    setAiAnalysis('')

    try {
      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analise a situação atual dos produtos semi-acabados e forneça:
              
**🔍 ANÁLISE GERAL**
- Status geral do estoque semi-acabado
- Produtos em destaque (críticos ou bem gerenciados)

**⚠️ RISCOS E PRIORIDADES**
- Produtos com risco de vencimento ou escassez
- Gargalos no processo de envase
- Itens que precisam de atenção imediata

**📋 AÇÕES RECOMENDADAS**
- Ações prioritárias para hoje/esta semana
- Otimização do fluxo de produção
- Sugestões para melhorar o controle

Dados atuais: ${items.length} produtos, famílias: ${Object.keys(groups).join(', ')}

Formato: Use títulos claros, linguagem direta e foco em ações práticas.`
            }
          ],
          options: { temperature: 0.7, max_tokens: 2000 }
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar análise')
      }

      setAiAnalysis(data.response || '')

    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setAiLoading(false)
    }
  }

  const groups = useMemo(() => {
    return items.reduce((acc, it) => {
      const key = it.family || 'Sem Família'
      if (!acc[key]) acc[key] = [] as SemiItem[]
      acc[key].push(it)
      return acc
    }, {} as Record<string, SemiItem[]>)
  }, [items])

  const organizedGroups = useMemo(() => {
    const result: Record<string, SemiItem[][]> = {}
    const perRow = 3

    Object.entries(groups).forEach(([family, products]) => {
      result[family] = []
      for (let i = 0; i < products.length; i += perRow) {
        result[family].push(products.slice(i, i + perRow))
      }
    })

    return result
  }, [groups])

  const dashboardStats = useMemo(() => {
    const totalProdutos = items.length
    const aguardando = items.filter((item) => item.status === 'aguardando').length
    const totalSaldo = items.reduce((sum, item) => sum + (Number(item.quantity_total) - Number(item.quantity_envasado)), 0)
    const familias = Object.keys(groups).length

    return { totalProdutos, aguardando, totalSaldo, familias }
  }, [items, groups])

  const handleLegacyInsert = async () => {
    try {
      setLegacyBusy(true)
      setLegacyError(null)

      const qty = Number(legacyQty)
      if (!Number.isFinite(qty) || qty <= 0) {
        setLegacyError('Quantidade inválida')
        setLegacyBusy(false)
        return
      }

      const result = await createSemiFinished({
        name: legacyName,
        family: legacyFamily,
        op: legacyOp,
        batch: legacyBatch,
        quantity_total: qty,
      })

      if (!result.success) {
        setLegacyError(result.error || 'Erro ao inserir produto legado')
        setLegacyBusy(false)
        return
      }

      await mutate('/api/semi-finished')
      setLegacyName('')
      setLegacyFamily('')
      setLegacyOp('')
      setLegacyBatch('')
      setLegacyQty('')
    } catch (e) {
      setLegacyError('Erro ao inserir produto legado')
    } finally {
      setLegacyBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 text-slate-900">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white grid place-items-center font-bold text-lg shadow-lg shadow-sky-500/30">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                  Kanban de Semi-Acabados
                </h1>
                <p className="text-sm text-slate-500 font-medium">Bluwe Cosméticos • Gerenciamento de estoque intermediário</p>
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
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={() => setOverviewDropdownOpen(false)}
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
                      onClick={() => setOverviewDropdownOpen(false)}
                    >
                      <Clock className="h-4 w-4 text-slate-500" />
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
                        <span className="text-xs text-slate-500">Página inicial</span>
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
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <section className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-sky-600/80 mb-2">Painel Administrativo</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Kanban de Semi-Acabados</h1>
            <p className="text-sm text-slate-600 mt-1">
              Gerencie o estoque intermediário, acompanhe saldos e mantenha o fluxo pós-produção organizado.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Produtos ativos" value={dashboardStats.totalProdutos} icon={<Layers className="h-4 w-4" />} accent="from-sky-500/30 to-sky-500/5" />
            <MetricCard label="Aguardando ação" value={dashboardStats.aguardando} icon={<Settings2 className="h-4 w-4" />} accent="from-amber-400/40 to-amber-400/10" />
            <MetricCard label="Saldo disponível" value={`${dashboardStats.totalSaldo.toFixed(1)} kg`} icon={<Droplet className="h-4 w-4" />} accent="from-emerald-400/40 to-emerald-400/10" />
            <MetricCard label="Famílias" value={dashboardStats.familias} icon={<TrendingUp className="h-4 w-4" />} accent="from-indigo-400/40 to-indigo-400/10" />
          </div>
        </section>

        {/* AI Analysis Section */}
        <section>
          <Card className="bg-white/80 border border-sky-100 shadow-xl">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-sky-600/80">Análise Inteligente</p>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-sky-600" />
                    Análise IA dos Semi-Acabados
                  </h2>
                </div>
                <button
                  onClick={generateAiAnalysis}
                  disabled={aiLoading}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  {aiLoading ? 'Analisando...' : 'Gerar Análise'}
                </button>
              </div>

              {aiError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">❌ {aiError}</p>
                </div>
              )}

              {aiAnalysis && (
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap bg-slate-50 rounded-lg p-6 border border-slate-200 text-sm">
                    {aiAnalysis}
                  </div>
                </div>
              )}

              {!aiAnalysis && !aiLoading && !aiError && (
                <div className="text-center py-8 text-slate-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Clique em "Gerar Análise" para obter insights inteligentes sobre o estoque semi-acabado</p>
                </div>
              )}

              {aiLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                  <p className="mt-4 text-slate-600">Analisando dados com IA...</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section>
          <Card className="bg-white/80 border border-sky-100 shadow-xl">
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-sky-600/80">Produtos legados</p>
                <h2 className="text-lg font-semibold text-slate-900">Adicionar item existente</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <LegacyInput id="legacy-name" label="Nome" value={legacyName} onChange={setLegacyName} placeholder="Nome do produto" />
                <LegacyInput id="legacy-family" label="Família" value={legacyFamily} onChange={setLegacyFamily} placeholder="Linha / família" />
                <LegacyInput id="legacy-op" label="OP" value={legacyOp} onChange={setLegacyOp} placeholder="OP" />
                <LegacyInput id="legacy-batch" label="Lote" value={legacyBatch} onChange={setLegacyBatch} placeholder="Lote" />
                <div className="space-y-1">
                  <Label htmlFor="legacy-qty" className="text-xs text-slate-600">
                    Qtd (kg)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="legacy-qty"
                      type="number"
                      step="0.1"
                      value={legacyQty}
                      onChange={(e) => setLegacyQty(e.target.value)}
                      placeholder="0.0"
                      className="h-9 text-xs bg-white border border-slate-200 text-slate-900"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 text-xs px-3 bg-gradient-to-r from-sky-500 to-blue-500"
                      disabled={legacyBusy || !legacyName || !legacyFamily || !legacyOp || !legacyBatch || !legacyQty}
                      onClick={handleLegacyInsert}
                    >
                      {legacyBusy ? 'Salvando...' : 'Inserir'}
                    </Button>
                  </div>
                </div>
              </div>
              {legacyError && <p className="text-xs text-red-500">{legacyError}</p>}
            </div>
          </Card>
        </section>

        {isLoading && <div className="text-xs text-slate-500">Carregando semi-acabados...</div>}
        {error && <div className="text-xs text-red-500">Erro ao carregar semi-acabados: {(error as Error).message}</div>}

        <section className="space-y-6">
          {Object.entries(organizedGroups).map(([family, rows]) => (
            <div key={family} className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white/70 backdrop-blur px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-sky-400 to-blue-500" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Família</p>
                    <h2 className="text-base font-semibold text-slate-900">{family}</h2>
                  </div>
                </div>
                <Badge className="bg-sky-600/10 text-sky-800 border border-sky-200 px-2.5 py-1 text-[11px] rounded-full">
                  {rows.flat().length} produto{rows.flat().length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {rows.map((rowProducts, rowIndex) => (
                <div key={`${family}-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rowProducts.map((product) => (
                    <CompactItemCard key={product.id} product={product} onManage={() => setSelectedProduct(product)} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </section>

        {selectedProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_25px_60px_-20px_rgba(15,23,42,0.4)] max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Gerenciar</p>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedProduct.name}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full w-9 h-9 p-0 transition-all"
                >
                  ✕
                </Button>
              </div>
              <div className="p-5 max-h-[calc(90vh-90px)] overflow-auto bg-white">
                <ItemRow
                  item={selectedProduct}
                  onDeleted={() => {
                    setSelectedProduct(null)
                    mutate('/api/semi-finished')
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function LegacyInput({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (val: string) => void; placeholder: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-slate-600">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-xs bg-white border border-slate-200 text-slate-900"
      />
    </div>
  )
}

function MetricCard({ label, value, icon, accent }: { label: string; value: string | number; icon: ReactNode; accent: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-lg shadow-lg p-4 flex items-center gap-3">
      <div className={`rounded-xl bg-gradient-to-br ${accent} text-slate-900 p-3 shadow-inner`}>{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function CompactItemCard({ product, onManage }: { product: SemiItem; onManage: () => void }) {
  const { data: buckets, isLoading: loading, error } = useSemiFinishedBuckets(product.id)
  const saldo = Number(product.quantity_total) - Number(product.quantity_envasado)

  // Status simplificado baseado nos baldes
  const statusSummary = useMemo(() => {
    if (loading || error || !buckets.length) return { text: 'Carregando...', color: 'text-slate-500' }

    const packaged = buckets.filter((b: Bucket) => b.status === 'packaged').length
    const partial = buckets.filter((b: Bucket) => b.status === 'partial').length
    const total = buckets.length

    const embalados = packaged + partial
    const inQuarantine = embalados > 0

    if (inQuarantine && embalados === total) {
      return { text: 'Quarentena (envase concluído)', color: 'text-emerald-600' }
    }

    if (inQuarantine) {
      return { text: `Quarentena (${embalados}/${total} envasados)`, color: 'text-amber-600' }
    }

    return { text: `${total} pendentes`, color: 'text-slate-600' }
  }, [buckets, loading, error])

  return (
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out group">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-800 truncate text-sm leading-tight">{product.name}</div>
            <div className="text-xs text-slate-600 truncate leading-tight">
              OP: {product.op} • Lote: {product.batch}
            </div>
          </div>
          <div className="ml-1.5 flex flex-col items-end gap-0.5">
            <Badge className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 ring-1 ring-slate-200/50 text-xs px-1.5 py-0.5 font-medium">
              {saldo.toFixed(1)}kg
            </Badge>
            <div className={`text-xs font-medium ${statusSummary.color} leading-tight`}>
              {statusSummary.text}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          <div className="text-center bg-gradient-to-b from-slate-50 to-white rounded-md border border-slate-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Total</div>
            <div className="font-bold text-slate-900 text-xs leading-tight">{product.quantity_total.toFixed(1)}kg</div>
          </div>
          <div className="text-center bg-gradient-to-b from-emerald-50 to-white rounded-md border border-emerald-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Envasado</div>
            <div className="font-bold text-emerald-700 text-xs leading-tight">{product.quantity_envasado.toFixed(1)}kg</div>
          </div>
          <div className="text-center bg-gradient-to-b from-slate-50 to-white rounded-md border border-slate-200/50 px-1.5 py-1.5">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Saldo</div>
            <div className="font-bold text-slate-900 text-xs leading-tight">{saldo.toFixed(1)}kg</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2.5">
          {loading ? (
            <div className="text-xs text-slate-500">Carregando baldes...</div>
          ) : error ? (
            <div className="text-xs text-red-600">Erro nos baldes</div>
          ) : buckets.length === 0 ? (
            <div className="text-xs text-slate-400">Sem baldes</div>
          ) : (
            buckets.slice(0, 6).map((bucket: Bucket) => {
              const color = bucket.status === 'packaged' ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100' :
                           bucket.status === 'partial' ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200 hover:from-amber-200 hover:to-amber-100' :
                           bucket.status === 'in_packaging' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-blue-100' :
                           'bg-gradient-to-r from-slate-100 to-white text-slate-700 border-slate-200 hover:from-slate-200 hover:to-slate-50'
              return (
                <div
                  key={bucket.id}
                  className={`px-1.5 py-0.5 rounded text-xs border transition-all duration-200 hover:scale-105 ${color}`}
                  title={`Balde #${bucket.bucketIndex}: ${bucket.currentQuantityKg.toFixed(2)}kg`}
                >
                  #{bucket.bucketIndex}
                </div>
              )
            })
          )}
          {buckets.length > 6 && (
            <div className="px-1.5 py-0.5 rounded text-xs border bg-gradient-to-r from-slate-50 to-white text-slate-600 border-slate-200 hover:from-slate-100 hover:to-slate-50 transition-all duration-200">
              +{buckets.length - 6}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            className="inline-flex items-center justify-center gap-1.5 text-xs h-8 px-4 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={buckets.length === 0}
            onClick={onManage}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Gerenciar
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ItemRow({ item, onDeleted }: { item: SemiItem; onDeleted?: () => void }) {
  const { data: buckets, isLoading: loading, error, mutate: refresh } = useSemiFinishedBuckets(item.id)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<null | 'send' | 'package' | 'return' | 'delete'>(null)

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }))
  const selectedIds = Object.keys(selected).filter((k) => selected[k])

  const sendToPackaging = async () => {
    if (!selectedIds.length) return
    setBusy('send')
    console.log('📦 sendToPackaging: Mock operation para GitHub Pages')
    // Mock operation
    await new Promise(resolve => setTimeout(resolve, 500))
    await Promise.all([refresh(), mutate('/api/semi-finished')])
    setSelected({})
    setBusy(null)
  }

  const deleteItem = async () => {
    if (!confirm('Excluir este produto de Semi-Acabados? Esta ação não pode ser desfeita.')) return
    setBusy('delete')
    try {
      const result = await deleteSemiFinished(item.id)
      if (!result.success) {
        console.error('Erro ao excluir semi-acabado:', result.error)
        alert(result.error || 'Erro ao excluir produto')
      } else {
        await Promise.all([refresh(), mutate('/api/semi-finished')])
        onDeleted?.()
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao excluir produto')
    } finally {
      setBusy(null)
    }
  }

  const packageBucket = async () => {
    const id = selectedIds[0]
    if (!id) return
    const v = prompt('Quantidade (kg) a envasar neste balde:', '18')
    if (!v) return
    const delta = Number(v)
    if (!Number.isFinite(delta) || delta <= 0) return
    setBusy('package')
    console.log('📦 packageBucket: Mock operation para GitHub Pages')
    // Mock operation
    await new Promise(resolve => setTimeout(resolve, 500))
    await Promise.all([refresh(), mutate('/api/semi-finished')])
    setSelected({})
    setBusy(null)
  }

  const returnBucket = async () => {
    const id = selectedIds[0]
    if (!id) return
    if (!confirm('Devolver este balde para o estoque de Semi‑Acabados?')) return
    setBusy('return')
    console.log('🔄 returnBucket: Mock operation para GitHub Pages')
    // Mock operation
    await new Promise(resolve => setTimeout(resolve, 500))
    await Promise.all([refresh(), mutate('/api/semi-finished')])
    setSelected({})
    setBusy(null)
  }

  const saldo = Number(item.quantity_total) - Number(item.quantity_envasado)
  const soft = getSemiFinishedFamilyColor(item.family)

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      <div className="px-3 py-2" style={{ backgroundColor: soft || '#f8fafc' }}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 truncate">{item.name}</div>
            <div className="text-[11px] text-slate-600 truncate">OP: {item.op} • Lote: {item.batch}</div>
          </div>
          <Badge className="bg-white/70 text-slate-700 ring-1 ring-slate-200">Saldo {saldo.toFixed(1)} kg</Badge>
        </div>
      </div>
      <div className="p-3">
        <div className="mb-2 grid grid-cols-3 gap-2 text-[11px] text-slate-700">
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-center">Total<br/><span className="font-semibold text-slate-900">{item.quantity_total.toFixed(1)} kg</span></div>
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-center">Envasado<br/><span className="font-semibold text-emerald-700">{item.quantity_envasado.toFixed(1)} kg</span></div>
          <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-center">Saldo<br/><span className="font-semibold text-slate-900">{saldo.toFixed(1)} kg</span></div>
        </div>

        <div className="mt-2">
          {loading ? (
            <div className="text-xs text-slate-500">Carregando baldes…</div>
          ) : error ? (
            <div className="text-xs text-red-600">Erro ao carregar baldes</div>
          ) : buckets.length === 0 ? (
            <div className="text-xs text-slate-400">Sem baldes</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {buckets.map((b: Bucket) => {
                const color = b.status === 'packaged' ? 'from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200' : b.status === 'partial' ? 'from-amber-100 to-amber-50 text-amber-800 border-amber-200' : b.status === 'in_packaging' ? 'from-blue-100 to-blue-50 text-blue-800 border-blue-200' : b.status === 'returned' ? 'from-slate-200 to-slate-100 text-slate-700 border-slate-300' : 'from-slate-100 to-white text-slate-700 border-slate-200'
                const sel = !!selected[b.id]
                const pct = Math.round(((b.originalQuantityKg - b.currentQuantityKg) / b.originalQuantityKg) * 100)
                return (
                  <button
                    key={b.id}
                    onClick={() => toggle(b.id)}
                    className={`px-2.5 py-1.5 rounded-full text-xs border bg-gradient-to-b ${color} ${sel ? 'ring-2 ring-blue-400' : 'hover:shadow-sm'} shadow-[0_1px_0_rgba(0,0,0,0.04)] transition`}
                    title={`Balde #${b.bucketIndex} • saldo ${b.currentQuantityKg.toFixed(2)}kg`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">#{b.bucketIndex}</span>
                      <span>{b.currentQuantityKg.toFixed(1)}kg</span>
                    </div>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-white/50 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-black/20 transition-all duration-300" 
                        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /* Style inline necessário: largura calculada dinamicamente */
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" disabled={!selectedIds.length || !!busy} onClick={sendToPackaging} className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow" title="Enviar baldes selecionados para envase">
              {busy === 'send' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />} Enviar para envase
            </Button>
            <Button size="sm" variant="secondary" disabled={selectedIds.length !== 1 || !!busy} onClick={packageBucket} className="bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow" title="Registrar envase total ou parcial no balde selecionado">
              {busy === 'package' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <PackageCheck className="h-3.5 w-3.5 mr-1" />} Registrar envase
            </Button>
            <Button size="sm" variant="ghost" disabled={selectedIds.length !== 1 || !!busy} onClick={returnBucket} className="border border-slate-300 hover:bg-slate-50" title="Devolver balde para o estoque de Semi‑Acabados">
              {busy === 'return' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Undo2 className="h-3.5 w-3.5 mr-1" />} Devolver
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={!!busy}
            onClick={deleteItem}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/60"
            title="Excluir este produto de Semi‑Acabados"
          >
            {busy === 'delete' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />} Excluir produto
          </Button>
        </div>
      </div>
    </div>
  )
}
