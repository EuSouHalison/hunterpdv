import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const movements = await prisma.stockMovement.findMany({
    include: {
      product: true,
      user: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return NextResponse.json(movements)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { productId, variantId, type, quantity, reason } = body

  // If variantId is provided, update that specific variant
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variante não encontrada' },
        { status: 404 }
      )
    }

    let newStock = variant.stock
    if (type === 'ENTRY') {
      newStock += quantity
    } else if (type === 'EXIT') {
      if (variant.stock < quantity) {
        return NextResponse.json(
          { error: 'Estoque insuficiente' },
          { status: 400 }
        )
      }
      newStock -= quantity
    } else {
      // ADJUSTMENT - quantity is the new stock value
      newStock = quantity
    }

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock }
    })
  } else {
    // Update all variants of the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    for (const variant of product.variants) {
      let newStock = variant.stock
      if (type === 'ENTRY') {
        newStock += quantity
      } else if (type === 'EXIT') {
        if (variant.stock < quantity) {
          return NextResponse.json(
            { error: `Estoque insuficiente na variante ${variant.sku}` },
            { status: 400 }
          )
        }
        newStock -= quantity
      } else {
        newStock = quantity
      }

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock: newStock }
      })
    }
  }

  // Create stock movement record
  const movement = await prisma.stockMovement.create({
    data: {
      productId,
      type,
      quantity,
      reason,
      userId: session.user.id
    },
    include: {
      product: true
    }
  })

  return NextResponse.json(movement, { status: 201 })
}
