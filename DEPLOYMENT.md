# Lekker Purmerend - Production Deployment Guide

## Quick Start

1. **Get your VPS ready** (Ubuntu 20.04+ recommended)
2. **Point your domain** `lekkerpurmerend.nl` to your VPS IP
3. **Run the deployment script**:
   ```bash
   # Always shows interactive menu
   ./scripts/deploy.sh
   ```

That's it! The script handles everything automatically.

## What the Script Does

The deployment script (`scripts/deploy.sh`) is **intelligent and modular**:

### ✅ **One-Time Setup** (detected automatically):
- Installs Docker & Docker Compose
- Configures Ubuntu firewall (UFW)
- Sets up Nginx reverse proxy
- Obtains SSL certificates via Let's Encrypt
- Creates production environment files

### 🔄 **Every Run**:
- Backs up existing database
- Updates and rebuilds containers
- Verifies all services are healthy
- Tests external accessibility

### 🛡️ **Fail-Safe Features**:
- Idempotent (safe to run multiple times)
- Comprehensive logging to `/var/log/lekker-deploy.log`
- Automatic backup before deployment
- Health checks for all services
- Rollback-friendly architecture

## Domain Configuration

The script automatically configures these subdomains:

- **`lekkerpurmerend.nl`** → Web frontend (Next.js)
- **`admin.lekkerpurmerend.nl`** → Medusa admin panel
- **`cms.lekkerpurmerend.nl`** → Strapi CMS admin

## Before First Deployment

1. **Update DNS Records** (point to your VPS IP):
   ```
   A     lekkerpurmerend.nl         → YOUR_VPS_IP
   A     www.lekkerpurmerend.nl     → YOUR_VPS_IP  
   A     admin.lekkerpurmerend.nl   → YOUR_VPS_IP
   A     cms.lekkerpurmerend.nl     → YOUR_VPS_IP
   ```

2. **Configure Production Secrets** (.env.prod already created):
   ```bash
   # Edit the production environment file
   nano .env.prod
   
   # Key values to update:
   - STRIPE_SECRET_KEY=sk_live_your_live_key (from Stripe Dashboard)
   - STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key (from Stripe Dashboard)  
   - STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret (from Stripe Dashboard)
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (your email provider)
   
   # All other secrets are already secure random values
   ```

## Script Commands & Options

### **Usage:**
```bash
# Always shows interactive management menu
./scripts/deploy.sh

# Available menu options:
# - View logs (by service)
# - Deploy full application  
# - Start/stop/restart services
# - Create admin users
# - Check system health
# - And more...

# Help
./scripts/deploy.sh --help
```

### **Options:**
```bash
# Skip database backup during deployment
./scripts/deploy.sh --skip-backup

# Force SSL certificate renewal during deployment  
./scripts/deploy.sh --force-ssl
```

### **Interactive Menu:**
The script **always shows an interactive menu**:
```bash
./scripts/deploy.sh
```

**Menu Options:**
1. 📊 View logs (follow) - *with service selection*
2. 📋 View logs (last 100 lines) - *with service selection*  
3. 🛑 Stop all services
4. 🔄 Restart services
5. 💾 Create database backup
6. 📊 Show service status
7. 🏥 Check service health
8. 🌐 Test external URLs
9. 🔧 Edit production config
10. 👤 Create Medusa admin user
11. 👤 Create Strapi admin user
12. 🚀 Full deployment

## Post-Deployment

### **1. Create Admin Users:**

#### **Medusa Admin Setup:**
```bash
# Use the interactive script (recommended)
./scripts/deploy.sh
# Select: "10) 👤 Create Medusa admin user"
```

#### **Strapi Admin Setup:**
```bash
# Use the interactive script (recommended)
./scripts/deploy.sh  
# Select: "11) 👤 Create Strapi admin user"
```

**Both admin panels will then show login screens only (no signup forms).**

### **2. Access Your Services:**
- **Website**: https://lekkerpurmerend.nl
- **Medusa Admin**: https://admin.lekkerpurmerend.nl
- **Strapi CMS**: https://cms.lekkerpurmerend.nl

### **3. Content Management Workflow:**

#### **For Store Manager (Medusa):**
1. Login to `https://admin.lekkerpurmerend.nl`
2. **Products**: Add items, descriptions, prices, images
3. **Categories**: Organize product categories
4. **Inventory**: Manage stock levels
5. **Orders**: Process customer orders
6. **Settings**: Configure shipping, payments

#### **For Content Manager (Strapi):**
1. Login to `https://cms.lekkerpurmerend.nl/admin`
2. **Posts**: Create blog articles
3. **Media**: Upload images for blog posts
4. **SEO**: Optimize meta descriptions, titles
5. **Publishing**: Schedule content releases

### **Management Commands:**
```bash
# Interactive menu (recommended)
bash scripts/deploy.sh menu

# Quick commands
bash scripts/deploy.sh logs      # View logs
bash scripts/deploy.sh status    # Service status
bash scripts/deploy.sh health    # Health checks
bash scripts/deploy.sh restart   # Restart services
bash scripts/deploy.sh backup    # Database backup

# Manual Docker commands (if needed)
docker compose -f infra/docker/docker-compose.prod.yml logs -f
docker compose -f infra/docker/docker-compose.prod.yml down
```

## VPS Requirements

**Minimum** (for testing/staging):
- 2 vCPU, 4GB RAM, 40GB SSD ✅
- Ubuntu 20.04+
- Root/sudo access

**Recommended** (for production):
- 2+ vCPU, 8GB RAM, 100GB SSD
- Regular backups enabled

## Security Features

- **Firewall configured** (only ports 80, 443, 22 open)
- **SSL certificates** with automatic renewal
- **CLI-only admin creation** - No public signup forms
- **Production secrets generation** - Secure random keys generated automatically
- **Container isolation** with Docker networks
- **Database backups** before each deployment

### **🔐 Admin Security**

**Secure by Design**: 
- **No public signup forms** - Admin users created via CLI only
- **Login-only interfaces** - Both Medusa and Strapi show login screens only
- **Strong authentication** - Proper session management and password requirements

**Admin Creation Process**:
1. **Deploy services** → Admin panels accessible but show login only
2. **Create admin users** → Use CLI commands via deployment script
3. **Secure access** → Only created admins can login

## Troubleshooting

### Script Fails?
Check the detailed logs:
```bash
tail -f /var/log/lekker-deploy.log
```

### Services Not Starting?
```bash
# Check container status
docker compose -f infra/docker/docker-compose.prod.yml ps

# View specific service logs
docker compose -f infra/docker/docker-compose.prod.yml logs [service-name]
```

### SSL Issues?
```bash
# Force certificate renewal
bash scripts/deploy.sh --force-ssl

# Check certificate status
sudo certbot certificates
```

### Database Issues?
```bash
# Access database directly
docker compose -f infra/docker/docker-compose.prod.yml exec postgres psql -U medusa -d medusa
```

## Architecture Overview

```
Internet → Nginx (SSL) → Docker Services
                      ├── Web :3000 (Next.js)
                      ├── Medusa :9000 (API)  
                      ├── Strapi :1337 (CMS)
                      ├── PostgreSQL :5432
                      └── Redis :6379
```

## Backup Strategy

- **Automatic**: Database backed up before each deployment
- **Location**: `/var/backups/lekker-purmerend/`
- **Retention**: Last 5 backups kept
- **Manual Backup**: 
  ```bash
  docker compose -f infra/docker/docker-compose.prod.yml exec postgres pg_dump -U medusa medusa > backup.sql
  ```

The deployment script is designed to be your **single source of truth** for production deployment. Run it whenever you need to update your production environment!