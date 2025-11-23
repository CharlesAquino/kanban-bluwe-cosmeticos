import { PrismaClient } from '@prisma/client'
import mockPrisma from './mock-prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

// Tenta usar Prisma real primeiro
try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

  console.log('✅ Prisma: Usando cliente real')

} catch (error) {
  console.warn('⚠️ Prisma real falhou, usando mock:', error.message)

  // Fallback para mock
  prisma = mockPrisma as any
  console.log('✅ Mock Prisma ativado')
}

export { prisma }
