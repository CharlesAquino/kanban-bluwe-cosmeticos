/**
 * Hook avançado para gerenciamento completo de histórico de processos aplicando clean code:
 * - Single Responsibility: Apenas gerenciamento de histórico de processos
 * - Performance: Otimizado com useCallback e useMemo
 * - Type Safety: Tipagem robusta e completa
 * - Real-time: Atualização automática baseada em ações
 * - Persistence: Persistência opcional em localStorage
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

export interface ProcessHistoryEntry {
  id: string
  timestamp: string
  productId: string
  productName: string
  action: 'product_create' | 'stage_advance' | 'stage_pause' | 'stage_resume' | 'stage_block' | 'hourly_control' | 'bottleneck_analysis'
  fromStage?: string
  toStage?: string
  operator?: string
  shift?: string
  notes?: string
  metadata?: Record<string, unknown>
  duration?: number // duração em minutos para cálculos de eficiência
  efficiency?: number // eficiência calculada
}

export interface ProcessSummary {
  totalActions: number
  totalProducts: number
  averageEfficiency: number
  totalDuration: number
  actionsByType: Record<string, number>
  efficiencyTrend: 'up' | 'down' | 'stable'
  last24Hours: ProcessHistoryEntry[]
}

export interface ProcessHistoryHook {
  history: ProcessHistoryEntry[]
  summary: ProcessSummary
  addEntry: (entry: Omit<ProcessHistoryEntry, 'id' | 'timestamp'>) => void
  clearHistory: () => void
  getHistoryByProduct: (productId: string) => ProcessHistoryEntry[]
  getHistoryByAction: (action: ProcessHistoryEntry['action']) => ProcessHistoryEntry[]
  getHistoryByTimeRange: (startDate: string, endDate: string) => ProcessHistoryEntry[]
  exportHistory: () => string
  loadFromStorage: () => void
  saveToStorage: () => void
}

export function useProcessHistory(persistToStorage = true): ProcessHistoryHook {
  const [history, setHistory] = useState<ProcessHistoryEntry[]>([])

  // Carregar histórico do localStorage na inicialização
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      const saved = localStorage.getItem('process-history')
      if (saved) {
        try {
          const parsedHistory = JSON.parse(saved)
          setHistory(parsedHistory)
        } catch (error) {
          console.error('Erro ao carregar histórico do localStorage:', error)
        }
      }
    }
  }, [persistToStorage])

  // Salvar no localStorage sempre que o histórico mudar
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.setItem('process-history', JSON.stringify(history))
    }
  }, [history, persistToStorage])

  // Função para adicionar entrada no histórico
  const addEntry = useCallback((entryData: Omit<ProcessHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: ProcessHistoryEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...entryData,
    }

    setHistory(prev => [newEntry, ...prev])

    // Log detalhado para debugging
    console.log('📋 Nova entrada no histórico:', {
      id: newEntry.id,
      action: newEntry.action,
      product: newEntry.productName,
      timestamp: newEntry.timestamp,
      totalEntries: history.length + 1
    })
  }, [history.length])

  // Função para limpar histórico
  const clearHistory = useCallback(() => {
    setHistory([])
    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.removeItem('process-history')
    }
  }, [persistToStorage])

  // Filtrar histórico por produto
  const getHistoryByProduct = useCallback((productId: string) => {
    return history.filter(entry => entry.productId === productId)
  }, [history])

  // Filtrar histórico por ação
  const getHistoryByAction = useCallback((action: ProcessHistoryEntry['action']) => {
    return history.filter(entry => entry.action === action)
  }, [history])

  // Filtrar histórico por período
  const getHistoryByTimeRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return history.filter(entry => {
      const entryDate = new Date(entry.timestamp)
      return entryDate >= start && entryDate <= end
    })
  }, [history])

  // Exportar histórico como JSON
  const exportHistory = useCallback(() => {
    return JSON.stringify(history, null, 2)
  }, [history])

  // Carregar do localStorage manualmente
  const loadFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('process-history')
      if (saved) {
        try {
          const parsedHistory = JSON.parse(saved)
          setHistory(parsedHistory)
        } catch (error) {
          console.error('Erro ao carregar histórico do localStorage:', error)
        }
      }
    }
  }, [])

  // Salvar no localStorage manualmente
  const saveToStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('process-history', JSON.stringify(history))
    }
  }, [history])

  // Calcular resumo dos dados
  const summary = useMemo((): ProcessSummary => {
    if (history.length === 0) {
      return {
        totalActions: 0,
        totalProducts: 0,
        averageEfficiency: 0,
        totalDuration: 0,
        actionsByType: {},
        efficiencyTrend: 'stable',
        last24Hours: []
      }
    }

    // Produtos únicos
    const uniqueProducts = new Set(history.map(h => h.productId)).size

    // Ações por tipo
    const actionsByType = history.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Eficiência média (dos registros que têm eficiência)
    const efficiencyEntries = history.filter(h => h.efficiency !== undefined)
    const averageEfficiency = efficiencyEntries.length > 0
      ? efficiencyEntries.reduce((acc, entry) => acc + (entry.efficiency || 0), 0) / efficiencyEntries.length
      : 0

    // Duração total em minutos
    const totalDuration = history
      .filter(h => h.duration !== undefined)
      .reduce((acc, entry) => acc + (entry.duration || 0), 0)

    // Últimas 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last24Hours = history.filter(entry => new Date(entry.timestamp) >= twentyFourHoursAgo)

    // Tendência de eficiência (comparação das últimas 10 ações com as 10 anteriores)
    const recentEntries = history.slice(0, 10)
    const olderEntries = history.slice(10, 20)

    let efficiencyTrend: 'up' | 'down' | 'stable' = 'stable'

    if (recentEntries.length >= 5 && olderEntries.length >= 5) {
      const recentAvg = recentEntries
        .filter(e => e.efficiency !== undefined)
        .reduce((acc, e) => acc + (e.efficiency || 0), 0) / recentEntries.filter(e => e.efficiency !== undefined).length

      const olderAvg = olderEntries
        .filter(e => e.efficiency !== undefined)
        .reduce((acc, e) => acc + (e.efficiency || 0), 0) / olderEntries.filter(e => e.efficiency !== undefined).length

      if (recentAvg > olderAvg + 5) efficiencyTrend = 'up'
      else if (recentAvg < olderAvg - 5) efficiencyTrend = 'down'
    }

    return {
      totalActions: history.length,
      totalProducts: uniqueProducts,
      averageEfficiency,
      totalDuration,
      actionsByType,
      efficiencyTrend,
      last24Hours
    }
  }, [history])

  return {
    history,
    summary,
    addEntry,
    clearHistory,
    getHistoryByProduct,
    getHistoryByAction,
    getHistoryByTimeRange,
    exportHistory,
    loadFromStorage,
    saveToStorage,
  }
}
