import 'dotenv/config'
import { Pool } from 'pg'

const url = process.env.DATABASE_URL || ''
const pool = new Pool({ connectionString: url })

async function check() {
    try {
        console.log('Connecting...')

        // Check column type
        const resCol = await pool.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `)
        console.log('Column Type:', JSON.stringify(resCol.rows, null, 2))

        // List all enums in public schema
        const resEnums = await pool.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
    `)
        // Group by enum name
        const enums: any = {}
        resEnums.rows.forEach(r => {
            if (!enums[r.enum_name]) enums[r.enum_name] = []
            enums[r.enum_name].push(r.enum_value)
        })
        console.log('Enums found:', JSON.stringify(enums, null, 2))

    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await pool.end()
    }
}

check()
