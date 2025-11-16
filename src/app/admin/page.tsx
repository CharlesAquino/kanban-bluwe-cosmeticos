'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Beaker, Users, Package, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

const adminPages = [
  {
    href: '/admin/quality',
    title: 'Qualidade Admin',
    description: 'Gerenciar análises de qualidade, RNCs e aprovações',
    icon: Beaker,
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    href: '/admin/mod',
    title: 'MOD Admin',
    description: 'Administrar operadores e equipes de produção',
    icon: Users,
    color: 'from-blue-500 to-blue-600'
  },
  {
    href: '/admin/kanban',
    title: 'Admin Kanban',
    description: 'Controlar fluxo de produção e finalizar produtos para semi-acabados',
    icon: Settings,
    color: 'from-purple-500 to-purple-600'
  },
  {
    href: '/semi-finished',
    title: 'Semi-acabados Admin',
    description: 'Gerenciar famílias e categorias de semi-acabados',
    icon: Package,
    color: 'from-emerald-500 to-emerald-600'
  }
]

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
              <p className="text-lg text-slate-600 mt-2">Gerenciamento do Sistema Bluwe Cosméticos</p>
            </div>
          </div>

          {/* Cards de Acesso Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminPages.map((page) => (
              <Card key={page.href} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${page.color} text-white`}>
                      <page.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 mb-4">{page.description}</p>
                  <Link href={page.href}>
                    <Button className={`w-full bg-gradient-to-r ${page.color} hover:opacity-90 transition-opacity`}>
                      Acessar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Acesso ao Overview */}
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                Acesso ao Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Acesse as páginas de visualização e operação do sistema para acompanhar produção, 
                qualidade e métricas em tempo real.
              </p>
              <Link href="/">
                <Button variant="outline" className="bg-white hover:bg-slate-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ir para Overview
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
