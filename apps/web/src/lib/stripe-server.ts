// Server-side only Stripe utilities
// This file should only be imported in API routes
import Stripe from 'stripe'

let stripeServerInstance: Stripe | null = null

export const getStripeServer = (): Stripe => {
  if (!stripeServerInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable')
    }
    
    stripeServerInstance = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  }
  return stripeServerInstance
}

// Payment Intent creation for iDEAL
export interface CreatePaymentIntentParams {
  amount: number // in cents
  currency: string
  orderId: string
  customerEmail: string
  returnUrl: string
  metadata?: Record<string, string>
}

export const createIDEALPaymentIntent = async (params: CreatePaymentIntentParams) => {
  const stripe = getStripeServer()
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      payment_method_types: ['ideal'],
      confirmation_method: 'automatic',
      confirm: false,
      metadata: {
        orderId: params.orderId,
        source: 'lekker-purmerend',
        ...params.metadata,
      },
      receipt_email: params.customerEmail,
    })

    return {
      success: true,
      paymentIntent,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Failed to create payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null => {
  const stripe = getStripeServer()
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}

// Helper to get payment method details
export const getPaymentMethodDetails = async (paymentIntentId: string) => {
  const stripe = getStripeServer()
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method']
    })
    
    return {
      success: true,
      paymentIntent,
      paymentMethod: paymentIntent.payment_method,
    }
  } catch (error) {
    console.error('Failed to retrieve payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}