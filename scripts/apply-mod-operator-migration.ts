/**
 * Script para aplicar migration: Adicionar MOD_OPERATOR ao enum user_role
 * 
 * Como executar:
 * npx tsx scripts/apply-mod-operator-migration.ts
 */

import { db } from '../src/lib/db/client'
import { sql } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function applyMigration() {
  console.log('🚀 Aplicando migration: MOD_OPERATOR role...\n')

  try {
    // Ler arquivo de migration
    const migrationPath = path.join(
      __dirname,
      '../src/lib/db/migrations/002_add_mod_operator_role.sql'
    )
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    
    console.log('📄 Migration SQL:')
    console.log(migrationSQL)
    console.log('')

    // Executar migration
    await db.execute(sql.raw(migrationSQL))
    
    console.log('✅ Migration aplicada com sucesso!')
    console.log('')

    // Verificar se o enum foi atualizado
    const result = await db.execute(sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'user_role'
      )
      ORDER BY enumlabel
    `)

    console.log('📋 Valores do enum user_role:')
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.enumlabel}`)
    })
    console.log('')

    console.log('🎉 Pronto! Agora você pode cadastrar operadores MOD.')
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

applyMigration()
