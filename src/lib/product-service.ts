import { prisma } from '@/lib/prisma'
import type { Product, ProductStage, ProductStatus, Shift, EfficiencyStatus } from '@/lib/types'
import { IntegrationService } from './integration-service'

export class ProductService {
  // Criar novo produto
  static async createProduct(data: {
    name: string
    op: string
    batch: string
    quantity: number
  }): Promise<Product> {
    const now = new Date().toISOString()

    // Criar produto com primeiro estágio
    const product = await prisma.product.create({
      data: {
        name: data.name,
        op: data.op,
        batch: data.batch,
        quantity: data.quantity,
        currentStage: 'PRODUCAO_1KG',
        status: 'in_progress',
        stagesHistory: {
          create: {
            stage: 'PRODUCAO_1KG',
            startTime: now,
            mod: 1,
          }
        }
      },
      include: {
        stagesHistory: true,
        hourlyControls: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return this.transformPrismaProduct(product)
  }

  // Buscar todos os produtos
  static async getAllProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      include: {
        stageHistory: {
          orderBy: {
            timestamp: 'asc'
          }
        },
        hourlyControls: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return products.map(this.transformPrismaProduct)
  }

  // Buscar produto por ID
  static async getProductById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stagesHistory: {
          orderBy: {
            startTime: 'asc'
          }
        },
        hourlyControls: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return product ? this.transformPrismaProduct(product) : null
  }

  // Avançar para próximo estágio (método original - sem integração)
  static async advanceStage(
    productId: string,
    nextStage: ProductStage,
    mod: number
  ): Promise<Product | null> {
    // Buscar produto atual
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { stagesHistory: true }
    })

    if (!product) return null

    // Finalizar estágio atual
    await prisma.stageHistory.updateMany({
      where: {
        productId,
        stage: product.currentStage,
        endTime: null
      },
      data: {
        endTime: new Date().toISOString()
      }
    })

    // Iniciar próximo estágio
    await prisma.stageHistory.create({
      data: {
        stage: nextStage,
        startTime: new Date().toISOString(),
        mod,
        productId
      }
    })

    // Atualizar produto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        currentStage: nextStage,
        status: nextStage === 'aprovado' ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString()
      },
      include: {
        stagesHistory: {
          orderBy: {
            startTime: 'asc'
          }
        },
        hourlyControls: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return this.transformPrismaProduct(updatedProduct)
  }

  // Avançar para próximo estágio com controle hora a hora integrado
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
  ): Promise<{ product: Product; hourlyControl: { id: string; date: string; shift: string; operator: string; productId: string; productName: string; targetQuantity: number; actualQuantity: number; efficiency: number; status: string; notes?: string; stage: string; createdAt: string; updatedAt: string } | null }> {
    try {
      // Buscar produto atual
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { stagesHistory: true }
      })

      if (!product) {
        throw new Error('Produto não encontrado')
      }

      // Finalizar estágio atual
      await prisma.stageHistory.updateMany({
        where: {
          productId,
          stage: product.currentStage,
          endTime: null
        },
        data: {
          endTime: new Date().toISOString()
        }
      })

      // Iniciar próximo estágio
      await prisma.stageHistory.create({
        data: {
          stage: nextStage,
          startTime: new Date().toISOString(),
          mod,
          productId
        }
      })

      // Atualizar produto
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          currentStage: nextStage,
          status: nextStage === 'aprovado' ? 'completed' : 'in_progress',
          updatedAt: new Date().toISOString()
        },
        include: {
          stagesHistory: {
            orderBy: {
              startTime: 'asc'
            }
          },
          hourlyControls: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      // Criar controle hora a hora integrado
      const hourlyControl = await IntegrationService.createHourlyControl(
        productId,
        nextStage,
        {
          operator: hourlyControlData.operator,
          shift: hourlyControlData.shift,
          targetQuantity: hourlyControlData.targetQuantity,
          actualQuantity: hourlyControlData.actualQuantity,
          notes: hourlyControlData.notes
        }
      )

      if (!hourlyControl) {
        throw new Error('Falha ao criar controle hora a hora')
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

  // Pausar produção
  static async pauseProduction(productId: string): Promise<Product | null> {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'paused',
        updatedAt: new Date().toISOString()
      },
      include: {
        stagesHistory: {
          orderBy: {
            startTime: 'asc'
          }
        },
        hourlyControls: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return this.transformPrismaProduct(product)
  }

  // Retomar produção
  static async resumeProduction(productId: string): Promise<Product | null> {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'in_progress',
        updatedAt: new Date().toISOString()
      },
      include: {
        stagesHistory: {
          orderBy: {
            startTime: 'asc'
          }
        },
        hourlyControls: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return this.transformPrismaProduct(product)
  }

  // Bloquear produção
  static async blockProduction(productId: string, reason: string): Promise<Product | null> {
    // Adicionar nota ao estágio atual
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { stagesHistory: true }
    })

    if (!product) return null

    // Atualizar estágio atual com motivo do bloqueio
    await prisma.stageHistory.updateMany({
      where: {
        productId,
        stage: product.currentStage,
        endTime: null
      },
      data: {
        notes: `[BLOQUEADO] ${reason}`
      }
    })

    // Atualizar status do produto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'blocked',
        updatedAt: new Date().toISOString()
      },
      include: {
        stagesHistory: {
          orderBy: {
            startTime: 'asc'
          }
        },
        hourlyControls: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return this.transformPrismaProduct(updatedProduct)
  }

  // Deletar produto
  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id: productId }
      })
      return true
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      return false
    }
  }

  // Calcular estatísticas
  static async getStats() {
    try {
      const products = await prisma.product.findMany({
        include: {
          stagesHistory: true,
          hourlyControls: true
        }
      })

      const stats = {
        total: products.length,
        inProgress: products.filter(p => p.status === 'in_progress').length,
        paused: products.filter(p => p.status === 'paused').length,
        completed: products.filter(p => p.status === 'completed').length,
        blocked: products.filter(p => p.status === 'blocked').length,
      }

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)

      // Retorna estatísticas vazias em caso de erro
      return {
        total: 0,
        inProgress: 0,
        paused: 0,
        completed: 0,
        blocked: 0,
      }
    }
  }

  // Transformar dados do Prisma para formato da aplicação
  private static transformPrismaProduct(prismaProduct: {
    id: string
    name: string
    op: string
    batch: string
    quantity: number
    currentStage: string
    status: string
    createdAt: Date
    updatedAt: Date
    stagesHistory: Array<{
      id: string
      stage: string
      startTime: Date
      endTime: Date | null
      mod: number
      notes: string | null
      productId: string
    }>
    hourlyControls?: Array<{
      id: string
      date: Date
      shift: string
      operator: string
      productId: string
      productName: string
      targetQuantity: number
      actualQuantity: number
      efficiency: number
      status: string
      notes: string | null
      stage: string
      createdAt: Date
      updatedAt: Date
    }>
  }): Product {
    return {
      id: prismaProduct.id,
      name: prismaProduct.name,
      op: prismaProduct.op,
      batch: prismaProduct.batch,
      quantity: prismaProduct.quantity,
      currentStage: prismaProduct.currentStage as ProductStage,
      status: prismaProduct.status as ProductStatus,
      createdAt: prismaProduct.createdAt.toISOString(),
      updatedAt: prismaProduct.updatedAt.toISOString(),
      stagesHistory: prismaProduct.stagesHistory.map((stage) => ({
        id: stage.id,
        stage: stage.stage as ProductStage,
        startTime: stage.startTime.toISOString(),
        endTime: stage.endTime?.toISOString() || null,
        mod: stage.mod,
        notes: stage.notes,
        productId: stage.productId
      })),
      hourlyControls: prismaProduct.hourlyControls?.map((control) => ({
        id: control.id,
        date: control.date.toISOString().split('T')[0],
        shift: control.shift as Shift,
        operator: control.operator,
        productId: control.productId,
        productName: control.productName,
        targetQuantity: control.targetQuantity,
        actualQuantity: control.actualQuantity,
        efficiency: control.efficiency,
        status: control.status as EfficiencyStatus,
        notes: control.notes || undefined,
        stage: control.stage as ProductStage,
        createdAt: control.createdAt.toISOString(),
        updatedAt: control.updatedAt.toISOString()
      })) || []
    }
  }
}
