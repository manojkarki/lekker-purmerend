'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CakeIcon, CalendarIcon, ClockIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import { strapiAPI } from '@/lib/strapi'
import { BlogPost } from '@lekker/shared-types'

export default function BlogPage() {
  const { cart } = useCart()
  const [selectedCategory, setSelectedCategory] = useState('Alle berichten')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Category mapping from Strapi enum values to display labels
  const categoryMapping = {
    'recepten': 'Recepten',
    'tips': 'Tips', 
    'nieuws': 'Nieuws',
    'achter-de-schermen': 'Achter de schermen'
  }

  const categories = ['Alle berichten', 'Recepten', 'Tips', 'Nieuws', 'Achter de schermen']

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const result = await strapiAPI.getPosts()
        setPosts(result.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('Er ging iets mis bij het laden van de blogberichten. Probeer het later opnieuw.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])
  
  // Filter posts based on selected category
  const filteredPosts = selectedCategory === 'Alle berichten' 
    ? posts 
    : posts.filter(post => {
        const attributes = post.attributes
        if (!attributes) return false
        const postCategory = categoryMapping[attributes.category] || attributes.category
        return postCategory === selectedCategory
      })

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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Blogberichten laden...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => {
              if (!post.attributes) return null
              
              const { attributes } = post
              const coverImageUrl = strapiAPI.getImageUrl(attributes.coverImage)
              const displayCategory = categoryMapping[attributes.category] || attributes.category
              
              return (
                <article key={post.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {coverImageUrl ? (
                      <img 
                        src={coverImageUrl}
                        alt={attributes.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">📝</div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        {displayCategory}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {attributes.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {attributes.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(attributes.publishedAt).toLocaleDateString('nl-NL')}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {attributes.readingTime || 3} min
                      </div>
                    </div>
                    
                    <Link
                      href={`/blog/${attributes.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Lees verder →
                    </Link>
                  </div>
                </article>
              )
            }).filter(Boolean)}
          </div>
        )}

        {/* No Posts Message */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-gray-600">Geen blogberichten gevonden voor deze categorie.</p>
            </div>
          </div>
        )}

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