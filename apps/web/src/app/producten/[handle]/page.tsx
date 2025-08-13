'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CakeIcon, ShoppingCartIcon, HeartIcon, ClockIcon, MapPinIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { DeliveryBadge } from '@/components/DeliveryEstimate'
import { ProductGallery } from '@/components/ProductGallery'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: string
  title: string
  handle: string
  description: string
  price: number
  image: string
  prep_time_hours: number
  same_day_cutoff: string
  category: string
  gallery?: string[]
  ingredients?: string[]
  allergens?: string[]
  nutrition?: {
    calories: number
    fat: number
    carbs: number
    protein: number
  }
}

export default function ProductDetailPage({ params }: { params: { handle: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { addItem, cart } = useCart()
  
  // Mock product data (same as in products page)
  const products: Product[] = [
    {
      id: '1',
      title: 'Chocoladetaart',
      handle: 'chocoladetaart',
      description: 'Rijke chocoladetaart met ganache en verse room. Deze luxueuze taart wordt gemaakt met de beste Belgische chocolade en vers geklopte room. Perfect voor speciale gelegenheden.',
      price: 2850,
      image: '🍫',
      prep_time_hours: 4,
      same_day_cutoff: '12:00',
      category: 'taarten',
      gallery: ['🍫', '🍰', '🎂'],
      ingredients: ['Belgische chocolade', 'Verse room', 'Eieren', 'Boter', 'Suiker', 'Bloem', 'Vanille'],
      allergens: ['Gluten', 'Lactose', 'Eieren'],
      nutrition: {
        calories: 450,
        fat: 28,
        carbs: 42,
        protein: 8
      }
    },
    {
      id: '2',
      title: 'Appeltaart',
      handle: 'appeltaart',
      description: 'Klassieke Nederlandse appeltaart met kaneelkruim. Gemaakt met verse Goudreinet appels en huisgemaakte kruimlaag.',
      price: 1850,
      image: '🍎',
      prep_time_hours: 3,
      same_day_cutoff: '14:00',
      category: 'taarten',
      gallery: ['🍎', '🥧', '🍰'],
      ingredients: ['Goudreinet appels', 'Bloem', 'Boter', 'Suiker', 'Kaneel', 'Rozijnen'],
      allergens: ['Gluten', 'Lactose'],
      nutrition: {
        calories: 320,
        fat: 14,
        carbs: 48,
        protein: 4
      }
    },
    {
      id: '3',
      title: 'Brownies (6 stuks)',
      handle: 'brownies',
      description: 'Zachte chocolade brownies met walnoten. Deze fudgy brownies zijn rijk aan chocolade en hebben een perfecte chewy textuur.',
      price: 1250,
      image: '🧁',
      prep_time_hours: 2,
      same_day_cutoff: '15:00',
      category: 'snacks',
      gallery: ['🧁', '🍫', '🥜'],
      ingredients: ['Pure chocolade', 'Walnoten', 'Boter', 'Eieren', 'Suiker', 'Bloem'],
      allergens: ['Gluten', 'Lactose', 'Eieren', 'Noten'],
      nutrition: {
        calories: 380,
        fat: 22,
        carbs: 38,
        protein: 6
      }
    }
  ]

  const product = products.find(p => p.handle === params.handle)

  if (!product) {
    notFound()
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // Add items one by one based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        title: product.title,
        handle: product.handle,
        price: product.price,
        image: product.image,
        prep_time_hours: product.prep_time_hours
      })
    }
    
    // Show success message
    alert(`${quantity}x ${product.title} toegevoegd aan winkelwagen!`)
    
    // Reset quantity
    setQuantity(1)
  }

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
        <div className="sm:hidden bg-white border-b border-gray-200 shadow-lg">
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

      {/* Breadcrumbs */}
      <div className="container py-4">
        <nav className="text-sm px-4">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/producten" className="text-gray-500 hover:text-primary-600">Producten</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 px-4">
          {/* Product Images */}
          <div>
            <ProductGallery 
              images={product.gallery || [product.image]}
              title={product.title}
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <DeliveryBadge 
                prepTimeHours={product.prep_time_hours}
                cutoffTime={product.same_day_cutoff}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {product.title}
            </h1>

            <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-6">
              €{(product.price / 100).toFixed(2)}
            </div>

            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Delivery Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm sm:text-base">Bezorging & Ophalen</span>
              </div>
              <p className="text-blue-800 text-xs sm:text-sm">
                Gratis bezorging in Purmerend • Ophalen mogelijk op afspraak
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 text-lg"
                >
                  −
                </button>
                <span className="px-4 py-2 border-l border-r border-gray-300 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm sm:text-base px-4 py-2.5"
              >
                <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Toevoegen aan winkelwagen</span>
                <span className="sm:hidden">Toevoegen</span>
              </button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2.5 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 w-fit self-center sm:self-auto"
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                )}
              </button>
            </div>

            {/* Product Details Tabs */}
            <div className="border-t pt-6 sm:pt-8">
              <div className="space-y-4 sm:space-y-6">
                {/* Ingredients */}
                {product.ingredients && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Ingrediënten</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {product.ingredients.join(', ')}
                    </p>
                  </div>
                )}

                {/* Allergens */}
                {product.allergens && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Allergenen</h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {product.allergens.map((allergen) => (
                        <span 
                          key={allergen}
                          className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs sm:text-sm"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutrition */}
                {product.nutrition && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Voedingswaarde (per portie)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calorieën:</span>
                        <span className="font-medium">{product.nutrition.calories} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vetten:</span>
                        <span className="font-medium">{product.nutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Koolhydraten:</span>
                        <span className="font-medium">{product.nutrition.carbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Eiwitten:</span>
                        <span className="font-medium">{product.nutrition.protein}g</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 px-4">
            Andere producten die je misschien leuk vindt
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
            {products.filter(p => p.id !== product.id).map((relatedProduct) => (
              <Link 
                key={relatedProduct.id}
                href={`/producten/${relatedProduct.handle}`}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-product bg-gray-100 flex items-center justify-center text-4xl">
                  {relatedProduct.image}
                </div>
                
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    {relatedProduct.title}
                  </h3>
                  
                  <div className="text-base sm:text-lg font-bold text-primary-600">
                    €{(relatedProduct.price / 100).toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Extra bottom spacing for mobile scroll */}
      <div className="pb-16 sm:pb-8"></div>
    </div>
  )
}