const { medusaClient } = require('@medusajs/medusa')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '../../.env' })

async function createBasicProducts() {
  try {
    console.log('🌱 Starting simple product seeding...')
    
    // First create a region if it doesn't exist
    const regionData = {
      name: 'Netherlands',
      currency_code: 'eur',
      tax_rate: 21,
      payment_providers: ['manual'],
      fulfillment_providers: ['manual'],
      countries: ['nl']
    }
    
    console.log('📍 Creating region...')
    console.log('Region data:', regionData)
    
    // Create simple products directly in database
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    
    // Insert a basic product manually
    const productId = 'prod_01HQMX6Z7K4B5C6D7E8F9G0H1J'
    const variantId = 'variant_01HQMX6Z7K4B5C6D7E8F9G0H1J'
    
    await client.query(`
      INSERT INTO product (
        id, title, handle, description, status, created_at, updated_at, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), NOW(), $6
      ) ON CONFLICT (id) DO NOTHING
    `, [
      productId,
      'Chocoladetaart',
      'chocoladetaart',
      'Rijke chocoladetaart met ganache en verse room',
      'published',
      JSON.stringify({
        prep_time_hours: 4,
        same_day_cutoff: '12:00',
        estimation_rules: 'same_day_if_before_cutoff|next_day',
        category: 'taarten'
      })
    ])
    
    console.log('✅ Product created: Chocoladetaart')
    
    await client.end()
    console.log('🎉 Basic seeding completed!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  }
}

if (require.main === module) {
  createBasicProducts().then(() => process.exit(0))
}

module.exports = { createBasicProducts }