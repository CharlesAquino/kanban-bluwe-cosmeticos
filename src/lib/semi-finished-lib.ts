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
  manufactureDate?: string
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
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
  return json.data
}

export function useSemiFinishedBuckets(itemId: string) {
  const { data, isLoading, error, mutate } = useSWR<Bucket[]>(
    `/api/semi-finished/${itemId}/buckets`,
    semiFinishedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 15000,
      keepPreviousData: true,
    }
  )
  return { buckets: data || [], loading: isLoading, error, mutate }
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
