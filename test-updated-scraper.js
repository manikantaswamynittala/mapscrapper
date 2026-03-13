// Quick test for the updated scraper with better debugging
const axios = require('axios');

async function testUpdatedScraper() {
  console.log('🧪 Testing updated scraper with better selectors...\n');
  
  try {
    // Test the scraper endpoint
    console.log('🔄 Testing scraper with restaurants in kphb...');
    const response = await axios.post('http://localhost:5000/api/scraper/scrape', {
      keyword: 'restaurants',
      location: 'kphb'
    });
    
    console.log('✅ SUCCESS! Scraper is working');
    console.log('📊 Results:', {
      totalFound: response.data.totalFound,
      message: response.data.message,
      sampleData: response.data.data?.slice(0, 2).map(b => ({
        name: b.name,
        address: b.address,
        phone: b.phone,
        rating: b.rating
      }))
    });
    
    if (response.data.totalFound === 0) {
      console.log('\n⚠️  Warning: Found 0 businesses');
      console.log('💡 This could mean:');
      console.log('   - No restaurants found in that area');
      console.log('   - Google Maps structure changed');
      console.log('   - Location name might be too specific');
      console.log('   - Try a different search term or location');
      console.log('   - Check backend console for detailed logs');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('waitForTimeout')) {
      console.log('🔄 The fix didn\'t work - waitForTimeout still causing issues');
    } else {
      console.log('🔍 Different error - check backend logs');
    }
  }
}

testUpdatedScraper();