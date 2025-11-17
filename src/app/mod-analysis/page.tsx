'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  TrendingUp, 
  Target,
  Award,
  Activity,
  BarChart3,
  Scale,
  AlertTriangle,
  Settings,
  ChevronDown,
  Shield,
  Beaker,
  Package,
  Clock
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ModOperator, ModActivity } from '@/lib/mod-types'

interface MODPerformance {
  operadorId: string
  nomeOperador: string
  data: string
  opsProcessadas: number
  quantidadeTotalKg: number
  tempoTotalTrabalhado: number
  eficienciaGeral: number
  metricasPorCategoria: {
    geis: { quantidadeKg: number; opsProcessadas: number; tempoMedio: number; eficiencia: number; qualidade: number }
    bases: { quantidadeKg: number; opsProcessadas: number; tempoMedio: number; eficiencia: number; qualidade: number }
    esmaltes: { quantidadeKg: number; opsProcessadas: number; tempoMedio: number; eficiencia: number; qualidade: number }
    outros: { quantidadeKg: number; opsProcessadas: number; tempoMedio: number; eficiencia: number; qualidade: number }
  }
  qualidade: {
    taxaAprovacao: number
    reprocessos: number
    naoConformidades: number
    auditoriaBPF: number
  }
  desenvolvimento: {
    curvaAprendizagem: number
    consistencia: number
    especializacao: string[]
    pontosMelhoria: string[]
  }
}

export default function AnaliseOperadorPage() {
  const pathname = usePathname()
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)
  const [operadorSelecionado, setOperadorSelecionado] = useState<string>('')
  const [performance, setPerformance] = useState<MODPerformance | null>(null)
  const [loading, setLoading] = useState(false)
  const [periodo, setPeriodo] = useState('hoje')

  const { data: operadoresData, error: operadoresError } = useSWR<ModOperator[]>(
    '/api/mod/operators',
    async (url: string) => {
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
      return json.data as ModOperator[]
    },
    {
      revalidateOnFocus: false,
    }
  )

  const operadores = useMemo(() => operadoresData || [], [operadoresData])

  const operadorAtual = useMemo(
    () => operadores.find((op) => op.id === operadorSelecionado),
    [operadores, operadorSelecionado]
  )

  const calcularPerformance = useCallback((operadorId: string, atividades: ModActivity[]) => {
    const operador = operadores.find((op) => op.id === operadorId)
    if (!operador) return

    const opsProcessadas = atividades.length

    let tempoTotalTrabalhado = 0
    for (const atv of atividades) {
      const inicio = atv.startedAt ? new Date(atv.startedAt) : null
      const fim = atv.endedAt ? new Date(atv.endedAt) : new Date()
      if (inicio && !isNaN(inicio.getTime()) && fim && !isNaN(fim.getTime())) {
        const diffHoras = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
        if (Number.isFinite(diffHoras) && diffHoras > 0) {
          tempoTotalTrabalhado += diffHoras
        }
      }
    }

    const quantidadeTotalKg = 0 // ainda não temos integração direta com quantidade produzida

    const tempoMedio = opsProcessadas > 0 ? tempoTotalTrabalhado / opsProcessadas : 0
    const metaHorasPorOP = 2.5
    let eficienciaGeral = 0
    if (tempoMedio > 0) {
      eficienciaGeral = Math.max(60, Math.min(120, (metaHorasPorOP / tempoMedio) * 100))
    }

    const performanceMock: MODPerformance = {
      operadorId,
      nomeOperador: operador.name,
      data: new Date().toISOString().split('T')[0],
      opsProcessadas,
      quantidadeTotalKg,
      tempoTotalTrabalhado,
      eficienciaGeral,
      metricasPorCategoria: {
        geis: { quantidadeKg: 150, opsProcessadas: 3, tempoMedio: 2.1, eficiencia: 95, qualidade: 98 },
        bases: { quantidadeKg: 200, opsProcessadas: 4, tempoMedio: 2.5, eficiencia: 90, qualidade: 97 },
        esmaltes: { quantidadeKg: 80, opsProcessadas: 2, tempoMedio: 1.8, eficiencia: 93, qualidade: 99 },
        outros: { quantidadeKg: 50, opsProcessadas: 1, tempoMedio: 2.0, eficiencia: 88, qualidade: 95 }
      },
      qualidade: {
        taxaAprovacao: 98.2,
        reprocessos: 1,
        naoConformidades: 0,
        auditoriaBPF: 94
      },
      desenvolvimento: {
        curvaAprendizagem: 12.5,
        consistencia: 8.2,
        especializacao: ['GEIS', 'BASES'],
        pontosMelhoria: ['Velocidade em Esmaltes', 'Controle de Qualidade']
      }
    }

    setPerformance(performanceMock)
  }, [operadores])

  const fetchDados = useCallback(async () => {
    if (!operadorSelecionado) return

    setLoading(true)
    try {
      const res = await fetch(`/api/mod/activities?operatorId=${operadorSelecionado}`, {
        cache: 'no-store',
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        console.error('Erro ao buscar atividades MOD:', json?.error || res.status)
        setPerformance(null)
        return
      }

      const atividades = Array.isArray(json.data) ? (json.data as ModActivity[]) : []

      const agora = new Date()
      let limite: Date | null = null
      if (periodo === 'hoje') {
        limite = new Date(agora.toISOString().split('T')[0])
      } else if (periodo === 'semana') {
        limite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (periodo === 'mes') {
        limite = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      const atividadesFiltradas = limite
        ? atividades.filter((a) => {
            const inicio = new Date(a.startedAt)
            return !isNaN(inicio.getTime()) && inicio >= limite!
          })
        : atividades

      calcularPerformance(operadorSelecionado, atividadesFiltradas)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setPerformance(null)
    } finally {
      setLoading(false)
    }
  }, [operadorSelecionado, periodo, calcularPerformance])

  useEffect(() => {
    if (!operadorSelecionado) {
      setPerformance(null)
      return
    }

    fetchDados()
  }, [operadorSelecionado, fetchDados])

  const getEficienciaColor = (eficiencia: number) => {
    if (eficiencia >= 95) return 'text-green-600'
    if (eficiencia >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualidadeColor = (qualidade: number) => {
    if (qualidade >= 97) return 'text-green-600'
    if (qualidade >= 93) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 text-white grid place-items-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Análise de Performance MOD
                </h1>
                <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                    <Activity className="h-3 w-3" />
                    Tempo Real
                  </span>
                  Bluwe Cosméticos • Métricas individuais e eficiência operacional
                </p>
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
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
                    >
                      <Clock className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Hora a Hora</span>
                        <span className="text-xs text-slate-500">Controle horário</span>
                      </div>
                    </Link>
                    <Link
                      href="/quality"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setOverviewDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setAdminDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setAdminDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setAdminDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
                      onClick={(e) => {
                        setAdminDropdownOpen(false)
                        // Não impedir a navegação padrão
                      }}
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
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Cards de Colaboradores MOD */}
        {operadores.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Equipe de Operadores
            </h2>
            <p className="text-sm text-slate-600 hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                <Target className="h-3 w-3" />
                Performance
              </span>
              Selecione um operador para visualizar métricas detalhadas de eficiência
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {operadores
              .filter((op) => op.isActive !== false)
              .map((op) => {
                const baseName = op.name || 'MOD'
                const initials = baseName
                  .split(' ')
                  .map((n) => n.trim()[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'MOD'
                const isSelected = op.id === operadorSelecionado
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperadorSelecionado(op.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                      {op.photo ? (
                        <Image
                          src={op.photo}
                          alt={op.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{op.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {op.role || 'Função não informada'}
                      </p>
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Selecionar Operador
          </CardTitle>
        </CardHeader>
        <CardContent>
          {operadoresError && (
            <div className="mb-3 text-xs text-red-600">
              Erro ao carregar MOD: {(operadoresError as Error).message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operador
              </label>
              <Select value={operadorSelecionado} onValueChange={setOperadorSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um operador" />
                </SelectTrigger>
                <SelectContent>
                  {operadores.map((op: ModOperator) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Activity className="h-4 w-4 animate-spin" />
          Atualizando dados do operador selecionado...
        </div>
      )}

      {performance && (
        <>
          {/* Perfil do Operador */}
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                {operadorAtual?.photo ? (
                  <Image
                    src={operadorAtual.photo}
                    alt={operadorAtual.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {(operadorAtual?.name || performance.nomeOperador)
                      .split(' ')
                      .map((n) => n.trim()[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'MOD'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Operador</p>
                <p className="text-lg font-semibold text-gray-900">
                  {operadorAtual?.name || performance.nomeOperador}
                </p>
                {operadorAtual?.role && (
                  <p className="text-xs text-gray-500">{operadorAtual.role}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">OPs Processadas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {performance.opsProcessadas}
                    </p>
                    <p className="text-xs text-gray-500">
                      {performance.tempoTotalTrabalhado.toFixed(1)}h trabalhadas
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Produção Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {performance.quantidadeTotalKg.toFixed(1)} kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {(performance.quantidadeTotalKg / performance.opsProcessadas).toFixed(1)} kg/OP
                    </p>
                  </div>
                  <Scale className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Eficiência Geral</p>
                    <p className={`text-2xl font-bold ${getEficienciaColor(performance.eficienciaGeral)}`}>
                      {performance.eficienciaGeral.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Meta: 90%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                    <p className={`text-2xl font-bold ${getQualidadeColor(performance.qualidade.taxaAprovacao)}`}>
                      {performance.qualidade.taxaAprovacao.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Meta: 97%</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análise por Categoria */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Desempenho por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(performance.metricasPorCategoria).map(([categoria, metricas]) => (
                    <div key={categoria} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium capitalize">{categoria}</h4>
                        <Badge className={getEficienciaColor(metricas.eficiencia)}>
                          {metricas.eficiencia}% eficiência
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Produção:</span>
                          <div className="font-medium">{metricas.quantidadeKg} kg</div>
                        </div>
                        <div>
                          <span className="text-gray-600">OPs:</span>
                          <div className="font-medium">{metricas.opsProcessadas}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo Médio:</span>
                          <div className="font-medium">{metricas.tempoMedio}h</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Qualidade:</span>
                          <div className={`font-medium ${getQualidadeColor(metricas.qualidade)}`}>
                            {metricas.qualidade}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Indicadores de Qualidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Indicadores de Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Taxa de Aprovação</p>
                      <p className="text-sm text-gray-600">Qualidade geral da produção</p>
                    </div>
                    <div className={`text-xl font-bold ${getQualidadeColor(performance.qualidade.taxaAprovacao)}`}>
                      {performance.qualidade.taxaAprovacao.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Reprocessos</p>
                      <p className="text-sm text-gray-600">Número de retrabalhos</p>
                    </div>
                    <div className={`text-xl font-bold ${performance.qualidade.reprocessos > 2 ? 'text-red-600' : 'text-green-600'}`}>
                      {performance.qualidade.reprocessos}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">RNCs</p>
                      <p className="text-sm text-gray-600">Registros de não conformidades</p>
                    </div>
                    <div className={`text-xl font-bold ${performance.qualidade.naoConformidades > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {performance.qualidade.naoConformidades}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Auditoria BPF</p>
                      <p className="text-sm text-gray-600">Score de boas práticas</p>
                    </div>
                    <div className={`text-xl font-bold ${getQualidadeColor(performance.qualidade.auditoriaBPF)}`}>
                      {performance.qualidade.auditoriaBPF}/100
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desenvolvimento e Tendências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Desenvolvimento e Tendências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Métricas de Desenvolvimento</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Curva de Aprendizagem</span>
                      <span className="font-medium text-green-600">
                        +{performance.desenvolvimento.curvaAprendizagem}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Consistência</span>
                      <span className="font-medium text-blue-600">
                        {performance.desenvolvimento.consistencia}/10
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Especializações</h4>
                  <div className="flex flex-wrap gap-2">
                    {performance.desenvolvimento.especializacao.map((esp, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {esp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Pontos de Melhoria</h4>
                <div className="space-y-2">
                  {performance.desenvolvimento.pontosMelhoria.map((ponto, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{ponto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!operadorSelecionado && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              Selecione um operador para visualizar a análise detalhada de desempenho
            </p>
          </CardContent>
        </Card>
        )}
      </div>
    </main>
  </div>
)
}
