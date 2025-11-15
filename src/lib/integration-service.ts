// Serviço de integração entre produtos e controles hora a hora
import { prisma } from './prisma'
import { ProductStage, ProductStatus, Shift, EfficiencyStatus } from '@prisma/client'
import type { Product, HourlyControl } from './types'

export class IntegrationService {
  /**
   * Cria um controle hora a hora para um produto em um estágio específico
   */
  static async createHourlyControl(
    productId: string,
    stage: ProductStage,
    data: {
      operator: string
      shift: Shift
      targetQuantity: number
      actualQuantity: number
      notes?: string
    }
  ): Promise<HourlyControl | null> {
    try {
      // Buscar produto
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { hourlyControls: true }
      })

      if (!product) {
        throw new Error('Produto não encontrado')
      }

      // Calcular eficiência
      const efficiency = Math.round((data.actualQuantity / data.targetQuantity) * 100)

      // Determinar status baseado na eficiência
      let status: EfficiencyStatus
      if (efficiency >= 100) {
        status = 'ahead'
      } else if (efficiency >= 90) {
        status = 'on_track'
      } else {
        status = 'behind'
      }

      // Criar controle hora a hora
      const hourlyControl = await prisma.hourlyControl.create({
        data: {
          productId,
          productName: product.name,
          stage,
          operator: data.operator,
          shift: data.shift,
          targetQuantity: data.targetQuantity,
          actualQuantity: data.actualQuantity,
          efficiency,
          status,
          notes: data.notes,
          date: new Date()
        }
      })

      return this.transformPrismaHourlyControl(hourlyControl)
    } catch (error) {
      console.error('Erro ao criar controle hora a hora:', error)
      throw error
    }
  }

  /**
   * Atualiza um controle hora a hora existente
   */
  static async updateHourlyControl(
    hourlyControlId: string,
    data: {
      actualQuantity?: number
      notes?: string
      status?: EfficiencyStatus
    }
  ): Promise<HourlyControl | null> {
    try {
      const existingControl = await prisma.hourlyControl.findUnique({
        where: { id: hourlyControlId }
      })

      if (!existingControl) {
        throw new Error('Controle hora a hora não encontrado')
      }

      // Calcular nova eficiência se actualQuantity foi alterado
      let efficiency = existingControl.efficiency
      let status = existingControl.status

      if (data.actualQuantity !== undefined) {
        efficiency = Math.round((data.actualQuantity / existingControl.targetQuantity) * 100)

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

      const updatedControl = await prisma.hourlyControl.update({
        where: { id: hourlyControlId },
        data: {
          actualQuantity: data.actualQuantity ?? existingControl.actualQuantity,
          efficiency,
          status,
          notes: data.notes ?? existingControl.notes,
          updatedAt: new Date()
        }
      })

      return this.transformPrismaHourlyControl(updatedControl)
    } catch (error) {
      console.error('Erro ao atualizar controle hora a hora:', error)
      throw error
    }
  }

  /**
   * Busca controles hora a hora por produto
   */
  static async getHourlyControlsByProduct(productId: string): Promise<HourlyControl[]> {
    try {
      const controls = await prisma.hourlyControl.findMany({
        where: { productId },
        orderBy: { date: 'desc' }
      })

      return controls.map(this.transformPrismaHourlyControl)
    } catch (error) {
      console.error('Erro ao buscar controles hora a hora:', error)
      throw error
    }
  }

  /**
   * Busca controles hora a hora por data e turno
   */
  static async getHourlyControlsByDateAndShift(
    date: string,
    shift: Shift
  ): Promise<HourlyControl[]> {
    try {
      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)

      const controls = await prisma.hourlyControl.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate
          },
          shift
        },
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return controls.map(this.transformPrismaHourlyControl)
    } catch (error) {
      console.error('Erro ao buscar controles hora a hora por data e turno:', error)
      throw error
    }
  }

  /**
   * Registra avanço de estágio e cria controle hora a hora
   */
  static async advanceStageWithHourlyControl(
    productId: string,
    nextStage: ProductStage,
    mod: number,
    hourlyControlData: {
      operator: string
      shift: Shift
      targetQuantity: number
      actualQuantity: number
      notes?: string
    }
  ): Promise<{ product: Product; hourlyControl: HourlyControl }> {
    try {
      // Criar controle hora a hora primeiro
      const hourlyControl = await this.createHourlyControl(
        productId,
        nextStage,
        hourlyControlData
      )

      if (!hourlyControl) {
        throw new Error('Falha ao criar controle hora a hora')
      }

      // Buscar produto atualizado com controles hora a hora
      const updatedProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          stagesHistory: true,
          hourlyControls: true
        }
      })

      if (!updatedProduct) {
        throw new Error('Produto não encontrado após atualização')
      }

      return {
        product: this.transformPrismaProduct(updatedProduct),
        hourlyControl
      }
    } catch (error) {
      console.error('Erro ao avançar estágio com controle hora a hora:', error)
      throw error
    }
  }

  /**
   * Obtém estatísticas de produção integradas
   */
  static async getIntegratedStats() {
    try {
      const [
        totalProducts,
        productsInProgress,
        hourlyControls,
        averageEfficiency
      ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({
          where: { status: 'in_progress' }
        }),
        prisma.hourlyControl.count(),
        prisma.hourlyControl.aggregate({
          _avg: {
            efficiency: true
          }
        })
      ])

      return {
        totalProducts,
        productsInProgress,
        totalHourlyControls: hourlyControls,
        averageEfficiency: Math.round(averageEfficiency._avg.efficiency || 0)
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas integradas:', error)
      throw error
    }
  }

  /**
   * Transforma objeto Prisma para interface TypeScript
   */
  private static transformPrismaHourlyControl(prismaControl: any): HourlyControl {
    return {
      id: prismaControl.id,
      date: prismaControl.date.toISOString().split('T')[0],
      shift: prismaControl.shift,
      operator: prismaControl.operator,
      productId: prismaControl.productId,
      productName: prismaControl.productName,
      targetQuantity: prismaControl.targetQuantity,
      actualQuantity: prismaControl.actualQuantity,
      efficiency: prismaControl.efficiency,
      status: prismaControl.status,
      notes: prismaControl.notes,
      stage: prismaControl.stage,
      createdAt: prismaControl.createdAt.toISOString(),
      updatedAt: prismaControl.updatedAt.toISOString()
    }
  }

  /**
   * Transforma produto Prisma para interface TypeScript
   */
  private static transformPrismaProduct(prismaProduct: any): Product {
    return {
      id: prismaProduct.id,
      name: prismaProduct.name,
      op: prismaProduct.op,
      batch: prismaProduct.batch,
      quantity: prismaProduct.quantity,
      currentStage: prismaProduct.currentStage,
      status: prismaProduct.status,
      createdAt: prismaProduct.createdAt.toISOString(),
      updatedAt: prismaProduct.updatedAt.toISOString(),
      stagesHistory: prismaProduct.stagesHistory.map((stage: any) => ({
        id: stage.id,
        stage: stage.stage,
        startTime: stage.startTime.toISOString(),
        endTime: stage.endTime?.toISOString() || null,
        mod: stage.mod,
        notes: stage.notes,
        productId: stage.productId
      })),
      hourlyControls: prismaProduct.hourlyControls?.map(this.transformPrismaHourlyControl) || []
    }
  }
}
