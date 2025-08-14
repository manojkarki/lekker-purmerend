### Stripe iDEAL + Cash on Delivery with Medusa (Minimal, Modular Plan)

#### Overview
- Use Medusa for ecommerce flows; Stripe for iDEAL; Manual provider for Cash on Delivery.
- Keep frontend thin: a single Next.js API orchestrates checkout; UI only collects data.

#### Medusa backend
- Plugins
  - `medusa-payment-stripe` (iDEAL via Stripe PaymentIntents)
  - `medusa-payment-manual` (Cash on Delivery)
- Environment variables
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_...`
  - Ensure region currency is `EUR`
- Configuration (apps/medusa/medusa-config.js)
  - Register Stripe plugin with `api_key` and `webhook_secret`
  - Keep `medusa-payment-manual` enabled
- Shipping model (delivery vs pickup)
  - Region should define two shipping options:
    - Delivery: e.g., €2.95 (free ≥ €25)
    - Pickup: €0
- Webhooks
  - Configure Stripe webhook to Medusa’s Stripe endpoint
  - Medusa finalizes orders when Stripe confirms payment (test with ngrok locally if needed)
- Emails
  - Ensure an email service is wired (can start with console logs, switch to SMTP later)

#### Next.js storefront
- API route (server-only): `POST /api/checkout`
  - Input: delivery/pickup, customer, address, notes, `paymentMethod: ideal|cash` + current cart items
  - Flow:
    1) Create cart (Store API)
    2) Add line items from client cart
    3) Set region (EUR) and customer email
    4) Set shipping address and select shipping option (delivery vs pickup)
    5) Create payment sessions (`/store/carts/:id/payment-sessions`)
    6) If iDEAL: select Stripe, set `return_url`, complete cart → respond with redirect URL
    7) If Cash: select Manual, complete cart → respond with order id + success URL
- Pages
  - `/checkout`: submits to `/api/checkout`; redirect for iDEAL; success for cash
  - `/checkout/success?order=...`: thank-you page
  - `/checkout/cancel`: cancel path back to checkout
- Security
  - Do not expose secrets client-side; use Store API only from server route

#### Cash on Delivery
- Uses `medusa-payment-manual`
- Completing the cart creates a pending/unpaid order; operations mark as paid on delivery later

#### Admin
- Keep current Admin at `http://localhost:9000/app` for managing orders, payments, shipping

#### Dev workflow
- `pnpm run dev` (starts Postgres/Redis via Docker; Medusa via Docker; Strapi+Web locally)
- For Stripe webhooks locally, expose Medusa via ngrok and set webhook in Stripe dashboard

#### Production
- Same architecture; set Stripe keys/webhook in environment
- Admin served at `/app` on port 9000

#### To-dos (Checklist)
- [ ] Add Stripe env vars locally and in Docker Compose
- [ ] Enable `medusa-payment-stripe` in `medusa-config.js`
- [ ] Verify Region (EUR) + Shipping options (Delivery, Pickup)
- [ ] Implement Next.js `POST /api/checkout`
- [ ] Wire checkout submit to call `/api/checkout` (remove demo alert)
- [ ] Add success/cancel pages and redirects
- [ ] Configure Stripe webhook → Medusa endpoint (test via ngrok)
- [ ] Basic email confirmation handler (console → SMTP)
