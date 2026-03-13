// Quick test for the scraper fix
const axios = require('axios');

async function testScraperFix() {
  console.log('🧪 Testing scraper fix...\n');
  
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
        phone: b.phone
      }))
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('waitForTimeout')) {
      console.log('🔄 The fix didn\'t work - waitForTimeout still causing issues');
    } else {
      console.log('🔍 Different error - check backend logs');
    }
  }
}

testScraperFix();