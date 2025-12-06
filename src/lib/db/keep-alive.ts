/**
 * Keep-Alive para PostgreSQL
 * Evita que o banco entre em "sleeping mode" no Railway
 */

import { db } from './client'
import { sql } from 'drizzle-orm'

let keepAliveInterval: NodeJS.Timeout | null = null

/**
 * Inicia o keep-alive do PostgreSQL
 * Faz um ping a cada 4 minutos para manter a conexão ativa
 */
export function startKeepAlive() {
  if (keepAliveInterval) {
    console.log('⚠️ Keep-alive já está rodando')
    return
  }

  console.log('🚀 Iniciando keep-alive do PostgreSQL')

  // Ping imediato
  pingDatabase()

  // Ping a cada 4 minutos (Railway coloca em sleep após 5 min)
  keepAliveInterval = setInterval(() => {
    pingDatabase()
  }, 4 * 60 * 1000)
}

/**
 * Para o keep-alive
 */
export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = null
    console.log('🛑 Keep-alive do PostgreSQL parado')
  }
}

/**
 * Faz um ping no banco de dados
 */
async function pingDatabase() {
  try {
    await db.execute(sql`SELECT 1 as ping`)
    console.log('✅ PostgreSQL keep-alive ping - OK')
  } catch (error) {
    console.error('❌ PostgreSQL keep-alive ping - FALHOU:', error)
  }
}

// Auto-start em produção
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  startKeepAlive()
}
