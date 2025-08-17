import { medusaClient } from '@/lib/medusa'

// Product type that matches our current frontend usage
export interface Product {
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

// Transform Medusa product to our frontend format
function transformMedusaProduct(medusaProduct: any): Product {
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

// API functions
export async function getAllProducts(): Promise<Product[]> {
  // Check if we're running in the browser
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      const data = await response.json()
      return data.products || []
    } catch (error) {
      console.error('Error fetching products from API route:', error)
      throw error
    }
  }

  try {
    const { products } = await medusaClient.products.list()
    return products.map(transformMedusaProduct)
  } catch (error) {
    console.error('Error fetching products from Medusa:', error)
    throw error
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const { products } = await medusaClient.products.list({ handle })
    const product = products?.[0]
    return product ? transformMedusaProduct(product) : null
  } catch (error) {
    console.error(`Error fetching product ${handle} from Medusa:`, error)
    throw error
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { product } = await medusaClient.products.retrieve(id)
    return product ? transformMedusaProduct(product) : null
  } catch (error) {
    console.error(`Error fetching product ${id} from Medusa:`, error)
    throw error
  }
}

// Service object for consistent API
export const ProductService = {
  getAllProducts,
  getProductByHandle,
  getProductById
}