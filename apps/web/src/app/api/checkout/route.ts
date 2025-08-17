import { NextRequest, NextResponse } from 'next/server'
import { medusaClient } from '@/lib/medusa'
import { createIDEALPaymentIntent } from '@/lib/stripe-server'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    
    const {
      paymentMethod, // 'ideal' | 'cash'
      deliveryMethod, // 'delivery' | 'pickup'
      customer,
      address,
      cartItems = [],
    } = payload || {}

    // Try to create cart with sales_channel_id
    const medusaUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const cartResponse = await fetch(`${medusaUrl}/store/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        region_id: 'reg_nl',
        sales_channel_id: 'sc_01K2MJ0T69EZBY3QN7JT6J0SGM',
      }),
    })

    if (!cartResponse.ok) {
      const errorText = await cartResponse.text()
      console.error('Cart creation failed:', errorText)
      throw new Error('Failed to create cart')
    }

    const { cart } = await cartResponse.json()

    // 2) Add line items
    for (const item of cartItems) {
      try {
        // Find the product variant
        const productResponse = await fetch(`${medusaUrl}/store/products/${item.id}`)
        if (!productResponse.ok) continue
        
        const { product } = await productResponse.json()
        const variantId = product?.variants?.[0]?.id
        if (!variantId) continue

        const addItemResponse = await fetch(`${medusaUrl}/store/carts/${cart.id}/line-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variant_id: variantId,
            quantity: item.quantity || 1,
          }),
        })

        if (!addItemResponse.ok) {
          console.error('Failed to add item:', item.id)
        }
      } catch (err) {
        console.error('Failed to add item:', item.id, err)
      }
    }

    // 3) Set customer email
    if (customer?.email) {
      await fetch(`${medusaUrl}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: customer.email }),
      })
    }

    // 4) Set shipping address (for delivery)
    if (deliveryMethod === 'delivery' && address) {
      await fetch(`${medusaUrl}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipping_address: {
            first_name: customer?.firstName || 'Klant',
            last_name: customer?.lastName || 'Lekker',
            address_1: address.street || '',
            address_2: address.houseNumber || '',
            city: address.city || 'Purmerend',
            postal_code: address.postalCode || '',
            country_code: 'nl',
            phone: customer?.phone || undefined,
          },
        }),
      })
    }

    // 5) Select shipping option
    try {
      const shippingResponse = await fetch(`${medusaUrl}/store/shipping-options/${cart.region_id}`)
      
      if (shippingResponse.ok) {
        const { shipping_options } = await shippingResponse.json()
        
        let option = shipping_options?.[0]
        if (shipping_options?.length) {
          const byPickup = shipping_options.find((o: any) => /pickup|ophalen/i.test(o.name || ''))
          const byDelivery = shipping_options.find((o: any) => /delivery|bezorg/i.test(o.name || ''))
          option = deliveryMethod === 'pickup' ? (byPickup || option) : (byDelivery || option)
        }
        
        if (option) {
          await fetch(`${medusaUrl}/store/carts/${cart.id}/shipping-methods`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ option_id: option.id }),
          })
        }
      }
    } catch (err) {
      console.error('Shipping method error:', err)
    }

    // 6) Create payment sessions
    const paymentSessionsResponse = await fetch(`${medusaUrl}/store/carts/${cart.id}/payment-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!paymentSessionsResponse.ok) {
      console.error('Failed to create payment sessions')
    }

    if (paymentMethod === 'cash') {
      // Select manual payment and complete
      const selectPaymentResponse = await fetch(`${medusaUrl}/store/carts/${cart.id}/payment-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider_id: 'manual' }),
      })

      if (selectPaymentResponse.ok) {
        // Complete the cart
        const completeResponse = await fetch(`${medusaUrl}/store/carts/${cart.id}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (completeResponse.ok) {
          const completed = await completeResponse.json()
          const orderId = completed.order?.id || completed.data?.id || 'order'
          return NextResponse.json({
            status: 'ok',
            orderId,
            message: 'Bestelling geplaatst! Je betaalt bij de bezorging.'
          })
        }
      }
    }

    if (paymentMethod === 'ideal') {
      let orderId: string | null = null
      
      try {
        // Validate required fields for iDEAL
        if (!customer?.email) {
          throw new Error('Email is required for iDEAL payments')
        }
        
        if (!payload.total || payload.total <= 0) {
          throw new Error('Invalid order total for payment')
        }

        // First, complete the cart to create an order
        const completeResponse = await fetch(`${medusaUrl}/store/carts/${cart.id}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!completeResponse.ok) {
          const errorText = await completeResponse.text()
          console.error('Cart completion failed:', errorText)
          throw new Error('Failed to create order. Please try again.')
        }

        const completed = await completeResponse.json()
        orderId = completed.order?.id || completed.data?.id

        if (!orderId) {
          throw new Error('Order was created but no ID was returned')
        }

        console.log(`Order ${orderId} created, creating payment intent for €${(payload.total / 100).toFixed(2)}`)

        // Create Stripe PaymentIntent for iDEAL
        const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
        const paymentResult = await createIDEALPaymentIntent({
          amount: payload.total,
          currency: 'eur',
          orderId,
          customerEmail: customer.email,
          returnUrl: `${siteUrl}/bestelling-geplaatst?orderId=${orderId}&payment=ideal&status=success`,
          metadata: {
            deliveryMethod: deliveryMethod || 'delivery',
            customerName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
            cartId: cart.id,
          }
        })

        if (!paymentResult.success) {
          console.error('Payment intent creation failed:', paymentResult.error)
          throw new Error('Failed to initialize payment. Please try again.')
        }

        return NextResponse.json({
          status: 'requires_payment',
          orderId,
          clientSecret: paymentResult.clientSecret,
          message: 'iDEAL betaling wordt voorbereid...',
        }, { status: 202 })

      } catch (error) {
        console.error('iDEAL payment creation failed:', error)
        
        // If we have an order ID, we should mark it as payment failed
        if (orderId) {
          console.log(`Marking order ${orderId} as payment failed due to error: ${error}`)
          // TODO: Mark order as payment failed in Medusa
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to create iDEAL payment'
        return NextResponse.json({
          error: errorMessage
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Unsupported paymentMethod' }, { status: 400 })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to process checkout' }, { status: 500 })
  }
}
