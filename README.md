# HunterPDV - Sistema de Ponto de Venda

Sistema completo para gestão de loja de roupas, bolsas e acessórios.

## Funcionalidades

- **Produtos**: Cadastro completo com variantes (tamanho/cor), categorias, SKUs
- **Estoque**: Entradas/saídas, alertas de estoque baixo, histórico de movimentações
- **PDV**: Interface de venda rápida com carrinho, múltiplas formas de pagamento
- **Clientes**: Cadastro completo com CPF, telefone, endereço
- **Crediário**: Limite de crédito, parcelas, controle de inadimplência
- **Relatórios**: Vendas por período, produtos mais vendidos, formas de pagamento
- **Offline**: PWA com funcionamento offline e sincronização automática

## Tecnologias

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Banco**: PostgreSQL 15+
- **Auth**: NextAuth.js (JWT + sessions)
- **Offline**: PWA com Service Worker + IndexedDB
- **Deploy**: Docker + Docker Compose + Nginx

## Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- Docker e Docker Compose (para deploy)

## Instalação Local

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/hunterpdv.git
cd hunterpdv

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Gerar cliente Prisma
npm run db:generate

# Criar banco de dados
npm run db:push

# Popula o banco com dados de exemplo
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Deploy na VPS Hostinger

```bash
# Conectar na VPS
ssh root@seu-ip

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Clonar repositório
git clone https://github.com/seu-usuario/hunterpdv.git
cd hunterpdv

# Executar script de deploy
chmod +x deploy.sh
./deploy.sh
```

## Credenciais Padrão

- **Email**: admin@hunterpdv.com
- **Senha**: admin123

## Estrutura do Projeto

```
hunterpdv/
├── src/
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── (auth)/             # Login, registro
│   │   ├── (dashboard)/        # Dashboard principal
│   │   ├── produtos/           # Cadastro de produtos
│   │   ├── estoque/            # Entradas e saídas
│   │   ├── clientes/           # Cadastro de clientes
│   │   ├── crediario/          # Gestão de crédito
│   │   ├── pdv/                # Ponto de venda
│   │   ├── relatorios/         # Relatórios
│   │   └── api/                # API Routes
│   ├── components/             # Componentes reutilizáveis
│   ├── lib/                    # Utilitários
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Schema do banco
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Sincronizar schema
npm run db:migrate     # Criar migração
npm run db:seed        # Popular banco
npm run db:studio      # Interface do banco

# Docker
npm run docker:up      # Iniciar containers
npm run docker:down    # Parar containers
npm run docker:build   # Rebuild containers

# Deploy completo
npm run deploy
```

## Licença

MIT
