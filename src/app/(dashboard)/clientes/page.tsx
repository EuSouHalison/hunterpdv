'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, Badge } from '@/components/ui'
import { formatCurrency, formatCPF, formatPhone } from '@/lib/utils'
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin } from 'lucide-react'

interface Customer {
  id: string
  name: string
  cpf: string
  phone: string
  email?: string
  address?: string
  creditAccount?: {
    limit: number
    balance: number
  }
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.cpf.includes(search) ||
    customer.phone.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={() => router.push('/clientes/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Customers list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Nenhum cliente encontrado
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <p className="text-sm text-gray-500">CPF: {formatCPF(customer.cpf)}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => router.push(`/clientes/${customer.id}`)}
                    className="p-2 text-gray-500 hover:text-blue-500"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => router.push(`/clientes/${customer.id}/editar`)}
                    className="p-2 text-gray-500 hover:text-yellow-500"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {formatPhone(customer.phone)}
                </div>
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {customer.address}
                  </div>
                )}
              </div>

              {customer.creditAccount && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Crediário:</span>
                    <Badge variant={customer.creditAccount.balance > 0 ? 'warning' : 'success'}>
                      {formatCurrency(customer.creditAccount.balance)} / {formatCurrency(customer.creditAccount.limit)}
                    </Badge>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
