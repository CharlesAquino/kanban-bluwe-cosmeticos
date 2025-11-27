/**
 * Queries Drizzle para Hourly Controls
 * Substitui IntegrationService queries do Prisma
 */

import { db, hourlyControls, products } from '../client'
import { eq, and, gte, lt, desc } from 'drizzle-orm'
import type { ProductStage } from '../schema'

export const hourlyControlQueries = {
  /**
   * Criar novo controle hora a hora
   */
  async create(data: {
    productId: string
    productName: string
    stage: ProductStage
    operator: string
    shift: string
    targetQuantity: number
    actualQuantity: number
    notes?: string
  }) {
    // Calcular eficiência
    const efficiency = Math.round(
      (data.actualQuantity / data.targetQuantity) * 100
    )

    // Determinar status baseado na eficiência
    let status: string
    if (efficiency >= 100) {
      status = 'ahead'
    } else if (efficiency >= 90) {
      status = 'on_track'
    } else {
      status = 'behind'
    }

    const [control] = await db
      .insert(hourlyControls)
      .values({
        id: `hc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: data.productId,
        productName: data.productName,
        stage: data.stage,
        operator: data.operator,
        shift: data.shift,
        targetQuantity: data.targetQuantity,
        actualQuantity: data.actualQuantity,
        efficiency,
        status,
        notes: data.notes,
        date: new Date(),
      })
      .returning()

    return control
  },

  /**
   * Atualizar controle hora a hora
   */
  async update(
    hourlyControlId: string,
    data: {
      actualQuantity?: number
      notes?: string
      status?: string
    }
  ) {
    const [existing] = await db
      .select()
      .from(hourlyControls)
      .where(eq(hourlyControls.id, hourlyControlId))

    if (!existing) {
      return null
    }

    // Calcular nova eficiência se actualQuantity foi alterado
    let efficiency = existing.efficiency
    let status = existing.status

    if (data.actualQuantity !== undefined) {
      efficiency = Math.round(
        (data.actualQuantity / existing.targetQuantity) * 100
      )

      if (efficiency >= 100) {
        status = 'ahead'
      } else if (efficiency >= 90) {
        status = 'on_track'
      } else {
        status = 'behind'
      }
    }

    if (data.status) {
      status = data.status
    }

    const [updated] = await db
      .update(hourlyControls)
      .set({
        actualQuantity: data.actualQuantity ?? existing.actualQuantity,
        efficiency,
        status,
        notes: data.notes ?? existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(hourlyControls.id, hourlyControlId))
      .returning()

    return updated
  },

  /**
   * Buscar controles por produto
   */
  async getByProduct(productId: string) {
    return await db
      .select()
      .from(hourlyControls)
      .where(eq(hourlyControls.productId, productId))
      .orderBy(desc(hourlyControls.date))
  },

  /**
   * Buscar controles por data e turno
   */
  async getByDateAndShift(date: string, shift: string) {
    const startDate = new Date(date)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    return await db
      .select()
      .from(hourlyControls)
      .where(
        and(
          gte(hourlyControls.date, startDate),
          lt(hourlyControls.date, endDate),
          eq(hourlyControls.shift, shift)
        )
      )
      .orderBy(desc(hourlyControls.createdAt))
  },

  /**
   * Buscar todos os controles
   */
  async getAll() {
    return await db
      .select()
      .from(hourlyControls)
      .orderBy(desc(hourlyControls.date))
  },

  /**
   * Buscar controle por ID
   */
  async getById(id: string) {
    const [control] = await db
      .select()
      .from(hourlyControls)
      .where(eq(hourlyControls.id, id))

    return control || null
  },

  /**
   * Deletar controle
   */
  async delete(id: string) {
    await db.delete(hourlyControls).where(eq(hourlyControls.id, id))
    return true
  },
}
