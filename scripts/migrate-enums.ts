import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

async function run() {
    try {
        console.log('Migrating users.role to new user_role enum...')

        // 1. Drop default
        console.log('Dropping default...')
        await pool.query(`ALTER TABLE users ALTER COLUMN role DROP DEFAULT`)

        // 2. Alter type
        console.log('Altering type...')
        await pool.query(`
        ALTER TABLE users 
        ALTER COLUMN role 
        TYPE user_role 
        USING role::text::user_role
    `)

        // 3. Set new default
        console.log('Setting new default...')
        await pool.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'VIEWER'::user_role`)

        console.log('✅ users.role migrated!')

    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await pool.end()
    }
}

run()
