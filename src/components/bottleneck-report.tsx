/**
 * Componente de relatório de gargalos aplicando clean code:
 * - Single Responsibility: Apenas relatório de gargalos
 * - Performance: Memoização adequada
 * - Type Safety: Tipagem robusta
 * - UX: Interface clara e informativa
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, TrendingUp, Clock, Users } from 'lucide-react'
import { getBottleneckReports, generateBottleneckReport } from '@/lib/product-operations'

interface BottleneckReportProps {
  productId?: string
}

interface BottleneckData {
  productId: string
  stage: string
  waitingTime: number
  stageDuration: number
  bottleneckScore: number
  analysisDate: string
  recommendations?: string
}

export function BottleneckReportComponent({ productId }: BottleneckReportProps) {
  const [reports, setReports] = useState<BottleneckData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [productId])

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    const result = await getBottleneckReports()

    if (result.success && result.data) {
      setReports(result.data as BottleneckData[])
    } else {
      setError(result.error || 'Erro ao carregar relatórios')
    }

    setLoading(false)
  }

  const handleGenerateReport = async (productId: string) => {
    const result = await generateBottleneckReport(productId)

    if (result.success) {
      await loadReports() // Recarrega os relatórios
    } else {
      setError(result.error || 'Erro ao gerar relatório')
    }
  }

  // Estatísticas calculadas aplicando clean code
  const bottleneckStats = useMemo(() => {
    if (reports.length === 0) return null

    const avgWaitingTime = reports.reduce((acc, r) => acc + r.waitingTime, 0) / reports.length
    const avgStageDuration = reports.reduce((acc, r) => acc + r.stageDuration, 0) / reports.length
    const avgBottleneckScore = reports.reduce((acc, r) => acc + r.bottleneckScore, 0) / reports.length

    return {
      avgWaitingTime,
      avgStageDuration,
      avgBottleneckScore,
      totalReports: reports.length
    }
  }, [reports])

  // Produtos ordenados por score de gargalo
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => b.bottleneckScore - a.bottleneckScore)
  }, [reports])

  if (loading) {
    return (
      <Card className="card-modern">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatório de gargalos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="card-modern border-red-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Erro ao carregar relatório</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadReports} variant="outline">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (reports.length === 0) {
    return (
      <Card className="card-modern">
        <CardContent className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nenhum dado de gargalo disponível
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Execute alguns processos para gerar dados de análise de gargalos.
          </p>
          {productId && (
            <Button onClick={() => handleGenerateReport(productId)}>
              Gerar Relatório para Produto
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      {bottleneckStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Tempo Médio de Espera</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round(bottleneckStats.avgWaitingTime)}min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Duração Média</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(bottleneckStats.avgStageDuration)}min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">Score Médio Gargalo</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {Math.round(bottleneckStats.avgBottleneckScore)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">Análises Realizadas</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {bottleneckStats.totalReports}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório Detalhado */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-warning rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            📊 Análise de Gargalos por Produto
          </CardTitle>
          <p className="text-gray-600">
            Produtos ordenados por maior impacto de gargalo (score mais alto)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedReports.map((report) => (
              <div
                key={`${report.productId}-${report.stage}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={`bg-blue-100 text-blue-800 w-fit`}>
                      {report.stage}
                    </Badge>
                    <span className="font-medium text-gray-900">
                      Produto ID: {report.productId.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Score de Gargalo</div>
                    <div className={`text-lg font-bold ${
                      report.bottleneckScore > 70 ? 'text-red-600' :
                      report.bottleneckScore > 40 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {Math.round(report.bottleneckScore)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tempo de Espera:</span>
                    <div className="font-medium">{report.waitingTime}min</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duração Total:</span>
                    <div className="font-medium">{report.stageDuration}min</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Análise:</span>
                    <div className="font-medium">
                      {new Date(report.analysisDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={
                      report.bottleneckScore > 70 ? 'destructive' :
                      report.bottleneckScore > 40 ? 'secondary' :
                      'default'
                    }>
                      {report.bottleneckScore > 70 ? 'Crítico' :
                       report.bottleneckScore > 40 ? 'Atenção' :
                       'Normal'}
                    </Badge>
                  </div>
                </div>

                {report.recommendations && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Recomendação:</strong> {report.recommendations}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={loadReports} variant="outline">
          Atualizar Relatórios
        </Button>
        {productId && (
          <Button onClick={() => handleGenerateReport(productId)}>
            Gerar Novo Relatório
          </Button>
        )}
      </div>
    </div>
  )
}
