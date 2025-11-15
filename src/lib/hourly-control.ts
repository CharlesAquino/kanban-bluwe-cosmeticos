// Controle Hora a Hora - Sistema de acompanhamento de produtividade
export interface HourlyControl {
  id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  operator: string;
  productId: string;
  productName: string;
  targetQuantity: number; // Meta de produção por hora
  actualQuantity: number; // Produzido realmente
  efficiency: number; // Eficiência (%)
  status: 'on_track' | 'behind' | 'ahead' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakTime?: string;
}

export const SHIFTS: Shift[] = [
  { id: 'morning', name: 'Manhã', startTime: '06:00', endTime: '14:00', breakTime: '10:00-10:15' },
  { id: 'afternoon', name: 'Tarde', startTime: '14:00', endTime: '22:00', breakTime: '18:00-18:15' },
  { id: 'night', name: 'Noite', startTime: '22:00', endTime: '06:00', breakTime: '02:00-02:15' }
];

export const SHIFT_LABELS = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite'
} as const;

export const STATUS_LABELS = {
  on_track: 'No Prazo',
  behind: 'Atrasado',
  ahead: 'Adiantado',
  completed: 'Concluído'
} as const;

export const STATUS_COLORS = {
  on_track: 'bg-blue-100 text-blue-800',
  behind: 'bg-red-100 text-red-800',
  ahead: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800'
} as const;
