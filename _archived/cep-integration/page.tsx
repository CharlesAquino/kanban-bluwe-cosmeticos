import { redirect } from 'next/navigation'

export default function CEPIntegrationPage() {
  redirect('/dashboard')
}
    ? new Date(lastUpdate).toLocaleString('pt-BR')
    : 'Carregando...'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Análise CEP
              </h1>
              <p className="text-gray-600">
                Controle Estatístico de Processo - Bluwe Cosméticos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Estados globais: carregando/erro */}
      {(loading || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {loading && (
            <div className="flex items-center justify-between rounded-lg border p-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Carregando dados globais...</span>
              </div>
              {stalled && (
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Carregamento mais lento que o esperado. Tente atualizar.</span>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border p-3 bg-red-50 border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>Falha ao carregar dados: {error}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo CEP */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processos Estáveis</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {cepData?.controlCharts?.filter((c: any) => c.status === 'normal').length || 0}
              </div>
              <p className="text-xs text-green-700">
                Dentro dos limites
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidade Média</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {cepData?.capabilityIndices?.length > 0
                  ? Math.round(cepData.capabilityIndices.reduce((acc: number, c: any) => acc + c.cp, 0) / cepData.capabilityIndices.length * 100) / 100
                  : 0}
              </div>
              <p className="text-xs text-blue-700">
                Índice Cp médio
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendências Positivas</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {cepData?.trends?.filter((t: any) => t.trend === 'up').length || 0}
              </div>
              <p className="text-xs text-purple-700">
                Melhorias detectadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {cepData?.controlCharts?.filter((c: any) => c.status !== 'normal').length || 0}
              </div>
              <p className="text-xs text-red-700">
                Fora dos limites
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Controle */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cartas de Controle
            </CardTitle>
            <p className="text-sm text-gray-600">
              Monitoramento estatístico dos processos de produção
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cepData?.controlCharts?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma carta de controle configurada.</p>
                  <p className="text-sm">Configure cartas para monitorar processos.</p>
                </div>
              ) : (
                cepData?.controlCharts?.map((chart: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{chart.name}</p>
                      <p className="text-sm text-gray-600">
                        Último valor: {chart.lastValue}
                      </p>
                    </div>
                    <Badge variant={chart.status === 'normal' ? 'default' : 'destructive'}>
                      {chart.status === 'normal' ? 'Normal' : 'Fora do limite'}
                    </Badge>
                  </div>
                )) || []
              )}
            </div>
          </CardContent>
        </Card>

        {/* Índices de Capacidade */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Índices de Capacidade do Processo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cepData?.capabilityIndices?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum índice calculado.</p>
                </div>
              ) : (
                cepData?.capabilityIndices?.map((index: any, i: number) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{index.process}</p>
                      <p className="text-sm text-gray-600">Processo</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{index.cp}</p>
                      <p className="text-sm text-gray-600">Cp</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{index.cpk}</p>
                      <p className="text-sm text-gray-600">Cpk</p>
                    </div>
                  </div>
                )) || []
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tendências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de Tendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cepData?.trends?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tendência detectada.</p>
                </div>
              ) : (
                cepData?.trends?.map((trend: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        trend.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{trend.metric}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          Tendência: {trend.trend === 'up' ? 'Melhorando' : 'Piorando'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={trend.trend === 'up' ? 'default' : 'destructive'}>
                      {trend.change}
                    </Badge>
                  </div>
                )) || []
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integração com Produção */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Integração com Sistema de Produção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Dados Sincronizados:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Produtos ativos: {products.length}</li>
                  <li>• Última atualização: {displayLastUpdate}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Navegação:</h4>
                <div className="space-y-2">
                  <Link href="/bpm" prefetch={false} className="inline-flex w-full">
                    <Button size="sm" className="w-full">
                      Gerenciar BPM
                    </Button>
                  </Link>
                  <Link href="/hourly-control" prefetch={false} className="inline-flex w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Controle Hora a Hora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
