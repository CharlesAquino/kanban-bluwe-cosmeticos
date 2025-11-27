import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/tags/route'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns tags successfully', async () => {
      const mockTags = [
        {
          id: '1',
          name: 'Urgente',
          color: '#ff0000',
          entityType: 'product',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.tag.findMany.mockResolvedValue(mockTags)

      const request = new NextRequest('http://localhost:3000/api/tags')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockTags)
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      })
    })

    it('filters by entityType', async () => {
      const mockTags = [
        {
          id: '1',
          name: 'Tag 1',
          color: '#ff0000',
          entityType: 'product',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.tag.findMany.mockResolvedValue(mockTags)

      const request = new NextRequest('http://localhost:3000/api/tags?entityType=product')
      const response = await GET(request)

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { entityType: 'product' },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('POST', () => {
    it('creates a tag successfully', async () => {
      const newTag = {
        name: 'Nova Tag',
        color: '#00ff00',
        entityType: 'product',
      }

      const createdTag = {
        id: '123',
        ...newTag,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.tag.create.mockResolvedValue(createdTag)

      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(newTag),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdTag)
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: {
          ...newTag,
          isActive: true,
        },
      })
    })

    it('validates required fields', async () => {
      const invalidTag = {
        color: '#00ff00',
        entityType: 'product',
        // missing name
      }

      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(invalidTag),
        headers: { 'content-type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Nome é obrigatório')
    })
  })
})
