/**
 * SISTEMA DE ESTADO GLOBAL - KANBAN BLUWE COSMÉTICOS
 *
 * Contexto global otimizado para evitar loops infinitos.
 * Aplicando princípios de clean code e debugging estratégico.
 */

'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react'
import type { Product, HourlyControl, ProductStage, ProductStatus } from '@/lib/types-modern'

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

// Tipo para eventos do processo
type ProcessEvent = {
  id: string
  type: string
  timestamp: string
  data?: Record<string, unknown>
}

// Interfaces melhoradas para type safety
export interface GlobalState {
  // Dados de produção
  products: Product[]
  stats: {
    total: number
    inProgress: number
    paused: number
    completed: number
    blocked: number
  }

  // Controle hora a hora
  monitoringData: MonitoringData[]
  hourlyControls: HourlyControl[]

  // Sistema de monitoramento
  processHistory: ProcessEvent[]

  // Configurações do sistema
  settings: {
    autoRefresh: boolean
    refreshInterval: number
    theme: 'light' | 'dark'
  }

  // Estados de controle
  loading: boolean
  error: string | null
  timestamp: number
  lastUpdate: number
}

// Ações para o reducer
type GlobalAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_STATS'; payload: GlobalState['stats'] }
  | { type: 'SET_MONITORING_DATA'; payload: MonitoringData[] }
  | { type: 'SET_HOURLY_CONTROLS'; payload: HourlyControl[] }
  | { type: 'ADD_PROCESS_EVENT'; payload: ProcessEvent }
  | { type: 'SET_SETTINGS'; payload: Partial<GlobalState['settings']> }
  | { type: 'UPDATE_TIMESTAMP' }

// Estado inicial - autoRefresh DESABILITADO por padrão para evitar loops
const initialState: GlobalState = {
  products: [],
  stats: {
    total: 0,
    inProgress: 0,
    paused: 0,
    completed: 0,
    blocked: 0
  },
  monitoringData: [],
  hourlyControls: [],
  processHistory: [],
  settings: {
    autoRefresh: false, // ❌ DESABILITADO por padrão para evitar loops
    refreshInterval: 30000,
    theme: 'light'
  },
  loading: false,
  error: null,
  timestamp: Date.now(),
  lastUpdate: Date.now()
}

// Reducer otimizado
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'SET_MONITORING_DATA':
      return { ...state, monitoringData: action.payload }
    case 'SET_HOURLY_CONTROLS':
      return { ...state, hourlyControls: action.payload }
    case 'ADD_PROCESS_EVENT':
      return {
        ...state,
        processHistory: [action.payload, ...state.processHistory].slice(0, 100) // Limitar a 100 entradas
      }
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    case 'UPDATE_TIMESTAMP':
      return { ...state, timestamp: Date.now(), lastUpdate: Date.now() }
    default:
      return state
  }
}

// Contexto
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

// Provider otimizado
export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState)

  // Carregar dados - integrado às APIs reais
  const loadAllData = useCallback(async () => {
    // Watchdog timer handle, visible to finally
    let watchdog: ReturnType<typeof setTimeout> | null = null
    try {
      console.log('🔄 Iniciando carregamento de dados...')

      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Watchdog: falhar com timeout se o carregamento travar
      watchdog = setTimeout(() => {
        console.warn('⏱️ Timeout no carregamento global (watchdog)')
        dispatch({ type: 'SET_ERROR', payload: 'Timeout no carregamento global' })
        dispatch({ type: 'SET_LOADING', payload: false })
      }, 12000)

      // Buscar produtos reais
      const productsRes = await fetch('/api/products', { cache: 'no-store' })
      if (!productsRes.ok) throw new Error(`Falha ao buscar produtos: ${productsRes.status}`)
      const productsJson = await productsRes.json()
      const products = (productsJson?.data ?? []) as Product[]
      dispatch({ type: 'SET_PRODUCTS', payload: products })

      // Buscar estatísticas reais
      const statsRes = await fetch('/api/stats', { cache: 'no-store' })
      if (!statsRes.ok) throw new Error(`Falha ao buscar estatísticas: ${statsRes.status}`)
      const statsJson = await statsRes.json()
      const stats = (statsJson?.data ?? {
        total: 0,
        inProgress: 0,
        paused: 0,
        completed: 0,
        blocked: 0
      }) as GlobalState['stats']
      dispatch({ type: 'SET_STATS', payload: stats })

      // Dados de monitoramento (placeholder vazio até termos API)
      dispatch({ type: 'SET_MONITORING_DATA', payload: [] })


      dispatch({ type: 'UPDATE_TIMESTAMP' })
      console.log('✅ Todos os dados carregados com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      // Limpar watchdog para evitar disparo indevido
      if (watchdog) clearTimeout(watchdog)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Função de refresh rápida
  const refreshData = useCallback(async () => {
    console.log('🔄 Executando refresh manual...')
    await loadAllData()
  }, [loadAllData])

  // Atualizar configurações
  const updateSettings = useCallback((settings: Partial<GlobalState['settings']>) => {
    console.log('⚙️ Atualizando configurações:', settings)
    dispatch({ type: 'SET_SETTINGS', payload: settings })
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    console.log('🧹 Limpando erro...')
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  // Carregar dados iniciais - apenas uma vez - CORRIGIDO
  useEffect(() => {
    console.log('🚀 Inicializando contexto global...')
    loadAllData()
  }, [loadAllData]) // ✅ Dependência correta - loadAllData está memoizado

  // Auto-refresh se habilitado - versão segura - CORRIGIDO
  useEffect(() => {
    console.log('⏰ Configurando auto-refresh:', state.settings.autoRefresh, state.settings.refreshInterval)

    if (!state.settings.autoRefresh) {
      console.log('⏸️ Auto-refresh desabilitado')
      return
    }

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh executando...')
      refreshData()
    }, state.settings.refreshInterval)

    return () => {
      console.log('🛑 Limpando intervalo de auto-refresh')
      clearInterval(interval)
    }
  }, [state.settings.autoRefresh, state.settings.refreshInterval, refreshData]) // ✅ Todas dependências corretas

  const value = {
    state,
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

// Hook para usar o contexto global
export function useGlobalState() {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobalState deve ser usado dentro de GlobalProvider')
  }
  return context
}

// Hook para acessar apenas o estado
export function useGlobalData() {
  const { state } = useGlobalState()
  return state
}

// Hook para acessar apenas as ações
export function useGlobalActions() {
  const { actions } = useGlobalState()
  return actions
}
