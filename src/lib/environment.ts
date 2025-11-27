/**
 * Environment Detection & Configuration
 * 
 * Centraliza detecção de ambiente e constantes relacionadas.
 * Garante que mocks NUNCA sejam usados em nenhum ambiente.
 */

export const ENV = {
  // Ambiente Node
  isDev: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  isProd: process.env.NODE_ENV === 'production',
  
  // Railway specific
  isStaging: process.env.RAILWAY_ENVIRONMENT === 'staging',
  
  // Configurações
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || '3000',
}

/**
 * POLÍTICA DE MOCKS: PROIBIDO EM TODOS OS AMBIENTES
 * 
 * Mocks foram completamente removidos do sistema.
 * Todas as APIs devem usar dados reais via Prisma.
 * Se o banco não estiver disponível, retornar erro apropriado.
 */
export const ALLOW_MOCKS = false

/**
 * Validar se ambiente está configurado corretamente
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!ENV.databaseUrl) {
    errors.push('DATABASE_URL não configurada')
  }
  
  if (ENV.isProd && !process.env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET não configurada em produção')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Logar informações de ambiente (útil para debug)
 */
export function logEnvironment() {
  console.log('=== ENVIRONMENT INFO ===')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('RAILWAY_ENV:', process.env.RAILWAY_ENVIRONMENT)
  console.log('DATABASE:', ENV.databaseUrl ? '✅ Configurado' : '❌ Não configurado')
  console.log('MOCKS:', ALLOW_MOCKS ? '⚠️ ATIVADO' : '✅ DESATIVADO')
  console.log('========================')
}
