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
    max: 20, // Pool de conexões
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Timeout de 10s para cold start
    query_timeout: 8000, // Query timeout de 8s
    keepAlive: true, // Manter conexão viva
    keepAliveInitialDelayMillis: 10000,
  })

  db = drizzle(pool, { schema })
  globalForDrizzle.db = db
} else {
  db = globalForDrizzle.db
}

export { db }
export * from './schema'

// Iniciar keep-alive em produção (server-side only)
if (typeof window === 'undefined') {
  import('./keep-alive').then(({ startKeepAlive }) => {
    startKeepAlive()
  })
}
