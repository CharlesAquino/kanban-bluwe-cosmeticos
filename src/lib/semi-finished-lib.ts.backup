import useSWR from 'swr'

export type SemiItem = {
  id: string
  productId: string
  name: string
  family: string
  op: string
  batch: string
  quantity_total: number
  quantity_envasado: number
  status: string
}

export type Bucket = {
  id: string
  semiFinishedId: string
  bucketIndex: number
  originalQuantityKg: number
  currentQuantityKg: number
  status: string
}

export const semiFinishedFetcher = async (url: string) => {
  console.log('📦 semiFinishedFetcher: Mock data para GitHub Pages')
  
  // Mock data para semi-acabados
  const mockData: SemiItem[] = [
    {
      id: '1',
      productId: '1',
      name: 'Semi-Acabado Mock 1',
      family: 'Família A',
      op: 'OP001',
      batch: 'B001',
      quantity_total: 1000,
      quantity_envasado: 500,
      status: 'parcial'
    },
    {
      id: '2',
      productId: '2',
      name: 'Semi-Acabado Mock 2',
      family: 'Família B',
      op: 'OP002',
      batch: 'B002',
      quantity_total: 1500,
      quantity_envasado: 750,
      status: 'completo'
    },
    {
      id: '3',
      productId: '3',
      name: 'Semi-Acabado Mock 3',
      family: 'Família A',
      op: 'OP003',
      batch: 'B003',
      quantity_total: 800,
      quantity_envasado: 0,
      status: 'aguardando'
    }
  ]
  
  return mockData
}

export function useSemiFinishedBuckets(itemId: string) {
  console.log('🪣 useSemiFinishedBuckets: Mock data para GitHub Pages')
  
  // Mock buckets data
  const mockBuckets: Bucket[] = [
    {
      id: 'b1',
      semiFinishedId: itemId,
      bucketIndex: 1,
      originalQuantityKg: 18,
      currentQuantityKg: 18,
      status: 'cheio'
    },
    {
      id: 'b2',
      semiFinishedId: itemId,
      bucketIndex: 2,
      originalQuantityKg: 18,
      currentQuantityKg: 15,
      status: 'parcial'
    }
  ]

  return { data: mockBuckets, isLoading: false, error: null, mutate: async () => {} }
}

export function getSemiFinishedFamilyColor(family: string) {
  const n = (family || '').toLowerCase()
  const presets: Record<string, string> = {
    'linha pink': '#FDE7EF',
    skincare: '#E8F0FE',
    'linha skincare': '#E8F0FE',
    capilar: '#EAF7EF',
    'linha capilar': '#EAF7EF',
    solar: '#FFF7DB',
    'linha solar': '#FFF7DB',
    neutra: '#F3F4F6',
    neutro: '#F3F4F6',
  }
  for (const key of Object.keys(presets)) {
    if (n.includes(key)) return presets[key]
  }
  const colorHints: Record<string, string> = {
    bege: '#F6F0E4',
    rosa: '#FDE7EF',
    pink: '#FDE7EF',
    azul: '#E8F0FE',
    verde: '#EAF7EF',
    amarelo: '#FFF7DB',
    roxo: '#F1E9FF',
    laranja: '#FFF0E5',
    cinza: '#F3F4F6',
  }
  for (const key of Object.keys(colorHints)) if (n.includes(key)) return colorHints[key]
  let h = 0
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360
  return `hsl(${h}, 70%, 95%)`
}
