import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

async function run() {
    try {
        console.log('Adding MOD_OPERATOR to user_role enum...')
        await pool.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MOD_OPERATOR'`)
        console.log('✅ Done!')
    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await pool.end()
    }
}

run()
