'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react'

interface ProducaoData {
  id: string
  name: string
  op: string
  batch: string
  quantity: number
  currentStage: string
  status: string
  createdAt: string
  notes?: string
}

interface KPIS {
  totalProducao: number
  opsProcessadas: number
  eficienciaGeral: number
  taxaAprovacao: number
  tempoMedio: number
  gargalosAtivos: number
}

export default function DashboardViewPage() {
  const [producoes, setProducoes] = useState<ProducaoData[]>([])
  const [kpis, setKpis] = useState<KPIS>({
    totalProducao: 0,
    opsProcessadas: 0,
    eficienciaGeral: 0,
    taxaAprovacao: 0,
    tempoMedio: 0,
    gargalosAtivos: 0
  })
  const [loading, setLoading] = useState(true)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date())

  const calcularKPIs = useCallback((dados: ProducaoData[]) => {
    const hoje = new Date().toDateString()
    const producoesHoje = dados.filter(p => 
      new Date(p.createdAt).toDateString() === hoje
    )

    const totalProducao = producoesHoje.reduce((sum, p) => sum + p.quantity, 0)
    const opsProcessadas = producoesHoje.length
    const eficienciaGeral = opsProcessadas > 0 ? 94.2 : 0 // Mock - calcular real depois
    const taxaAprovacao = 98.1 // Mock - calcular real depois
    const tempoMedio = 2.3 // Mock - calcular real depois
    const gargalosAtivos = producoesHoje.filter(p => p.status === 'paused').length

    setKpis({
      totalProducao,
      opsProcessadas,
      eficienciaGeral,
      taxaAprovacao,
      tempoMedio,
      gargalosAtivos
    })
  }, [])

  const fetchDados = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/producao-manual')
      const result = await response.json()

      if (result.success) {
        setProducoes(result.data)
        calcularKPIs(result.data)
        setUltimaAtualizacao(new Date())
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [calcularKPIs])

  useEffect(() => {
    fetchDados()
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchDados, 30000)
    return () => clearInterval(interval)
  }, [fetchDados])

  const getCategoriaFromName = (name: string) => {
    if (name.includes('GEIS')) return 'GEIS'
    if (name.includes('BASES')) return 'BASES'
    if (name.includes('ESMALTES')) return 'ESMALTES'
    return 'OUTROS'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">🔄 Em Andamento</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">✅ Concluído</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">⏸️ Pausado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">❓ Desconhecido</Badge>
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'GEIS': return '🧪'
      case 'BASES': return '💧'
      case 'ESMALTES': return '🎨'
      default: return '📦'
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Dashboard de Produção
            </h1>
            <p className="text-gray-600">
              Acompanhamento em tempo real do setor de mistura e manipulação
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchDados}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Relatório
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          🔄 Última atualização: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produção do Dia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis.totalProducao.toFixed(1)} kg
                </p>
                <p className="text-xs text-gray-500">{kpis.opsProcessadas} OPs</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiência</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis.eficienciaGeral.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600">Meta: 90%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualidade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis.taxaAprovacao.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600">Meta: 97%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gargalos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis.gargalosAtivos}
                </p>
                <p className="text-xs text-orange-600">Ativos agora</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produções em Andamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Produções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Produções em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Carregando dados...
                </div>
              ) : producoes.filter(p => p.status === 'active').length > 0 ? (
                producoes
                  .filter(p => p.status === 'active')
                  .slice(0, 5)
                  .map((producao) => (
                    <div key={producao.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getCategoriaIcon(getCategoriaFromName(producao.name))}
                          </span>
                          <div>
                            <p className="font-medium">{producao.op}</p>
                            <p className="text-sm text-gray-600">{producao.currentStage}</p>
                          </div>
                        </div>
                        {getStatusBadge(producao.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>{producao.quantity} kg</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(producao.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Nenhuma produção em andamento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Produção por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['GEIS', 'BASES', 'ESMALTES', 'OUTROS'].map((categoria) => {
                const producoesCategoria = producoes.filter(p => 
                  getCategoriaFromName(p.name) === categoria
                )
                const totalKg = producoesCategoria.reduce((sum, p) => sum + p.quantity, 0)
                const opsCount = producoesCategoria.length

                return (
                  <div key={categoria} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoriaIcon(categoria)}</span>
                      <div>
                        <p className="font-medium">{categoria}</p>
                        <p className="text-sm text-gray-600">{opsCount} OPs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{totalKg.toFixed(1)} kg</p>
                      <p className="text-sm text-gray-600">
                        {opsCount > 0 ? (totalKg / opsCount).toFixed(1) : '0'} kg/OP
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Baixar Relatório do Dia
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Histórico Completo
              </Button>
              <Button variant="outline" className="justify-start">
                <Users className="h-4 w-4 mr-2" />
                Análise por Operador
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
