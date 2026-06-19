import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU é obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
  cost: z.number().positive('Custo deve ser positivo'),
  category: z.enum(['CLOTHING', 'BAGS', 'SHOES', 'ACCESSORIES', 'OTHER']),
  imageUrl: z.string().url().optional().or(z.literal('')),
  variants: z.array(z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    sku: z.string().min(1, 'SKU é obrigatório'),
    stock: z.number().int().min(0, 'Estoque não pode ser negativo'),
    minStock: z.number().int().min(0)
  })).min(1, 'Adicione pelo menos uma variante')
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional()
})

export const creditAccountSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  limit: z.number().positive('Limite deve ser positivo'),
  dueDay: z.number().int().min(1).max(28)
})

export const saleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive()
  })).min(1, 'Adicione pelo menos um item'),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CREDIT_STORE'])
})

export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  variantId: z.string().optional(),
  type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT']),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  reason: z.string().optional()
})
