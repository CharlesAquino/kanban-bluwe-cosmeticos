import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bluwe.com' },
    update: {},
    create: {
      email: 'admin@bluwe.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Criar usuário operador
  const operatorPassword = await bcrypt.hash('operator123', 12)
  const operator = await prisma.user.upsert({
    where: { email: 'operator@bluwe.com' },
    update: {},
    create: {
      email: 'operator@bluwe.com',
      name: 'Operador',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  })

  // Criar tags de exemplo
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { id: 'urgent' },
      update: {},
      create: {
        id: 'urgent',
        name: 'Urgente',
        color: '#ef4444',
        entityType: 'product',
        isActive: true,
      },
    }),
    prisma.tag.upsert({
      where: { id: 'priority' },
      update: {},
      create: {
        id: 'priority',
        name: 'Prioridade',
        color: '#f97316',
        entityType: 'product',
        isActive: true,
      },
    }),
    prisma.tag.upsert({
      where: { id: 'completed' },
      update: {},
      create: {
        id: 'completed',
        name: 'Concluído',
        color: '#22c55e',
        entityType: 'product',
        isActive: true,
      },
    }),
  ])

  // Criar custom fields de exemplo
  const customFields = await Promise.all([
    prisma.customField.upsert({
      where: { id: 'batch-number' },
      update: {},
      create: {
        id: 'batch-number',
        name: 'Número do Lote',
        type: 'TEXT',
        entityType: 'product',
        required: true,
        isActive: true,
        createdById: admin.id,
      },
    }),
    prisma.customField.upsert({
      where: { id: 'expiration-date' },
      update: {},
      create: {
        id: 'expiration-date',
        name: 'Data de Validade',
        type: 'DATE',
        entityType: 'product',
        required: true,
        isActive: true,
        createdById: admin.id,
      },
    }),
    prisma.customField.upsert({
      where: { id: 'temperature' },
      update: {},
      create: {
        id: 'temperature',
        name: 'Temperatura',
        type: 'NUMBER',
        entityType: 'product',
        required: false,
        isActive: true,
        createdById: admin.id,
      },
    }),
  ])

  // Criar produto de exemplo
  const product = await prisma.product.upsert({
    where: { id: 'sample-product' },
    update: {},
    create: {
      id: 'sample-product',
      name: 'Produto de Exemplo',
      description: 'Produto criado para demonstração',
      status: 'ACTIVE',
      stage: 'BACKLOG',
      quantityTotal: 100,
      createdById: admin.id,
    },
  })

  console.log('✅ Seed concluído!')
  console.log(`👤 Usuários criados: ${admin.email}, ${operator.email}`)
  console.log(`🏷️ Tags criadas: ${tags.length}`)
  console.log(`⚙️ Campos customizados: ${customFields.length}`)
  console.log(`📦 Produto criado: ${product.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
