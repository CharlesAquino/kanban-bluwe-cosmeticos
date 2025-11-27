/**
 * Queries Drizzle para Products
 * Substitui ProductService queries do Prisma
 */

import { db, products, stageHistory, hourlyControls, productTags, tags } from '../client'
import { eq, and, desc, asc, inArray } from 'drizzle-orm'
import type { ProductStage, ProductStatus } from '../schema'

export const productQueries = {
  /**
   * Criar novo produto
   */
  async create(data: {
    name: string
    op: string
    batch: string
    quantity: number
    createdById: string
  }) {
    const now = new Date()

    const [product] = await db
      .insert(products)
      .values({
        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        op: data.op,
        batch: data.batch,
        quantity: data.quantity,
        currentStage: 'PRODUCAO_1KG',
        status: 'ACTIVE',
        createdById: data.createdById,
        manufacturingDate: now,
      })
      .returning()

    // Criar primeiro estágio
    await db.insert(stageHistory).values({
      id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      stage: 'PRODUCAO_1KG',
      startTime: now,
      mod: 1,
    })

    return product
  },

  /**
   * Buscar todos os produtos
   */
  async getAll() {
    return await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
  },

  /**
   * Buscar produto por ID
   */
  async getById(id: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))

    return product || null
  },

  /**
   * Buscar produtos por estágio
   */
  async getByStage(stage: ProductStage) {
    return await db
      .select()
      .from(products)
      .where(eq(products.currentStage, stage))
      .orderBy(desc(products.createdAt))
  },

  /**
   * Buscar produtos por status
   */
  async getByStatus(status: ProductStatus) {
    return await db
      .select()
      .from(products)
      .where(eq(products.status, status))
      .orderBy(desc(products.createdAt))
  },

  /**
   * Atualizar estágio do produto
   */
  async updateStage(
    productId: string,
    nextStage: ProductStage,
    mod: number
  ) {
    const now = new Date()

    // Finalizar estágio atual
    await db
      .update(stageHistory)
      .set({ endTime: now })
      .where(
        and(
          eq(stageHistory.productId, productId),
          eq(stageHistory.stage, (await this.getById(productId))?.currentStage as ProductStage),
          eq(stageHistory.endTime, null as any)
        )
      )

    // Criar novo estágio
    await db.insert(stageHistory).values({
      id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      stage: nextStage,
      startTime: now,
      mod,
    })

    // Atualizar produto
    const [updated] = await db
      .update(products)
      .set({
        currentStage: nextStage,
        status: nextStage === 'APROVADO' ? 'COMPLETED' : 'ACTIVE',
        updatedAt: now,
      })
      .where(eq(products.id, productId))
      .returning()

    return updated
  },

  /**
   * Pausar produção
   */
  async pause(productId: string) {
    const [updated] = await db
      .update(products)
      .set({
        status: 'PAUSED',
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning()

    return updated
  },

  /**
   * Retomar produção
   */
  async resume(productId: string) {
    const [updated] = await db
      .update(products)
      .set({
        status: 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning()

    return updated
  },

  /**
   * Bloquear produção
   */
  async block(productId: string, reason: string) {
    const now = new Date()

    // Atualizar estágio atual com motivo
    await db
      .update(stageHistory)
      .set({ notes: `[BLOQUEADO] ${reason}` })
      .where(
        and(
          eq(stageHistory.productId, productId),
          eq(stageHistory.endTime, null as any)
        )
      )

    // Atualizar produto
    const [updated] = await db
      .update(products)
      .set({
        status: 'BLOCKED',
        updatedAt: now,
      })
      .where(eq(products.id, productId))
      .returning()

    return updated
  },

  /**
   * Deletar produto
   */
  async delete(productId: string) {
    await db.delete(products).where(eq(products.id, productId))
    return true
  },

  /**
   * Buscar histórico de estágios
   */
  async getStageHistory(productId: string) {
    return await db
      .select()
      .from(stageHistory)
      .where(eq(stageHistory.productId, productId))
      .orderBy(asc(stageHistory.startTime))
  },

  /**
   * Filtrar produtos sem mocks
   */
  async getAllWithoutMocks() {
    const allProducts = await this.getAll()
    return allProducts.filter((p) => {
      const id = String(p.id)
      const name = String(p.name)
      const isMockId = id.startsWith('mock-prod-')
      const isMockName = name.toLowerCase().startsWith('produto mock')
      return !isMockId && !isMockName
    })
  },

  /**
   * Calcular estatísticas
   */
  async getStats() {
    const allProducts = await this.getAll()

    return {
      total: allProducts.length,
      active: allProducts.filter((p) => p.status === 'ACTIVE').length,
      paused: allProducts.filter((p) => p.status === 'PAUSED').length,
      completed: allProducts.filter((p) => p.status === 'COMPLETED').length,
      blocked: allProducts.filter((p) => p.status === 'BLOCKED').length,
    }
  },
}
