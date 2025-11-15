export type StatusUI = {
  label: string
  icon: string
  badgeClass: string
}

export function getStatusUI(status: unknown): StatusUI {
  const s = String(status).toLowerCase()
  switch (s) {
    case 'active':
      return { label: 'Em Andamento', icon: '🔄', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' }
    case 'paused':
      return { label: 'Pausado', icon: '⏸️', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    case 'completed':
      return { label: 'Concluído', icon: '✅', badgeClass: 'bg-green-100 text-green-800 border-green-200' }
    case 'blocked':
      return { label: 'Bloqueado', icon: '🚫', badgeClass: 'bg-red-100 text-red-800 border-red-200' }
    case 'cancelled':
      return { label: 'Cancelado', icon: '🚫', badgeClass: 'bg-gray-200 text-gray-800 border-gray-300' }
    default:
      return { label: s, icon: '•', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
}
