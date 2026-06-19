import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      creditAccount: {
        include: {
          payments: true
        }
      },
      sales: {
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!customer) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  return NextResponse.json(customer)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, cpf, phone, email, address } = body

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name,
      cpf,
      phone,
      email,
      address
    }
  })

  return NextResponse.json(customer)
}
