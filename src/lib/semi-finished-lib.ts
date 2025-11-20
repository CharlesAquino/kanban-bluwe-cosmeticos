/**
 * Biblioteca para operações com semi-acabados
 * Conectada às APIs reais do sistema
 */

import useSWR from 'swr'

export interface SemiItem {
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

export interface Bucket {
  id: string
  bucketIndex: number
  originalQuantityKg: number
  currentQuantityKg: number
  status: 'packaged' | 'partial' | 'in_packaging' | 'returned' | 'available'
  semiFinishedId: string
}

export interface CreateSemiParams {
  productId: string
  name: string
  family: string
  op: string
  batch: string
  quantity_total: number
}

export interface UpdateSemiParams {
  name?: string
  family?: string
  op?: string
  batch?: string
  quantity_total?: number
  quantity_envasado?: number
  status?: string
}

/**
 * Fetcher para SWR - busca dados de semi-acabados da API
 */
export const semiFinishedFetcher = async (url: string): Promise<SemiItem[]> => {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch semi-finished items: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.success ? data.data || [] : []
}

/**
 * Hook para buscar buckets de um semi-acabado
 */
export function useSemiFinishedBuckets(semiFinishedId: string) {
  const { data, error, isLoading, mutate } = useSWR<Bucket[]>(
    semiFinishedId ? `/api/semi-finished/${semiFinishedId}/buckets` : null,
    async (url: string): Promise<Bucket[]> => {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch buckets: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.success ? data.data || [] : []
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10000,
    }
  )

  return {
    data: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Cria novo item semi-acabado
 */
export async function createSemiFinished(params: CreateSemiParams): Promise<{ success: boolean; data?: SemiItem; error?: string }> {
  try {
    const response = await fetch('/api/semi-finished', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to create semi-finished item' }
    }

    return { success: true, data: data.data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Atualiza item semi-acabado
 */
export async function updateSemiFinished(id: string, params: UpdateSemiParams): Promise<{ success: boolean; data?: SemiItem; error?: string }> {
  try {
    const response = await fetch(`/api/semi-finished/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to update semi-finished item' }
    }

    return { success: true, data: data.data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Deleta item semi-acabado
 */
export async function deleteSemiFinished(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/semi-finished/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to delete semi-finished item' }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Envia baldes para envase
 */
export async function sendBucketsToPackaging(semiFinishedId: string, bucketIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/semi-finished/${semiFinishedId}/send-to-packaging`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketIds })
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to send buckets to packaging' }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Registra envase de balde
 */
export async function packageBucket(semiFinishedId: string, bucketId: string, packagedQuantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/semi-finished/${semiFinishedId}/package-bucket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketId, packagedQuantity })
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to package bucket' }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Retorna balde para estoque
 */
export async function returnBucket(semiFinishedId: string, bucketId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/semi-finished/${semiFinishedId}/return-bucket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketId })
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to return bucket' }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Obtém cor da família para UI
 */
export function getSemiFinishedFamilyColor(family: string): string {
  const colors: Record<string, string> = {
    'Família A': '#dbeafe',
    'Família B': '#dcfce7', 
    'Família C': '#fef3c7',
    'Família D': '#fce7f3',
    'Família E': '#e9d5ff',
    'default': '#f8fafc'
  }
  
  return colors[family] || colors.default
}
