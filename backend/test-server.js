const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend server...');
    
    // Test scraper endpoint
    const scraperResponse = await axios.get('http://localhost:5000/api/scraper/test');
    console.log('Scraper test:', scraperResponse.data);
    
    // Test businesses endpoint
    const businessesResponse = await axios.get('http://localhost:5000/api/businesses');
    console.log('Businesses endpoint working:', businessesResponse.data.length, 'businesses');
    
    console.log('✅ Backend is working correctly!');
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('Make sure the backend server is running with: node server.js');
  }
}

testBackend();