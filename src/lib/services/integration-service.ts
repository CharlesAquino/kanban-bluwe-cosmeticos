/**
 * Integration Service - Refatorado com Drizzle + Redis Cache
 * Gerencia controles hora a hora e integrações entre produtos e semi-acabados
 */

import { hourlyControlQueries } from '@/lib/db/queries/hourly-controls'
import { CacheService } from './cache-service'
import type { ProductStage } from '@/lib/db/schema'

export class IntegrationService {
  /**
   * Criar controle hora a hora
   */
  static async createHourlyControl(
    productId: string,
    stage: ProductStage,
    data: {
      operator: string
      shift: string
      targetQuantity: number
      actualQuantity: number
      notes?: string
    }
  ) {
    // Buscar nome do produto
    const { productQueries } = await import('@/lib/db/queries/products')
    const product = await productQueries.getById(productId)

    if (!product) {
      throw new Error('Produto não encontrado')
    }

    // Criar controle
    const control = await hourlyControlQueries.create({
      productId,
      productName: product.name,
      stage,
      operator: data.operator,
      shift: data.shift,
      targetQuantity: data.targetQuantity,
      actualQuantity: data.actualQuantity,
      notes: data.notes,
    })

    // Invalidar cache de controles
    const dateStr = new Date().toISOString().split('T')[0]
    await CacheService.invalidateHourlyControlsCache(dateStr)

    return control
  }

  /**
   * Atualizar controle hora a hora
   */
  static async updateHourlyControl(
    hourlyControlId: string,
    data: {
      actualQuantity?: number
      notes?: string
      status?: string
    }
  ) {
    const control = await hourlyControlQueries.update(hourlyControlId, data)

    if (control) {
      // Invalidar cache
      const dateStr = control.date.toISOString().split('T')[0]
      await CacheService.invalidateHourlyControlsCache(dateStr)
    }

    return control
  }

  /**
   * Buscar controles por produto
   */
  static async getHourlyControlsByProduct(productId: string) {
    return await hourlyControlQueries.getByProduct(productId)
  }

  /**
   * Buscar controles por data e turno (com cache)
   */
  static async getHourlyControlsByDateAndShift(date: string, shift: string) {
    // Tentar cache primeiro
    const cacheKey = `hourly-controls:${date}:${shift}`
    const cached = await CacheService.getHourlyControlsCache(date)
    if (cached) {
      return cached.filter((c: any) => c.shift === shift)
    }

    // Se não estiver em cache, buscar do banco
    const controls = await hourlyControlQueries.getByDateAndShift(date, shift)

    // Salvar em cache
    await CacheService.setHourlyControlsCache(date, controls)

    return controls
  }

  /**
   * Buscar todos os controles
   */
  static async getAllHourlyControls() {
    return await hourlyControlQueries.getAll()
  }

  /**
   * Buscar controle por ID
   */
  static async getHourlyControlById(id: string) {
    return await hourlyControlQueries.getById(id)
  }

  /**
   * Deletar controle
   */
  static async deleteHourlyControl(id: string) {
    const control = await hourlyControlQueries.getById(id)
    const success = await hourlyControlQueries.delete(id)

    if (success && control) {
      // Invalidar cache
      const dateStr = control.date.toISOString().split('T')[0]
      await CacheService.invalidateHourlyControlsCache(dateStr)
    }

    return success
  }

  /**
   * Calcular eficiência média por operador
   */
  static async getOperatorEfficiency(operator: string, dateStart: string, dateEnd: string) {
    const controls = await hourlyControlQueries.getAll()

    const operatorControls = controls.filter(
      (c) =>
        c.operator === operator &&
        new Date(c.date) >= new Date(dateStart) &&
        new Date(c.date) <= new Date(dateEnd)
    )

    if (operatorControls.length === 0) {
      return {
        operator,
        averageEfficiency: 0,
        totalControls: 0,
        ahead: 0,
        onTrack: 0,
        behind: 0,
      }
    }

    const totalEfficiency = operatorControls.reduce((sum, c) => sum + c.efficiency, 0)
    const averageEfficiency = Math.round(totalEfficiency / operatorControls.length)

    return {
      operator,
      averageEfficiency,
      totalControls: operatorControls.length,
      ahead: operatorControls.filter((c) => c.status === 'ahead').length,
      onTrack: operatorControls.filter((c) => c.status === 'on_track').length,
      behind: operatorControls.filter((c) => c.status === 'behind').length,
    }
  }

  /**
   * Calcular eficiência média por turno
   */
  static async getShiftEfficiency(shift: string, dateStart: string, dateEnd: string) {
    const controls = await hourlyControlQueries.getAll()

    const shiftControls = controls.filter(
      (c) =>
        c.shift === shift &&
        new Date(c.date) >= new Date(dateStart) &&
        new Date(c.date) <= new Date(dateEnd)
    )

    if (shiftControls.length === 0) {
      return {
        shift,
        averageEfficiency: 0,
        totalControls: 0,
        ahead: 0,
        onTrack: 0,
        behind: 0,
      }
    }

    const totalEfficiency = shiftControls.reduce((sum, c) => sum + c.efficiency, 0)
    const averageEfficiency = Math.round(totalEfficiency / shiftControls.length)

    return {
      shift,
      averageEfficiency,
      totalControls: shiftControls.length,
      ahead: shiftControls.filter((c) => c.status === 'ahead').length,
      onTrack: shiftControls.filter((c) => c.status === 'on_track').length,
      behind: shiftControls.filter((c) => c.status === 'behind').length,
    }
  }
}
