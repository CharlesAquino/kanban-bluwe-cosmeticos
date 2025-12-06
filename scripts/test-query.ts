import 'dotenv/config'
import { getUnifiedDb } from '../src/lib/db-unified'
import { userQueries } from '../src/lib/db/queries/users'

// Mock ENV for db-unified to pick postgres if needed, though getUnifiedDb checks process.env
// But db-unified uses imports which might fail if TS setup is weird in script
// Better to copy the query logic here to minimize deps issues

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

async function test() {
    console.log('Testing query...')
    try {
        const role = 'MOD_OPERATOR'
        const users = await db.query.users.findMany({
            where: eq(schema.users.role, role as any)
        })
        console.log('Users found:', users.length)
    } catch (err) {
        console.error('❌ Query failed:', err)
    } finally {
        await pool.end()
    }
}

test()
