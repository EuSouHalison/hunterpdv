import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customers = await prisma.customer.findMany({
    include: {
      creditAccount: true
    },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(customers)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, cpf, phone, email, address } = body

  const existingCustomer = await prisma.customer.findUnique({
    where: { cpf }
  })

  if (existingCustomer) {
    return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 400 })
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      cpf,
      phone,
      email,
      address
    }
  })

  return NextResponse.json(customer, { status: 201 })
}
