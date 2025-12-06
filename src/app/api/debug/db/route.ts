import { NextResponse } from 'next/server'
import { getDbInfo } from '@/lib/db-unified'
import { db } from '@/lib/db/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const info = getDbInfo()
    
    // Testar conexão
    let connectionTest = 'not tested'
    try {
      // Simples query para testar conexão
      await db.execute({ sql: 'SELECT 1 as test', args: [] })
      connectionTest = 'OK'
    } catch (err) {
      connectionTest = `FAILED: ${err instanceof Error ? err.message : 'Unknown error'}`
    }

    return NextResponse.json({
      database: info,
      connection: connectionTest,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DB_TYPE: process.env.DB_TYPE,
        DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : 'NOT SET',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get database info',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
