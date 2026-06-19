import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { accountId, amount } = body

  // Get the account
  const account = await prisma.creditAccount.findUnique({
    where: { id: accountId },
    include: { customer: true }
  })

  if (!account) {
    return NextResponse.json(
      { error: 'Conta de crediário não encontrada' },
      { status: 404 }
    )
  }

  // Find pending payments
  const pendingPayments = await prisma.creditPayment.findMany({
    where: {
      accountId,
      status: 'PENDING'
    },
    orderBy: { dueDate: 'asc' }
  })

  if (pendingPayments.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma parcela pendente' },
      { status: 400 }
    )
  }

  // Apply payment to pending payments (oldest first)
  let remainingAmount = amount
  const updatedPayments = []

  for (const payment of pendingPayments) {
    if (remainingAmount <= 0) break

    const paymentAmount = Math.min(remainingAmount, Number(payment.amount))
    remainingAmount -= paymentAmount

    const updatedPayment = await prisma.creditPayment.update({
      where: { id: payment.id },
      data: {
        amount: Number(payment.amount) - paymentAmount,
        paidDate: paymentAmount >= Number(payment.amount) ? new Date() : undefined,
        status: paymentAmount >= Number(payment.amount) ? 'PAID' : 'PENDING'
      }
    })

    updatedPayments.push(updatedPayment)
  }

  // Update account balance
  await prisma.creditAccount.update({
    where: { id: accountId },
    data: {
      balance: {
        decrement: amount - remainingAmount
      }
    }
  })

  return NextResponse.json({
    success: true,
    paidAmount: amount - remainingAmount,
    remainingBalance: Number(account.balance) - (amount - remainingAmount)
  })
}
