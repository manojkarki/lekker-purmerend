#!/usr/bin/env bash

# Robust development environment startup script
set -e

echo "🚀 Starting development environment..."

# Function to check if Docker daemon is running
check_docker_daemon() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker is not installed or not in PATH"
    return 1
  fi
  
  # Try docker info command and capture both stdout and stderr
  local docker_output
  docker_output=$(docker info 2>&1)
  local docker_exit_code=$?
  
  if [ $docker_exit_code -eq 0 ]; then
    return 0
  fi
  
  # Check if it's a context/socket issue
  if echo "$docker_output" | grep -q "docker.sock"; then
    echo "⚠️  Docker socket connection issue detected"
    echo "🔧 Attempting to fix Docker context..."
    
    # Try to use default context
    if docker context use default >/dev/null 2>&1; then
      echo "✅ Switched to default Docker context"
      # Test again
      if docker info >/dev/null 2>&1; then
        return 0
      fi
    fi
    
    # Try to restart Docker Desktop programmatically
    echo "🔄 Attempting to restart Docker Desktop..."
    if command -v osascript >/dev/null 2>&1; then
      osascript -e 'quit app "Docker Desktop"' >/dev/null 2>&1 || true
      sleep 3
      open -a "Docker Desktop" >/dev/null 2>&1 || true
      echo "⏳ Waiting for Docker Desktop to restart..."
      sleep 10
      
      # Test again after restart
      if docker info >/dev/null 2>&1; then
        return 0
      fi
    fi
  fi
  
  echo "❌ Docker daemon connection failed"
  echo "💡 Please try:"
  echo "   1. Restart Docker Desktop completely"
  echo "   2. Run: docker context use default"
  echo "   3. Check Docker Desktop settings"
  return 1
}

# Function to wait for Docker daemon to be ready
wait_for_docker() {
  echo "⏳ Waiting for Docker daemon to be ready..."
  local max_attempts=30
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if check_docker_daemon; then
      echo "✅ Docker daemon is ready"
      return 0
    fi
    
    echo "  Attempt $attempt/$max_attempts - Docker not ready, waiting 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "❌ Docker daemon failed to become ready after $max_attempts attempts"
  return 1
}

# Function to start Docker services
start_docker_services() {
  echo "🐳 Starting Docker services..."
  
  # First, ensure Docker is available
  if ! wait_for_docker; then
    echo "❌ Cannot start Docker services - Docker daemon is not available"
    echo "💡 Please:"
    echo "   1. Install Docker if not installed"
    echo "   2. Start Docker Desktop or Docker daemon"
    echo "   3. Try running 'pnpm run dev' again"
    exit 1
  fi
  
  # Start services with build
  echo "🔨 Building and starting containers..."
  if ! docker compose -f infra/docker/docker-compose.yml --env-file .env up --build -d; then
    echo "❌ Failed to start Docker services"
    echo "💡 Try running: docker system prune && pnpm run dev"
    exit 1
  fi
  
  echo "✅ Docker services started successfully"
  
  # Show container status
  echo "📊 Container status:"
  docker compose -f infra/docker/docker-compose.yml --env-file .env ps
}

# Function to show helpful information
show_info() {
  echo ""
  echo "🎉 Development environment is starting up!"
  echo ""
  echo "📍 Available services:"
  echo "   🌐 Web (Next.js):     http://localhost:3000"
  echo "   🛒 Medusa (API):      http://localhost:9000"
  echo "   📝 Strapi (CMS):      http://localhost:1337"
  echo "   🗄️  PostgreSQL:       localhost:5432"
  echo "   🔴 Redis:             localhost:6379"
  echo ""
  echo "📋 Useful commands:"
  echo "   📊 View logs:         pnpm run docker:logs"
  echo "   🛑 Stop services:     pnpm run docker:down"
  echo "   🧹 Clean up:          pnpm run clean"
  echo ""
  echo "⏳ Services are starting up... this may take a few moments"
  echo "🔍 Monitor the logs above for any startup issues"
}

# Main execution
main() {
  start_docker_services
  show_info
}

# Execute main function
main