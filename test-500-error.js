const axios = require('axios');

async function testBackend() {
  console.log('=== Testing Backend for 500 Error ===\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', health.data);
    
    // Test 2: Test scraper endpoint
    console.log('\n2. Testing scraper endpoint...');
    const test = await axios.get('http://localhost:5000/api/scraper/test');
    console.log('✅ Scraper test:', test.data);
    
    // Test 3: Try actual scraping with your parameters
    console.log('\n3. Testing actual scraping...');
    console.log('🔄 Attempting to scrape "restaurants" in "kphb"...');
    
    const scrapeResponse = await axios.post('http://localhost:5000/api/scraper/scrape', {
      keyword: 'restaurants',
      location: 'kphb'
    });
    
    console.log('✅ Scraping successful!');
    console.log('📊 Results:', {
      totalFound: scrapeResponse.data.totalFound,
      message: scrapeResponse.data.message
    });
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔍 500 Error Analysis:');
      console.log('This typically means:');
      console.log('1. MongoDB is not running');
      console.log('2. Puppeteer/browser issues');
      console.log('3. Missing dependencies');
      console.log('4. Network/connection issues');
      
      console.log('\n💡 Quick Fixes to Try:');
      console.log('1. Start MongoDB: net start MongoDB');
      console.log('2. Install dependencies: npm install');
      console.log('3. Check server logs in the terminal where backend is running');
    }
  }
}

testBackend();