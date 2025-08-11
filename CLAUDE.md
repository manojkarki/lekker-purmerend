Homemade Food Website - Full Project Context and MVP Implementation Plan (LLM Agent Build Brief)

Overview

A solo-managed e-commerce and blog website to sell homemade food (primarily cakes, cookies, and snacks). Dutch-only at launch, mobile-first, with order management for local delivery logic (Purmerend only) and a blog for marketing.
This document is the LLM-ready implementation brief to build the entire backend and frontend.

⸻

Technology Stack & Versions
    •    Node.js: v20 LTS
    •    Package Manager: PNPM
    •    TypeScript: strict mode enabled
    •    Next.js: latest stable
    •    MedusaJS: latest stable
    •    Strapi: latest stable
    •    PostgreSQL: 15+
    •    Runtime (local dev): Docker Compose for app services (Medusa, Strapi, Postgres)
    •    Runtime (prod VPS): Your existing Nginx reverse proxy; apps run via Docker or systemd
    •    Timezone: Europe/Amsterdam

⸻

Repository & Deployment Layout

Monorepo with:

/apps/medusa
/apps/strapi
/apps/web
/infra

    •    Local development: Docker Compose for Medusa, Strapi, PostgreSQL. Next.js runs with next dev on host (or in compose if preferred).
    •    Production: Reuse existing Nginx on VPS. Deploy apps as containers (or systemd services) listening on internal ports; Nginx proxies to them. No need to containerize Nginx.

Ports (defaults):
    •    Medusa: localhost:9000
    •    Strapi: localhost:1337
    •    Next.js: localhost:3000 (prod served by next start on :3000)
    •    PostgreSQL: localhost:5432

⸻

Environment Variables (initial)

Common .env values for local; separate .env.prod for VPS.
    •    DATABASE_URL (Medusa)
    •    STRAPI_DATABASE_URL
    •    STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
    •    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    •    PICKUP_ADDRESS (string)
    •    SITE_URL
    •    CUTOFF_TIME=12:00
    •    NODE_ENV = development | production

⸻

Product & Content Schemas

Medusa Product Custom Fields:
    •    prep_time_hours: number
    •    same_day_cutoff: "12:00"
    •    estimation_rules: "same_day_if_before_cutoff|next_day"

Strapi Content Type post:
    •    title (string)
    •    slug (string)
    •    richText (WYSIWYG)
    •    coverImage (media)
    •    ogTitle, ogDescription, ogImage (SEO)

SEO fields for both products and posts.

⸻

Delivery & Payment Logic
    •    Purmerend detection: address city equals “Purmerend” (exact match) or postal code prefix list.
    •    Payment matrix:
    •    Delivery+Purmerend: iDEAL, Card, Bank Transfer, Cash on Delivery
    •    Pickup or non-Purmerend: iDEAL, Card, Bank Transfer (no COD)
    •    ETA Formula:
    •    If current time <= cutoff → ETA = today + prep_time_hours
    •    Else → ETA = tomorrow + prep_time_hours
    •    Display as human-readable: e.g., “Vandaag 18:00–21:00” / “Morgen”

⸻

Order Workflow
    1.    Browse Products – Show delivery estimate badge.
    2.    Place Order – Choose delivery or pickup; payment options per rules.
    3.    Pay – Stripe (iDEAL, Card), Bank Transfer (manual), Cash on Delivery (Purmerend only).
    4.    Post-Order – Email confirmation to customer and owner.
    5.    Admin View – Tag orders (deliver_today, pickup_tomorrow, etc.), assign delivery time, print order sheet.

⸻

Notifications (MVP)
    •    Email confirmations (customer & owner)
    •    Templates: order confirmation, ready for pickup, out for delivery
    •    SMTP for sending

⸻

Admin Panel
    •    Start with Medusa Admin UI
    •    Extend if needed for:
    •    Order tagging
    •    Delivery assignment
    •    Print-friendly order sheet (A4 with order id, items, notes, address, ETA)

⸻

Frontend Must-Haves
    •    Pages: Home, Products, Product Detail (image gallery), Cart/Checkout, Blog List, Blog Post, About/Contact
    •    Components: DeliveryEstimateBadge, PurmerendGate, ProductCard with gallery
    •    Blog → product embed syntax: [product:handle]
    •    Fully responsive mobile-first design

⸻

Acceptance Criteria
    •    Create product with prep_time_hours → correct ETA shown based on cutoff.
    •    Purmerend delivery shows COD; outside Purmerend hides COD.
    •    Stripe test payment (iDEAL/Card) completes order and sends emails.
    •    Blog post from Strapi appears on site with product embed working.
    •    Print order sheet renders correctly.

⸻

Next Steps
    1.    Local setup: docker compose for Medusa, Strapi, PostgreSQL; Next.js with pnpm dev.
    2.    Implement business logic: delivery/payment rules, prep-time ETA, product gallery.
    3.    Email templates: order confirmation (customer/owner), pickup/delivery notices.
    4.    QA locally: product/blog creation, checkout with Stripe test keys, print sheet.
    5.    Prepare VPS: create Unix users, folders, .env.prod files, persistent volumes.
    6.    Deploy services: run Medusa/Strapi (Docker or systemd) on internal ports; build Next.js and run next start.
    7.    Smoke test in prod and launch MVP.

⸻

Developer Task Backlog (MVP)

Backend — Medusa
    •    Add product metadata fields: prep_time_hours:number, same_day_cutoff:string, estimation_rules:string.
    •    Shipping rules: Purmerend (delivery enabled) vs non‑Purmerend (pickup only).
    •    Payment matrix enforcement (hide COD unless Purmerend+delivery).
    •    Order metadata: eta_iso, eta_label (“Vandaag”/“Morgen”), tags.
    •    REST endpoints to set/update order tags and exact delivery time.
    •    Email sender service (SMTP) with templates (see below).

CMS — Strapi
    •    Content type post (title, slug, richText, coverImage, og fields).
    •    Public API for blog list/detail; add CORS for web.
    •    Media upload limits and basic roles.

Frontend — Next.js
    •    Pages: Home, Products, Product Detail, Cart/Checkout, Blog List, Blog Post, About/Contact.
    •    Components: DeliveryEstimateBadge, PurmerendGate, ProductCard (with image gallery), PrintOrderSheet.
    •    Blog product embed: parse [product:handle] into a product card.
    •    Checkout form: address capture with city+postal code; toggle delivery/pickup and payments per rules.
    •    SEO component with per‑page meta + OG tags.

Emails (MVP)
    •    Order Confirmation (Customer): order id, items, total, chosen method, ETA label/date, pickup address (if pickup).
    •    New Order (Owner): order id, items, customer details, ETA suggestion, quick link to print.
    •    Ready Notifications (optional for MVP+1): pickup ready / out for delivery.

Print‑friendly Order Sheet
    •    Route: /orders/{id}/print (server‑rendered HTML, A4).
    •    Fields: order id, items (qty, notes), customer name, phone, address (if delivery), ETA, tags, prep notes.

⸻

API Contracts (High Level)
    •    GET /store/products/:id → product with prep_time_hours metadata.
    •    POST /admin/orders/:id/tags → { tags: string[] }.
    •    POST /admin/orders/:id/eta → { eta_iso: string, eta_label: string }.

⸻

Data & Validation Rules
    •    City comparison is case‑insensitive; accepted city: Purmerend.
    •    Optional postal code prefixes for Purmerend can be added later.
    •    All time calculations in Europe/Amsterdam.
    •    prep_time_hours must be integer 0–72.

⸻

Testing Plan (Local)
    •    Create a product with prep_time_hours=6, cutoff 12:00; verify ETA before/after cutoff.
    •    Checkout with address in Purmerend → delivery + COD visible; outside → pickup only, no COD.
    •    Stripe test payment (iDEAL/Card) completes order and sends emails.
    •    Create blog post in Strapi; verify list/detail; verify [product:handle] embed.
    •    Print order sheet contains all fields and fits A4.

⸻

Definition of Done (MVP)
    •    All acceptance criteria met from earlier section.
    •    CI script runs typecheck and basic integration tests.
    •    Docker Compose starts Medusa, Strapi, Postgres; pnpm dev runs web; README includes run commands.
