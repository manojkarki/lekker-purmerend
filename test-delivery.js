#!/usr/bin/env node

// Simple test script to verify delivery estimation logic
const { calculateETA, isPurmerend } = require('./packages/utils/dist/index.js');

console.log('🍰 Testing Lekker Purmerend Business Logic\n');

// Test delivery estimation
console.log('📅 Testing Delivery Estimation:');
console.log('Current time in Amsterdam timezone');

try {
  // Test same-day vs next-day logic
  const estimate1 = calculateETA(4, '12:00'); // 4 hours prep, cutoff at 12:00
  console.log('- 4 hours prep, 12:00 cutoff:', estimate1);

  const estimate2 = calculateETA(2, '15:00'); // 2 hours prep, cutoff at 15:00  
  console.log('- 2 hours prep, 15:00 cutoff:', estimate2);
} catch (error) {
  console.error('❌ Error testing delivery estimation:', error.message);
}

console.log('\n📍 Testing Purmerend Detection:');

// Test Purmerend detection
const locations = [
  { city: 'Purmerend', postalCode: '1441AA' },
  { city: 'purmerend', postalCode: '1442BB' }, // lowercase
  { city: 'Amsterdam', postalCode: '1012AB' },
  { city: '', postalCode: '1443CC' }, // only postal code
  { city: 'Utrecht', postalCode: '3511AB' }
];

locations.forEach(({ city, postalCode }) => {
  try {
    const result = isPurmerend(city, postalCode);
    console.log(`- ${city || 'empty'} ${postalCode}:`, 
      result.isPurmerend ? '✅ Delivery available' : '❌ Pickup only',
      `(reason: ${result.reason})`
    );
  } catch (error) {
    console.error(`❌ Error testing ${city} ${postalCode}:`, error.message);
  }
});

console.log('\n🎉 Test completed! Frontend is available at: http://localhost:3000');
console.log('\n💡 Next steps:');
console.log('- Visit http://localhost:3000 to test the homepage');
console.log('- Try the location checker with different addresses');
console.log('- Test the responsive design on mobile');