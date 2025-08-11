// API service utilities for Medusa and Strapi integration

const MEDUSA_API_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337/api';

// Medusa API types
export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  status: string;
  metadata: {
    prep_time_hours?: string;
    same_day_cutoff?: string;
    estimation_rules?: string;
    category?: string;
  };
  variants: Array<{
    id: string;
    title: string;
    prices: Array<{
      amount: number;
      currency_code: string;
    }>;
    inventory_quantity: number;
  }>;
  images?: Array<{
    id: string;
    url: string;
  }>;
}

export interface MedusaProductsResponse {
  products: MedusaProduct[];
  count: number;
  offset: number;
  limit: number;
}

// Strapi API types
export interface StrapiPost {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured?: boolean;
    category: string;
    readingTime?: number;
    publishedAt: string;
    updatedAt: string;
    createdAt: string;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string;
    };
    coverImage?: {
      data?: {
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
  };
}

export interface StrapiPostsResponse {
  data: StrapiPost[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Medusa API functions
export async function fetchMedusaProducts(): Promise<MedusaProduct[]> {
  try {
    const response = await fetch(`${MEDUSA_API_URL}/store/products`);
    if (!response.ok) {
      throw new Error(`Medusa API error: ${response.status}`);
    }
    const data: MedusaProductsResponse = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching Medusa products:', error);
    return [];
  }
}

export async function fetchMedusaProduct(handle: string): Promise<MedusaProduct | null> {
  try {
    const response = await fetch(`${MEDUSA_API_URL}/store/products/${handle}`);
    if (!response.ok) {
      throw new Error(`Medusa API error: ${response.status}`);
    }
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching Medusa product:', error);
    return null;
  }
}

// Strapi API functions
export async function fetchStrapiBlogPosts(): Promise<StrapiPost[]> {
  try {
    const response = await fetch(`${STRAPI_API_URL}/posts?populate=*&sort=publishedAt:desc`);
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }
    const data: StrapiPostsResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Strapi posts:', error);
    return [];
  }
}

export async function fetchStrapiBlogPost(slug: string): Promise<StrapiPost | null> {
  try {
    const response = await fetch(`${STRAPI_API_URL}/posts?filters[slug][$eq]=${slug}&populate=*`);
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }
    const data: StrapiPostsResponse = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error('Error fetching Strapi post:', error);
    return null;
  }
}

// Transform functions to convert API responses to frontend format
export function transformMedusaProduct(product: MedusaProduct) {
  const mainVariant = product.variants[0];
  const price = mainVariant?.prices?.find(p => p.currency_code === 'eur')?.amount || 0;
  
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    price: price,
    image: product.images?.[0]?.url || '🎂', // fallback to emoji for now
    prep_time_hours: parseInt(product.metadata?.prep_time_hours || '0'),
    same_day_cutoff: product.metadata?.same_day_cutoff || '12:00',
    category: product.metadata?.category || 'general'
  };
}

export function transformStrapiPost(post: StrapiPost) {
  return {
    id: post.id,
    title: post.attributes.title,
    slug: post.attributes.slug,
    excerpt: post.attributes.excerpt || '',
    publishedAt: post.attributes.publishedAt,
    readingTime: post.attributes.readingTime || 5,
    category: post.attributes.category,
    featured: post.attributes.featured || false,
    coverImage: post.attributes.coverImage?.data?.attributes?.url || '📝',
    content: post.attributes.content
  };
}

// Utility function to check API health
export async function checkAPIHealth() {
  const results = {
    medusa: false,
    strapi: false
  };
  
  try {
    const medusaResponse = await fetch(`${MEDUSA_API_URL}/health`);
    results.medusa = medusaResponse.ok;
  } catch (error) {
    results.medusa = false;
  }
  
  try {
    const strapiResponse = await fetch(`${STRAPI_API_URL}/posts?pagination[limit]=1`);
    results.strapi = strapiResponse.ok;
  } catch (error) {
    results.strapi = false;
  }
  
  return results;
}