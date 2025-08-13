'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CakeIcon, TruckIcon, HeartIcon, ClockIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { DeliveryBadge } from '@/components/DeliveryEstimate'

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock data for demonstration
  const featuredProducts = [
    {
      id: '1',
      title: 'Chocoladetaart',
      handle: 'chocoladetaart',
      description: 'Rijke chocoladetaart met verse room en ganache',
      price: 2850,
      images: ['/images/chocolate-cake-1.jpg', '/images/chocolate-cake-2.jpg'],
      prep_time_hours: 4,
      same_day_cutoff: '12:00'
    },
    {
      id: '2',
      title: 'Appeltaart',
      handle: 'appeltaart',
      description: 'Klassieke Nederlandse appeltaart met kaneelkruim',
      price: 1850,
      images: ['/images/apple-pie-1.jpg'],
      prep_time_hours: 3,
      same_day_cutoff: '14:00'
    },
    {
      id: '3',
      title: 'Brownies (6 stuks)',
      handle: 'brownies',
      description: 'Zachte chocolade brownies met walnoten',
      price: 1250,
      images: ['/images/brownies-1.jpg'],
      prep_time_hours: 2,
      same_day_cutoff: '15:00'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <CakeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Lekker Purmerend
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 lg:gap-6">
              <Link href="/producten" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Producten
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Contact
              </Link>
            </div>
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-primary-600"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200 shadow-lg relative z-50">
          <div className="container py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/producten" 
                className="text-gray-700 hover:text-primary-600 py-2 px-4 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Producten
              </Link>
              <Link 
                href="/blog" 
                className="text-gray-700 hover:text-primary-600 py-2 px-4 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-primary-600 py-2 px-4 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12 sm:py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto px-4">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 text-balance leading-tight">
              Verse huisgemaakte
              <span className="text-primary-600"> lekkernijen</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 text-balance leading-relaxed">
              Uit de keuken van Purmerend. Dagvers gemaakt met liefde en de beste ingrediënten. 
              Bestel online voor bezorging of kom langs voor ophalen.
            </p>
            <div className="flex justify-center">
              <Link href="/producten" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3">
                Bekijk ons assortiment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Met liefde gemaakt</h3>
              <p className="text-gray-600">
                Elke taart en elk koekje wordt met zorg en aandacht bereid in onze keuken.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dagvers</h3>
              <p className="text-gray-600">
                Alles wordt vers op bestelling gemaakt, zodat je altijd de beste kwaliteit krijgt.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gratis bezorging</h3>
              <p className="text-gray-600">
                Binnen Purmerend bezorgen we gratis bij je thuis. Ook ophalen is mogelijk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Onze specialiteiten
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Een selectie van onze meest populaire lekkernijen
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card">
                <div className="aspect-product relative bg-gray-100">
                  {/* Placeholder for product image */}
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    🍰
                  </div>
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
          
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/producten" className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3">
              Alle producten bekijken
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 pb-16 sm:pb-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CakeIcon className="w-6 h-6" />
                <span className="text-lg font-semibold">Lekker Purmerend</span>
              </div>
              <p className="text-gray-300">
                Verse huisgemaakte taarten, koekjes en snacks uit het hart van Purmerend.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/producten" className="hover:text-white">Producten</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/over-ons" className="hover:text-white">Over ons</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-300">
                <p>📍 Hoofdstraat 123<br />1441 AA Purmerend</p>
                <p>📧 info@lekkerpurmerend.nl</p>
                <p>📞 0299 123 456</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Lekker Purmerend. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}