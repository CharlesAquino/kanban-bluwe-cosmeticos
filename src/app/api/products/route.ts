import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'
// Conectar ao banco via singleton
const db = getDb()

interface Product {
  id: string
  name: string
  family?: string
  op: string
  batch: string
  quantity: number
  currentStage: string
  status: string
  image?: string
  createdAt: string
  updatedAt: string
}

export async function GET() {
  try {
    console.log('=== API PRODUCTS: Buscando produtos do SQLite ===')

    const stmt = db.prepare('SELECT * FROM products ORDER BY createdAt DESC')
    const products: Product[] = stmt.all() as Product[]

    console.log('=== API PRODUCTS: Produtos encontrados:', products.length)

    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('=== API PRODUCTS: ERRO ===')
    console.error('Erro ao buscar produtos:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API PRODUCTS: Criando produto no SQLite ===')

    const body = await request.json()
    const { name: rawName, family: rawFamily, op: rawOp, batch: rawBatch, quantity: rawQuantity, image: rawImage } = body as {
      name: string
      family?: string
      op: string
      batch: string
      quantity: number | string
      image?: string
    }

    console.log('Dados recebidos:', { name: rawName, family: rawFamily, op: rawOp, batch: rawBatch, quantity: rawQuantity, image: rawImage })

    if (!rawName || !rawFamily || !rawOp || !rawBatch || rawQuantity === undefined || rawQuantity === null) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: name, family, op, batch, quantity'
      }, { status: 400 })
    }

    // Normalizar e validar quantidade
    const qty = Number(rawQuantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantidade deve ser um número maior que zero'
      }, { status: 400 })
    }

    // Normalizar campos
    const name = String(rawName).trim()
    const family = String(rawFamily).trim()
    const op = String(rawOp).trim()
    const batch = String(rawBatch).trim()
    const image = rawImage && String(rawImage).trim() ? String(rawImage).trim() : undefined

    const product: Product = {
      id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
      name,
      family,
      op,
      batch,
      quantity: qty,
      currentStage: 'producao_1kg',
      status: 'active',
      image: image || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Inserir no banco
    const stmt = db.prepare(`
      INSERT INTO products (id, name, family, op, batch, quantity, currentStage, status, image, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    try {
      stmt.run(
        product.id,
        product.name,
        product.family ?? null,
        product.op,
        product.batch,
        product.quantity,
        product.currentStage,
        product.status,
        product.image ?? null,
        product.createdAt,
        product.updatedAt
      )
    } catch (dbErr) {
      const err = dbErr as any
      console.error('Erro SQLite ao inserir produto:', err)
      const message = String(err?.message || err)
      const isConstraint = err && (
        err.code === 'SQLITE_CONSTRAINT' ||
        err.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        message.includes('UNIQUE constraint failed: products.op, products.batch')
      )
      return NextResponse.json({
        success: false,
        error: isConstraint ? 'Produto duplicado: combinação OP + Lote já existe' : 'Falha ao salvar no banco de dados',
        details: message
      }, { status: isConstraint ? 409 : 500 })
    }

    console.log('Produto criado no SQLite:', product)

    // Gerar baldes automaticamente (18kg por balde, último com resto)
    try {
      const capacity = 18
      const fullBuckets = Math.floor(product.quantity / capacity)
      const remainder = product.quantity % capacity
      const totalBuckets = fullBuckets + (remainder > 0 ? 1 : 0)

      const insertBucket = db.prepare(`
        INSERT INTO product_buckets (id, productId, bucketIndex, capacityKg, originalQuantityKg, currentQuantityKg, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, 'created', ?, ?)
      `)
      const now = new Date().toISOString()
      for (let i = 0; i < totalBuckets; i++) {
        const isLast = i === totalBuckets - 1
        const q = isLast && remainder > 0 ? remainder : capacity
        const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
        insertBucket.run(id, product.id, i + 1, capacity, q, q, now, now)
      }
    } catch (e) {
      console.warn('Aviso: falha ao gerar baldes automaticamente', e)
    }

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 })
  } catch (error) {
    console.error('=== API PRODUCTS: ERRO ao criar produto ===')
    console.error('Mensagem:', error instanceof Error ? error.message : 'Erro desconhecido')

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
