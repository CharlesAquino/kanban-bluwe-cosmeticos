'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs'
import {
  Plus,
  BarChart3,
  Calculator,
  Activity,
  TrendingUp,
  Settings,
  Target
} from 'lucide-react'
import { ControlChart } from '@/components/control-chart'
import { ProcessCapability } from '@/components/process-capability'
import type { ControlChartType } from '@/lib/types'

interface CEPChart {
  id: string
  name: string
  chartType: ControlChartType
  characteristic: string
  isActive: boolean
  createdAt: string
}

interface CEPData {
  data: any[]
  stats: any
  limits: any
  violations: number[]
  rules: string[]
}

export default function CEPPage() {
  const [charts, setCharts] = useState<CEPChart[]>([])
  const [selectedChart, setSelectedChart] = useState<string>('')
  const [chartData, setChartData] = useState<CEPData | null>(null)
  const [capabilityData, setCapabilityData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Formulário para nova carta
  const [newChart, setNewChart] = useState({
    name: '',
    chartType: 'x_bar_r' as ControlChartType,
    characteristic: '',
    sampleSize: 5,
    frequency: 1
  })

  // Dados de teste para demonstração
  const [testData, setTestData] = useState<number[]>([])

  useEffect(() => {
    loadCharts()
  }, [])

  const loadCharts = async () => {
    try {
      const response = await fetch('/api/cep/charts')
      const result = await response.json()
      if (result.success) {
        setCharts(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar cartas:', error)
    }
  }

  const createChart = async () => {
    if (!newChart.name || !newChart.characteristic) return

    try {
      setLoading(true)
      const response = await fetch('/api/cep/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChart)
      })

      const result = await response.json()
      if (result.success) {
        setNewChart({
          name: '',
          chartType: 'x_bar_r',
          characteristic: '',
          sampleSize: 5,
          frequency: 1
        })
        loadCharts()
      }
    } catch (error) {
      console.error('Erro ao criar carta:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async (chartId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cep/analysis/${chartId}`)
      const result = await response.json()
      if (result.success) {
        setChartData(result.data)
        setCapabilityData(null) // Reset capability data
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCapability = async (chartId: string, lsl: number, usl: number) => {
    try {
      const response = await fetch(`/api/cep/analysis/${chartId}/capability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lsl, usl })
      })

      const result = await response.json()
      if (result.success) {
        setCapabilityData(result.data)
      }
    } catch (error) {
      console.error('Erro ao calcular capacidade:', error)
    }
  }

  const addTestData = async () => {
    if (!selectedChart || testData.length === 0) return

    try {
      const response = await fetch('/api/cep/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlChartId: selectedChart,
          measurements: testData,
          subgroup: 1,
          operator: 'Sistema Demo',
          notes: 'Dados de teste para demonstração'
        })
      })

      if (response.ok) {
        loadChartData(selectedChart)
        setTestData([])
      }
    } catch (error) {
      console.error('Erro ao adicionar dados:', error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Controle Estatístico de Processos (CEP)
          </h1>
          <p className="text-muted-foreground">
            Monitoramento estatístico da qualidade e capacidade do processo
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Sistema Integrado com Controle Hora a Hora
        </Badge>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts">Cartas de Controle</TabsTrigger>
          <TabsTrigger value="data">Dados de Processo</TabsTrigger>
          <TabsTrigger value="capability">Capacidade</TabsTrigger>
          <TabsTrigger value="setup">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Lista de cartas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Cartas de Controle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {charts.map((chart) => (
                    <div
                      key={chart.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedChart === chart.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedChart(chart.id)
                        loadChartData(chart.id)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-gray-500">
                            {chart.characteristic} • {chart.chartType}
                          </div>
                        </div>
                        <Badge variant={chart.isActive ? 'default' : 'secondary'}>
                          {chart.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {charts.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma carta de controle configurada
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfico da carta selecionada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Visualização da Carta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedChart && chartData ? (
                  <ControlChart
                    data={chartData}
                    chartType={charts.find(c => c.id === selectedChart)?.chartType || 'x_bar_r'}
                    title={charts.find(c => c.id === selectedChart)?.name || ''}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Selecione uma carta de controle para visualizar
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Dados de Processo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="measurements">Medidas (separadas por vírgula)</Label>
                  <Input
                    id="measurements"
                    placeholder="Ex: 10.1, 10.2, 9.9, 10.3, 10.0"
                    value={testData.join(', ')}
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
                      setTestData(values)
                    }}
                  />
                </div>
                <div>
                  <Label>Carta Selecionada</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {charts.find(c => c.id === selectedChart)?.name || 'Nenhuma selecionada'}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={addTestData} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Dados
                  </Button>
                </div>
              </div>

              {testData.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    {testData.length} medições preparadas: {testData.join(', ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capability" className="space-y-6">
          <ProcessCapability
            capabilityData={capabilityData}
            onCalculate={(lsl, usl) => selectedChart && calculateCapability(selectedChart, lsl, usl)}
          />
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Nova Carta de Controle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="chartName">Nome da Carta</Label>
                  <Input
                    id="chartName"
                    placeholder="Ex: Viscosidade - Produção 1kg"
                    value={newChart.name}
                    onChange={(e) => setNewChart({...newChart, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="characteristic">Característica</Label>
                  <Input
                    id="characteristic"
                    placeholder="Ex: viscosidade, pH, temperatura"
                    value={newChart.characteristic}
                    onChange={(e) => setNewChart({...newChart, characteristic: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Tipo de Carta</Label>
                  <Select
                    value={newChart.chartType}
                    onValueChange={(value) => setNewChart({...newChart, chartType: value as ControlChartType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x_bar_r">X-barra e R</SelectItem>
                      <SelectItem value="x_bar_s">X-barra e S</SelectItem>
                      <SelectItem value="i_mr">Individuais e MR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sampleSize">Tamanho da Amostra</Label>
                  <Input
                    id="sampleSize"
                    type="number"
                    min="2"
                    max="20"
                    value={newChart.sampleSize}
                    onChange={(e) => setNewChart({...newChart, sampleSize: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Button onClick={createChart} disabled={loading} className="w-full">
                {loading ? 'Criando...' : 'Criar Carta de Controle'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
