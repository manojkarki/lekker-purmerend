import { NextRequest, NextResponse } from 'next/server'
import { getPaymentMethodDetails } from '@/lib/stripe-server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const paymentIntentId = searchParams.get('payment_intent')
    const orderId = searchParams.get('order_id')

    if (!paymentIntentId || !orderId) {
      return NextResponse.json({
        error: 'Missing payment_intent or order_id parameter'
      }, { status: 400 })
    }

    // Get payment details from Stripe
    const paymentResult = await getPaymentMethodDetails(paymentIntentId)
    
    if (!paymentResult.success) {
      return NextResponse.json({
        error: 'Failed to retrieve payment status'
      }, { status: 500 })
    }

    const paymentIntent = paymentResult.paymentIntent
    const status = paymentIntent?.status

    // Map Stripe status to our application status
    let appStatus: 'success' | 'pending' | 'failed' | 'cancelled' = 'pending'
    let message = 'Payment is being processed'

    switch (status) {
      case 'succeeded':
        appStatus = 'success'
        message = 'Payment completed successfully'
        break
      case 'processing':
        appStatus = 'pending'
        message = 'Payment is being processed'
        break
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        appStatus = 'pending'
        message = 'Payment requires additional action'
        break
      case 'canceled':
        appStatus = 'cancelled'
        message = 'Payment was cancelled'
        break
      default:
        appStatus = 'pending'
        message = 'Payment status unknown'
    }

    return NextResponse.json({
      success: true,
      status: appStatus,
      message,
      orderId,
      paymentIntentId,
      stripeStatus: status,
      amount: paymentIntent?.amount,
      currency: paymentIntent?.currency,
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json({
      error: 'Failed to check payment status'
    }, { status: 500 })
  }
}