// Client-side only Stripe utilities
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe as StripeClientType } from '@stripe/stripe-js'

// Initialize Stripe client-side
let stripePromise: Promise<StripeClientType | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

export default {
  getStripe,
}