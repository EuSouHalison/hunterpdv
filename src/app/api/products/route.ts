import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const where: any = { active: true }

  if (category) {
    where.category = category
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } }
    ]
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      variants: true
    },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, sku, price, cost, category, imageUrl, variants } = body

  const existingProduct = await prisma.product.findUnique({
    where: { sku }
  })

  if (existingProduct) {
    return NextResponse.json({ error: 'SKU já cadastrado' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      sku,
      price,
      cost,
      category,
      imageUrl,
      variants: {
        create: variants
      }
    },
    include: {
      variants: true
    }
  })

  return NextResponse.json(product, { status: 201 })
}
