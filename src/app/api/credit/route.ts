import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accounts = await prisma.creditAccount.findMany({
    include: {
      customer: true,
      payments: {
        orderBy: { dueDate: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(accounts)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { customerId, limit, dueDay } = body

  // Check if customer already has an account
  const existingAccount = await prisma.creditAccount.findUnique({
    where: { customerId }
  })

  if (existingAccount) {
    return NextResponse.json(
      { error: 'Cliente já possui conta de crediário' },
      { status: 400 }
    )
  }

  const account = await prisma.creditAccount.create({
    data: {
      customerId,
      limit,
      dueDay: dueDay || 10
    },
    include: {
      customer: true
    }
  })

  return NextResponse.json(account, { status: 201 })
}
