// Test with different search terms and locations
const axios = require('axios');

async function testDifferentSearches() {
  console.log('🧪 Testing scraper with different search combinations...\n');
  
  const testCases = [
    { keyword: 'restaurants', location: 'kphb' },
    { keyword: 'restaurants', location: 'hyderabad' },
    { keyword: 'pizza', location: 'kphb' },
    { keyword: 'coffee', location: 'kphb' },
    { keyword: 'hotel', location: 'kphb' },
  ];
  
  for (const testCase of testCases) {
    console.log(`🔄 Testing: ${testCase.keyword} in ${testCase.location}...`);
    
    try {
      const response = await axios.post('http://localhost:5000/api/scraper/scrape', testCase);
      
      console.log(`✅ Found ${response.data.totalFound} businesses`);
      
      if (response.data.totalFound > 0) {
        console.log('   Sample:', {
          name: response.data.data[0].name,
          address: response.data.data[0].address,
          phone: response.data.data[0].phone
        });
      }
      
    } catch (error) {
      console.error(`❌ Failed: ${error.response?.data?.error || error.message}`);
    }
    
    console.log(''); // Empty line for readability
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🏁 Test complete!');
}

testDifferentSearches();