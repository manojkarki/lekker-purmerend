import { BlogPost } from '@lekker/shared-types'

const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337/api'
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'

class StrapiAPI {
  private baseUrl: string
  private apiUrl: string

  constructor() {
    this.baseUrl = STRAPI_URL
    this.apiUrl = STRAPI_API_URL
  }

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Strapi API Error for ${endpoint}:`, error)
      throw error
    }
  }

  async getPosts(options: {
    limit?: number
    start?: number
    featured?: boolean
    category?: string
  } = {}): Promise<{ data: BlogPost[]; meta: any }> {
    const searchParams = new URLSearchParams()
    
    // Pagination
    if (options.limit) searchParams.set('limit', options.limit.toString())
    if (options.start) searchParams.set('start', options.start.toString())
    
    // Filters
    if (options.featured) searchParams.set('featured', 'true')
    if (options.category) searchParams.set('category', options.category)

    // Use the Next.js API route instead of calling Strapi directly
    const url = `/api/blog?${searchParams.toString()}`
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Blog API Error:`, error)
      throw error
    }
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    try {
      const result = await this.fetchAPI(
        `/posts?filters[slug][$eq]=${slug}&populate=coverImage,seo,seo.ogImage`
      )
      
      return result.data?.[0] || null
    } catch (error) {
      console.error(`Error fetching post with slug ${slug}:`, error)
      return null
    }
  }

  getImageUrl(imageData: any): string {
    if (!imageData?.data?.attributes?.url) return ''
    
    const url = imageData.data.attributes.url
    return url.startsWith('http') ? url : `${this.baseUrl}${url}`
  }
}

export const strapiAPI = new StrapiAPI()