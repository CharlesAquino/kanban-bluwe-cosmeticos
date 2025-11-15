'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Beaker,
  FileText,
  Activity,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react'
import { useGlobalData, useGlobalActions } from '@/contexts/global-context'
import { QualityTestForm } from '@/components/quality/quality-test-form'
import { NonConformityForm } from '@/components/quality/non-conformity-form'
import Link from 'next/link'

// Tipos específicos para controle da qualidade de cosméticos
interface QualityParameter {
  id: string
  productId: string
  productName: string
  batch: string
  stage: string
  parameter: 'pH' | 'viscosidade' | 'cor' | 'densidade' | 'estabilidade' | 'pureza'
  targetValue: number
  tolerance: { min: number, max: number }
  measuredValue: number
  unit: string
  operator: string
  timestamp: string
  approved: boolean
  notes?: string
}

interface NonConformity {
  id: string
  productId: string
  productName: string
  batch: string
  stage: string
  type: 'qualidade' | 'processo' | 'material' | 'equipamento'
  severity: 'critical' | 'major' | 'minor'
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  createdAt: string
  responsible?: string
  deadline?: string
}

// Sem dados mockados: integrações reais virão das APIs/Contexto

export default function QualityPage() {
  const { products } = useGlobalData()
  const { refreshData } = useGlobalActions()
  const [qualityData, setQualityData] = useState<QualityParameter[]>([])
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Filtros
  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [filterParameter, setFilterParameter] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchQualityTests = async () => {
    try {
      const res = await fetch('/api/quality/tests', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao buscar análises')
      const json = await res.json()
      setQualityData(Array.isArray(json?.data) ? json.data : [])
    } catch (e) {
      console.error('Erro ao carregar quality tests', e)
      setQualityData([])
    }
  }

  const fetchNonConformities = async () => {
    try {
      const res = await fetch('/api/quality/nc', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao buscar NCs')
      const json = await res.json()
      setNonConformities(Array.isArray(json?.data) ? json.data : [])
    } catch (e) {
      console.error('Erro ao carregar NCs', e)
      setNonConformities([])
    }
  }

  const reloadAll = async () => {
    await Promise.all([fetchQualityTests(), fetchNonConformities()])
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await refreshData()
    await reloadAll()
    setIsLoading(false)
  }

  // Filtrar dados
  const filteredQualityData = qualityData.filter(test => {
    if (filterProduct !== 'all' && test.productId !== filterProduct) return false
    if (filterParameter !== 'all' && test.parameter !== filterParameter) return false
    if (filterStatus === 'approved' && !test.approved) return false
    if (filterStatus === 'rejected' && test.approved) return false
    return true
  })

  // Cálculos para dashboard
  const qualityStats = {
    totalTests: filteredQualityData.length,
    approvedTests: filteredQualityData.filter(q => q.approved).length,
    rejectedTests: filteredQualityData.filter(q => !q.approved).length,
    approvalRate: filteredQualityData.length > 0 ? (filteredQualityData.filter(q => q.approved).length / filteredQualityData.length) * 100 : 0,
    openNonConformities: nonConformities.filter(nc => nc.status !== 'closed').length
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getParameterIcon = (parameter: string) => {
    switch (parameter) {
      case 'pH': return '🧪'
      case 'viscosidade': return '🌊'
      case 'cor': return '🎨'
      case 'densidade': return '⚖️'
      default: return '📊'
    }
  }

  useEffect(() => {
    reloadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Sistema Integrado de Qualidade
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Controle da Qualidade • Cosméticos • Bluwe
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link href="/" prefetch={false} className="inline-flex">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </Link>
        </div>
      </div>

      {/* Alertas de Análises Reprovadas */}
      {qualityData.filter(q => !q.approved).length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas de Qualidade ({qualityData.filter(q => !q.approved).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qualityData.filter(q => !q.approved).slice(0, 3).map(test => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{test.productName}</p>
                      <p className="text-xs text-gray-600">
                        {test.parameter}: {test.measuredValue} {test.unit} (Esperado: {test.tolerance.min}-{test.tolerance.max})
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">Reprovado</Badge>
                </div>
              ))}
              {qualityData.filter(q => !q.approved).length > 3 && (
                <p className="text-xs text-orange-700 text-center pt-2">
                  +{qualityData.filter(q => !q.approved).length - 3} análises reprovadas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Taxa de Aprovação</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {Math.round(qualityStats.approvalRate)}%
            </div>
            <p className="text-xs text-green-700">
              {qualityStats.approvedTests}/{qualityStats.totalTests} testes aprovados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Não Conformidades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {qualityStats.openNonConformities}
            </div>
            <p className="text-xs text-red-700">
              abertas para resolução
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Testes Hoje</CardTitle>
            <Beaker className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {qualityStats.totalTests}
            </div>
            <p className="text-xs text-blue-700">
              análises realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Produtos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {products.length}
            </div>
            <p className="text-xs text-purple-700">
              em produção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="quality-control" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quality-control" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Controle da Qualidade
          </TabsTrigger>
          <TabsTrigger value="non-conformities" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Conformidades
          </TabsTrigger>
          <TabsTrigger value="specifications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Especificações
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Controle da Qualidade */}
        <TabsContent value="quality-control" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Análises de Controle da Qualidade
                </CardTitle>
                <QualityTestForm onTestAdded={reloadAll} />
              </div>
              <p className="text-sm text-gray-600">
                Monitoramento de parâmetros críticos: pH, viscosidade, cor, densidade
              </p>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              {qualityData.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Filtros</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="filter-product" className="text-xs">Produto</Label>
                      <Select value={filterProduct} onValueChange={setFilterProduct}>
                        <SelectTrigger id="filter-product" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {Array.from(new Set(qualityData.map(t => t.productId))).map(productId => {
                            const product = products.find(p => p.id === productId)
                            return (
                              <SelectItem key={productId} value={productId}>
                                {product?.name || productId}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-parameter" className="text-xs">Parâmetro</Label>
                      <Select value={filterParameter} onValueChange={setFilterParameter}>
                        <SelectTrigger id="filter-parameter" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="pH">pH</SelectItem>
                          <SelectItem value="viscosidade">Viscosidade</SelectItem>
                          <SelectItem value="cor">Cor</SelectItem>
                          <SelectItem value="densidade">Densidade</SelectItem>
                          <SelectItem value="estabilidade">Estabilidade</SelectItem>
                          <SelectItem value="pureza">Pureza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="filter-status" className="text-xs">Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger id="filter-status" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="approved">Aprovados</SelectItem>
                          <SelectItem value="rejected">Reprovados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(filterProduct !== 'all' || filterParameter !== 'all' || filterStatus !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 text-xs"
                      onClick={() => {
                        setFilterProduct('all')
                        setFilterParameter('all')
                        setFilterStatus('all')
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              )}
              
              {filteredQualityData.length === 0 && qualityData.length > 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Nenhuma análise encontrada</p>
                  <p className="text-sm mt-1">Ajuste os filtros para ver resultados</p>
                </div>
              ) : qualityData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Nenhuma análise registrada</p>
                  <p className="text-sm mt-1">Clique em &quot;Nova Análise&quot; para registrar a primeira análise de qualidade</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQualityData.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getParameterIcon(test.parameter)}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{test.productName}</p>
                        <p className="text-sm text-gray-600">
                          {test.parameter} • Lote {test.batch} • {test.stage.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Operador: {test.operator} • {new Date(test.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          <span className={test.approved ? 'text-green-600' : 'text-red-600'}>
                            {test.measuredValue}
                          </span>
                          <span className="text-gray-500"> / {test.targetValue} {test.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Tolerância: {test.tolerance.min}-{test.tolerance.max}
                        </div>
                      </div>
                      <Badge variant={test.approved ? 'default' : 'destructive'}>
                        {test.approved ? 'Aprovado' : 'Reprovado'}
                      </Badge>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Não Conformidades */}
        <TabsContent value="non-conformities" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sistema de Não Conformidades
                </CardTitle>
                <NonConformityForm onNCAdded={reloadAll} />
              </div>
              <p className="text-sm text-gray-600">
                CAPA - Corrective and Preventive Actions • Conformidade ANVISA
              </p>
            </CardHeader>
            <CardContent>
              {nonConformities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Nenhuma não conformidade registrada</p>
                  <p className="text-sm mt-1">Sistema CAPA (Corrective and Preventive Actions) pronto para uso</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nonConformities.map((nc) => (
                  <div key={nc.id} className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(nc.severity)}>
                            {nc.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {nc.type}
                          </Badge>
                          <Badge variant={
                            nc.status === 'open' ? 'destructive' :
                            nc.status === 'investigating' ? 'default' :
                            nc.status === 'resolved' ? 'secondary' : 'outline'
                          }>
                            {nc.status === 'open' ? 'Aberto' :
                             nc.status === 'investigating' ? 'Investigando' :
                             nc.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                          </Badge>
                        </div>
                        <p className="font-semibold text-gray-900">{nc.productName} - {nc.batch}</p>
                        <p className="text-sm text-gray-600 mt-1">{nc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Criado: {new Date(nc.createdAt).toLocaleDateString('pt-BR')}</span>
                      {nc.responsible && <span>Responsável: {nc.responsible}</span>}
                      {nc.deadline && <span>Prazo: {new Date(nc.deadline).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Especificações */}
        <TabsContent value="specifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Especificações de Qualidade
              </CardTitle>
              <p className="text-sm text-gray-600">
                Controle de fórmulas e parâmetros técnicos por produto
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">Especificações Técnicas</p>
                <p className="text-sm mt-1">Sistema de gestão de fórmulas em desenvolvimento</p>
                <Button className="mt-4" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Especificações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios de Qualidade
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análises e relatórios para conformidade regulatória
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">Relatórios de Qualidade</p>
                <p className="text-sm mt-1">Sistema de relatórios em desenvolvimento</p>
                <Button className="mt-4" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
