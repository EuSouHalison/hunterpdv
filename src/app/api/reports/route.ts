import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: any = {
    status: 'COMPLETED'
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = new Date(startDate)
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z')
    }
  }

  // Get all sales
  const sales = await prisma.sale.findMany({
    where,
    include: {
      customer: true,
      user: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate stats
  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + Number(sale.total), 0)
  const totalSales = sales.length
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

  // Top products
  const productSales: Record<string, { name: string; quantity: number; total: number }> = {}
  for (const sale of sales) {
    for (const item of sale.items) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.product.name,
          quantity: 0,
          total: 0
        }
      }
      productSales[item.productId].quantity += item.quantity
      productSales[item.productId].total += Number(item.subtotal)
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Sales by payment method
  const paymentMethodSales: Record<string, { count: number; total: number }> = {}
  for (const sale of sales) {
    if (!paymentMethodSales[sale.paymentMethod]) {
      paymentMethodSales[sale.paymentMethod] = { count: 0, total: 0 }
    }
    paymentMethodSales[sale.paymentMethod].count++
    paymentMethodSales[sale.paymentMethod].total += Number(sale.total)
  }

  const salesByPaymentMethod = Object.entries(paymentMethodSales).map(([method, data]) => ({
    method,
    ...data
  }))

  return NextResponse.json({
    sales,
    totalRevenue,
    totalSales,
    averageTicket,
    topProducts,
    salesByPaymentMethod
  })
}
