'use client'

import { useEffect, useState } from 'react'
import { Card, Badge } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users
} from 'lucide-react'

interface DashboardStats {
  totalSales: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  recentSales: any[]
  lowStockProducts: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch sales
      const salesRes = await fetch('/api/sales')
      const sales = await salesRes.json()

      // Fetch products
      const productsRes = await fetch('/api/products')
      const products = await productsRes.json()

      // Fetch customers
      const customersRes = await fetch('/api/customers')
      const customers = await customersRes.json()

      // Calculate stats
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + Number(sale.total), 0)
      const lowStockProducts = products.filter((p: any) => 
        p.variants.some((v: any) => v.stock <= v.minStock)
      )

      setStats({
        totalSales: sales.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: customers.length,
        recentSales: sales.slice(0, 5),
        lowStockProducts: lowStockProducts.slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Vendas</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalSales || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Produtos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalProducts || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalCustomers || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent sales and low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Vendas Recentes</h2>
          <div className="space-y-3">
            {stats?.recentSales.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma venda registrada</p>
            ) : (
              stats?.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{sale.customer?.name || 'Cliente não informado'}</p>
                    <p className="text-sm text-gray-500">{formatDate(sale.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(sale.total)}</p>
                    <Badge variant={sale.paymentMethod === 'CREDIT_STORE' ? 'warning' : 'success'}>
                      {sale.paymentMethod === 'CASH' && 'Dinheiro'}
                      {sale.paymentMethod === 'CREDIT_CARD' && 'Crédito'}
                      {sale.paymentMethod === 'DEBIT_CARD' && 'Débito'}
                      {sale.paymentMethod === 'PIX' && 'PIX'}
                      {sale.paymentMethod === 'CREDIT_STORE' && 'Crediário'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Estoque Baixo</h2>
          <div className="space-y-3">
            {stats?.lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">Todos os produtos com estoque adequado</p>
            ) : (
              stats?.lowStockProducts.map((product) => {
                const lowVariant = product.variants.find((v: any) => v.stock <= v.minStock)
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {lowVariant?.size && `${lowVariant.size} `}
                        {lowVariant?.color && lowVariant.color}
                      </p>
                    </div>
                    <Badge variant="danger">
                      {lowVariant?.stock} unidades
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
