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
    if (options.limit) searchParams.set('pagination[limit]', options.limit.toString())
    if (options.start) searchParams.set('pagination[start]', options.start.toString())
    
    // Filters
    if (options.featured) searchParams.set('filters[featured][$eq]', 'true')
    if (options.category) searchParams.set('filters[category][$eq]', options.category)
    
    // Sort by creation date (newest first)
    searchParams.set('sort', 'createdAt:desc')
    
    // Populate relations
    searchParams.set('populate', 'coverImage,seo,seo.ogImage')

    const result = await this.fetchAPI(`/posts?${searchParams.toString()}`)
    return result
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