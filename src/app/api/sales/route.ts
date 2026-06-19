import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sales = await prisma.sale.findMany({
    include: {
      customer: true,
      user: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return NextResponse.json(sales)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { customerId, items, discount, paymentMethod } = body

  // Calculate total
  let total = 0
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    })
    if (product) {
      total += Number(product.price) * item.quantity
    }
  }

  // Apply discount
  if (discount) {
    total -= discount
  }

  // Create sale with items
  const sale = await prisma.sale.create({
    data: {
      customerId: customerId || null,
      userId: session.user.id,
      total,
      discount: discount || 0,
      paymentMethod,
      status: 'COMPLETED',
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity
        }))
      }
    },
    include: {
      customer: true,
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  // Update stock
  for (const item of items) {
    // Find the first variant with stock
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: {
        variants: {
          where: { stock: { gte: item.quantity } },
          take: 1
        }
      }
    })

    if (product && product.variants.length > 0) {
      const variant = product.variants[0]
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })

      // Create stock movement
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'EXIT',
          quantity: item.quantity,
          reason: `Venda #${sale.id}`,
          userId: session.user.id
        }
      })
    }
  }

  return NextResponse.json(sale, { status: 201 })
}
