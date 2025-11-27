import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET() { return NextResponse.json({ error: 'Rota desativada' }, { status: 503 }) }
export async function POST() { return NextResponse.json({ error: 'Rota desativada' }, { status: 503 }) }
export async function PATCH() { return NextResponse.json({ error: 'Rota desativada' }, { status: 503 }) }
export async function DELETE() { return NextResponse.json({ error: 'Rota desativada' }, { status: 503 }) }
