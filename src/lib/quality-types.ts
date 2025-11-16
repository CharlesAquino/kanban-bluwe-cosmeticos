export interface QualityParameter {
  id: string
  productId: string
  productName: string
  batch: string
  stage: string
  parameter: 'pH' | 'viscosidade' | 'cor' | 'densidade' | 'estabilidade' | 'pureza'
  targetValue: number
  tolMin: number
  tolMax: number
  measuredValue: number
  unit: string
  operator: string
  timestamp: string
  approved: boolean
  notes?: string
}

export interface NonConformity {
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
