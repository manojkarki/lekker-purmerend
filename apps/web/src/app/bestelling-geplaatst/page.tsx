'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon, CakeIcon, MapPinIcon, CreditCardIcon } from '@heroicons/react/24/outline'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const paymentMethod = searchParams.get('payment')
  const deliveryMethod = searchParams.get('delivery')

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
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bestelling Geplaatst!
            </h1>
            
            <p className="text-lg text-gray-600 mb-2">
              Bedankt voor je bestelling. We hebben je bestelling ontvangen.
            </p>
            
            {orderId && (
              <p className="text-sm text-gray-500">
                Bestelnummer: <span className="font-mono font-medium">{orderId}</span>
              </p>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Wat gebeurt er nu?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Bestelling Bevestigd</h3>
                  <p className="text-sm text-gray-600">
                    Je bestelling is ontvangen en we beginnen met de bereiding.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Bereiding</h3>
                  <p className="text-sm text-gray-600">
                    We bereiden je bestelling met verse ingrediënten.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">3</span>
                  </div>
                </div>
                <div>
                  {deliveryMethod === 'delivery' ? (
                    <>
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        Bezorging
                      </h3>
                      <p className="text-sm text-gray-600">
                        We bezorgen je bestelling op het opgegeven adres.
                        {paymentMethod === 'cash' && (
                          <span className="block mt-1 font-medium">
                            💰 Betaling: Contant bij bezorging
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <CakeIcon className="w-4 h-4" />
                        Ophalen
                      </h3>
                      <p className="text-sm text-gray-600">
                        Je bestelling is klaar om op te halen op het afgesproken tijdstip.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-medium text-blue-900 mb-2">
              Vragen over je bestelling?
            </h3>
            <p className="text-sm text-blue-800">
              Neem contact met ons op via{' '}
              <Link href="/contact" className="underline hover:no-underline">
                onze contactpagina
              </Link>{' '}
              of bel ons direct.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/producten"
              className="btn-outline flex-1 sm:flex-initial text-center"
            >
              Verder Winkelen
            </Link>
            <Link 
              href="/"
              className="btn-primary flex-1 sm:flex-initial text-center"
            >
              Naar Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}