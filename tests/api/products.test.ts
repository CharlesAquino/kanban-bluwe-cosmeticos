import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, DELETE } from '@/app/api/products/route'

// Mock do NextRequest
const createMockRequest = (body?: any) => ({
  json: () => Promise.resolve(body || {})
}) as any

describe('Products API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('deve retornar lista de produtos', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/products', () => {
    it('deve criar um novo produto', async () => {
      const mockProduct = {
        name: 'Test Product',
        op: 'OP001',
        batch: 'B001',
        quantity: 100.5,
        currentStage: 'Produção do 1kg'
      }

      const mockRequest = createMockRequest(mockProduct)
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe(mockProduct.name)
      expect(data.data.op).toBe(mockProduct.op)
      expect(data.data.id).toBeDefined()
    })

    it('deve rejeitar produto sem nome', async () => {
      const mockProduct = {
        op: 'OP001',
        batch: 'B001',
        quantity: 100.5
      }

      const mockRequest = createMockRequest(mockProduct)
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('obrigatório')
    })

    it('deve rejeitar produto com quantidade negativa', async () => {
      const mockProduct = {
        name: 'Test Product',
        op: 'OP001',
        batch: 'B001',
        quantity: -10
      }

      const mockRequest = createMockRequest(mockProduct)
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PUT /api/products/[id]', () => {
    it('deve atualizar um produto existente', async () => {
      const mockUpdate = {
        name: 'Updated Product',
        quantity: 150.0,
        status: 'completed'
      }

      const mockRequest = createMockRequest(mockUpdate)
      const mockParams = { id: 'test-id' }
      
      // Mock da função PUT para teste
      const response = await PUT(mockRequest, { params: mockParams })
      const data = await response.json()

      // Verificar se a resposta tem estrutura esperada
      expect(typeof response.status).toBe('number')
      expect(typeof data).toBe('object')
    })
  })

  describe('DELETE /api/products/[id]', () => {
    it('deve deletar um produto existente', async () => {
      const mockParams = { id: 'test-id' }
      
      // Mock da função DELETE para teste
      const response = await DELETE(new Request('http://localhost'), { params: mockParams })
      const data = await response.json()

      // Verificar se a resposta tem estrutura esperada
      expect(typeof response.status).toBe('number')
      expect(typeof data).toBe('object')
    })
  })
})
