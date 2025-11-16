import { NextRequest, NextResponse } from 'next/server'

// Mock de dados de usuários - em produção, usar banco de dados
const USERS = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@bluwe.com.br',
    username: 'CharlesAquino',
    password: '0320ncis', // Em produção, usar hash
    role: 'admin' as const,
    permissions: ['admin', 'kanban', 'quality', 'mod', 'semi-finished']
  },
  {
    id: '2',
    name: 'Operador',
    email: 'operator@bluwe.com.br',
    username: 'operator',
    password: 'operator123',
    role: 'operator' as const,
    permissions: ['kanban', 'mod']
  },
  {
    id: '3',
    name: 'Qualidade',
    email: 'quality@bluwe.com.br',
    username: 'quality',
    password: 'quality123',
    role: 'user' as const,
    permissions: ['quality', 'kanban']
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    // Aceitar email ou username
    const identifier = email || username
    
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = USERS.find(u => 
      (u.email === identifier || u.username === identifier) && 
      u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    // Criar session token (em produção, usar JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    })

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 horas
    })

    // Manter compatibilidade com sistema antigo
    response.cookies.set('admin_auth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth_token')
  response.cookies.delete('admin_auth')
  return response
}
