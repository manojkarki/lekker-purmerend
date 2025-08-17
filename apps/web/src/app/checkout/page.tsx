'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CakeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector'
import { useCart } from '@/contexts/CartContext'
import { getStripe } from '@/lib/stripe'

interface CheckoutData {
  deliveryMethod: 'delivery' | 'pickup'
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  address?: {
    street: string
    houseNumber: string
    city: string
    postalCode: string
  }
  paymentMethod: 'ideal' | 'cash'
  notes: string
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    deliveryMethod: 'delivery',
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    address: {
      street: '',
      houseNumber: '',
      city: 'Purmerend',
      postalCode: ''
    },
    paymentMethod: 'ideal',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const cartItems = cart.items
  const subtotal = cart.subtotal
  const deliveryFee = checkoutData.deliveryMethod === 'delivery' && subtotal < 2500 ? 295 : 0
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutData,
          cartItems,
          subtotal,
          deliveryFee,
          total,
        }),
      })

      if (res.status === 202) {
        const data = await res.json()
        
        // Handle Stripe iDEAL payment
        if (data.status === 'requires_payment' && data.clientSecret) {
          const stripe = await getStripe()
          if (!stripe) {
            alert('Stripe kon niet worden geladen')
            setIsSubmitting(false)
            return
          }

          // Redirect to Stripe's iDEAL payment page
          const { error } = await stripe.confirmIdealPayment(data.clientSecret, {
            payment_method: {
              ideal: {
                // Don't specify bank - let user choose on Stripe's page
              }
            },
            return_url: `${window.location.origin}/bestelling-geplaatst?orderId=${data.orderId}&payment=ideal&status=success`,
          })

          if (error) {
            console.error('Stripe payment error:', error)
            alert('Er ging iets mis met de betaling: ' + error.message)
            setIsSubmitting(false)
          } else {
            // User is being redirected to bank, clear cart
            clearCart()
          }
          return
        }
        
        // Handle other 202 responses
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl
          return
        }
        alert('Betaling wordt voorbereid...')
        setIsSubmitting(false)
        return
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Checkout mislukt' }))
        alert(err.error || 'Checkout mislukt')
        setIsSubmitting(false)
        return
      }

      const data = await res.json()
      
      // Clear the cart on successful order
      clearCart()
      
      // Redirect to success page with order details
      const params = new URLSearchParams({
        orderId: data.orderId || 'unknown',
        payment: checkoutData.paymentMethod,
        delivery: checkoutData.deliveryMethod
      })
      
      window.location.href = `/bestelling-geplaatst?${params.toString()}`
    } catch (err) {
      alert('Er ging iets mis tijdens het afrekenen')
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setCheckoutData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value
          }
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const isPurmerend = checkoutData.address?.city?.toLowerCase() === 'purmerend'
  const availablePaymentMethods = checkoutData.deliveryMethod === 'delivery' && isPurmerend 
    ? ['ideal', 'cash']
    : ['ideal']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <CakeIcon className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Lekker Purmerend
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bestelling afronden
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Delivery Method */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Bezorging of ophalen?
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={checkoutData.deliveryMethod === 'delivery'}
                        onChange={(e) => updateField('deliveryMethod', e.target.value)}
                        className="peer sr-only"
                      />
                      <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50">
                        <div className="flex items-center gap-3">
                          <MapPinIcon className="w-6 h-6 text-primary-600" />
                          <div>
                            <div className="font-medium">Bezorging</div>
                            <div className="text-sm text-gray-600">Gratis vanaf €25</div>
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="relative">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={checkoutData.deliveryMethod === 'pickup'}
                        onChange={(e) => updateField('deliveryMethod', e.target.value)}
                        className="peer sr-only"
                      />
                      <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50">
                        <div className="flex items-center gap-3">
                          <CakeIcon className="w-6 h-6 text-primary-600" />
                          <div>
                            <div className="font-medium">Ophalen</div>
                            <div className="text-sm text-gray-600">Altijd gratis</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Contactgegevens
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Voornaam *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.customer.firstName}
                        onChange={(e) => updateField('customer.firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Achternaam *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.customer.lastName}
                        onChange={(e) => updateField('customer.lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={checkoutData.customer.email}
                        onChange={(e) => updateField('customer.email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefoon *
                      </label>
                      <input
                        type="tel"
                        required
                        value={checkoutData.customer.phone}
                        onChange={(e) => updateField('customer.phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                {checkoutData.deliveryMethod === 'delivery' && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Bezorgadres
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Straatnaam *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutData.address?.street || ''}
                          onChange={(e) => updateField('address.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Huisnummer *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutData.address?.houseNumber || ''}
                          onChange={(e) => updateField('address.houseNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postcode *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="1441 AB"
                          value={checkoutData.address?.postalCode || ''}
                          onChange={(e) => updateField('address.postalCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stad *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutData.address?.city || ''}
                          onChange={(e) => updateField('address.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          Let op: bezorging alleen mogelijk in Purmerend
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Betaalmethode
                  </h2>
                  
                  <PaymentMethodSelector
                    value={checkoutData.paymentMethod}
                    onChange={(method) => updateField('paymentMethod', method)}
                    availableMethods={availablePaymentMethods}
                    isPurmerend={isPurmerend}
                    deliveryMethod={checkoutData.deliveryMethod}
                  />
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Opmerkingen (optioneel)
                  </h2>
                  
                  <textarea
                    rows={3}
                    value={checkoutData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Bijzondere wensen of instructies voor de bezorging..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Je bestelling
                  </h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-600">Aantal: {item.quantity}</div>
                        </div>
                        <div className="font-medium">
                          €{(item.price / 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 mb-6 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotaal</span>
                      <span>€{(subtotal / 100).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {checkoutData.deliveryMethod === 'delivery' ? 'Bezorgkosten' : 'Ophalen'}
                      </span>
                      <span>
                        {deliveryFee === 0 ? 'Gratis' : `€${(deliveryFee / 100).toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold border-t pt-3">
                      <span>Totaal</span>
                      <span className="text-primary-600">€{(total / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Bestelling plaatsen...' : 'Bestelling plaatsen'}
                  </button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Door je bestelling te plaatsen ga je akkoord met onze voorwaarden.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}