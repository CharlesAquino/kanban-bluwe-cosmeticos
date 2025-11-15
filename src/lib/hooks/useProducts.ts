"use client"

import useSWR, { mutate } from 'swr'
import { useEffect } from 'react'
import { subscribeChanges } from '@/lib/bus'
import type { Product } from '@/lib/types'

export type DashboardStats = {
  total: number
  inProgress: number
  paused: number
  completed: number
  blocked: number
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
  return json.data as Product[]
}

export function useProducts() {
  const { data, error, isLoading } = useSWR<Product[]>('/api/products', fetcher, {
    revalidateOnFocus: false, // Só revalidar ao voltar foco se necessário
    revalidateOnReconnect: true,
    refreshInterval: 15000, // Mais suave
    keepPreviousData: true, // Não "piscar" dados antigos
  })

  useEffect(() => {
    const unsub = subscribeChanges((ev) => {
      if (ev.type === 'products') mutate('/api/products')
      if (ev.type === 'semi_finished') mutate('/api/semi-finished')
    })
    return () => unsub()
  }, [])

  const products: Product[] = data || []
  const stats: DashboardStats = {
    total: products.length,
    inProgress: products.filter((p: Product) => String(p.status).toLowerCase() === 'active').length,
    paused: products.filter((p: Product) => String(p.status).toLowerCase() === 'paused').length,
    blocked: products.filter((p: Product) => String(p.status).toLowerCase() === 'blocked').length,
    completed: products.filter((p: Product) => String(p.currentStage).toLowerCase() === 'finalizado').length,
  }

  return {
    products,
    stats,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refresh: () => mutate('/api/products'),
  }
}
