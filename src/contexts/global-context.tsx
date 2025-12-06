'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useMemo } from 'react'
import type { Product, HourlyControl, ProductStage, ProductStatus } from '@/lib/types'
import { loadProducts } from '@/lib/product-operations'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Tipos necessários
type MonitoringData = {
  productId: string
  productName: string
  currentStage: ProductStage
  status: ProductStatus
  startTime: string
  elapsedTime: number
  targetTime?: number
  efficiency: number
  lastUpdate: string
}

type ProcessEvent = {
  id: string
  type: string
  timestamp: string
  data?: Record<string, unknown>
}

// Interface GlobalState
export interface GlobalState {
  products: Product[]
  stats: {
    total: number
    inProgress: number
    paused: number
    completed: number
    blocked: number
  }
  monitoringData: MonitoringData[]
  hourlyControls: HourlyControl[]
  processHistory: ProcessEvent[]
  settings: {
    autoRefresh: boolean
    refreshInterval: number
    theme: 'light' | 'dark'
  }
  loading: boolean
  error: string | null
  timestamp: number
  lastUpdate: number
}

// Actions
type GlobalAction =
  | { type: 'SET_MONITORING_DATA'; payload: MonitoringData[] }
  | { type: 'SET_HOURLY_CONTROLS'; payload: HourlyControl[] }
  | { type: 'ADD_PROCESS_EVENT'; payload: ProcessEvent }
  | { type: 'SET_SETTINGS'; payload: Partial<GlobalState['settings']> }

const initialState: GlobalState = {
  products: [],
  stats: { total: 0, inProgress: 0, paused: 0, completed: 0, blocked: 0 },
  monitoringData: [],
  hourlyControls: [],
  processHistory: [],
  settings: {
    autoRefresh: true, // React Query handles this efficiently
    refreshInterval: 30000,
    theme: 'light'
  },
  loading: true,
  error: null,
  timestamp: Date.now(),
  lastUpdate: Date.now()
}

// Reducer para estados locais (não-servidor)
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_MONITORING_DATA':
      return { ...state, monitoringData: action.payload }
    case 'SET_HOURLY_CONTROLS':
      return { ...state, hourlyControls: action.payload }
    case 'ADD_PROCESS_EVENT':
      return { ...state, processHistory: [action.payload, ...state.processHistory].slice(0, 100) }
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    default:
      return state
  }
}

const GlobalContext = createContext<{
  state: GlobalState
  dispatch: React.Dispatch<GlobalAction>
  actions: {
    loadAllData: () => Promise<void>
    refreshData: () => Promise<void>
    updateSettings: (settings: Partial<GlobalState['settings']>) => void
    clearError: () => void
  }
} | null>(null)

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [localState, dispatch] = useReducer(globalReducer, initialState)
  const queryClient = useQueryClient()

  // React Query: Fetching Products & Stats
  const {
    data: fetchedData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['products'],
    queryFn: loadProducts,
    refetchInterval: localState.settings.autoRefresh ? localState.settings.refreshInterval : false,
    staleTime: 5000, // 5 segundos
    retry: 2, // Tentar 2 vezes antes de falhar
  })

  // Monitorar timeout de loading (cold start do banco)
  useEffect(() => {
    if (!isLoading) return

    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Loading está demorando mais de 12 segundos - possível cold start do PostgreSQL')
      console.warn('💡 Aguarde mais alguns segundos ou recarregue a página')
    }, 12000)

    return () => clearTimeout(timeoutId)
  }, [isLoading])

  // Derived State: Combine fetched data with local state
  const computedState: GlobalState = useMemo(() => {
    return {
      ...localState,
      products: fetchedData?.products || [],
      stats: fetchedData?.stats || initialState.stats,
      loading: isLoading || isRefetching,
      error: error instanceof Error ? error.message : (error ? String(error) : null),
      lastUpdate: Date.now()
    }
  }, [localState, fetchedData, isLoading, isRefetching, error])

  // Backward Compatibility Actions
  const loadAllData = useCallback(async () => {
    await refetch()
  }, [refetch])

  const refreshData = useCallback(async () => {
    await refetch()
  }, [refetch])

  const updateSettings = useCallback((settings: Partial<GlobalState['settings']>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings })
  }, [])

  const clearError = useCallback(() => {
    // React Query manages error state, but we can reset the query if needed
    // or just ignore if it's purely UI
  }, [])

  const value = {
    state: computedState,
    dispatch,
    actions: {
      loadAllData,
      refreshData,
      updateSettings,
      clearError
    }
  }

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  )
}

// Hooks permanecem iguais
export function useGlobalState() {
  const context = useContext(GlobalContext)
  if (!context) throw new Error('useGlobalState deve ser usado dentro de GlobalProvider')
  return context
}

export function useGlobalData() {
  const { state } = useGlobalState()
  return state
}

export function useGlobalActions() {
  const { actions } = useGlobalState()
  return actions
}
