require('dotenv').config()
const { createDefaultsBase } = require('@medusajs/medusa')

async function seedProducts() {
  const { container } = createDefaultsBase()
  
  const productService = container.resolve('productService')
  const regionService = container.resolve('regionService')
  const priceListService = container.resolve('priceListService')
  
  try {
    console.log('🌱 Starting simple product seeding...')
    
    // Get or create default region
    const regions = await regionService.list()
    let defaultRegion = regions.find(r => r.currency_code === 'eur')
    
    if (!defaultRegion) {
      console.log('Creating EUR region...')
      defaultRegion = await regionService.create({
        name: 'Netherlands',
        currency_code: 'eur',
        tax_rate: 21,
        payment_providers: ['manual'],
        fulfillment_providers: ['manual'],
        countries: ['nl']
      })
    }
    
    console.log(`✅ Using region: ${defaultRegion.name} (${defaultRegion.currency_code})`)
    
    const products = [
      {
        title: 'Chocoladetaart',
        handle: 'chocoladetaart',
        description: 'Rijke chocoladetaart met ganache en verse room',
        status: 'published',
        metadata: {
          prep_time_hours: '4',
          same_day_cutoff: '12:00',
          estimation_rules: 'same_day_if_before_cutoff|next_day',
          category: 'taarten'
        },
        options: [{ title: 'Maat' }],
        variants: [
          {
            title: 'Klein (6 personen)',
            inventory_quantity: 50,
            prices: [{ currency_code: 'eur', amount: 2850 }],
            options: [{ value: 'Klein (6 personen)' }]
          }
        ]
      },
      {
        title: 'Appeltaart',
        handle: 'appeltaart',
        description: 'Klassieke Nederlandse appeltaart met kaneelkruim',
        status: 'published',
        metadata: {
          prep_time_hours: '3',
          same_day_cutoff: '14:00',
          estimation_rules: 'same_day_if_before_cutoff|next_day',
          category: 'taarten'
        },
        options: [{ title: 'Maat' }],
        variants: [
          {
            title: 'Regulier',
            inventory_quantity: 50,
            prices: [{ currency_code: 'eur', amount: 1850 }],
            options: [{ value: 'Regulier' }]
          }
        ]
      },
      {
        title: 'Brownies (6 stuks)',
        handle: 'brownies',
        description: 'Zachte chocolade brownies met walnoten',
        status: 'published',
        metadata: {
          prep_time_hours: '2',
          same_day_cutoff: '15:00',
          estimation_rules: 'same_day_if_before_cutoff|next_day',
          category: 'snacks'
        },
        options: [{ title: 'Verpakking' }],
        variants: [
          {
            title: '6 stuks',
            inventory_quantity: 100,
            prices: [{ currency_code: 'eur', amount: 1250 }],
            options: [{ value: '6 stuks' }]
          }
        ]
      }
    ]
    
    for (const productData of products) {
      try {
        console.log(`📦 Creating product: ${productData.title}`)
        
        const product = await productService.create(productData)
        console.log(`✅ Product created: ${product.title} (ID: ${product.id})`)
        
      } catch (error) {
        console.error(`❌ Error creating product ${productData.title}:`, error.message)
      }
    }
    
    console.log('🎉 Product seeding completed!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  } finally {
    process.exit(0)
  }
}

seedProducts()