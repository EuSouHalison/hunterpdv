'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, Select } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'

interface Variant {
  size: string
  color: string
  sku: string
  stock: number
  minStock: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [category, setCategory] = useState('CLOTHING')
  const [imageUrl, setImageUrl] = useState('')
  const [variants, setVariants] = useState<Variant[]>([
    { size: '', color: '', sku: '', stock: 0, minStock: 5 }
  ])

  const addVariant = () => {
    setVariants([
      ...variants,
      { size: '', color: '', sku: '', stock: 0, minStock: 5 }
    ])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) return
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          sku,
          price: parseFloat(price),
          cost: parseFloat(cost),
          category,
          imageUrl: imageUrl || undefined,
          variants: variants.map(v => ({
            ...v,
            stock: parseInt(v.stock.toString()),
            minStock: parseInt(v.minStock.toString())
          }))
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar produto')
      }

      router.push('/produtos')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <Card className="space-y-6">
          <h2 className="text-lg font-semibold">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="SKU *"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
            <Input
              label="Preço de Venda *"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Custo *"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
            <Select
              label="Categoria *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'CLOTHING', label: 'Roupas' },
                { value: 'BAGS', label: 'Bolsas' },
                { value: 'SHOES', label: 'Calçados' },
                { value: 'ACCESSORIES', label: 'Acessórios' },
                { value: 'OTHER', label: 'Outros' }
              ]}
            />
            <Input
              label="URL da Imagem"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </Card>

        <Card className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Variantes</h2>
            <Button type="button" variant="secondary" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Variante
            </Button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Variante {index + 1}</span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Input
                    label="Tamanho"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    placeholder="P, M, G, 38..."
                  />
                  <Input
                    label="Cor"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    placeholder="Preto, Branco..."
                  />
                  <Input
                    label="SKU *"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    required
                  />
                  <Input
                    label="Estoque *"
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                    required
                  />
                  <Input
                    label="Estoque Mínimo"
                    type="number"
                    min="0"
                    value={variant.minStock}
                    onChange={(e) => updateVariant(index, 'minStock', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
