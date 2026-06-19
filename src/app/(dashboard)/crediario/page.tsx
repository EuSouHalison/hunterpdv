'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Input, Badge } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, CreditCard, DollarSign, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreditAccount {
  id: string
  customerId: string
  customer: {
    id: string
    name: string
    cpf: string
    phone: string
  }
  limit: number
  balance: number
  dueDay: number
  payments: {
    id: string
    amount: number
    dueDate: string
    paidDate?: string
    status: string
  }[]
}

export default function CreditPage() {
  const [accounts, setAccounts] = useState<CreditAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewAccount, setShowNewAccount] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/credit')
      const data = await res.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching credit accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(account =>
    account.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    account.customer.cpf.includes(search)
  )

  const handlePayment = async (accountId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Informe um valor válido')
      return
    }

    try {
      const res = await fetch('/api/credit/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          amount: parseFloat(paymentAmount)
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao registrar pagamento')
      }

      toast.success('Pagamento registrado com sucesso!')
      setPaymentAmount('')
      setSelectedAccount(null)
      fetchAccounts()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getOverdueAmount = (account: CreditAccount) => {
    const now = new Date()
    return account.payments
      .filter(p => p.status === 'PENDING' && new Date(p.dueDate) < now)
      .reduce((sum, p) => sum + Number(p.amount), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Crediário</h1>
        <Button onClick={() => setShowNewAccount(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total em Crédito</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(accounts.reduce((sum, a) => sum + Number(a.balance), 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Inadimplência</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(accounts.reduce((sum, a) => sum + getOverdueAmount(a), 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Contas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Accounts list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Nenhuma conta de crediário encontrada
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAccounts.map((account) => {
            const overdueAmount = getOverdueAmount(account)
            const availableLimit = Number(account.limit) - Number(account.balance)
            
            return (
              <Card key={account.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{account.customer.name}</h3>
                      {overdueAmount > 0 && (
                        <Badge variant="danger">Inadimplente</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">CPF: {account.customer.cpf}</p>
                    <p className="text-sm text-gray-500">Tel: {account.customer.phone}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Limite: {formatCurrency(account.limit)}</p>
                      <p className="text-sm text-gray-500">Saldo: {formatCurrency(account.balance)}</p>
                      <p className="text-sm text-green-600">Disponível: {formatCurrency(availableLimit)}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAccount(account)}
                      >
                        Registrar Pagamento
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pending payments */}
                {account.payments.filter(p => p.status === 'PENDING').length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Parcelas Pendentes:</p>
                    <div className="flex flex-wrap gap-2">
                      {account.payments
                        .filter(p => p.status === 'PENDING')
                        .map((payment) => (
                          <Badge
                            key={payment.id}
                            variant={new Date(payment.dueDate) < new Date() ? 'danger' : 'warning'}
                          >
                            {formatCurrency(payment.amount)} - Vence: {formatDate(payment.dueDate)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Payment Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Registrar Pagamento</h2>
            <p className="text-gray-600 mb-4">
              Cliente: <strong>{selectedAccount.customer.name}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Salde devedor: <strong>{formatCurrency(selectedAccount.balance)}</strong>
            </p>
            
            <Input
              label="Valor do Pagamento"
              type="number"
              step="0.01"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0,00"
            />

            <div className="flex gap-4 mt-6">
              <Button
                className="flex-1"
                onClick={() => handlePayment(selectedAccount.id)}
              >
                Confirmar Pagamento
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedAccount(null)
                  setPaymentAmount('')
                }}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
