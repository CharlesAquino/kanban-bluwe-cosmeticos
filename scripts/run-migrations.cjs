/**
 * Script para executar migrations no banco de dados
 * Uso: node scripts/run-migrations.js
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

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
      await pool.query(statement)
      console.log('✅ OK')
    }

    console.log('✅ Todas as migrations executadas com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations()
