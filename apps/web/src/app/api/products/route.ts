import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts } from '@/services/products'

export async function GET(req: NextRequest) {
  try {
    console.log('API: Getting all products...')
    const products = await getAllProducts()
    console.log(`API: Found ${products.length} products`)
    
    return NextResponse.json({
      success: true,
      products,
      count: products.length
    })
    
  } catch (error) {
    console.error('API: Error getting products:', error)
    return NextResponse.json({ 
      error: 'Failed to get products', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}