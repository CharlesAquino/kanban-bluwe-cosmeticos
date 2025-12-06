import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

async function checkEnum() {
    try {
        const res = await pool.query(`SELECT unnest(enum_range(NULL::user_role)) as val`)
        console.log('Enum values:', res.rows.map(r => r.val))
    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await pool.end()
    }
}

checkEnum()
