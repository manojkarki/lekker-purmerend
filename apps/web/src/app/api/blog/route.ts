import { NextRequest, NextResponse } from 'next/server'

const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://strapi:1337/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const start = searchParams.get('start')
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (limit) queryParams.set('pagination[limit]', limit)
    if (start) queryParams.set('pagination[start]', start)
    if (featured) queryParams.set('filters[featured][$eq]', featured)
    if (category) queryParams.set('filters[category][$eq]', category)
    
    // Sort by creation date (newest first)
    queryParams.set('sort', 'createdAt:desc')
    
    // Populate relations
    queryParams.set('populate', 'coverImage,seo,seo.ogImage')

    const url = `${STRAPI_API_URL}/posts?${queryParams.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Strapi API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
