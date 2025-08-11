const { MedusaModule } = require('@medusajs/modules-sdk')
const { ModulesDefinition } = require('@medusajs/modules-sdk')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const productData = [
  {
    title: 'Chocoladetaart',
    handle: 'chocoladetaart',
    description: 'Rijke chocoladetaart met ganache en verse room',
    collection_id: null,
    weight: 1000,
    length: null,
    height: null,
    width: null,
    options: [
      {
        title: 'Maat',
        values: ['Klein (6 personen)', 'Groot (12 personen)']
      }
    ],
    variants: [
      {
        title: 'Chocoladetaart - Klein',
        sku: 'CHOC-SMALL',
        prices: [
          {
            amount: 2850,
            currency_code: 'eur'
          }
        ],
        inventory_quantity: 50,
        options: [{ value: 'Klein (6 personen)' }]
      },
      {
        title: 'Chocoladetaart - Groot',
        sku: 'CHOC-LARGE',
        prices: [
          {
            amount: 4850,
            currency_code: 'eur'
          }
        ],
        inventory_quantity: 50,
        options: [{ value: 'Groot (12 personen)' }]
      }
    ],
    metadata: {
      prep_time_hours: 4,
      same_day_cutoff: '12:00',
      estimation_rules: 'same_day_if_before_cutoff|next_day',
      category: 'taarten'
    }
  },
  {
    title: 'Appeltaart',
    handle: 'appeltaart',
    description: 'Klassieke Nederlandse appeltaart met kaneelkruim',
    collection_id: null,
    weight: 900,
    options: [
      {
        title: 'Maat',
        values: ['Regulier']
      }
    ],
    variants: [
      {
        title: 'Appeltaart',
        sku: 'APPLE-REG',
        prices: [
          {
            amount: 1850,
            currency_code: 'eur'
          }
        ],
        inventory_quantity: 50,
        options: [{ value: 'Regulier' }]
      }
    ],
    metadata: {
      prep_time_hours: 3,
      same_day_cutoff: '14:00',
      estimation_rules: 'same_day_if_before_cutoff|next_day',
      category: 'taarten'
    }
  },
  {
    title: 'Brownies (6 stuks)',
    handle: 'brownies',
    description: 'Zachte chocolade brownies met walnoten',
    collection_id: null,
    weight: 400,
    options: [
      {
        title: 'Verpakking',
        values: ['6 stuks']
      }
    ],
    variants: [
      {
        title: 'Brownies - 6 stuks',
        sku: 'BROWN-6',
        prices: [
          {
            amount: 1250,
            currency_code: 'eur'
          }
        ],
        inventory_quantity: 100,
        options: [{ value: '6 stuks' }]
      }
    ],
    metadata: {
      prep_time_hours: 2,
      same_day_cutoff: '15:00',
      estimation_rules: 'same_day_if_before_cutoff|next_day',
      category: 'snacks'
    }
  },
  {
    title: 'Stroopwafels (10 stuks)',
    handle: 'stroopwafels',
    description: 'Verse stroopwafels met karamelstroop',
    collection_id: null,
    weight: 300,
    options: [
      {
        title: 'Verpakking',
        values: ['10 stuks']
      }
    ],
    variants: [
      {
        title: 'Stroopwafels - 10 stuks',
        sku: 'STROOP-10',
        prices: [
          {
            amount: 950,
            currency_code: 'eur'
          }
        ],
        inventory_quantity: 100,
        options: [{ value: '10 stuks' }]
      }
    ],
    metadata: {
      prep_time_hours: 3,
      same_day_cutoff: '13:00',
      estimation_rules: 'same_day_if_before_cutoff|next_day',
      category: 'snacks'
    }
  },
  {
    title: 'Carrot Cake',
    handle: 'carrot-cake',
    description: 'Carrot cake met cream cheese frosting',
    collection_id: null,
    weight: 800,
    options: [
      {
        title: 'Maat',
        values: ['Regulier']
      }
    ],
    variants: [
      {
        title: 'Carrot Cake',
        sku: 'CARROT-REG',
        prices: [
          {
            amount: 2250,
            currency_code: 'eur'
          }
        ],
        inventory_quantity: 50,
        options: [{ value: 'Regulier' }]
      }
    ],
    metadata: {
      prep_time_hours: 5,
      same_day_cutoff: '11:00',
      estimation_rules: 'same_day_if_before_cutoff|next_day',
      category: 'taarten'
    }
  },
  {
    title: 'Koekjes Mix (20 stuks)',
    handle: 'koekjes-mix',
    description: 'Assortiment van verschillende koekjes',
    collection_id: null,
    weight: 500,
    options: [
      {
        title: 'Verpakking',
        values: ['20 stuks']
      }
    ],
    variants: [
      {
        title: 'Koekjes Mix - 20 stuks',
        sku: 'COOKIES-20',
        prices: [
          {
            amount: 1450,
            currency_code: 'eur'
          }
        ],
        inventory_quantity: 100,
        options: [{ value: '20 stuks' }]
      }
    ],
    metadata: {
      prep_time_hours: 2,
      same_day_cutoff: '16:00',
      estimation_rules: 'same_day_if_before_cutoff|next_day',
      category: 'koekjes'
    }
  }
]

async function seedProducts() {
  try {
    console.log('🌱 Starting Medusa product seeding...')
    
    // Import Medusa dependencies
    const { medusaIntegrationTestRunner } = require('medusa-test-utils')
    const { DataSource } = require('typeorm')
    
    // Database connection
    const dbConfig = {
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://medusa:medusa@localhost:5432/medusa',
      logging: false
    }
    
    const dataSource = new DataSource(dbConfig)
    await dataSource.initialize()
    
    // Import required services
    const ProductService = require('@medusajs/medusa/dist/services/product').default
    const ProductVariantService = require('@medusajs/medusa/dist/services/product-variant').default
    const RegionService = require('@medusajs/medusa/dist/services/region').default
    const SalesChannelService = require('@medusajs/medusa/dist/services/sales-channel').default
    
    const container = {
      productService: new ProductService({ manager: dataSource.manager }),
      productVariantService: new ProductVariantService({ manager: dataSource.manager }),
      regionService: new RegionService({ manager: dataSource.manager }),
      salesChannelService: new SalesChannelService({ manager: dataSource.manager })
    }
    
    // Get the default region
    const regions = await container.regionService.list()
    const defaultRegion = regions[0]
    
    if (!defaultRegion) {
      console.error('❌ No regions found. Please run Medusa migrations first.')
      return
    }
    
    // Get the default sales channel
    const salesChannels = await container.salesChannelService.list()
    const defaultSalesChannel = salesChannels[0]
    
    console.log(`✅ Using region: ${defaultRegion.name}`)
    console.log(`✅ Using sales channel: ${defaultSalesChannel?.name || 'Default'}`)
    
    // Create products
    for (const productInfo of productData) {
      try {
        console.log(`📦 Creating product: ${productInfo.title}`)
        
        // Create the product
        const product = await container.productService.create({
          title: productInfo.title,
          handle: productInfo.handle,
          description: productInfo.description,
          status: 'published',
          weight: productInfo.weight,
          metadata: productInfo.metadata,
          options: productInfo.options,
          sales_channels: defaultSalesChannel ? [{ id: defaultSalesChannel.id }] : undefined
        })
        
        console.log(`✅ Product created: ${product.title} (ID: ${product.id})`)
        
        // Create variants for this product
        for (const variantInfo of productInfo.variants) {
          const variant = await container.productVariantService.create(product.id, {
            title: variantInfo.title,
            sku: variantInfo.sku,
            inventory_quantity: variantInfo.inventory_quantity,
            prices: variantInfo.prices.map(price => ({
              ...price,
              region_id: defaultRegion.id
            })),
            options: variantInfo.options
          })
          console.log(`  ✅ Variant created: ${variant.title}`)
        }
        
      } catch (productError) {
        console.error(`❌ Error creating product ${productInfo.title}:`, productError.message)
      }
    }
    
    console.log('🎉 Product seeding completed!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  }
}

// Execute seeding
if (require.main === module) {
  seedProducts().catch(console.error)
}

module.exports = { seedProducts, productData }