/**
 * Queries Drizzle para Semi-Finished Items
 */

import { db, semiFinishedItems, semiFinishedBuckets } from '../client'
import { eq, desc, and } from 'drizzle-orm'

export const semiFinishedQueries = {
  /**
   * Criar novo item semi-acabado
   */
  async create(data: {
    productId?: string
    name: string
    family: string
    op: string
    batch: string
    quantityTotal: number
    createdById: string
  }) {
    const [item] = await db
      .insert(semiFinishedItems)
      .values({
        id: `sf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: data.productId,
        name: data.name,
        family: data.family,
        op: data.op,
        batch: data.batch,
        quantityTotal: data.quantityTotal,
        quantityEnvasado: 0,
        status: 'AGUARDANDO',
        createdById: data.createdById,
        manufacturingDate: new Date(),
      })
      .returning()

    return item
  },

  /**
   * Buscar todos os semi-acabados
   */
  async getAll() {
    return await db
      .select()
      .from(semiFinishedItems)
      .orderBy(desc(semiFinishedItems.createdAt))
  },

  /**
   * Buscar semi-acabado por ID
   */
  async getById(id: string) {
    const [item] = await db
      .select()
      .from(semiFinishedItems)
      .where(eq(semiFinishedItems.id, id))

    return item || null
  },

  /**
   * Buscar semi-acabados por status
   */
  async getByStatus(status: string) {
    return await db
      .select()
      .from(semiFinishedItems)
      .where(eq(semiFinishedItems.status, status as any))
      .orderBy(desc(semiFinishedItems.createdAt))
  },

  /**
   * Atualizar quantidade envasada
   */
  async updateQuantityEnvasado(id: string, quantityEnvasado: number) {
    const [item] = await db
      .select()
      .from(semiFinishedItems)
      .where(eq(semiFinishedItems.id, id))

    if (!item) return null

    // Determinar novo status
    let newStatus = item.status
    const totalKg = item.quantityTotal
    const envasadoKg = quantityEnvasado

    if (envasadoKg >= totalKg && totalKg > 0) {
      newStatus = 'QUARENTENA'
    } else if (envasadoKg > 0 && item.status === 'AGUARDANDO') {
      newStatus = 'ENVIASANDO'
    }

    const [updated] = await db
      .update(semiFinishedItems)
      .set({
        quantityEnvasado: quantityEnvasado,
        status: newStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(semiFinishedItems.id, id))
      .returning()

    return updated
  },

  /**
   * Atualizar status
   */
  async updateStatus(id: string, status: string) {
    const [updated] = await db
      .update(semiFinishedItems)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(semiFinishedItems.id, id))
      .returning()

    return updated
  },

  /**
   * Deletar semi-acabado
   */
  async delete(id: string) {
    await db.delete(semiFinishedItems).where(eq(semiFinishedItems.id, id))
    return true
  },

  /**
   * Buscar buckets de um semi-acabado
   */
  async getBuckets(semiFinishedId: string) {
    return await db
      .select()
      .from(semiFinishedBuckets)
      .where(eq(semiFinishedBuckets.semiFinishedId, semiFinishedId))
      .orderBy(semiFinishedBuckets.bucketIndex)
  },

  /**
   * Criar bucket para semi-acabado
   */
  async createBucket(data: {
    semiFinishedId: string
    sourceBucketId: string
    bucketIndex: number
    originalQuantityKg: number
    currentQuantityKg: number
  }) {
    const [bucket] = await db
      .insert(semiFinishedBuckets)
      .values({
        id: `bucket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        semiFinishedId: data.semiFinishedId,
        sourceBucketId: data.sourceBucketId,
        bucketIndex: data.bucketIndex,
        originalQuantityKg: data.originalQuantityKg,
        currentQuantityKg: data.currentQuantityKg,
        status: 'available',
      })
      .returning()

    return bucket
  },

  /**
   * Atualizar status de bucket
   */
  async updateBucketStatus(bucketId: string, status: string) {
    const [updated] = await db
      .update(semiFinishedBuckets)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(semiFinishedBuckets.id, bucketId))
      .returning()

    return updated
  },

  /**
   * Buscar semi-acabados em quarentena
   */
  async getInQuarantine() {
    return await db
      .select()
      .from(semiFinishedItems)
      .where(eq(semiFinishedItems.status, 'QUARENTENA' as any))
      .orderBy(desc(semiFinishedItems.createdAt))
  },

  /**
   * Buscar semi-acabados prontos para quarentena
   */
  async getReadyForQuarantine() {
    const items = await db
      .select()
      .from(semiFinishedItems)
      .where(eq(semiFinishedItems.status, 'ENVIASANDO' as any))

    return items.filter((item) => {
      const totalKg = item.quantityTotal
      const envasadoKg = item.quantityEnvasado || 0
      return envasadoKg >= totalKg && totalKg > 0
    })
  },
}
