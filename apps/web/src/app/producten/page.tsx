'use client'

import Link from 'next/link'
import { CakeIcon } from '@heroicons/react/24/outline'
import { DeliveryBadge } from '@/components/DeliveryEstimate'

export default function ProductenPage() {
  // Mock product data
  const products = [
    {
      id: '1',
      title: 'Chocoladetaart',
      handle: 'chocoladetaart',
      description: 'Rijke chocoladetaart met ganache en verse room',
      price: 2850,
      image: '🍫',
      prep_time_hours: 4,
      same_day_cutoff: '12:00',
      category: 'taarten'
    },
    {
      id: '2',
      title: 'Appeltaart',
      handle: 'appeltaart',
      description: 'Klassieke Nederlandse appeltaart met kaneelkruim',
      price: 1850,
      image: '🍎',
      prep_time_hours: 3,
      same_day_cutoff: '14:00',
      category: 'taarten'
    },
    {
      id: '3',
      title: 'Brownies (6 stuks)',
      handle: 'brownies',
      description: 'Zachte chocolade brownies met walnoten',
      price: 1250,
      image: '🧁',
      prep_time_hours: 2,
      same_day_cutoff: '15:00',
      category: 'snacks'
    }
  ]

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
            <div className="flex items-center gap-6">
              <Link href="/producten" className="text-primary-600 font-medium">
                Producten
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ons Assortiment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verse huisgemaakte lekkernijen, elke dag met liefde bereid
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-product bg-gray-100 flex items-center justify-center text-6xl">
                {product.image}
              </div>
              
              <div className="p-6">
                <div className="mb-3">
                  <DeliveryBadge 
                    prepTimeHours={product.prep_time_hours}
                    cutoffTime={product.same_day_cutoff}
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">
                    €{(product.price / 100).toFixed(2)}
                  </span>
                  
                  <Link 
                    href={`/producten/${product.handle}`}
                    className="btn-primary"
                  >
                    Bestellen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}