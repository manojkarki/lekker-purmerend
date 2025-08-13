'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CakeIcon, CalendarIcon, ClockIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'

export default function BlogPage() {
  const { cart } = useCart()
  const [selectedCategory, setSelectedCategory] = useState('Alle berichten')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Mock blog data
  const posts = [
    {
      id: 1,
      title: 'De perfecte chocoladetaart: tips van een bakker',
      slug: 'perfecte-chocoladetaart-tips',
      excerpt: 'Ontdek de geheimen achter onze populairste chocoladetaart en leer hoe je thuis de perfecte textuur kunt bereiken.',
      publishedAt: '2025-01-10',
      readingTime: 5,
      category: 'Recepten',
      featured: true,
      coverImage: '🍫'
    },
    {
      id: 2,
      title: 'Seizoensgebonden ingrediënten in de winter',
      slug: 'seizoensgebonden-ingredienten-winter',
      excerpt: 'Waarom we in de winter kiezen voor bepaalde ingrediënten en hoe dit de smaak van onze producten beïnvloedt.',
      publishedAt: '2025-01-08',
      readingTime: 3,
      category: 'Achter de schermen',
      featured: false,
      coverImage: '🍎'
    },
    {
      id: 3,
      title: 'Nieuwe stroopwafel receptuur gelanceerd!',
      slug: 'nieuwe-stroopwafel-receptuur',
      excerpt: 'Na maanden testen hebben we onze stroopwafel receptuur geperfectioneerd. Proef het verschil!',
      publishedAt: '2025-01-05',
      readingTime: 2,
      category: 'Nieuws',
      featured: false,
      coverImage: '🥧'
    },
    {
      id: 4,
      title: '5 tips voor het bewaren van je taart',
      slug: 'tips-bewaren-taart',
      excerpt: 'Leer hoe je je huisgemaakte taart het beste kunt bewaren voor optimale versheid en smaak.',
      publishedAt: '2025-01-03',
      readingTime: 4,
      category: 'Tips',
      featured: false,
      coverImage: '💡'
    },
    {
      id: 5,
      title: 'Glutenvrije alternatieven: zo doe je dat',
      slug: 'glutenvrije-alternatieven-tips',
      excerpt: 'Praktische tips voor het maken van heerlijke glutenvrije gebakjes zonder in te leveren op smaak.',
      publishedAt: '2025-01-01',
      readingTime: 6,
      category: 'Tips',
      featured: false,
      coverImage: '🌾'
    },
    {
      id: 6,
      title: 'Ons nieuwe atelier: een kijkje achter de schermen',
      slug: 'nieuw-atelier-achter-schermen',
      excerpt: 'We nemen je mee voor een rondleiding door ons vernieuwde atelier waar alle magie gebeurt.',
      publishedAt: '2024-12-28',
      readingTime: 3,
      category: 'Achter de schermen',
      featured: false,
      coverImage: '🏠'
    }
  ]

  const categories = ['Alle berichten', 'Recepten', 'Tips', 'Nieuws', 'Achter de schermen']
  
  // Filter posts based on selected category
  const filteredPosts = selectedCategory === 'Alle berichten' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)

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
              <Link href="/blog" className="text-primary-600 font-medium text-sm lg:text-base">
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
                className="text-gray-700 hover:text-primary-600 py-2 px-4 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Producten
              </Link>
              <Link 
                href="/blog" 
                className="text-primary-600 font-medium py-2 px-4 rounded-md"
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

      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog & Verhalen
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verhalen, tips en recepten uit onze keuken
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12 px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 flex items-center justify-center text-4xl">
                {post.coverImage}
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(post.publishedAt).toLocaleDateString('nl-NL')}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {post.readingTime} min
                  </div>
                </div>
                
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Lees verder →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blijf op de hoogte
          </h2>
          <p className="text-gray-600 mb-6">
            Ontvang onze nieuwste recepten, tips en verhalen rechtstreeks in je inbox
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Je emailadres"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button className="btn-primary px-6">
              Aanmelden
            </button>
          </div>
        </div>
      </div>
      
      {/* Extra bottom spacing for mobile scroll */}
      <div className="pb-16 sm:pb-8"></div>
    </div>
  )
}