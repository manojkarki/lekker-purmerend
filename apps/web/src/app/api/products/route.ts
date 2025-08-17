import { NextRequest, NextResponse } from 'next/server'
import Medusa from '@medusajs/medusa-js'

// Use Docker service name for server-side requests
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://medusa:9000'

const medusaClient = new Medusa({ 
  baseUrl: MEDUSA_BACKEND_URL,
  maxRetries: 3,
})

// Transform Medusa product to our frontend format
function transformMedusaProduct(medusaProduct: any) {
  const firstVariant = medusaProduct.variants?.[0]
  const price = firstVariant?.prices?.[0]?.amount || 0
  
  return {
    id: medusaProduct.id,
    title: medusaProduct.title,
    handle: medusaProduct.handle,
    description: medusaProduct.description || '',
    price: price,
    image: medusaProduct.thumbnail || '🎂', // Fallback to emoji
    prep_time_hours: parseInt(medusaProduct.metadata?.prep_time_hours || '2'),
    same_day_cutoff: medusaProduct.metadata?.same_day_cutoff || '14:00',
    category: medusaProduct.metadata?.category || 'general',
    // Additional fields for detail page
    gallery: medusaProduct.images?.map((img: any) => img.url) || [medusaProduct.thumbnail || '🎂'],
    // These would come from metadata or separate content
    ingredients: medusaProduct.metadata?.ingredients?.split(',') || undefined,
    allergens: medusaProduct.metadata?.allergens?.split(',') || undefined,
    nutrition: medusaProduct.metadata?.nutrition ? JSON.parse(medusaProduct.metadata.nutrition) : undefined
  }
}

export async function GET(request: NextRequest) {
  try {
    const { products } = await medusaClient.products.list()
    const transformedProducts = products.map(transformMedusaProduct)
    
    return NextResponse.json({
      success: true,
      products: transformedProducts,
      count: products.length
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}