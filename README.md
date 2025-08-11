# Lekker Purmerend - Homemade Food E-commerce Platform

A Dutch e-commerce platform for homemade food delivery in Purmerend, built with Next.js, Medusa, and Strapi.

## Quick Start

1. **Setup the development environment:**
   ```bash
   bash scripts/setup.sh
   ```

2. **Start all services:**
   ```bash
   pnpm run dev
   ```

   Or start services individually:
   ```bash
   pnpm run dev:web     # Next.js frontend (port 3000)
   pnpm run dev:medusa  # Medusa backend (port 9000) 
   pnpm run dev:strapi  # Strapi CMS (port 1337)
   ```

## Access Points

- **Frontend**: http://localhost:3000
- **Medusa Admin**: http://localhost:9000/admin
- **Strapi Admin**: http://localhost:1337/admin
- **PostgreSQL**: localhost:5432 (user: medusa, password: medusa)
- **Redis**: localhost:6379

## Architecture

```
├── apps/
│   ├── web/          # Next.js frontend
│   ├── medusa/       # E-commerce backend
│   └── strapi/       # CMS backend
├── packages/
│   ├── shared-types/ # TypeScript types
│   └── utils/        # Business logic utilities
└── infra/
    └── docker/       # Development infrastructure
```

## Features Implemented

✅ **Core Business Logic**
- Delivery estimation with Amsterdam timezone
- Purmerend location detection for delivery/payment options
- Payment method matrix (iDEAL, Card, Bank Transfer, Cash on Delivery)

✅ **Frontend Components**
- Product gallery with image carousel
- Delivery estimate badges
- Payment method selector
- Purmerend location checker

✅ **Backend Services**
- Custom Medusa product fields (prep_time_hours, cutoff_time)
- Email service with order confirmation templates
- Order management APIs
- Strapi blog with SEO components

✅ **Infrastructure**
- Docker Compose for local development
- Monorepo with pnpm workspaces
- Shared types and utilities

## Testing the Platform

1. **Visit the homepage**: http://localhost:3000
2. **Test location detection**: Use the "Check je bezorg- en betaalmogelijkheden" section
3. **Test Purmerend vs non-Purmerend addresses**:
   - Purmerend: Shows delivery + all payment methods
   - Other cities: Shows pickup only + limited payment methods

## Environment Variables

Copy `.env.example` to `.env` and update with your settings:

- **Stripe**: Add your test keys
- **SMTP**: Configure email settings
- **Business**: Update pickup address and cutoff time

## Next Steps

After successful testing:
- Add products via Medusa Admin
- Create blog posts via Strapi Admin
- Set up Stripe payment processing
- Configure email templates
- Deploy to production

Happy testing! 🍰