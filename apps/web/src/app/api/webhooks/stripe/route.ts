import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyWebhookSignature } from '@/lib/stripe-server'

// Disable body parsing for raw webhook payload
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')
    
    if (!signature) {
      console.error('Missing Stripe signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret)
    if (!event) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`🔔 Stripe webhook received: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
        
      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in payment intent metadata', { paymentIntentId: paymentIntent.id })
      return
    }

    console.log(`💰 Payment succeeded for order ${orderId}`, {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })
    
    const medusaUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
    
    // First, verify the order exists
    const orderCheckResponse = await fetch(`${medusaUrl}/store/orders/${orderId}`)
    if (!orderCheckResponse.ok) {
      console.error(`Order ${orderId} not found`)
      return
    }

    // Mark payment as captured in Medusa
    try {
      const captureResponse = await fetch(`${medusaUrl}/admin/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, you'll need proper Medusa admin authentication
        },
      })

      if (captureResponse.ok) {
        console.log(`✅ Payment captured for order ${orderId}`)
      } else {
        console.error(`Failed to capture payment for order ${orderId}:`, await captureResponse.text())
      }
    } catch (captureError) {
      console.error(`Error capturing payment for order ${orderId}:`, captureError)
    }

    // Send confirmation email
    await sendOrderConfirmationEmail(orderId, paymentIntent)
    
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    console.log(`❌ Payment failed for order ${orderId}`)
    
    // TODO: Implement payment failure handling
    // - Mark order as payment failed
    // - Send notification to customer
    // - Potentially restore cart items
    
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handlePaymentRequiresAction(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) {
      console.error('No orderId in payment intent metadata')
      return
    }

    console.log(`⏳ Payment requires action for order ${orderId}`)
    
    // This typically happens when additional authentication is required
    // The customer will be redirected to complete the payment
    
  } catch (error) {
    console.error('Error handling payment requires action:', error)
  }
}

// Helper function to send order confirmation email (to be implemented)
async function sendOrderConfirmationEmail(orderId: string, paymentIntent?: any) {
  try {
    // TODO: Implement email sending integration
    // This could integrate with your existing email service or Medusa's email service
    console.log(`📧 Would send confirmation email for order ${orderId}`, {
      paymentAmount: paymentIntent?.amount,
      paymentMethod: 'iDEAL'
    })
    
    // For now, we'll just log what would be sent
    const emailData = {
      orderId,
      paymentStatus: 'completed',
      paymentMethod: 'iDEAL',
      amount: paymentIntent?.amount ? (paymentIntent.amount / 100).toFixed(2) : 'Unknown',
      currency: paymentIntent?.currency?.toUpperCase() || 'EUR'
    }
    
    console.log('Email data that would be sent:', emailData)
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
}