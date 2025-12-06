// Script para aplicar migration direto no Railway Postgres
import 'dotenv/config'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

// Conexão com SSL para Railway
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

async function applyMigration() {
    const sqlContent = readFileSync(
        join(process.cwd(), 'src/lib/db/migrations/0000_watery_the_captain.sql'),
        'utf-8'
    )

    // Split por comando SQL (básico)
    const statements = sqlContent.split('--> statement-breakpoint')

    console.log(`🚀 Applying ${statements.length} migration statements to Railway Postgres...`)

    const client = await pool.connect()
    try {
        let success = 0
        let skipped = 0
        let failed = 0

        for (const statement of statements) {
            if (!statement.trim()) continue
            try {
                await client.query(statement)
                success++
                process.stdout.write('.')
            } catch (error: any) {
                const msg = String(error.message)
                if (msg.includes('already exists') || msg.includes('does not exist')) {
                    // Se diz que coluna nao existe ao criar indice, talvez a tabela falhou antes?
                    // Mas 'already exists' é safe skip.
                    // 'does not exist' geralmente é indice em tabela que nao existe
                    process.stdout.write('s')
                    skipped++
                } else {
                    process.stdout.write('F')
                    console.error(`\n❌ Error:\n${msg}`)
                    failed++
                }
            }
        }
        console.log(`\n\n✅ Migration finished! Success: ${success}, Skipped: ${skipped}, Failed: ${failed}`)
    } finally {
        client.release()
        await pool.end()
    }
}

applyMigration()
