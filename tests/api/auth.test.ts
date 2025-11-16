import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/auth/login/route'

// Mock do NextRequest
const createMockRequest = (body: any) => ({
  json: () => Promise.resolve(body)
}) as any

describe('Auth Login API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve fazer login com credenciais corretas', async () => {
    const mockRequest = createMockRequest({
      email: 'admin@bluwe.com.br',
      password: '0320ncis'
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('admin@bluwe.com.br')
    expect(data.user.name).toBe('Administrador')
    expect(data.user.role).toBe('admin')
    expect(data.token).toBeDefined()
  })

  it('deve fazer login com username', async () => {
    const mockRequest = createMockRequest({
      username: 'CharlesAquino',
      password: '0320ncis'
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.username).toBe('CharlesAquino')
  })

  it('deve rejeitar credenciais inválidas', async () => {
    const mockRequest = createMockRequest({
      email: 'invalid@email.com',
      password: 'wrongpassword'
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Credenciais inválidas')
  })

  it('deve rejeitar requisição sem senha', async () => {
    const mockRequest = createMockRequest({
      email: 'admin@bluwe.com.br'
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Email/Usuário e senha são obrigatórios')
  })

  it('deve rejeitar requisição sem email/username', async () => {
    const mockRequest = createMockRequest({
      password: '0320ncis'
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Email/Usuário e senha são obrigatórios')
  })
})
