/**
 * Hook personalizado para monitoramento automático de processos aplicando clean code:
 * - Single Responsibility: Apenas monitoramento de ações
 * - Performance: Otimizado com useCallback e useMemo
 * - Type Safety: Tipagem robusta
 * - Real-time: Atualização automática baseada em ações
 */

'use client'

import { useState, useCallback } from 'react'

interface ProcessMonitoringEvent {
  id: string
  timestamp: string
  productId: string
  productName: string
  action: 'stage_advance' | 'stage_pause' | 'stage_resume' | 'stage_block' | 'product_create'
  fromStage?: string
  toStage?: string
  operator?: string
  notes?: string
  metadata?: Record<string, unknown>
}

interface ProcessMonitorHook {
  events: ProcessMonitoringEvent[]
  addEvent: (event: Omit<ProcessMonitoringEvent, 'id' | 'timestamp'>) => void
  clearEvents: () => void
  getEventsByProduct: (productId: string) => ProcessMonitoringEvent[]
  getEventsByAction: (action: ProcessMonitoringEvent['action']) => ProcessMonitoringEvent[]
  getRecentEvents: (limit?: number) => ProcessMonitoringEvent[]
}

export function useProcessMonitor(): ProcessMonitorHook {
  const [events, setEvents] = useState<ProcessMonitoringEvent[]>([])

  // Função para adicionar evento de monitoramento
  const addEvent = useCallback((eventData: Omit<ProcessMonitoringEvent, 'id' | 'timestamp'>) => {
    const newEvent: ProcessMonitoringEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    }

    setEvents(prev => [newEvent, ...prev])
  }, [])

  // Função para limpar eventos
  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  // Filtrar eventos por produto
  const getEventsByProduct = useCallback((productId: string) => {
    return events.filter(event => event.productId === productId)
  }, [events])

  // Filtrar eventos por ação
  const getEventsByAction = useCallback((action: ProcessMonitoringEvent['action']) => {
    return events.filter(event => event.action === action)
  }, [events])

  // Obter eventos recentes
  const getRecentEvents = useCallback((limit = 50) => {
    return events.slice(0, limit)
  }, [events])

  return {
    events,
    addEvent,
    clearEvents,
    getEventsByProduct,
    getEventsByAction,
    getRecentEvents,
  }
}
