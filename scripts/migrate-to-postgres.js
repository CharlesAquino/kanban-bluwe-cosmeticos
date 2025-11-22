#!/usr/bin/env node

/**
 * Script de migração: SQLite → PostgreSQL
 * Use este script para migrar dados do banco SQLite local para PostgreSQL no Railway
 */

import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrateData() {
  console.log('🚀 Iniciando migração SQLite → PostgreSQL...')

  // Conectar ao SQLite (fonte)
  const sqliteDb = new Database(path.join(__dirname, '..', 'dev.db'))

  // Conectar ao PostgreSQL (destino) - usar variável de ambiente
  const postgresUrl = process.env.DATABASE_URL
  if (!postgresUrl) {
    console.error('❌ DATABASE_URL não definida. Configure a variável de ambiente.')
    process.exit(1)
  }

  const prisma = new PrismaClient()

  try {
    console.log('📊 Lendo dados do SQLite...')

    // Buscar todos os produtos do SQLite
    const products = sqliteDb.prepare('SELECT * FROM products').all()
    console.log(`📦 Encontrados ${products.length} produtos`)

    // Buscar usuários (se existirem)
    let users = []
    try {
      users = sqliteDb.prepare('SELECT * FROM users').all()
      console.log(`👥 Encontrados ${users.length} usuários`)
    } catch (error) {
      console.log('⚠️ Tabela users não encontrada, pulando...')
    }

    console.log('💾 Inserindo dados no PostgreSQL...')

    // Limpar tabelas existentes no PostgreSQL
    await prisma.product.deleteMany({})
    if (users.length > 0) {
      await prisma.user.deleteMany({})
    }

    // Migrar usuários primeiro (devido às foreign keys)
    if (users.length > 0) {
      for (const user of users) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            role: user.role,
            image: user.image,
            emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        })
      }
      console.log(`✅ ${users.length} usuários migrados`)
    }

    // Migrar produtos
    for (const product of products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          op: product.op,
          batch: product.batch,
          quantity: product.quantity,
          currentStage: product.currentStage,
          status: product.status,
          priority: product.priority,
          dueDate: product.dueDate ? new Date(product.dueDate) : null,
          notes: product.notes,
          image: product.image,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
          createdById: product.createdById,
          updatedById: product.updatedById
        }
      })
    }

    console.log(`✅ ${products.length} produtos migrados`)
    console.log('🎉 Migração concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante migração:', error)
    process.exit(1)
  } finally {
    sqliteDb.close()
    await prisma.$disconnect()
  }
}

// Executar migração
migrateData()
