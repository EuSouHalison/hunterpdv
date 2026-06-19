'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, Button, Input, Badge, Select } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  category: string
  variants: {
    id: string
    size?: string
    color?: string
    stock: number
  }[]
}

interface CartItem {
  productId: string
  variantId: string
  name: string
  size?: string
  color?: string
  price: number
  quantity: number
  stock: number
}

interface Customer {
  id: string
  name: string
  cpf: string
  creditAccount?: {
    limit: number
    balance: number
  }
}

export default function PDVPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [discount, setDiscount] = useState('0')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
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

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.sku.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (product: Product, variant?: Product['variants'][0]) => {
    const selectedVariant = variant || product.variants[0]
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error('Produto sem estoque')
      return
    }

    const existingItem = cart.find(
      item => item.productId === product.id && item.variantId === selectedVariant.id
    )

    if (existingItem) {
      if (existingItem.quantity >= selectedVariant.stock) {
        toast.error('Estoque insuficiente')
        return
      }
      setCart(cart.map(item =>
        item.productId === product.id && item.variantId === selectedVariant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          variantId: selectedVariant.id,
          name: product.name,
          size: selectedVariant.size,
          color: selectedVariant.color,
          price: Number(product.price),
          quantity: 1,
          stock: selectedVariant.stock
        }
      ])
    }
    toast.success('Item adicionado ao carrinho')
  }

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.variantId === variantId) {
        const newQuantity = item.quantity + delta
        if (newQuantity <= 0) return null
        if (newQuantity > item.stock) {
          toast.error('Estoque insuficiente')
          return item
        }
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean) as CartItem[])
  }

  const removeFromCart = (variantId: string) => {
    setCart(cart.filter(item => item.variantId !== variantId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountValue = parseFloat(discount) || 0
  const total = subtotal - discountValue

  const handleSale = async () => {
    if (cart.length === 0) {
      toast.error('Adicione itens ao carrinho')
      return
    }

    if (paymentMethod === 'CREDIT_STORE' && !selectedCustomer) {
      toast.error('Selecione um cliente para venda no crediário')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer?.id,
          items: cart.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price
          })),
          discount: discountValue,
          paymentMethod
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao finalizar venda')
      }

      toast.success('Venda finalizada com sucesso!')
      setCart([])
      setSelectedCustomer(null)
      setDiscount('0')
      fetchProducts() // Refresh stock
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col lg:flex-row gap-6">
      {/* Products section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => addToCart(product)}
              >
                <div className="text-center">
                  <div className="h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-primary font-semibold">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-gray-500">
                    Estoque: {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart section */}
      <div className="w-full lg:w-96 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Carrinho</h2>

          {/* Customer selection */}
          <div className="mb-4">
            <Select
              label="Cliente (opcional)"
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = customers.find(c => c.id === e.target.value)
                setSelectedCustomer(customer || null)
              }}
              options={[
                { value: '', label: 'Selecionar cliente...' },
                ...customers.map(c => ({
                  value: c.id,
                  label: `${c.name} - ${c.cpf}`
                }))
              ]}
            />
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-auto space-y-3">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Carrinho vazio
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.size && `${item.size} `}
                      {item.color && item.color}
                    </p>
                    <p className="text-sm text-primary">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.variantId, -1)}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, 1)}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Desconto:</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 text-right"
              />
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="mt-4">
            <Select
              label="Forma de Pagamento"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'CASH', label: 'Dinheiro' },
                { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
                { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
                { value: 'PIX', label: 'PIX' },
                { value: 'CREDIT_STORE', label: 'Crediário' }
              ]}
            />
          </div>

          {/* Finalize button */}
          <Button
            className="w-full mt-4"
            size="lg"
            onClick={handleSale}
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Finalizando...' : 'Finalizar Venda'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
