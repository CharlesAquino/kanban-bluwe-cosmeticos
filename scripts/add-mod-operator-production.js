/**
 * Script para adicionar MOD_OPERATOR ao enum user_role em PRODUÇÃO
 * 
 * USO:
 * node scripts/add-mod-operator-production.js
 */

import pg from 'pg'
const { Client } = pg

async function addModOperatorEnum() {
  // URL do banco de PRODUÇÃO (Railway)
  const DATABASE_URL = process.env.DATABASE_URL

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada!')
    console.error('Configure a variável de ambiente DATABASE_URL com a URL do PostgreSQL do Railway')
    process.exit(1)
  }

  console.log('🔗 Conectando ao PostgreSQL de produção...')
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Railway usa SSL
    }
  })

  try {
    await client.connect()
    console.log('✅ Conectado ao banco de produção!')

    // Verificar se MOD_OPERATOR já existe
    console.log('\n🔍 Verificando enum atual...')
    const checkResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'user_role'
      )
      ORDER BY enumsortorder
    `)

    console.log('📋 Valores atuais do enum user_role:')
    checkResult.rows.forEach(row => {
      console.log(`   - ${row.enumlabel}`)
    })

    const hasMOD_OPERATOR = checkResult.rows.some(row => row.enumlabel === 'MOD_OPERATOR')

    if (hasMOD_OPERATOR) {
      console.log('\n✅ MOD_OPERATOR já existe no enum! Nada a fazer.')
      await client.end()
      return
    }

    // Adicionar MOD_OPERATOR
    console.log('\n🚀 Adicionando MOD_OPERATOR ao enum...')
    await client.query(`
      ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'MOD_OPERATOR'
    `)

    console.log('✅ MOD_OPERATOR adicionado com sucesso!')

    // Verificar novamente
    const verifyResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'user_role'
      )
      ORDER BY enumsortorder
    `)

    console.log('\n📋 Valores atualizados do enum user_role:')
    verifyResult.rows.forEach(row => {
      console.log(`   - ${row.enumlabel}`)
    })

    console.log('\n🎉 Migration concluída com sucesso!')

  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error)
    console.error('Detalhes:', error.message)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Conexão fechada.')
  }
}

// Executar
addModOperatorEnum()
