#!/bin/bash

# HunterPDV Deployment Script for Hostinger KVM 2
# Usage: ./deploy.sh

set -e

echo "🚀 Starting HunterPDV deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec app npx prisma db push

# Seed database
echo "🌱 Seeding database..."
docker-compose exec app npm run db:seed

echo "✅ Deployment completed successfully!"
echo ""
echo "📱 HunterPDV is now running at: http://your-domain.com"
echo ""
echo "Default login:"
echo "  Email: admin@hunterpdv.com"
echo "  Password: admin123"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
