/**
 * Script para executar migrations no banco de dados
 * Uso: npx ts-node scripts/run-migrations.ts
 */

import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migrations...')

    // Ler arquivo de migration
    const migrationPath = path.join(
      __dirname,
      '../src/lib/db/migrations/001_create_quality_tables.sql'
    )
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Dividir em statements individuais
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    // Executar cada statement
    for (const statement of statements) {
      console.log(`📝 Executando: ${statement.substring(0, 50)}...`)
      await db.execute(sql.raw(statement))
      console.log('✅ OK')
    }

    console.log('✅ Todas as migrations executadas com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error)
    process.exit(1)
  }
}

runMigrations()
