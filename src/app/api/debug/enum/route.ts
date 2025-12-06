import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verificar valores do enum user_role no banco
    const result = await db.execute(sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'user_role'
      )
      ORDER BY enumsortorder
    `)

    return NextResponse.json({
      success: true,
      enumValues: result.rows,
      hasMOD_OPERATOR: result.rows.some((row: any) => row.enumlabel === 'MOD_OPERATOR'),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check enum values',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
