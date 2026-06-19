'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Input, Badge, Select } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, ArrowUpCircle, ArrowDownCircle, Search, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  sku: string
  variants: {
    id: string
    size?: string
    color?: string
    stock: number
    minStock: number
  }[]
}

interface StockMovement {
  id: string
  productId: string
  product: {
    name: string
    sku: string
  }
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT'
  quantity: number
  reason?: string
  createdAt: string
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewMovement, setShowNewMovement] = useState(false)

  // Form state
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [movementType, setMovementType] = useState('ENTRY')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchMovements()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchMovements = async () => {
    try {
      const res = await fetch('/api/stock')
      const data = await res.json()
      setMovements(data)
    } catch (error) {
      console.error('Error fetching movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct || !quantity) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          variantId: selectedVariant || undefined,
          type: movementType,
          quantity: parseInt(quantity),
          reason: reason || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao registrar movimentação')
      }

      toast.success('Movimentação registrada com sucesso!')
      setShowNewMovement(false)
      resetForm()
      fetchProducts()
      fetchMovements()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const resetForm = () => {
    setSelectedProduct('')
    setSelectedVariant('')
    setMovementType('ENTRY')
    setQuantity('')
    setReason('')
  }

  const selectedProductData = products.find(p => p.id === selectedProduct)

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.sku.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockProducts = products.filter(product =>
    product.variants.some(v => v.stock <= v.minStock)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
        <Button onClick={() => setShowNewMovement(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {lowStockProducts.length} produto(s) com estoque baixo
              </p>
              <p className="text-sm text-yellow-600">
                {lowStockProducts.map(p => p.name).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Products stock */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Estoque por Produto</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Produto</th>
                <th className="text-left py-3 px-2">SKU</th>
                <th className="text-left py-3 px-2">Variantes</th>
                <th className="text-right py-3 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{product.name}</td>
                  <td className="py-3 px-2 text-gray-500">{product.sku}</td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((variant) => (
                        <Badge
                          key={variant.id}
                          variant={variant.stock <= variant.minStock ? 'danger' : 'default'}
                        >
                          {variant.size && `${variant.size} `}
                          {variant.color && variant.color}
                          {`: ${variant.stock}`}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold">
                    {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent movements */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Movimentações Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Data</th>
                <th className="text-left py-3 px-2">Produto</th>
                <th className="text-left py-3 px-2">Tipo</th>
                <th className="text-right py-3 px-2">Quantidade</th>
                <th className="text-left py-3 px-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 10).map((movement) => (
                <tr key={movement.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm">{formatDate(movement.createdAt)}</td>
                  <td className="py-3 px-2">{movement.product.name}</td>
                  <td className="py-3 px-2">
                    <Badge variant={movement.type === 'ENTRY' ? 'success' : movement.type === 'EXIT' ? 'danger' : 'warning'}>
                      {movement.type === 'ENTRY' && <ArrowUpCircle className="h-3 w-3 mr-1" />}
                      {movement.type === 'EXIT' && <ArrowDownCircle className="h-3 w-3 mr-1" />}
                      {movement.type === 'ENTRY' ? 'Entrada' : movement.type === 'EXIT' ? 'Saída' : 'Ajuste'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">{movement.quantity}</td>
                  <td className="py-3 px-2 text-gray-500">{movement.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Movement Modal */}
      {showNewMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Nova Movimentação</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Produto *"
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value)
                  setSelectedVariant('')
                }}
                options={[
                  { value: '', label: 'Selecionar produto...' },
                  ...products.map(p => ({
                    value: p.id,
                    label: `${p.name} (${p.sku})`
                  }))
                ]}
              />

              {selectedProductData && selectedProductData.variants.length > 1 && (
                <Select
                  label="Variante"
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  options={[
                    { value: '', label: 'Todas as variantes' },
                    ...selectedProductData.variants.map(v => ({
                      value: v.id,
                      label: `${v.size || ''} ${v.color || ''} (Estoque: ${v.stock})`.trim()
                    }))
                  ]}
                />
              )}

              <Select
                label="Tipo *"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                options={[
                  { value: 'ENTRY', label: 'Entrada' },
                  { value: 'EXIT', label: 'Saída' },
                  { value: 'ADJUSTMENT', label: 'Ajuste' }
                ]}
              />

              <Input
                label="Quantidade *"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />

              <Input
                label="Motivo"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Devolução, Compra, Ajuste..."
              />

              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1">
                  Registrar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowNewMovement(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
