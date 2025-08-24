#!/usr/bin/env bash

# ==============================================================================
# LEKKER PURMEREND - PRODUCTION DEPLOYMENT SCRIPT
# ==============================================================================
# 
# Intelligent, modular deployment script that:
# - Detects and performs one-time setup automatically
# - Can be run multiple times safely (idempotent)
# - Provides clear logging and error handling
# - Handles domain: lekkerpurmerend.nl with subdomains
# 
# Usage: bash scripts/deploy.sh [options] [command]
# Options: --skip-backup, --force-ssl
# Commands: deploy (default), menu, logs, stop, restart, backup, status, health
# 
# ==============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOMAIN="lekkerpurmerend.nl"
EMAIL="admin@${DOMAIN}"  # Change this to your email
LOG_FILE="/var/log/lekker-deploy.log"
COMPOSE_FILE="${PROJECT_ROOT}/infra/docker/docker-compose.prod.yml"
ENV_FILE="${PROJECT_ROOT}/.env.prod"

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_BACKUP=false
FORCE_SSL=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --force-ssl)
      FORCE_SSL=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# ==============================================================================
# LOGGING FUNCTIONS
# ==============================================================================

log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "${LOG_FILE}"
}

log_warn() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "${LOG_FILE}"
}

log_error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "${LOG_FILE}"
}

log_step() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo "$1" >> "${LOG_FILE}"
}

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

service_exists() {
  systemctl list-unit-files | grep -q "^$1.service"
}

port_in_use() {
  netstat -ln 2>/dev/null | grep -q ":$1 "
}

wait_for_service() {
  local url="$1"
  local max_attempts=30
  local attempt=1
  
  log "Waiting for service at $url to be ready..."
  
  while [ $attempt -le $max_attempts ]; do
    if curl -f -s "$url" >/dev/null 2>&1; then
      log_success "Service at $url is ready"
      return 0
    fi
    
    log "  Attempt $attempt/$max_attempts - waiting 10 seconds..."
    sleep 10
    attempt=$((attempt + 1))
  done
  
  log_error "Service at $url failed to become ready after $max_attempts attempts"
  return 1
}

backup_database() {
  if [ "$SKIP_BACKUP" = true ]; then
    log_warn "Skipping database backup (--skip-backup flag)"
    return 0
  fi
  
  local backup_dir="/var/backups/lekker-purmerend"
  local timestamp=$(date +%Y%m%d_%H%M%S)
  
  log "Creating database backup..."
  
  sudo mkdir -p "$backup_dir"
  
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_dump -U medusa medusa > "$backup_dir/medusa_$timestamp.sql" 2>/dev/null; then
    log_success "Database backup created: $backup_dir/medusa_$timestamp.sql"
    
    # Keep only last 5 backups
    sudo find "$backup_dir" -name "medusa_*.sql" -type f | sort -r | tail -n +6 | xargs -r rm -f
  else
    log_warn "Database backup failed (database may not exist yet)"
  fi
}

# ==============================================================================
# SETUP FUNCTIONS
# ==============================================================================

setup_system_requirements() {
  log_step "CHECKING SYSTEM REQUIREMENTS"
  
  # Update system
  log "Updating system packages..."
  sudo apt-get update -qq
  
  # Install required packages
  local packages=("curl" "wget" "git" "ufw" "certbot" "python3-certbot-nginx" "nginx")
  local missing_packages=()
  
  for package in "${packages[@]}"; do
    if ! dpkg -l | grep -q "^ii  $package "; then
      missing_packages+=("$package")
    fi
  done
  
  if [ ${#missing_packages[@]} -gt 0 ]; then
    log "Installing missing packages: ${missing_packages[*]}"
    sudo apt-get install -y "${missing_packages[@]}"
  else
    log_success "All required packages are installed"
  fi
  
  # Setup log directory
  sudo mkdir -p "$(dirname "$LOG_FILE")"
  sudo touch "$LOG_FILE"
  sudo chmod 666 "$LOG_FILE"
}

setup_docker() {
  log_step "SETTING UP DOCKER"
  
  if command_exists docker && command_exists docker-compose; then
    log_success "Docker and Docker Compose already installed"
    return 0
  fi
  
  log "Installing Docker..."
  
  # Remove old versions
  sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
  
  # Install Docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  rm get-docker.sh
  
  # Add current user to docker group
  sudo usermod -aG docker $USER
  
  # Install Docker Compose
  log "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  
  # Start and enable Docker
  sudo systemctl start docker
  sudo systemctl enable docker
  
  log_success "Docker and Docker Compose installed successfully"
  log_warn "Please log out and log back in to use Docker without sudo"
}

setup_firewall() {
  log_step "CONFIGURING FIREWALL"
  
  if sudo ufw status | grep -q "Status: active"; then
    log "Firewall already active, updating rules..."
  else
    log "Enabling firewall..."
    sudo ufw --force enable
  fi
  
  # Allow essential ports
  sudo ufw allow ssh
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  
  log_success "Firewall configured"
}

setup_nginx() {
  log_step "CONFIGURING NGINX"
  
  # Start and enable nginx
  sudo systemctl start nginx
  sudo systemctl enable nginx
  
  # Create nginx configuration
  local nginx_config="/etc/nginx/sites-available/lekker-purmerend"
  
  log "Creating Nginx configuration..."
  
  sudo tee "$nginx_config" > /dev/null << 'EOF'
# Main website
server {
    listen 80;
    server_name lekkerpurmerend.nl www.lekkerpurmerend.nl;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Medusa Admin
server {
    listen 80;
    server_name admin.lekkerpurmerend.nl;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Strapi CMS
server {
    listen 80;
    server_name cms.lekkerpurmerend.nl;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
EOF
  
  # Enable the site
  sudo ln -sf "$nginx_config" /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  
  # Test nginx configuration
  if sudo nginx -t; then
    sudo systemctl reload nginx
    log_success "Nginx configured successfully"
  else
    log_error "Nginx configuration test failed"
    exit 1
  fi
}

setup_ssl() {
  log_step "SETTING UP SSL CERTIFICATES"
  
  # Check if certificates exist
  if [ "$FORCE_SSL" = false ] && [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    log_success "SSL certificates already exist"
    return 0
  fi
  
  log "Obtaining SSL certificates..."
  
  # Obtain certificates for all domains
  if sudo certbot certonly --nginx --non-interactive --agree-tos --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    -d "admin.$DOMAIN" \
    -d "cms.$DOMAIN"; then
    
    log_success "SSL certificates obtained successfully"
    
    # Update nginx configuration with SSL
    local nginx_ssl_config="/etc/nginx/sites-available/lekker-purmerend"
    sudo tee "$nginx_ssl_config" > /dev/null << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name lekkerpurmerend.nl www.lekkerpurmerend.nl admin.lekkerpurmerend.nl cms.lekkerpurmerend.nl;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Main website HTTPS
server {
    listen 443 ssl http2;
    server_name lekkerpurmerend.nl www.lekkerpurmerend.nl;
    
    ssl_certificate /etc/letsencrypt/live/lekkerpurmerend.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lekkerpurmerend.nl/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Medusa Admin HTTPS
server {
    listen 443 ssl http2;
    server_name admin.lekkerpurmerend.nl;
    
    ssl_certificate /etc/letsencrypt/live/lekkerpurmerend.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lekkerpurmerend.nl/privkey.pem;
    
    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Strapi CMS HTTPS
server {
    listen 443 ssl http2;
    server_name cms.lekkerpurmerend.nl;
    
    ssl_certificate /etc/letsencrypt/live/lekkerpurmerend.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lekkerpurmerend.nl/privkey.pem;
    
    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
EOF
    
    # Test and reload nginx
    if sudo nginx -t; then
      sudo systemctl reload nginx
      log_success "SSL configuration applied successfully"
    else
      log_error "SSL nginx configuration test failed"
      exit 1
    fi
    
    # Setup automatic renewal
    if ! crontab -l | grep -q certbot; then
      log "Setting up automatic SSL renewal..."
      (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    fi
    
  else
    log_error "Failed to obtain SSL certificates"
    log_warn "Continuing without SSL..."
  fi
}

# ==============================================================================
# DEPLOYMENT FUNCTIONS
# ==============================================================================

create_production_compose() {
  log_step "CREATING PRODUCTION DOCKER COMPOSE"
  
  log "Creating production Docker Compose configuration..."
  
  mkdir -p "$(dirname "$COMPOSE_FILE")"
  
  cat > "$COMPOSE_FILE" << 'EOF'
services:
  postgres:
    image: postgres:15-alpine
    container_name: lekker-postgres-prod
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-medusa}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-medusa}
      POSTGRES_DB: ${POSTGRES_DB:-medusa}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - lekker-network-prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-medusa}"]
      interval: 30s
      timeout: 20s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: lekker-redis-prod
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data_prod:/data
    networks:
      - lekker-network-prod
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    restart: unless-stopped

  medusa:
    build:
      context: ../..
      dockerfile: apps/medusa/Dockerfile
    container_name: lekker-medusa-prod
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER:-medusa}:${POSTGRES_PASSWORD:-medusa}@postgres:5432/${POSTGRES_DB:-medusa}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      COOKIE_SECRET: ${COOKIE_SECRET}
      ADMIN_CORS: ${ADMIN_CORS}
      STORE_CORS: ${STORE_CORS}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
    ports:
      - "127.0.0.1:9000:9000"
    volumes:
      - medusa_uploads_prod:/app/apps/medusa/uploads
    networks:
      - lekker-network-prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 20s
      retries: 5
    restart: unless-stopped

  strapi:
    build:
      context: ../../apps/strapi
      dockerfile: Dockerfile
    container_name: lekker-strapi-prod
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      DATABASE_CLIENT: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: ${STRAPI_DATABASE_NAME:-strapi}
      DATABASE_USERNAME: ${POSTGRES_USER:-medusa}
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD:-medusa}
      APP_KEYS: ${STRAPI_APP_KEYS}
      JWT_SECRET: ${STRAPI_JWT_SECRET}
      ADMIN_JWT_SECRET: ${STRAPI_ADMIN_JWT_SECRET}
      API_TOKEN_SALT: ${STRAPI_API_TOKEN_SALT}
    ports:
      - "127.0.0.1:1337:1337"
    volumes:
      - strapi_uploads_prod:/usr/src/app/public/uploads
    networks:
      - lekker-network-prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1337/_health"]
      interval: 30s
      timeout: 20s
      retries: 5
    restart: unless-stopped

  web:
    build:
      context: ../..
      dockerfile: apps/web/Dockerfile
    container_name: lekker-web-prod
    depends_on:
      - medusa
      - strapi
    environment:
      NODE_ENV: production
      MEDUSA_BACKEND_URL: http://medusa:9000
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: https://admin.${DOMAIN:-lekkerpurmerend.nl}
      STRAPI_API_URL: http://strapi:1337/api
      STRAPI_URL: https://cms.${DOMAIN:-lekkerpurmerend.nl}
      SITE_URL: https://${DOMAIN:-lekkerpurmerend.nl}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
    ports:
      - "127.0.0.1:3000:3000"
    networks:
      - lekker-network-prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 20s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data_prod:
    driver: local
  redis_data_prod:
    driver: local
  medusa_uploads_prod:
    driver: local
  strapi_uploads_prod:
    driver: local

networks:
  lekker-network-prod:
    driver: bridge
EOF
  
  log_success "Production Docker Compose configuration created"
}

check_production_env() {
  log_step "CHECKING PRODUCTION ENVIRONMENT"
  
  if [ ! -f "$ENV_FILE" ]; then
    log_error "Production environment file not found: $ENV_FILE"
    log "This file should contain your production configuration."
    log "Please create it with your production values before deployment."
    exit 1
  fi
  
  log_success "Production .env file found: $ENV_FILE"
  
  # Check for placeholder values that need to be updated
  if grep -q "YOUR_LIVE_SECRET_KEY\|YOUR_LIVE_PUBLISHABLE_KEY\|YOUR_WEBHOOK_SECRET\|your-smtp-host" "$ENV_FILE"; then
    log_warn "⚠️  Production .env file contains placeholder values!"
    log "Please update the following in $ENV_FILE:"
    log "  - STRIPE_SECRET_KEY (get from Stripe Dashboard)"
    log "  - STRIPE_PUBLISHABLE_KEY (get from Stripe Dashboard)"  
    log "  - STRIPE_WEBHOOK_SECRET (get from Stripe Dashboard)"
    log "  - SMTP configuration (your email provider settings)"
    log ""
    log "The deployment will continue, but update these for production use."
  else
    log_success "Production environment appears to be properly configured"
  fi
}

deploy_services() {
  log_step "DEPLOYING SERVICES"
  
  # Check if environment file exists
  if [ ! -f "$ENV_FILE" ]; then
    log_error "Production environment file not found: $ENV_FILE"
    log "Run the deployment script first to create the template"
    exit 1
  fi
  
  # Create backup before deployment
  backup_database
  
  # Stop existing services if running
  if [ -f "$COMPOSE_FILE" ]; then
    log "Stopping existing services..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down || true
  fi
  
  # Pull latest images and build
  log "Building and starting services..."
  cd "$PROJECT_ROOT"
  
  if ! docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up --build -d; then
    log_error "Failed to start services"
    exit 1
  fi
  
  log_success "Services started successfully"
}

verify_deployment() {
  log_step "VERIFYING DEPLOYMENT"
  
  local services=(
    "http://localhost:3000"
    "http://localhost:9000/health"
    "http://localhost:1337/_health"
  )
  
  for service in "${services[@]}"; do
    wait_for_service "$service"
  done
  
  # Test external access if SSL is configured
  if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    log "Testing external HTTPS access..."
    
    local external_services=(
      "https://${DOMAIN}"
      "https://admin.${DOMAIN}/health"
      "https://cms.${DOMAIN}/_health"
    )
    
    for service in "${external_services[@]}"; do
      if curl -f -s "$service" >/dev/null 2>&1; then
        log_success "✅ $service is accessible"
      else
        log_warn "⚠️  $service is not accessible (DNS may not be configured yet)"
      fi
    done
  fi
  
  log_success "Deployment verification completed"
}

show_completion_info() {
  log_step "DEPLOYMENT COMPLETED"
  
  echo ""
  log_success "🎉 Lekker Purmerend has been deployed successfully!"
  echo ""
  log "📍 Service URLs:"
  log "   🌐 Website:      https://${DOMAIN}"
  log "   👨‍💼 Medusa Admin: https://admin.${DOMAIN}"
  log "   📝 Strapi CMS:   https://cms.${DOMAIN}"
  echo ""
  log "📋 Management Commands:"
  log "   📊 View logs:    docker compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f"
  log "   🛑 Stop:         docker compose -f $COMPOSE_FILE --env-file $ENV_FILE down"
  log "   🔄 Restart:      bash $0"
  log "   💾 Backup DB:    bash $0 --backup-only"
  echo ""
  log "📁 Important files:"
  log "   📄 Environment:  $ENV_FILE"
  log "   🐳 Compose:      $COMPOSE_FILE"
  log "   📋 Logs:         $LOG_FILE"
  echo ""
  
  if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    log_warn "⚠️  SSL certificates not configured. Run with --force-ssl after DNS is set up."
  fi
  
  if grep -q "YOUR_LIVE" "$ENV_FILE"; then
    log_warn "⚠️  Remember to update Stripe production keys in $ENV_FILE"
  fi
}

# ==============================================================================
# MANAGEMENT FUNCTIONS
# ==============================================================================

show_help() {
  echo -e "${BLUE}Lekker Purmerend Deployment & Management Script${NC}"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "This script always shows an interactive menu where you can:"
  echo "  - View logs from specific services"
  echo "  - Deploy the full application" 
  echo "  - Manage services (start/stop/restart)"
  echo "  - Create admin users"
  echo "  - Check system health"
  echo ""
  echo "Options:"
  echo "  --skip-backup    Skip database backup during deployment"
  echo "  --force-ssl      Force SSL certificate renewal"  
  echo "  -h, --help       Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                    # Show interactive menu"
  echo "  $0 --skip-backup     # Show menu with backup skipping enabled"
  echo "  $0 --force-ssl       # Show menu with SSL renewal enabled"
}

show_interactive_menu() {
  log_step "LEKKER PURMEREND MANAGEMENT MENU"
  
  echo ""
  echo -e "${GREEN}Available Commands:${NC}"
  echo "1) 📊 View logs (follow)"
  echo "2) 📋 View logs (last 100 lines)"
  echo "3) 🛑 Stop all services"
  echo "4) 🔄 Restart services"
  echo "5) 💾 Create database backup"
  echo "6) 📊 Show service status"
  echo "7) 🏥 Check service health"
  echo "8) 🌐 Test external URLs"
  echo "9) 🔧 Edit production config"
  echo "10) 👤 Create Medusa admin user"
  echo "11) 👤 Create Strapi admin user"
  echo "12) 🚀 Full deployment"
  echo "0) ❌ Exit"
  echo ""
  
  while true; do
    read -p "Select option (0-12): " choice
    case $choice in
      1) cmd_logs_follow ;;
      2) cmd_logs_tail ;;
      3) cmd_stop ;;
      4) cmd_restart ;;
      5) cmd_backup ;;
      6) cmd_status ;;
      7) cmd_health ;;
      8) cmd_test_urls ;;
      9) cmd_edit_config ;;
      10) cmd_create_medusa_admin ;;
      11) cmd_create_strapi_admin ;;
      12) cmd_deploy ;;
      0) log "Goodbye!"; exit 0 ;;
      *) echo "Invalid option. Please try again." ;;
    esac
    echo ""
    read -p "Press Enter to continue..."
    echo ""
  done
}

ensure_compose_exists() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Production compose file not found: $COMPOSE_FILE"
    log "Please run: $0 deploy"
    exit 1
  fi
  
  if [ ! -f "$ENV_FILE" ]; then
    log_error "Production environment file not found: $ENV_FILE"
    log "Please run: $0 deploy"
    exit 1
  fi
}

cmd_logs_follow() {
  log "Following service logs (Ctrl+C to stop)..."
  ensure_compose_exists
  
  echo ""
  echo "Select service to view logs:"
  echo "1) 🌐 All services"
  echo "2) 🖥️  Web (Next.js)"
  echo "3) 🛒 Medusa (API)"
  echo "4) 📝 Strapi (CMS)"
  echo "5) 🗄️  PostgreSQL"
  echo "6) 🔴 Redis"
  echo ""
  
  while true; do
    read -p "Select option (1-6): " choice
    case $choice in
      1) 
        log "Following logs from all services..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
        break
        ;;
      2) 
        log "Following Web (Next.js) logs..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f web
        break
        ;;
      3) 
        log "Following Medusa API logs..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f medusa
        break
        ;;
      4) 
        log "Following Strapi CMS logs..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f strapi
        break
        ;;
      5) 
        log "Following PostgreSQL logs..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f postgres
        break
        ;;
      6) 
        log "Following Redis logs..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f redis
        break
        ;;
      *) 
        echo "Invalid option. Please select 1-6."
        ;;
    esac
  done
}

cmd_logs_tail() {
  log "Showing last 100 lines of logs..."
  ensure_compose_exists
  
  echo ""
  echo "Select service to view logs:"
  echo "1) 🌐 All services"
  echo "2) 🖥️  Web (Next.js)"
  echo "3) 🛒 Medusa (API)"
  echo "4) 📝 Strapi (CMS)"
  echo "5) 🗄️  PostgreSQL"
  echo "6) 🔴 Redis"
  echo ""
  
  while true; do
    read -p "Select option (1-6): " choice
    case $choice in
      1) 
        log "Last 100 lines from all services..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=100
        break
        ;;
      2) 
        log "Last 100 lines from Web (Next.js)..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=100 web
        break
        ;;
      3) 
        log "Last 100 lines from Medusa API..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=100 medusa
        break
        ;;
      4) 
        log "Last 100 lines from Strapi CMS..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=100 strapi
        break
        ;;
      5) 
        log "Last 100 lines from PostgreSQL..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=100 postgres
        break
        ;;
      6) 
        log "Last 100 lines from Redis..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=100 redis
        break
        ;;
      *) 
        echo "Invalid option. Please select 1-6."
        ;;
    esac
  done
}

cmd_stop() {
  log "Stopping all services..."
  ensure_compose_exists
  
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down; then
    log_success "All services stopped successfully"
  else
    log_error "Failed to stop some services"
    return 1
  fi
}

cmd_restart() {
  log "Restarting all services..."
  ensure_compose_exists
  
  # Stop services
  log "Stopping services..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
  
  # Start services
  log "Starting services..."
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d; then
    log_success "All services restarted successfully"
    
    # Wait for services to be ready
    sleep 10
    cmd_health
  else
    log_error "Failed to restart services"
    return 1
  fi
}

cmd_backup() {
  log "Creating database backup..."
  backup_database
}

cmd_status() {
  log "Checking service status..."
  ensure_compose_exists
  
  echo ""
  log "Docker container status:"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
  
  echo ""
  log "System resources:"
  echo "Memory usage:"
  free -h
  echo ""
  echo "Disk usage:"
  df -h /
  
  echo ""
  log "Docker disk usage:"
  docker system df
}

cmd_health() {
  log "Checking service health..."
  ensure_compose_exists
  
  local services=(
    "localhost:3000|Web Frontend"
    "localhost:9000/health|Medusa API"
    "localhost:1337/_health|Strapi CMS"
  )
  
  echo ""
  for service in "${services[@]}"; do
    IFS='|' read -r url name <<< "$service"
    
    if curl -f -s "http://$url" >/dev/null 2>&1; then
      log_success "✅ $name ($url) - Healthy"
    else
      log_error "❌ $name ($url) - Unhealthy"
    fi
  done
}

cmd_test_urls() {
  log "Testing external URLs..."
  
  if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    log_warn "SSL not configured, skipping HTTPS tests"
    return 0
  fi
  
  local external_services=(
    "https://${DOMAIN}|Website"
    "https://admin.${DOMAIN}/health|Medusa Admin"
    "https://cms.${DOMAIN}/_health|Strapi CMS"
  )
  
  echo ""
  for service in "${external_services[@]}"; do
    IFS='|' read -r url name <<< "$service"
    
    log "Testing $name..."
    if curl -f -s "$url" >/dev/null 2>&1; then
      log_success "✅ $name - Accessible"
    else
      log_warn "⚠️  $name - Not accessible (check DNS/SSL)"
    fi
  done
}

cmd_edit_config() {
  log "Opening production configuration for editing..."
  
  if [ ! -f "$ENV_FILE" ]; then
    log_error "Production environment file not found: $ENV_FILE"
    log "Please run: $0 deploy first"
    return 1
  fi
  
  # Use the user's preferred editor
  local editor="${EDITOR:-nano}"
  
  log "Opening $ENV_FILE with $editor..."
  log_warn "⚠️  Remember to restart services after changes: $0 restart"
  
  $editor "$ENV_FILE"
}

cmd_create_medusa_admin() {
  log "Creating Medusa admin user..."
  ensure_compose_exists
  
  echo ""
  log "This will create a new admin user for Medusa"
  echo ""
  
  read -p "Enter admin email: " admin_email
  if [ -z "$admin_email" ]; then
    log_error "Email is required"
    return 1
  fi
  
  read -s -p "Enter admin password: " admin_password
  echo ""
  if [ -z "$admin_password" ]; then
    log_error "Password is required"
    return 1
  fi
  
  read -s -p "Confirm admin password: " admin_password_confirm
  echo ""
  if [ "$admin_password" != "$admin_password_confirm" ]; then
    log_error "Passwords do not match"
    return 1
  fi
  
  log "Creating Medusa admin user with email: $admin_email"
  
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec medusa npx medusa user --email "$admin_email" --password "$admin_password"; then
    log_success "✅ Medusa admin user created successfully!"
    log "Login at: https://admin.${DOMAIN}"
    log "Email: $admin_email"
  else
    log_error "Failed to create Medusa admin user"
    return 1
  fi
}

cmd_create_strapi_admin() {
  log "Creating Strapi admin user..."
  ensure_compose_exists
  
  echo ""
  log "This will create a new admin user for Strapi CMS"
  echo ""
  
  read -p "Enter first name: " admin_firstname
  if [ -z "$admin_firstname" ]; then
    log_error "First name is required"
    return 1
  fi
  
  read -p "Enter last name (optional): " admin_lastname
  
  read -p "Enter admin email: " admin_email
  if [ -z "$admin_email" ]; then
    log_error "Email is required"
    return 1
  fi
  
  read -s -p "Enter admin password: " admin_password
  echo ""
  if [ -z "$admin_password" ]; then
    log_error "Password is required"
    return 1
  fi
  
  read -s -p "Confirm admin password: " admin_password_confirm
  echo ""
  if [ "$admin_password" != "$admin_password_confirm" ]; then
    log_error "Passwords do not match"
    return 1
  fi
  
  log "Creating Strapi admin user with email: $admin_email"
  
  # Build the command with optional lastname
  local cmd="npx strapi admin:create-user --firstname=\"$admin_firstname\" --email=\"$admin_email\" --password=\"$admin_password\""
  if [ -n "$admin_lastname" ]; then
    cmd="$cmd --lastname=\"$admin_lastname\""
  fi
  
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec strapi bash -c "$cmd"; then
    log_success "✅ Strapi admin user created successfully!"
    log "Login at: https://cms.${DOMAIN}/admin"
    log "Email: $admin_email"
  else
    log_error "Failed to create Strapi admin user"
    log "Note: If admin already exists, this command will fail"
    return 1
  fi
}


cmd_deploy() {
  log "Starting full deployment..."
  main_deploy
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main_deploy() {
  log_step "STARTING LEKKER PURMEREND DEPLOYMENT"
  
  # Ensure running as non-root (except for specific commands)
  if [[ $EUID -eq 0 ]] && [[ "$1" != "--allow-root" ]]; then
    log_error "Do not run this script as root. Docker commands will use sudo when needed."
    exit 1
  fi
  
  # Change to project directory
  cd "$PROJECT_ROOT"
  
  # Run deployment steps
  setup_system_requirements
  setup_docker
  setup_firewall
  setup_nginx
  create_production_compose
  check_production_env
  deploy_services
  setup_ssl
  verify_deployment
  show_completion_info
  
  log_success "🚀 Deployment completed successfully!"
}

main() {
  # Change to project directory
  cd "$PROJECT_ROOT"
  
  # Always show interactive menu
  show_interactive_menu
}

# Error handling
trap 'log_error "Script failed at line $LINENO"' ERR

# Execute main function
main "$@"