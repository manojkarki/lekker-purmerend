'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CakeIcon, ShoppingCartIcon, TrashIcon, MinusIcon, PlusIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const cartItems = cart.items

  const subtotal = cart.subtotal
  const deliveryFee = subtotal > 2500 ? 0 : 295 // Free delivery over €25
  const total = subtotal + deliveryFee

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
              <Link href="/producten" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Producten
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Contact
              </Link>
              <Link href="/cart" className="text-primary-600 font-medium relative">
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

      <div className="container py-8 sm:py-12">
        <div className="flex items-center gap-4 mb-8 px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Winkelwagen
          </h1>
          <span className="text-gray-500 text-sm sm:text-base">
            ({cart.totalItems} items)
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Je winkelwagen is leeg
            </h2>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">
              Voeg wat heerlijke producten toe om te beginnen!
            </p>
            <Link
              href="/producten"
              className="btn-primary inline-block"
            >
              Bekijk producten
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 px-4">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                      {item.image}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/producten/${item.handle}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 hover:text-primary-600 block truncate"
                      >
                        {item.title}
                      </Link>
                      <div className="text-primary-600 font-bold mt-1 text-sm sm:text-base">
                        €{(item.price / 100).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 border-l border-r border-gray-300 font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 sm:p-2 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 sticky top-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  Bestelling overzicht
                </h2>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotaal</span>
                    <span className="font-medium">€{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Bezorgkosten</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? 'Gratis' : `€${(deliveryFee / 100).toFixed(2)}`}
                    </span>
                  </div>
                  
                  {deliveryFee > 0 && (
                    <p className="text-sm text-gray-500">
                      Gratis bezorging vanaf €25,00
                    </p>
                  )}
                  
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Totaal</span>
                      <span className="text-primary-600">€{(total / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="btn-primary w-full text-center block"
                  >
                    Naar afrekenen
                  </Link>
                  
                  <Link
                    href="/producten"
                    className="block text-center text-primary-600 hover:text-primary-700"
                  >
                    Verder winkelen
                  </Link>
                </div>

                {/* Delivery Info */}
                <div className="mt-6 pt-6 border-t">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">
                      Bezorginformatie
                    </h3>
                    <p className="text-blue-800 text-sm">
                      Gratis bezorging in Purmerend vanaf €25,00. 
                      Ophalen mogelijk op afspraak.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Extra bottom spacing for mobile scroll */}
      <div className="pb-16 sm:pb-8"></div>
    </div>
  )
}