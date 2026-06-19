'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Input, Select } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart3, Download, Calendar } from 'lucide-react'

interface ReportData {
  sales: any[]
  totalRevenue: number
  totalSales: number
  averageTicket: number
  topProducts: { name: string; quantity: number; total: number }[]
  salesByPaymentMethod: { method: string; count: number; total: number }[]
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportType, setReportType] = useState('sales')

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await fetch(`/api/reports?${params}`)
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setLoading(true)
    fetchReportData()
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Data Início"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Data Fim"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Tipo de Relatório"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'sales', label: 'Vendas' },
                { value: 'products', label: 'Produtos' },
                { value: 'customers', label: 'Clientes' },
                { value: 'credit', label: 'Crediário' }
              ]}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleFilter}>
              <Calendar className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.totalSales || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data?.averageTicket || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h2>
        <div className="space-y-3">
          {data?.topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
          ) : (
            data?.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="ml-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} unidades</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">{formatCurrency(product.total)}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Sales by Payment Method */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Vendas por Forma de Pagamento</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Forma de Pagamento</th>
                <th className="text-right py-3 px-2">Quantidade</th>
                <th className="text-right py-3 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.salesByPaymentMethod.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    Nenhum dado disponível
                  </td>
                </tr>
              ) : (
                data?.salesByPaymentMethod.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      {item.method === 'CASH' && 'Dinheiro'}
                      {item.method === 'CREDIT_CARD' && 'Cartão de Crédito'}
                      {item.method === 'DEBIT_CARD' && 'Cartão de Débito'}
                      {item.method === 'PIX' && 'PIX'}
                      {item.method === 'CREDIT_STORE' && 'Crediário'}
                    </td>
                    <td className="py-3 px-2 text-right">{item.count}</td>
                    <td className="py-3 px-2 text-right font-semibold">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Sales */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Vendas Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Data</th>
                <th className="text-left py-3 px-2">Cliente</th>
                <th className="text-left py-3 px-2">Pagamento</th>
                <th className="text-right py-3 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                data?.sales.slice(0, 20).map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm">{formatDate(sale.createdAt)}</td>
                    <td className="py-3 px-2">{sale.customer?.name || 'Não informado'}</td>
                    <td className="py-3 px-2">
                      {sale.paymentMethod === 'CASH' && 'Dinheiro'}
                      {sale.paymentMethod === 'CREDIT_CARD' && 'Crédito'}
                      {sale.paymentMethod === 'DEBIT_CARD' && 'Débito'}
                      {sale.paymentMethod === 'PIX' && 'PIX'}
                      {sale.paymentMethod === 'CREDIT_STORE' && 'Crediário'}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold">
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
