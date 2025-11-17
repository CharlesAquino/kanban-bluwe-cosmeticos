'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Package, CheckCircle, AlertTriangle, Pause, Play } from 'lucide-react'
import { Carousel } from '@/components/ui/carousel'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'none'
  color?: 'blue' | 'green' | 'slate' | 'red'
}

export function StatsCard({ title, value, icon, trend = 'none', color = 'slate' }: StatsCardProps) {
  const colorToTone: Record<string, string> = {
    blue: 'text-slate-700',
    green: 'text-green-600',
    slate: 'text-slate-700',
    red: 'text-red-600',
  }

  const colorToBg: Record<string, string> = {
    blue: 'bg-slate-100',
    green: 'bg-green-50',
    slate: 'bg-slate-100',
    red: 'bg-red-50',
  }

  return (
    <Card className="bg-white border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-xl ${colorToBg[color]} ${colorToTone[color]} shadow-sm`}>
            {icon}
          </div>
          {trend !== 'none' && (
            <div className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↗' : '↘'}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
        <p className="text-sm text-slate-600 font-medium">{title}</p>
      </CardContent>
    </Card>
  )
}

export interface DashboardStats {
  total: number
  inProgress: number
  paused: number
  completed: number
  blocked: number
}

interface DashboardProps {
  stats: DashboardStats
}

export function Dashboard({ stats }: DashboardProps) {
  return (
    <Carousel className="carousel-center">
      <div className="w-52">
        <StatsCard
          title="Total"
          value={stats.total}
          icon={<Package className="h-5 w-5" />}
          color="slate"
        />
      </div>
      <div className="w-52">
        <StatsCard
          title="Em Andamento"
          value={stats.inProgress}
          icon={<Play className="h-5 w-5" />}
          trend={stats.inProgress > 0 ? 'up' : 'none'}
          color="slate"
        />
      </div>
      <div className="w-52">
        <StatsCard
          title="Pausados"
          value={stats.paused}
          icon={<Pause className="h-5 w-5" />}
          trend={stats.paused > 0 ? 'down' : 'none'}
          color="slate"
        />
      </div>
      <div className="w-52">
        <StatsCard
          title="Bloqueados"
          value={stats.blocked}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={stats.blocked > 0 ? 'down' : 'none'}
          color="red"
        />
      </div>
      <div className="w-52">
        <StatsCard
          title="Concluídos"
          value={stats.completed}
          icon={<CheckCircle className="h-5 w-5" />}
          trend="up"
          color="green"
        />
      </div>
    </Carousel>
  )
}
