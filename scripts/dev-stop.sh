#!/usr/bin/env bash

# Graceful cleanup script for development environment
# This script will NOT exit with error codes to prevent stopping the dev command

echo "🧹 Cleaning up development environment..."

# Function to check if Docker daemon is running
check_docker_daemon() {
  # Try docker info and fix context if needed
  if ! docker info >/dev/null 2>&1; then
    # Try switching to default context
    docker context use default >/dev/null 2>&1 || true
    docker info >/dev/null 2>&1
  else
    return 0
  fi
}

# Function to gracefully stop Docker containers
stop_docker_containers() {
  if command -v docker >/dev/null 2>&1 && check_docker_daemon; then
    echo "🐳 Docker daemon detected, stopping containers..."
    
    # Stop all containers from docker-compose gracefully
    docker compose -f infra/docker/docker-compose.yml --env-file .env down --timeout 10 >/dev/null 2>&1 || {
      echo "⚠️  Failed to stop containers gracefully, attempting force stop..."
      docker compose -f infra/docker/docker-compose.yml --env-file .env kill >/dev/null 2>&1 || true
      docker compose -f infra/docker/docker-compose.yml --env-file .env rm -f >/dev/null 2>&1 || true
    }
    
    echo "✅ Docker containers stopped"
  else
    echo "⚠️  Docker daemon not available or not running, skipping container cleanup"
  fi
}

# Function to kill processes on common development ports
kill_port_processes() {
  echo "🔌 Cleaning up processes on development ports..."
  
  # Common dev ports (Next.js:3000/3001, Strapi:1337, Admin dev:7001, Medusa:9000, Redis:6379, Postgres:5432)
  ports=(3000 3001 1337 7001 9000 6379 5432)
  
  for port in "${ports[@]}"; do
    if command -v lsof >/dev/null 2>&1; then
      pids=$(lsof -ti tcp:$port 2>/dev/null || true)
      if [ -n "${pids:-}" ]; then
        echo "  🔄 Stopping processes on port $port..."
        # Try graceful kill first, then force kill
        kill -TERM $pids >/dev/null 2>&1 || true
        sleep 1
        kill -9 $pids >/dev/null 2>&1 || true
      fi
    fi
  done
  
  echo "✅ Port cleanup completed"
}

# Execute cleanup functions
stop_docker_containers
kill_port_processes

echo "🎉 Development environment cleanup completed!"

# Always exit successfully to allow the dev command to continue
exit 0
