import Medusa from '@medusajs/medusa-js'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

export const medusaClient = new Medusa({ 
  baseUrl: MEDUSA_BACKEND_URL,
  maxRetries: 3,
})

export type { 
  Product,
  ProductVariant,
  LineItem,
  Cart,
  Order,
  Region,
  PaymentSession,
  ShippingOption,
  Customer 
} from '@medusajs/medusa'