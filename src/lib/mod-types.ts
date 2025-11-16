export interface ModOperator {
  id: string
  name: string
  role: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  photo?: string | null
}

export interface ModActivity {
  id: string
  operatorId: string
  type: string
  description: string
  productId?: string | null
  startedAt: string
  endedAt?: string | null
  createdAt: string
  operatorName?: string
}
