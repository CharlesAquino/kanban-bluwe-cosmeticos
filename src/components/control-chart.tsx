'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, BarChart3 } from 'lucide-react'
import type {
  StatisticalMetrics,
  ControlLimits,
  ControlChartType
} from '@/lib/types'
import { CONTROL_CHART_TYPE_LABELS } from '@/lib/types'

interface ControlChartProps {
  data: {
    data: Array<{
      timestamp: Date
      value: number
      batch?: string
      stage?: string
    }>
    stats: StatisticalMetrics
    limits: ControlLimits
    violations: number[]
    rules: string[]
  }
  chartType: ControlChartType
  title: string
}

export function ControlChart({ data, chartType, title }: ControlChartProps) {
  const [selectedTab, setSelectedTab] = useState('chart')

  if (!data.data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Nenhum dado disponível para análise
          </div>
        </CardContent>
      </Card>
    )
  }

  const values = data.data.map(d => d.value)
  const { stats, limits, violations } = data

  // Configuração do gráfico
  const width = 800
  const height = 400
  const margin = { top: 20, right: 20, bottom: 60, left: 60 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // Escala dos dados
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const range = dataMax - dataMin || 1

  const xScale = (index: number) => (index / (values.length - 1)) * chartWidth
  const yScale = (value: number) =>
    chartHeight - ((value - dataMin) / range) * chartHeight

  // Linhas de referência
  const meanLine = yScale(stats.mean)
  const uclLine = limits.uclX ? yScale(limits.uclX) : null
  const lclLine = limits.lclX ? yScale(limits.lclX) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
            <Badge variant="outline">
              {CONTROL_CHART_TYPE_LABELS[chartType]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {data.violations.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {data.violations.length} violações
              </Badge>
            )}
            {data.violations.length === 0 && (
              <Badge className="bg-green-100 text-green-800">
                ✓ Dentro dos limites
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Carta de Controle</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div className="border rounded-lg p-4 bg-white">
              <svg width={width} height={height} className="overflow-visible">
                {/* Eixos */}
                <line
                  x1={margin.left}
                  y1={margin.top + chartHeight}
                  x2={margin.left + chartWidth}
                  y2={margin.top + chartHeight}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <line
                  x1={margin.left}
                  y1={margin.top}
                  x2={margin.left}
                  y2={margin.top + chartHeight}
                  stroke="#374151"
                  strokeWidth="1"
                />

                {/* Linha central (média) */}
                <line
                  x1={margin.left}
                  y1={margin.top + meanLine}
                  x2={margin.left + chartWidth}
                  y2={margin.top + meanLine}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />

                {/* Limites de controle superior */}
                {uclLine && (
                  <line
                    x1={margin.left}
                    y1={margin.top + uclLine}
                    x2={margin.left + chartWidth}
                    y2={margin.top + uclLine}
                    stroke="#EF4444"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                )}

                {/* Limites de controle inferior */}
                {lclLine && (
                  <line
                    x1={margin.left}
                    y1={margin.top + lclLine}
                    x2={margin.left + chartWidth}
                    y2={margin.top + lclLine}
                    stroke="#EF4444"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                )}

                {/* Dados */}
                <polyline
                  fill="none"
                  stroke="#1F2937"
                  strokeWidth="2"
                  points={values.map((value, index) =>
                    `${margin.left + xScale(index)},${margin.top + yScale(value)}`
                  ).join(' ')}
                />

                {/* Pontos */}
                {values.map((value, index) => (
                  <circle
                    key={index}
                    cx={margin.left + xScale(index)}
                    cy={margin.top + yScale(value)}
                    r={violations.includes(index) ? "6" : "4"}
                    fill={violations.includes(index) ? "#EF4444" : "#1F2937"}
                    stroke={violations.includes(index) ? "#DC2626" : "#374151"}
                    strokeWidth="2"
                  />
                ))}

                {/* Labels */}
                <text x={margin.left - 10} y={margin.top + meanLine} textAnchor="end" className="text-sm fill-gray-600">
                  Média: {stats.mean.toFixed(2)}
                </text>
                {uclLine && (
                  <text x={margin.left - 10} y={margin.top + uclLine} textAnchor="end" className="text-sm fill-red-600">
                    UCL: {limits.uclX?.toFixed(2)}
                  </text>
                )}
                {lclLine && (
                  <text x={margin.left - 10} y={margin.top + lclLine} textAnchor="end" className="text-sm fill-red-600">
                    LCL: {limits.lclX?.toFixed(2)}
                  </text>
                )}
              </svg>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.mean.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Média</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.stdDev.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Desvio Padrão</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.min.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Mínimo</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.max.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Máximo</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Limites de Controle</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {limits.uclX && (
                    <div>UCL: <span className="font-mono">{limits.uclX.toFixed(3)}</span></div>
                  )}
                  {limits.lclX && (
                    <div>LCL: <span className="font-mono">{limits.lclX.toFixed(3)}</span></div>
                  )}
                  <div>Média: <span className="font-mono">{stats.mean.toFixed(3)}</span></div>
                  <div>DP: <span className="font-mono">{stats.stdDev.toFixed(3)}</span></div>
                </div>
              </div>

              {data.rules.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-800">Regras de Western Electric Violadas</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {data.rules.map((rule, index) => (
                      <li key={index}>• {rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Interpretação</h4>
                <p className="text-sm text-gray-700">
                  {data.violations.length > 0
                    ? `Processo apresenta ${data.violations.length} ponto(s) fora de controle. Análise detalhada necessária.`
                    : 'Processo dentro dos limites de controle. Monitoramento normal recomendado.'
                  }
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
