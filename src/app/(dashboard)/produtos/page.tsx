'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  category: string
  variants: {
    id: string
    size?: string
    color?: string
    stock: number
    minStock: number
  }[]
}

const categoryLabels: Record<string, string> = {
  CLOTHING: 'Roupas',
  BAGS: 'Bolsas',
  SHOES: 'Calçados',
  ACCESSORIES: 'Acessórios',
  OTHER: 'Outros'
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    await fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const getTotalStock = (variants: Product['variants']) => {
    return variants.reduce((sum, v) => sum + v.stock, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <Button onClick={() => router.push('/produtos/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas categorias</option>
              <option value="CLOTHING">Roupas</option>
              <option value="BAGS">Bolsas</option>
              <option value="SHOES">Calçados</option>
              <option value="ACCESSORIES">Acessórios</option>
              <option value="OTHER">Outros</option>
            </select>
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </Card>

      {/* Products list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Nenhum produto encontrado
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <Badge>{categoryLabels[product.category]}</Badge>
                  <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => router.push(`/produtos/${product.id}`)}
                    className="p-2 text-gray-500 hover:text-blue-500"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => router.push(`/produtos/${product.id}/editar`)}
                    className="p-2 text-gray-500 hover:text-yellow-500"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Preço:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Custo:</span>
                  <span>{formatCurrency(product.cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estoque:</span>
                  <span className={getTotalStock(product.variants) <= 5 ? 'text-red-500 font-semibold' : ''}>
                    {getTotalStock(product.variants)} unidades
                  </span>
                </div>
              </div>

              {/* Variants preview */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Variantes:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.slice(0, 3).map((variant) => (
                    <Badge key={variant.id} variant={variant.stock <= variant.minStock ? 'danger' : 'default'}>
                      {variant.size && `${variant.size} `}
                      {variant.color && variant.color}
                      {` (${variant.stock})`}
                    </Badge>
                  ))}
                  {product.variants.length > 3 && (
                    <Badge>+{product.variants.length - 3}</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
