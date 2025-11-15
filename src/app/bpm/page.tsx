'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Workflow,
  Activity,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Settings,
  Play,
} from 'lucide-react'
import { useGlobalState, useGlobalActions } from '@/contexts/global-context'
import Link from 'next/link'
import type { ProcessDefinition } from '@/lib/types'

export default function BPMPage() {
  const { state } = useGlobalState()
  const { refreshData } = useGlobalActions()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    await refreshData()
    setIsLoading(false)
  }

  // Evitar hydration mismatch mostrando timestamp apenas após montagem
  const displayLastUpdate = mounted && state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleString('pt-BR')
    : 'Nunca'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Workflow className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gerenciamento BPM</h1>
            <p className="text-sm text-slate-500 font-medium">Business Process Management • Bluwe Cosméticos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link href="/" className="inline-flex">
            <Button variant="outline" size="sm">
              <Workflow className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="space-y-6">
        {/* Cards de Resumo BPM - Modernizados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Processos BPM</CardTitle>
              <div className="p-2 bg-slate-50 rounded-lg">
                <Workflow className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {state.bpmMetrics.totalProcesses}
              </div>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Total configurados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Processos Ativos</CardTitle>
              <div className="p-2 bg-slate-50 rounded-lg">
                <Play className="h-4 w-4 text-emerald-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {state.bpmMetrics.activeProcesses}
              </div>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Em execução agora
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200" style={{animationDelay: '0.2s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Eficiência Média</CardTitle>
              <div className="p-2 bg-slate-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-indigo-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {Math.round(state.bpmMetrics.averageEfficiency)}%
              </div>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Performance geral
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200" style={{animationDelay: '0.3s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Concluídos</CardTitle>
              <div className="p-2 bg-slate-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {state.bpmMetrics.completedProcesses}
              </div>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Finalizados hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Processos BPM - Modernizada */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Processos BPM Configurados
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Gerencie e monitore os processos de negócio da produção
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.bpmProcesses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Workflow className="h-10 w-10 text-indigo-400" />
                  </div>
                  <p className="font-semibold text-gray-700">Nenhum processo BPM configurado ainda</p>
                  <p className="text-sm mt-1">Configure processos para otimizar a produção</p>
                </div>
              ) : (
                state.bpmProcesses.map((process: ProcessDefinition) => (
                  <div key={process.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-4 h-4 rounded-full ${
                          process.status === 'active' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                        }`}></div>
                        {process.status === 'active' && (
                          <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{process.name}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          Status: <span className="font-medium">{process.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                        process.status === 'active' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        Concl.: {process.completedInstances}/{process.totalInstances}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integração com Produção - Modernizada */}
        <Card className="mt-6 bg-white border border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-lg shadow-pink-500/30">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Integração com Sistema de Produção
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl border border-slate-200/70">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Dados Sincronizados
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Produtos ativos</span>
                    <span className="font-bold text-blue-600">{state.products.length}</span>
                  </li>
                  <li className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Eficiência média</span>
                    <span className="font-bold text-purple-600">
                      {Math.round(state.stats.total > 0 ? (state.stats.inProgress / state.stats.total) * 100 : 0)}%
                    </span>
                  </li>
                  <li className="flex items-center justify-between p-3 bg-pink-50/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Eventos registrados</span>
                    <span className="font-bold text-pink-600">{state.processHistory.length}</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-white rounded-xl border border-slate-200/70">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-indigo-600" />
                  Última Atualização
                </h4>
                <p className="text-sm text-gray-600 mb-4 p-3 bg-indigo-50/50 rounded-lg font-medium">
                  {displayLastUpdate}
                </p>
                <Link href="/hourly-control" className="inline-flex w-full">
                  <Button className="w-full bg-blue-800 hover:bg-blue-700 text-white">
                    <Activity className="h-4 w-4 mr-2" />
                    Ver Controle Hora a Hora
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
