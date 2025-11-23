/**
 * Seção de Analytics - Quarentena
 */

import React from 'react'
import { TrendingUp, Calendar, Package } from 'lucide-react'
import { AnimatedProgressBar, CardEntrance } from './quarantine-animations'
import { getFamilyPalette } from '@/lib/quarantine-design-system'
import { SemiItem } from '@/lib/semi-finished-lib'

interface AnalyticsSectionProps {
  items: SemiItem[]
  families: string[]
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ items, families }) => {
  return (
    <>
      {/* Top Families */}
      <CardEntrance delay={0}>
        <div className="group relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Famílias Mais Frequentes
            </h3>
            <div className="space-y-4">
              {families.slice(0, 5).map((family) => {
                const count = items.filter((i) => i.family === family).length
                const percentage = ((count / items.length) * 100).toFixed(1)
                return (
                  <div key={family}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">{family}</span>
                      <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                    </div>
                    <AnimatedProgressBar value={parseFloat(percentage)} max={100} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardEntrance>

      {/* Timeline */}
      <CardEntrance delay={50}>
        <div className="group relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Tempo em Quarentena
            </h3>
            <div className="space-y-4">
              {[
                { label: '0-7 dias', percentage: 35 },
                { label: '7-14 dias', percentage: 45 },
                { label: '14-30 dias', percentage: 15 },
                { label: '30+ dias', percentage: 5 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                  <AnimatedProgressBar value={item.percentage} max={100} color="from-indigo-500 to-indigo-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardEntrance>

      {/* Volume Distribution */}
      <CardEntrance delay={100}>
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Distribuição de Volume por Família
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {families.map((family) => {
                const familyItems = items.filter((i) => i.family === family)
                const totalVolume = familyItems.reduce((sum, i) => sum + (i.quantity_total || 0), 0)
                const palette = getFamilyPalette(family)
                return (
                  <div key={family} className={`bg-gradient-to-br ${palette.gradient} rounded-xl p-4 text-white shadow-lg`}>
                    <p className="text-sm font-medium opacity-90 mb-1">{family}</p>
                    <p className="text-2xl font-bold">{totalVolume}kg</p>
                    <p className="text-xs opacity-75 mt-2">{familyItems.length} itens</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardEntrance>
    </>
  )
}

export default AnalyticsSection
