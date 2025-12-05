/**
 * Unified Database Client
 * 
 * Cliente unificado que escolhe entre SQLite (dev) e PostgreSQL (prod/staging)
 * baseado em variáveis de ambiente.
 * 
 * Resolve a dualidade identificada na auditoria:
 * - src/lib/db.ts (better-sqlite3) 
 * - src/lib/db/schema.ts (Drizzle + PostgreSQL)
 */

import { ENV } from './environment'
import { getDb as getSqliteDb } from './db'
import { db as drizzleDb } from './db/client'

export type DbType = 'sqlite' | 'postgres'

interface UnifiedDbConfig {
    type: DbType
    client: any
    orm: 'raw' | 'drizzle'
}

/**
 * Detecta qual banco usar baseado em variáveis de ambiente
 */
function detectDbType(): DbType {
    // Forçar via env variable
    const forcedType = process.env.DB_TYPE?.toLowerCase()
    if (forcedType === 'sqlite' || forcedType === 'postgres') {
        return forcedType
    }

    // Auto-detectar: SQLite apenas em dev, PostgreSQL em staging/prod
    if (ENV.isDev) {
        return 'sqlite'
    }

    return 'postgres'
}

/** 
 * Get database client unificado
 * 
 * @example
 * ```typescript
 * const { client, type } = getUnifiedDb()
 * 
 * if (type === 'sqlite') {
 *   // Usar better-sqlite3 API
 *   const stmt = client.prepare('SELECT * FROM products')
 * } else {
 *   // Usar Drizzle ORM
 *   const products = await client.select().from(productsTable)
 * }
 * ```
 */
export function getUnifiedDb(): UnifiedDbConfig {
    const type = detectDbType()

    if (type === 'sqlite') {
        return {
            type: 'sqlite',
            client: getSqliteDb(),
            orm: 'raw'
        }
    }

    return {
        type: 'postgres',
        client: drizzleDb,
        orm: 'drizzle'
    }
}

/**
 * Helper: Get Drizzle client (sempre retorna Drizzle, mesmo em dev)
 * Útil para código que quer usar sempre Drizzle ORM
 * 
 * @example
 * ```typescript
 * const db = getDrizzleClient()
 * const products = await db.select().from(productsTable)
 * ```
 */
export function getDrizzleClient() {
    return drizzleDb
}

/**
 * Helper: Get SQLite client (apenas em dev)
 * Útil para operações legacy que precisam de SQLite direto
 * 
 * @example
 * ```typescript
 * if (ENV.isDev) {
 *   const db = getSqliteClient()
 *   const stmt = db.prepare('SELECT * FROM products')
 * }
 * ```
 */
export function getSqliteClient() {
    if (!ENV.isDev) {
        throw new Error('SQLite client only available in development')
    }
    return getSqliteDb()
}

/**
 * Info sobre o database atual
 */
export function getDbInfo() {
    const type = detectDbType()

    return {
        type,
        environment: ENV.env,
        isDev: ENV.isDev,
        isStaging: ENV.isStaging,
        isProd: ENV.isProd,
        message: type === 'sqlite'
            ? `Using SQLite (dev.db) in ${ENV.env}`
            : `Using PostgreSQL (Drizzle ORM) in ${ENV.env}`
    }
}

// Export types
export type { UnifiedDbConfig }
