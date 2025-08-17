# Stripe iDEAL Integration Setup Guide

## Overview
This implementation provides complete Stripe iDEAL payment integration for the Lekker Purmerend e-commerce site using Medusa backend and Next.js frontend.

## Architecture
- **Payment Flow**: Customer chooses iDEAL → PaymentIntent created → Redirect to Stripe → Bank authentication → Webhook confirmation → Order completion
- **Components**: Stripe service module, webhook handler, checkout API, frontend integration
- **Security**: Webhook signature verification, environment-based configuration

## Required Environment Variables

### Production Setup
Add these to your production `.env` file:

```bash
# Stripe Configuration (replace with actual values)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret

# Site URL (for Stripe redirects)
SITE_URL=https://your-production-domain.com
```

### Development/Testing Setup
For testing with Stripe test mode:

```bash
# Stripe Test Configuration
STRIPE_SECRET_KEY=sk_test_your_test_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Development Site URL
SITE_URL=http://localhost:3000
```

## Stripe Account Configuration

### 1. Enable iDEAL Payment Method
1. Log in to your Stripe Dashboard
2. Go to Settings → Payment methods
3. Enable "iDEAL" for your account
4. Configure iDEAL settings if needed

### 2. Create Webhook Endpoint
1. Go to Developers → Webhooks in Stripe Dashboard
2. Click "Add endpoint"
3. Set URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`
5. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Get API Keys
1. Go to Developers → API keys
2. Copy "Publishable key" to `STRIPE_PUBLISHABLE_KEY`
3. Copy "Secret key" to `STRIPE_SECRET_KEY`

## Testing the Integration

### Test Flow
1. Add products to cart
2. Go to checkout
3. Select iDEAL payment method
4. Fill in customer details
5. Click "Bestelling plaatsen"
6. Should redirect to Stripe's iDEAL test page
7. Complete test payment
8. Should redirect back to success page

### Test Bank Details (Stripe Test Mode)
- Use any test iDEAL bank in Stripe's test environment
- Payments will be simulated and complete immediately

### Verification Points
- [ ] Order created in Medusa
- [ ] PaymentIntent created in Stripe
- [ ] Webhook received and processed
- [ ] Order marked as paid in Medusa
- [ ] Customer redirected to success page

## API Endpoints Added

### `/api/webhooks/stripe` (POST)
- Handles Stripe webhook events
- Verifies webhook signatures
- Updates order status on payment completion

### `/api/payment-status` (GET)
- Query parameters: `payment_intent`, `order_id`
- Returns current payment status
- Used for payment verification

## Security Features

### Webhook Security
- Signature verification using `STRIPE_WEBHOOK_SECRET`
- Raw body parsing for signature validation
- Event type validation

### Payment Security
- Server-side PaymentIntent creation
- Metadata validation
- Order verification before payment processing

## Error Handling

### Payment Failures
- Failed payments logged with context
- Orders marked appropriately
- User-friendly error messages
- Automatic retry capabilities where appropriate

### Edge Cases Handled
- Missing environment variables
- Invalid webhook signatures
- Duplicate webhook events
- Network timeouts
- Order not found scenarios

## Deployment Checklist

### Pre-deployment
- [ ] Set production Stripe keys
- [ ] Configure webhook endpoint URL
- [ ] Test webhook delivery
- [ ] Verify iDEAL is enabled in Stripe

### Post-deployment
- [ ] Test complete payment flow
- [ ] Verify webhook events are received
- [ ] Check order completion in Medusa
- [ ] Monitor error logs

## Troubleshooting

### Common Issues

**Webhook not received:**
- Check webhook URL is accessible
- Verify webhook secret matches
- Check Stripe webhook delivery logs

**Payment not completing:**
- Check webhook event processing
- Verify order exists in Medusa
- Check server logs for errors

**iDEAL not available:**
- Verify iDEAL is enabled in Stripe
- Check region/currency settings
- Ensure test mode is configured correctly

### Debug Commands
```bash
# Check webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe

# Check payment status
curl "https://your-domain.com/api/payment-status?payment_intent=pi_xxx&order_id=order_xxx"
```

## Support
For Stripe-specific issues, consult:
- [Stripe iDEAL Documentation](https://stripe.com/docs/payments/ideal)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Dashboard](https://dashboard.stripe.com)