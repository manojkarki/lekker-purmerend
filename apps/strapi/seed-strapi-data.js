const fs = require('fs');
const path = require('path');

async function seedStrapiData() {
  try {
    console.log('🌱 Starting Strapi data seeding...');
    
    // Read the seed data
    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
    console.log('📖 Reading seed data from seed-data.json');
    console.log(`📝 Found ${seedData.length} blog posts to create`);
    
    // Check if Strapi is running
    const response = await fetch('http://localhost:1337/api/posts')
      .then(res => res.json())
      .catch(err => {
        throw new Error('Strapi is not running. Please start it with: pnpm run dev:strapi');
      });
    
    console.log('✅ Strapi API is accessible');
    
    // Create blog posts
    for (const post of seedData) {
      try {
        console.log(`📝 Creating blog post: ${post.title}`);
        
        const response = await fetch('http://localhost:1337/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // You might need to add authorization header if required
          },
          body: JSON.stringify({
            data: {
              ...post,
              publishedAt: new Date(post.publishedAt).toISOString()
            }
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error(`❌ Error creating post ${post.title}: ${response.status} - ${error}`);
          continue;
        }
        
        const result = await response.json();
        console.log(`✅ Blog post created: ${result.data?.attributes?.title || post.title}`);
        
      } catch (postError) {
        console.error(`❌ Error creating post ${post.title}:`, postError.message);
      }
    }
    
    console.log('🎉 Strapi blog seeding completed!');
    console.log('💡 To test: Visit http://localhost:1337/api/posts');
    
  } catch (error) {
    console.error('❌ Error during blog seeding:', error.message);
    console.log('💡 Make sure Strapi is running: pnpm run dev:strapi');
  }
}

// Execute seeding
seedStrapiData();