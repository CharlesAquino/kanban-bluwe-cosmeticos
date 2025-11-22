'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Clock, AlertTriangle, CheckCircle, BarChart3, Activity, Calendar, Filter } from 'lucide-react'
import Link from 'next/link'

export default function AnaliseOperadorPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedOperator, setSelectedOperator] = useState('all')

  // Dados mockados para análise
  const operatorsData = [
    {
      id: 1,
      name: 'João Silva',
      efficiency: 92,
      tasksCompleted: 45,
      avgTime: 12.5,
      qualityScore: 4.8,
      status: 'active'
    },
    {
      id: 2,
      name: 'Maria Santos',
      efficiency: 88,
      tasksCompleted: 38,
      avgTime: 14.2,
      qualityScore: 4.6,
      status: 'active'
    },
    {
      id: 3,
      name: 'Pedro Oliveira',
      efficiency: 95,
      tasksCompleted: 52,
      avgTime: 11.8,
      qualityScore: 4.9,
      status: 'active'
    }
  ]

  const periodOptions = [
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'busy':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'offline':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-emerald-600'
    if (efficiency >= 80) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-blue-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Análise de Operadores</h1>
                <p className="text-sm text-blue-700">Métricas de desempenho e produtividade</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  ← Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Filtros */}
        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Período:</span>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Selecionar período de análise"
              title="Selecionar período de análise"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-700">Operador:</span>
            <select 
              value={selectedOperator} 
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Selecionar operador específico"
              title="Selecionar operador específico"
            >
              <option value="all">Todos</option>
              {operatorsData.map(operator => (
                <option key={operator.id} value={operator.id}>{operator.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 border-blue-200 shadow-sm">
            <div className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-900">{operatorsData.length}</div>
              <div className="text-sm text-blue-600">Operadores Ativos</div>
            </div>
          </Card>
          <Card className="bg-white/80 border-blue-200 shadow-sm">
            <div className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl font-bold text-emerald-900">91.7%</div>
              <div className="text-sm text-emerald-600">Eficiência Média</div>
            </div>
          </Card>
          <Card className="bg-white/80 border-blue-200 shadow-sm">
            <div className="p-4 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold text-amber-900">135</div>
              <div className="text-sm text-amber-600">Tarefas Concluídas</div>
            </div>
          </Card>
          <Card className="bg-white/80 border-blue-200 shadow-sm">
            <div className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <div className="text-2xl font-bold text-indigo-900">4.8</div>
              <div className="text-sm text-indigo-600">Qualidade Média</div>
            </div>
          </Card>
        </div>

        {/* Tabela de Operadores */}
        <Card className="bg-white/90 border border-blue-200 shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Desempenho Individual</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-blue-700">Operador</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-blue-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-blue-700">Eficiência</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-blue-700">Tarefas</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-blue-700">Tempo Médio</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-blue-700">Qualidade</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-blue-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {operatorsData.map((operator) => (
                    <tr key={operator.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-blue-900">{operator.name}</div>
                          <div className="text-xs text-blue-600">ID: #{operator.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(operator.status)}>
                          {operator.status === 'active' ? 'Ativo' : 'Offline'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`font-semibold ${getEfficiencyColor(operator.efficiency)}`}>
                          {operator.efficiency}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-blue-900">{operator.tasksCompleted}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-blue-900">{operator.avgTime} min</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-blue-900">{operator.qualityScore}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-3 h-3 rounded-full ${i < Math.floor(operator.qualityScore) ? 'bg-amber-400' : 'bg-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Gráficos e Métricas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/90 border border-blue-200 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Tendência de Produtividade</h3>
              <div className="h-64 flex items-center justify-center text-blue-600">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                  <p>Gráfico de produtividade em desenvolvimento</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/90 border border-blue-200 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Distribuição de Tarefas</h3>
              <div className="h-64 flex items-center justify-center text-blue-600">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Gráfico de distribuição em desenvolvimento</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
