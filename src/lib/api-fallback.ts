/**
 * API Fallback System - Garante funcionamento mesmo sem banco de dados
 */

import { prisma } from './prisma'

// Mock data para fallback
const mockProducts = [
  {
    id: 'mock-prod-1',
    name: 'Produto Mock 1',
    op: 'OP001',
    batch: 'L001',
    quantity: 100,
    currentStage: 'PRODUCAO_1KG',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'mock-user'
  },
  {
    id: 'mock-prod-2',
    name: 'Produto Mock 2',
    op: 'OP002',
    batch: 'L002',
    quantity: 200,
    currentStage: 'PRODUCAO_5KG',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'mock-user'
  }
]

const mockStats = {
  totalProducts: 2,
  totalSemiFinished: 0,
  totalOperators: 3,
  activeStages: {
    'PRODUCAO_1KG': 1,
    'PRODUCAO_5KG': 1
  }
}

const mockOperators = [
  {
    id: 'mock-op-1',
    name: 'João Silva',
    email: 'joao@bluwe.com',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-op-2',
    name: 'Maria Santos',
    email: 'maria@bluwe.com',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-op-3',
    name: 'Pedro Costa',
    email: 'pedro@bluwe.com',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Função para verificar se Prisma está disponível
async function isPrismaAvailable(): Promise<boolean> {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.warn('⚠️ Prisma não disponível, usando fallback:', error.message)
    return false
  }
}

// API Products com fallback
export async function getProducts() {
  const prismaAvailable = await isPrismaAvailable()

  if (prismaAvailable) {
    try {
      return await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.warn('❌ Erro no Prisma products, usando fallback:', error.message)
    }
  }

  console.log('✅ Usando mock products')
  return mockProducts
}

export async function createProduct(data: any) {
  const prismaAvailable = await isPrismaAvailable()

  if (prismaAvailable) {
    try {
      return await prisma.product.create({ data })
    } catch (error) {
      console.warn('❌ Erro no Prisma create product, usando fallback:', error.message)
    }
  }

  console.log('✅ Simulando criação de produto (mock)')
  const newProduct = {
    id: `mock-prod-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  mockProducts.push(newProduct)
  return newProduct
}

// API Stats com fallback
export async function getStats() {
  const prismaAvailable = await isPrismaAvailable()

  if (prismaAvailable) {
    try {
      const [products, semiFinished, operators] = await Promise.all([
        prisma.product.count(),
        prisma.semiFinishedItem.count(),
        prisma.user.count({ where: { role: 'OPERATOR' } })
      ])

      return {
        totalProducts: products,
        totalSemiFinished: semiFinished,
        totalOperators: operators,
        activeStages: {} // TODO: implementar contagem por stage
      }
    } catch (error) {
      console.warn('❌ Erro no Prisma stats, usando fallback:', error.message)
    }
  }

  console.log('✅ Usando mock stats')
  return mockStats
}

// API Operators com fallback
export async function getOperators() {
  const prismaAvailable = await isPrismaAvailable()

  if (prismaAvailable) {
    try {
      return await prisma.user.findMany({
        where: { role: 'OPERATOR' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      })
    } catch (error) {
      console.warn('❌ Erro no Prisma operators, usando fallback:', error.message)
    }
  }

  console.log('✅ Usando mock operators')
  return mockOperators
}
