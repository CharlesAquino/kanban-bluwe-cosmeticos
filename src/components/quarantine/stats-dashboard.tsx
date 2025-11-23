/**
 * Dashboard de Estatísticas - Quarentena
 */

import React from 'react'
import { Lock, Archive, Timer, Package, TrendingUp } from 'lucide-react'
import { AnimatedCounter, Glow, CardEntrance } from './quarantine-animations'

interface StatsDashboardProps {
  total: number
  families: number
  avgDays: number
  totalKg: number
  byStatus: Record<string, number>
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  total,
  families,
  avgDays,
  totalKg,
  byStatus,
}) => {
  const stats = [
    {
      label: 'Itens em Quarentena',
      value: total,
      icon: Lock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-100 to-blue-50',
    },
    {
      label: 'Famílias',
      value: families,
      icon: Archive,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-100 to-indigo-50',
    },
    {
      label: 'Tempo Médio',
      value: avgDays,
      icon: Timer,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-100 to-purple-50',
      suffix: 'd',
    },
    {
      label: 'Volume Total',
      value: totalKg,
      icon: Package,
      color: 'from-slate-500 to-slate-600',
      bgColor: 'from-slate-100 to-slate-50',
      suffix: 'kg',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <CardEntrance key={idx} delay={idx * 50}>
            <div className="group relative">
              <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300`}></div>
              <div className={`relative bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-xl border border-white/50`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      <AnimatedCounter from={0} to={stat.value} duration={1000} suffix={stat.suffix || ''} />
                    </p>
                  </div>
                  <Glow color={stat.color.split('-')[1]} intensity="high">
                    <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </Glow>
                </div>
              </div>
            </div>
          </CardEntrance>
        )
      })}
    </div>
  )
}

export const StatusDistribution: React.FC<{ byStatus: Record<string, number>; total: number }> = ({
  byStatus,
  total,
}) => {
  // Validar que byStatus é um objeto válido
  if (!byStatus || typeof byStatus !== 'object' || Object.keys(byStatus).length === 0) {
    return null
  }

  const statusConfig = {
    quarantine: { label: '🔒 Em Quarentena', color: 'from-amber-500 to-amber-600' },
    released: { label: '✅ Liberado', color: 'from-emerald-500 to-emerald-600' },
    pending: { label: '⏳ Pendente', color: 'from-violet-500 to-violet-600' },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Object.entries(byStatus).map(([status, count], idx) => {
        const config = statusConfig[status as keyof typeof statusConfig]
        if (!config) return null

        const percentage = total > 0 ? (count / total) * 100 : 0

        return (
          <CardEntrance key={status} delay={idx * 50}>
            <div className="group relative">
              <div className={`absolute -inset-1 bg-gradient-to-r ${config.color} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{config.label}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{count}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${config.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{percentage.toFixed(1)}% do total</p>
              </div>
            </div>
          </CardEntrance>
        )
      })}
    </div>
  )
}

export default StatsDashboard
