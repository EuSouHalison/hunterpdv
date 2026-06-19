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
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true
    }
  })

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  return NextResponse.json(product)
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
  const { name, description, sku, price, cost, category, imageUrl, variants } = body

  // Update product
  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      sku,
      price,
      cost,
      category,
      imageUrl
    }
  })

  // Update variants if provided
  if (variants) {
    // Delete existing variants
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    })

    // Create new variants
    await prisma.productVariant.createMany({
      data: variants.map((v: any) => ({
        ...v,
        productId: id
      }))
    })
  }

  const updatedProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true
    }
  })

  return NextResponse.json(updatedProduct)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  // Soft delete
  await prisma.product.update({
    where: { id },
    data: { active: false }
  })

  return NextResponse.json({ success: true })
}
