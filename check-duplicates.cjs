const { PrismaClient } = require('@prisma/client');

// Usar a DATABASE_URL pública para execução local
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:OVfLRiilIWYosrJVEaUSUbAqImKThDyJ@switchback.proxy.rlwy.net:20669/railway'
    }
  }
});

async function checkDuplicates() {
  console.log('=== Verificando duplicados em products ===');
  const productDuplicates = await prisma.$queryRaw`
    SELECT op, batch, COUNT(*) as count 
    FROM products 
    GROUP BY op, batch 
    HAVING COUNT(*) > 1
  `;
  
  console.log('=== Verificando duplicados em semi_finished_items ===');
  const semiDuplicates = await prisma.$queryRaw`
    SELECT op, batch, COUNT(*) as count
    FROM semi_finished_items
    GROUP BY op, batch 
    HAVING COUNT(*) > 1
  `;
  
  console.log('Duplicados em products:', productDuplicates);
  console.log('Duplicados em semi_finished_items:', semiDuplicates);
  
  if (productDuplicates.length === 0 && semiDuplicates.length === 0) {
    console.log('\n✅ Nenhum duplicado encontrado. Safe to apply unique constraints.');
  } else {
    console.log('\n⚠️ Encontrados duplicados. É necessário limpar antes de aplicar constraints.');
  }
  
  await prisma.$disconnect();
}

checkDuplicates().catch(console.error);
