#!/bin/bash

set -e

echo "🚀 Setting up Lekker Purmerend development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is required but not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🏗️  Building shared packages..."
pnpm --filter @lekker/shared-types run build
pnpm --filter @lekker/utils run build

echo "🐳 Starting infrastructure services..."
docker-compose -f infra/docker/docker-compose.yml up -d postgres redis

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose -f infra/docker/docker-compose.yml ps | grep -q "Up"; then
    echo "✅ Infrastructure services are running"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose -f infra/docker/docker-compose.yml logs
    exit 1
fi

echo "📋 Creating environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "🔧 Please update .env with your actual configuration values"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update your .env file with the correct values"
echo "2. Start the development servers:"
echo "   pnpm run dev:medusa    # Start Medusa backend (port 9000)"
echo "   pnpm run dev:strapi    # Start Strapi CMS (port 1337)"
echo "   pnpm run dev:web       # Start Next.js frontend (port 3000)"
echo ""
echo "3. Or start everything at once:"
echo "   pnpm run dev"
echo ""
echo "📚 Access points:"
echo "   Frontend:      http://localhost:3000"
echo "   Medusa Admin:  http://localhost:9000/admin"
echo "   Strapi Admin:  http://localhost:1337/admin"
echo "   PostgreSQL:    localhost:5432 (user: medusa, password: medusa)"
echo "   Redis:         localhost:6379"
echo ""
echo "Happy coding! 🍰"