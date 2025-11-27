/**
 * Cliente Drizzle ORM para PostgreSQL
 * Substitui o cliente Prisma com melhor performance
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined
}

let db: ReturnType<typeof drizzle>

if (!globalForDrizzle.db) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  db = drizzle(pool, { schema })
  globalForDrizzle.db = db
} else {
  db = globalForDrizzle.db
}

export { db }
export * from './schema'
