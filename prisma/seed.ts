import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hunterpdv.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@hunterpdv.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created')

  // Create sample products
  const products = [
    {
      name: 'Camiseta Básica',
      description: 'Camiseta 100% algodão',
      sku: 'ROP-0001',
      price: 59.90,
      cost: 25.00,
      category: 'CLOTHING' as const,
      variants: {
        create: [
          { size: 'P', color: 'Branco', sku: 'ROP-0001-P-BR', stock: 20, minStock: 5 },
          { size: 'M', color: 'Branco', sku: 'ROP-0001-M-BR', stock: 25, minStock: 5 },
          { size: 'G', color: 'Branco', sku: 'ROP-0001-G-BR', stock: 15, minStock: 5 },
          { size: 'P', color: 'Preto', sku: 'ROP-0001-P-PT', stock: 18, minStock: 5 },
          { size: 'M', color: 'Preto', sku: 'ROP-0001-M-PT', stock: 22, minStock: 5 },
        ]
      }
    },
    {
      name: 'Calça Jeans Slim',
      description: 'Calça jeans premium',
      sku: 'ROP-0002',
      price: 189.90,
      cost: 85.00,
      category: 'CLOTHING' as const,
      variants: {
        create: [
          { size: '38', color: 'Azul', sku: 'ROP-0002-38-AZ', stock: 12, minStock: 3 },
          { size: '40', color: 'Azul', sku: 'ROP-0002-40-AZ', stock: 15, minStock: 3 },
          { size: '42', color: 'Azul', sku: 'ROP-0002-42-AZ', stock: 10, minStock: 3 },
        ]
      }
    },
    {
      name: 'Bolsa Feminina',
      description: 'Bolsa de couro legítimo',
      sku: 'BLS-0001',
      price: 299.90,
      cost: 120.00,
      category: 'BAGS' as const,
      variants: {
        create: [
          { color: 'Preto', sku: 'BLS-0001-PT', stock: 8, minStock: 2 },
          { color: 'Marrom', sku: 'BLS-0001-MM', stock: 6, minStock: 2 },
        ]
      }
    },
    {
      name: 'Tênis Esportivo',
      description: 'Tênis para corrida',
      sku: 'CAL-0001',
      price: 349.90,
      cost: 150.00,
      category: 'SHOES' as const,
      variants: {
        create: [
          { size: '38', color: 'Preto', sku: 'CAL-0001-38-PT', stock: 10, minStock: 3 },
          { size: '39', color: 'Preto', sku: 'CAL-0001-39-PT', stock: 12, minStock: 3 },
          { size: '40', color: 'Preto', sku: 'CAL-0001-40-PT', stock: 14, minStock: 3 },
          { size: '41', color: 'Preto', sku: 'CAL-0001-41-PT', stock: 8, minStock: 3 },
        ]
      }
    },
    {
      name: 'Cinto de Couro',
      description: 'Cinto masculino premium',
      sku: 'ACE-0001',
      price: 89.90,
      cost: 35.00,
      category: 'ACCESSORIES' as const,
      variants: {
        create: [
          { size: 'M', color: 'Preto', sku: 'ACE-0001-M-PT', stock: 15, minStock: 5 },
          { size: 'G', color: 'Preto', sku: 'ACE-0001-G-PT', stock: 12, minStock: 5 },
          { size: 'M', color: 'Marrom', sku: 'ACE-0001-M-MM', stock: 10, minStock: 5 },
        ]
      }
    }
  ]

  for (const productData of products) {
    await prisma.product.create({
      data: productData
    })
  }
  console.log('✅ Sample products created')

  // Create sample customers
  const customers = [
    {
      name: 'Maria Silva',
      cpf: '12345678901',
      phone: '(11) 99999-1234',
      email: 'maria@email.com',
      address: 'Rua das Flores, 123'
    },
    {
      name: 'João Santos',
      cpf: '98765432100',
      phone: '(11) 98888-5678',
      address: 'Av. Principal, 456'
    },
    {
      name: 'Ana Oliveira',
      cpf: '45678912300',
      phone: '(11) 97777-9012',
      email: 'ana@email.com'
    }
  ]

  for (const customerData of customers) {
    await prisma.customer.create({
      data: customerData
    })
  }
  console.log('✅ Sample customers created')

  // Create credit accounts
  const maria = await prisma.customer.findUnique({ where: { cpf: '12345678901' } })
  if (maria) {
    await prisma.creditAccount.create({
      data: {
        customerId: maria.id,
        limit: 500.00,
        balance: 0,
        dueDay: 10
      }
    })
  }
  console.log('✅ Credit accounts created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
