'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CakeIcon, CalendarIcon, ClockIcon, ArrowLeftIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import { strapiAPI } from '@/lib/strapi'
import { BlogPost } from '@lekker/shared-types'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { cart } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Category mapping from Strapi enum values to display labels
  const categoryMapping = {
    'recepten': 'Recepten',
    'tips': 'Tips', 
    'nieuws': 'Nieuws',
    'achter-de-schermen': 'Achter de schermen'
  }

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        const fetchedPost = await strapiAPI.getPost(params.slug)
        
        if (!fetchedPost) {
          notFound()
          return
        }
        
        setPost(fetchedPost)
        
        // Fetch related posts from the same category
        if (fetchedPost.attributes?.category) {
          const related = await strapiAPI.getPosts({ 
            category: fetchedPost.attributes.category,
            limit: 4 
          })
          // Filter out current post and limit to 3
          const filteredRelated = related.data
            .filter(p => p.id !== fetchedPost.id)
            .slice(0, 3)
          setRelatedPosts(filteredRelated)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Er ging iets mis bij het laden van dit blogbericht. Probeer het later opnieuw.')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Blogbericht laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-12">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800">{error || 'Blogbericht niet gevonden'}</p>
              <Link href="/blog" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                Terug naar blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Remove all mock data - keeping only the structure for compilation

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

      {/* Breadcrumbs */}
      <div className="container py-4">
        <nav className="text-sm px-4">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/blog" className="text-gray-500 hover:text-primary-600">Blog</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 truncate">
            {post?.attributes?.title || 'Loading...'}
          </span>
        </nav>
      </div>

      <div className="container pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Terug naar blog
          </Link>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Blogbericht laden...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800">{error}</p>
                <Link href="/blog" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                  Terug naar blog
                </Link>
              </div>
            </div>
          )}

          {/* Article Content */}
          {!loading && !error && post && post.attributes && (
            <>
              {/* Article Header */}
              <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Cover Image */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {(() => {
                    const coverImageUrl = strapiAPI.getImageUrl(post.attributes.coverImage)
                    
                    return coverImageUrl ? (
                      <img 
                        src={coverImageUrl}
                        alt={post.attributes.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-8xl">📝</div>
                    )
                  })()} 
                </div>

                {/* Article Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {categoryMapping[post.attributes.category] || post.attributes.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(post.attributes.publishedAt).toLocaleDateString('nl-NL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <ClockIcon className="w-4 h-4" />
                      {post.attributes.readingTime || 3} min leestijd
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.attributes.title}
                  </h1>

                  {/* Content */}
                  <div className="prose prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: post.attributes.content }} />
                  </div>
                </div>
              </article>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Meer uit {categoryMapping[post.attributes.category] || post.attributes.category}
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {relatedPosts.map((relatedPost) => {
                      if (!relatedPost.attributes) return null
                      
                      const relatedCoverImageUrl = strapiAPI.getImageUrl(relatedPost.attributes.coverImage)
                      
                      return (
                        <Link 
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.attributes.slug}`}
                          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-video bg-gray-100 flex items-center justify-center">
                            {relatedCoverImageUrl ? (
                              <img 
                                src={relatedCoverImageUrl}
                                alt={relatedPost.attributes.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-4xl">📝</div>
                            )}
                          </div>
                          
                          <div className="p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {relatedPost.attributes.title}
                            </h3>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {relatedPost.attributes.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(relatedPost.attributes.publishedAt).toLocaleDateString('nl-NL')}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {relatedPost.attributes.readingTime || 3} min
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    }).filter(Boolean)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Extra bottom spacing for mobile scroll */}
      <div className="pb-16 sm:pb-8"></div>
    </div>
  )
}