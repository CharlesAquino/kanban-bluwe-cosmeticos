/**
 * Script simples para executar migration MOD_OPERATOR
 * Usa apenas pg (já instalado no projeto)
 */

import pg from 'pg';
const { Pool } = pg;

async function runMigration() {
  console.log('🚀 Conectando ao PostgreSQL do Railway...\n');

  const pool = new Pool({
    connectionString: "postgresql://postgres:OVfLRiilIWYosrJVEaUSUbAqImKThDyJ@switchback.proxy.rlwy.net:20669/railway",
  });

  try {
    // Executar migration
    console.log('📝 Executando migration: ADD MOD_OPERATOR...');
    await pool.query(`ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'MOD_OPERATOR';`);
    console.log('✅ Migration executada com sucesso!\n');

    // Verificar resultado
    console.log('🔍 Verificando valores do enum user_role...');
    const result = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'user_role'
      )
      ORDER BY enumlabel;
    `);

    console.log('\n📋 Valores do enum user_role:');
    result.rows.forEach(row => {
      const label = row.enumlabel;
      const marker = label === 'MOD_OPERATOR' ? ' ← NOVO!' : '';
      console.log(`  - ${label}${marker}`);
    });

    console.log('\n🎉 Migration concluída com sucesso!');
    console.log('✅ Agora você pode cadastrar operadores MOD no sistema.\n');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  MOD_OPERATOR já existe no enum. Nada a fazer.');
      
      // Mostrar valores atuais
      const result = await pool.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid 
          FROM pg_type 
          WHERE typname = 'user_role'
        )
        ORDER BY enumlabel;
      `);

      console.log('\n📋 Valores atuais do enum user_role:');
      result.rows.forEach(row => {
        console.log(`  - ${row.enumlabel}`);
      });
    } else {
      console.error('❌ Erro ao executar migration:', error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Executar
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
