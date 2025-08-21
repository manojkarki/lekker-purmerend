Homemade Food Website - Full Project Context and MVP Implementation Plan (LLM Agent Build Brief)

Overview

A solo-managed e-commerce and blog website to sell homemade food (primarily cakes, cookies, and snacks). Dutch-only at launch, mobile-first, with order management for local delivery logic (Purmerend only) and a blog for marketing.
This document is the LLM-ready implementation brief with current status and completed features.

⸻

Technology Stack & Versions
    •    Node.js: v20 LTS
    •    Package Manager: PNPM
    •    TypeScript: strict mode enabled
    •    Next.js: 14.0.0 (latest stable)
    •    MedusaJS: latest stable
    •    Strapi: latest stable
    •    PostgreSQL: 15+
    •    Stripe: v14.25.0 (iDEAL payments)
    •    Runtime (local dev): Docker Compose for all services
    •    Runtime (prod VPS): Docker containers behind Nginx reverse proxy
    •    Timezone: Europe/Amsterdam

⸻

Repository & Deployment Layout

Monorepo with:

/apps/medusa - E-commerce backend
/apps/strapi - CMS backend
/apps/web - Next.js frontend
/apps/web/src/lib/stripe.ts - Client-side Stripe utilities
/apps/web/src/lib/stripe-server.ts - Server-side Stripe utilities
/apps/web/src/app/api/checkout/ - Payment processing endpoint
/apps/web/src/app/api/webhooks/stripe/ - Stripe webhook handler
/apps/web/src/app/api/payment-status/ - Payment verification endpoint
/infra - Docker configuration
/packages - Shared utilities and types
/scripts - Development automation

Local Development:
    •    `pnpm run dev` - Starts all services via Docker Compose with robust error handling
    •    Automatic cleanup of ports and containers
    •    Environment variable loading with --env-file .env
    •    Docker daemon detection and recovery

Ports:
    •    Web (Next.js): localhost:3000
    •    Medusa: localhost:9000 
    •    Strapi: localhost:1337
    •    PostgreSQL: localhost:5432
    •    Redis: localhost:6379

⸻

Environment Variables

Production (.env.prod):
    •    NODE_ENV=production
    •    DATABASE_URL=postgresql://user:pass@host:5432/medusa
    •    REDIS_URL=redis://host:6379
    •    STRIPE_SECRET_KEY=sk_live_your_live_secret_key
    •    STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
    •    STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret
    •    SITE_URL=https://your-production-domain.com
    •    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

Development (.env):
    •    NODE_ENV=development
    •    DATABASE_URL=postgresql://medusa:medusa@postgres:5432/medusa
    •    REDIS_URL=redis://redis:6379
    •    MEDUSA_BACKEND_URL=http://lekker-medusa:9000 (Docker internal)
    •    NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000 (Browser access)
    •    STRAPI_API_URL=http://lekker-strapi:1337/api
    •    STRIPE_SECRET_KEY=sk_test_your_test_secret_key
    •    STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key
    •    STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret
    •    SITE_URL=http://localhost:3000

⸻

Payment Integration - IMPLEMENTED ✅

Stripe iDEAL Integration:
    •    Complete end-to-end iDEAL payment flow
    •    PaymentIntent creation with order linking
    •    Secure webhook verification and order completion
    •    Client-side bank selection via Stripe hosted page
    •    Error handling and user feedback in Dutch

Payment Matrix (WORKING):
    •    Delivery+Purmerend: iDEAL, Cash on Delivery
    •    Pickup or non-Purmerend: iDEAL only (no COD)

Flow:
    1. Customer places order → Order created in Medusa
    2. iDEAL selected → PaymentIntent created via Stripe API
    3. Redirect to Stripe → Customer selects bank and pays
    4. Webhook received → Order marked as paid in Medusa
    5. Customer redirected → Success page with order confirmation

Files:
    •    /apps/web/src/lib/stripe.ts - Client-side utilities (getStripe)
    •    /apps/web/src/lib/stripe-server.ts - Server-side utilities (PaymentIntent creation, webhooks)
    •    /apps/web/src/app/api/checkout/route.ts - Order and payment processing
    •    /apps/web/src/app/api/webhooks/stripe/route.ts - Payment confirmation handler
    •    /apps/web/src/app/api/payment-status/route.ts - Payment verification

⸻

Product & Content Schemas

Medusa Product Custom Fields (IMPLEMENTED):
    •    prep_time_hours: number
    •    same_day_cutoff: "12:00" 
    •    estimation_rules: "same_day_if_before_cutoff|next_day"

Strapi Content Type post (IMPLEMENTED):
    •    title (string)
    •    slug (string)
    •    richText (WYSIWYG)
    •    coverImage (media)
    •    ogTitle, ogDescription, ogImage (SEO)

⸻

Delivery & Payment Logic (IMPLEMENTED ✅)

Purmerend Detection:
    •    City name: "Purmerend" (case-insensitive exact match)
    •    Postal codes: 1441-1447 prefix ranges
    •    Business logic in /packages/utils/src/location.ts

ETA Calculation (WORKING):
    •    Current time <= cutoff → ETA = today + prep_time_hours
    •    Current time > cutoff → ETA = tomorrow + prep_time_hours
    •    Display format: "Vandaag 18:00–21:00" / "Morgen 15:00–18:00"
    •    Timezone: Europe/Amsterdam

Payment Rules (ENFORCED IN UI):
    •    Cash on Delivery: Only for Purmerend + delivery
    •    iDEAL: Available for all locations
    •    Bank Transfer: Placeholder for future implementation

⸻

Development Status - CURRENT STATE

✅ COMPLETED FEATURES:
    •    Complete Stripe iDEAL payment integration
    •    Docker Compose environment with robust dev scripts
    •    Modular Stripe architecture (client/server separation)  
    •    Order creation and payment processing
    •    Webhook handling with signature verification
    •    Frontend checkout flow with error handling
    •    Mobile-first responsive design
    •    Business logic (delivery estimation, location detection)
    •    TypeScript strict mode throughout
    •    Environment variable management
    •    Docker networking and service communication

✅ TESTED & WORKING:
    •    End-to-end iDEAL payment flow
    •    Cash on delivery orders
    •    Docker container orchestration
    •    Environment variable loading
    •    Payment status verification
    •    Order creation in Medusa
    •    Frontend/backend API communication

🚧 IN PROGRESS / NEXT:
    •    Email notification system (SMTP integration)
    •    Print-friendly order sheets
    •    Blog post → product embed functionality
    •    Admin panel enhancements
    •    Production deployment preparation

⸻

API Endpoints - IMPLEMENTED

Payment & Orders:
    •    POST /api/checkout - Complete order with payment processing
    •    POST /api/webhooks/stripe - Stripe webhook handler
    •    GET /api/payment-status - Payment verification
    •    GET /store/products - Product catalog (Medusa)
    •    GET /store/orders - Order management (Medusa)

Content:
    •    GET /api/blog - Blog post listing (Strapi)
    •    GET /api/blog/[slug] - Blog post detail (Strapi)

⸻

Testing & Verification

Stripe Integration Testing:
    1. Add products to cart
    2. Go to checkout (http://localhost:3000/checkout)
    3. Select iDEAL payment method
    4. Fill customer details
    5. Click "Bestelling plaatsen"
    6. Redirect to Stripe's iDEAL test page
    7. Select test bank and complete payment
    8. Redirect to success page with order confirmation

Expected Results:
    •    Order created with unique ID
    •    PaymentIntent created in Stripe dashboard
    •    Webhook events processed (check logs)
    •    Order status updated to paid
    •    Customer receives confirmation

Test Commands:
```bash
# Start development environment
pnpm run dev

# Test business logic
node test-delivery.js

# Manual API testing
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod":"cash","deliveryMethod":"pickup",...}'
```

⸻

Deployment Checklist

Pre-deployment:
    •    [ ] Set production Stripe keys in .env.prod
    •    [ ] Configure webhook endpoint: https://domain.com/api/webhooks/stripe
    •    [ ] Enable iDEAL in Stripe Dashboard
    •    [ ] Configure SMTP settings for email notifications
    •    [ ] Set up production database and Redis
    •    [ ] Configure Nginx reverse proxy rules

Post-deployment:
    •    [ ] Test complete payment flow end-to-end
    •    [ ] Verify webhook events are received
    •    [ ] Monitor error logs and payment failures
    •    [ ] Test mobile responsiveness in production
    •    [ ] Validate SSL certificate for Stripe webhooks

⸻

Known Issues & Solutions

Docker Environment:
    •    SOLVED: Stripe module resolution in containers
    •    SOLVED: Environment variable loading with --env-file
    •    SOLVED: Docker daemon detection and recovery
    •    SOLVED: Container-to-container networking

Payment Integration:
    •    SOLVED: iDEAL bank parameter validation
    •    SOLVED: Client-side vs server-side Stripe library conflicts
    •    SOLVED: PaymentIntent creation and confirmation flow
    •    SOLVED: Webhook signature verification

Development Workflow:
    •    SOLVED: Automatic cleanup of ports and processes
    •    SOLVED: Graceful Docker container management
    •    SOLVED: TypeScript compilation issues

⸻

Architecture Decisions

Modular Stripe Integration:
    •    Client-side: Only UI interactions (stripe.ts)
    •    Server-side: All API calls and webhooks (stripe-server.ts)
    •    Separation prevents import conflicts and improves security

Docker-First Development:
    •    All services run in containers for consistency
    •    Volume mounts for hot reload during development
    •    Environment-specific configuration via compose files

TypeScript Strict Mode:
    •    Full type safety throughout the application
    •    Shared types package for consistency
    •    Strict configuration prevents runtime errors

⸻

Definition of Done - MVP STATUS: 90% COMPLETE

✅ Core Requirements Met:
    •    Functional e-commerce with payment processing
    •    Stripe iDEAL integration working end-to-end
    •    Mobile-first responsive design
    •    Dutch localization throughout
    •    Docker development environment
    •    Business logic correctly implemented
    •    Order management via Medusa
    •    Content management via Strapi

🚧 Remaining for 100%:
    •    Email notification system
    •    Print order sheets
    •    Blog → product embeds
    •    Production deployment testing

The platform is ready for user testing and can process real orders with Stripe iDEAL payments.