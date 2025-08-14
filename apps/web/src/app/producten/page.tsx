'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CakeIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { DeliveryBadge } from '@/components/DeliveryEstimate'
import { useCart } from '@/contexts/CartContext'
import { getAllProducts, type Product } from '@/services/products'

export default function ProductenPage() {
  const { cart } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const productData = await getAllProducts()
        setProducts(productData)
      } catch (err) {
        setError('Er ging iets mis bij het laden van de producten')
        console.error('Error loading products:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <CakeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Lekker Purmerend
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-3 lg:gap-6">
              <Link href="/producten" className="text-primary-600 font-medium text-sm lg:text-base">
                Producten
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Contact
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-primary-600 relative">
                <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              </Link>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              <Link href="/cart" className="relative p-2">
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-primary-600"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
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
                className="text-primary-600 font-medium py-2 px-4 rounded-md"
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

      <div className="container py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Ons Assortiment
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Verse huisgemaakte lekkernijen, elke dag met liefde bereid
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Producten laden...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
        )}
      </div>
      
      {/* Extra bottom spacing for mobile scroll */}
      <div className="pb-16 sm:pb-8"></div>
    </div>
  )
}