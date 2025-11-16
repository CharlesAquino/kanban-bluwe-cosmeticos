import { NextRequest, NextResponse } from 'next/server'

const STATIC_USER = 'CharlesAquino'
const STATIC_PASS = '0320ncis'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username !== STATIC_USER || password !== STATIC_PASS) {
      return NextResponse.json(
        { success: false, error: 'Usuário ou senha inválidos' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({ success: true })

    res.cookies.set('admin_auth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    return res
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}
