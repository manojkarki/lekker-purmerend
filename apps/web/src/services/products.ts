import { medusaClient } from '@/lib/medusa'

// Environment flag to toggle between mock and real data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

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

// Mock data (current static data)
const mockProducts: Product[] = [
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

// Transform Medusa product to our frontend format
function transformMedusaProduct(medusaProduct: any): Product {
  const firstVariant = medusaProduct.variants?.[0]
  // Fallback to mock data prices if no prices are set in Medusa
  let price = firstVariant?.prices?.[0]?.amount || 0
  
  // Temporary fallback prices based on handle until we set up proper pricing
  if (price === 0) {
    const fallbackPrices: { [key: string]: number } = {
      'chocoladetaart': 2850,
      'appeltaart': 1850,
      'brownies': 1250
    }
    price = fallbackPrices[medusaProduct.handle] || 1000
  }
  
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
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock product data')
    return Promise.resolve(mockProducts)
  }

  try {
    console.log('🌐 Fetching products from Medusa API')
    const { products } = await medusaClient.products.list()
    return products.map(transformMedusaProduct)
  } catch (error) {
    console.error('❌ Error fetching products from Medusa, falling back to mock data:', error)
    return mockProducts
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (USE_MOCK_DATA) {
    console.log(`🔧 Using mock product data for handle: ${handle}`)
    return Promise.resolve(mockProducts.find(p => p.handle === handle) || null)
  }

  try {
    console.log(`🌐 Fetching product ${handle} from Medusa API`)
    const { products } = await medusaClient.products.list({ handle })
    const product = products?.[0]
    return product ? transformMedusaProduct(product) : null
  } catch (error) {
    console.error(`❌ Error fetching product ${handle} from Medusa, falling back to mock data:`, error)
    return mockProducts.find(p => p.handle === handle) || null
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (USE_MOCK_DATA) {
    console.log(`🔧 Using mock product data for ID: ${id}`)
    return Promise.resolve(mockProducts.find(p => p.id === id) || null)
  }

  try {
    console.log(`🌐 Fetching product ${id} from Medusa API`)
    const { product } = await medusaClient.products.retrieve(id)
    return product ? transformMedusaProduct(product) : null
  } catch (error) {
    console.error(`❌ Error fetching product ${id} from Medusa, falling back to mock data:`, error)
    return mockProducts.find(p => p.id === id) || null
  }
}