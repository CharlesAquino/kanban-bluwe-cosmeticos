'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  BarChart3, 
  Users, 
  Eye,
  TrendingUp,
  Settings,
  FileText,
  Activity
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      title: 'Dashboard de Produção',
      description: 'Acompanhamento em tempo real da produção do setor de mistura e manipulação.',
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      href: '/dashboard',
      badge: 'Principal',
      badgeColor: 'bg-blue-100 text-blue-800',
      stats: {
        label: 'Atualizado',
        value: 'Agora'
      }
    },
    {
      title: 'Análise por Operador',
      description: 'Avaliação de desempenho individual e indicadores de MOD.',
      icon: <Users className="h-8 w-8 text-purple-600" />,
      href: '/analise-operador',
      badge: 'Estratégico',
      badgeColor: 'bg-purple-100 text-purple-800',
      stats: {
        label: 'Operadores',
        value: '4'
      }
    },
    {
      title: 'Produção',
      description: 'Fluxo de produção em formato Kanban (somente leitura).',
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      href: '/kanban-overview',
      badge: 'Visual',
      badgeColor: 'bg-orange-100 text-orange-800',
      stats: {
        label: 'Em andamento',
        value: '8'
      }
    },
    {
      title: 'Kanban de Semi-acabados',
      description: 'Monitoramento de lotes de semi-acabados e status de envase.',
      icon: <Package className="h-8 w-8 text-teal-600" />,
      href: '/semi-finished-overview',
      badge: 'Envase',
      badgeColor: 'bg-teal-100 text-teal-800',
      stats: {
        label: 'Lotes em estoque',
        value: '–'
      }
    }
  ]

  const quickActions = [
    {
      title: 'Baixar Relatório do Dia',
      description: 'Exportar produção diária em PDF/Excel',
      icon: <FileText className="h-5 w-5" />,
      href: '#',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    },
    {
      title: 'Ver Histórico Completo',
      description: 'Acessar dados históricos de produção',
      icon: <Activity className="h-5 w-5" />,
      href: '#',
      color: 'bg-green-50 text-green-700 hover:bg-green-100'
    },
    {
      title: 'Configurações',
      description: 'Ajustar parâmetros do sistema',
      icon: <Settings className="h-5 w-5" />,
      href: '#',
      color: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    }
  ]

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Sistema de Produção - Mistura e Manipulação
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-4 max-w-2xl">
          Centro de monitoramento para acompanhamento e análise da produção, MOD e qualidade.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Badge className="bg-green-100 text-green-800">
            ✅ Sistema Online
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            🔄 Auto-refresh: 30s
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            👥 4 Operadores ativos
          </Badge>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {features.map((feature, index) => (
          <Link key={index} href={feature.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <Badge className={feature.badgeColor} variant="secondary">
                        {feature.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex justify-between items-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    Acessar
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{feature.stats.label}</p>
                    <p className="text-lg font-bold text-gray-900">{feature.stats.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`justify-start h-auto p-4 ${action.color}`}
                asChild
              >
                <Link href={action.href}>
                  <div className="flex items-start gap-3">
                    {action.icon}
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm opacity-80">{action.description}</p>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Rápido */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">245.8 kg</p>
            <p className="text-sm text-gray-600">Produção do Dia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">94.2%</p>
            <p className="text-sm text-gray-600">Eficiência</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">4</p>
            <p className="text-sm text-gray-600">Operadores Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-gray-600">OPs em Andamento</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
