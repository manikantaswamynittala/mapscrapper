const axios = require('axios');
const mongoose = require('mongoose');
const Business = require('./backend/models/Business');

async function debugScraper() {
  console.log('=== Google Maps Scraper Debug Tool ===\n');
  
  // Test 1: Check if backend server is running
  console.log('1. Testing backend server connectivity...');
  try {
    const response = await axios.get('http://localhost:5000/api/scraper/test');
    console.log('✅ Backend server is running:', response.data);
  } catch (error) {
    console.error('❌ Backend server error:', error.response?.data || error.message);
    console.log('💡 Make sure to start the backend server first: cd backend && node server.js');
    return;
  }
  
  // Test 2: Check MongoDB connection
  console.log('\n2. Testing MongoDB connection...');
  try {
    await mongoose.connect('mongodb://localhost:27017/google-maps-scraper');
    console.log('✅ MongoDB connection successful');
    
    // Test database operations
    const count = await Business.countDocuments();
    console.log(`📊 Current business records in database: ${count}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Make sure MongoDB is installed and running');
    console.log('   - Install MongoDB: https://www.mongodb.com/try/download/community');
    console.log('   - Start MongoDB service: net start MongoDB');
    return;
  }
  
  // Test 3: Test actual scraping with the exact parameters
  console.log('\n3. Testing scraper with your parameters (restaurants, kphb)...');
  try {
    console.log('🔄 Starting scraping process...');
    const response = await axios.post('http://localhost:5000/api/scraper/scrape', {
      keyword: 'restaurants',
      location: 'kphb'
    });
    console.log('✅ Scraping successful:', response.data);
  } catch (error) {
    console.error('❌ Scraping failed:', error.response?.data || error.message);
    
    // Provide specific troubleshooting based on error
    if (error.response?.data?.error) {
      const errorMsg = error.response.data.error;
      console.log('\n🔍 Error Analysis:');
      
      if (errorMsg.includes('Failed to scrape Google Maps')) {
        console.log('💡 This is likely a Puppeteer/browser issue:');
        console.log('   - Make sure Chrome/Chromium is installed');
        console.log('   - Check if Puppeteer can launch browser');
        console.log('   - Try running: npm install puppeteer --force');
      } else if (errorMsg.includes('database')) {
        console.log('💡 This is a database connection issue');
        console.log('   - Check MongoDB service status');
        console.log('   - Verify connection string in .env file');
      } else {
        console.log('💡 General error - check server logs for details');
      }
    }
  }
  
  // Test 4: Check if data already exists
  console.log('\n4. Checking for existing data...');
  try {
    await mongoose.connect('mongodb://localhost:27017/google-maps-scraper');
    const existingData = await Business.find({
      searchKeyword: 'restaurants',
      searchLocation: 'kphb'
    });
    console.log(`📊 Found ${existingData.length} existing records for restaurants in kphb`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error checking existing data:', error.message);
  }
  
  console.log('\n=== Debug Complete ===');
}

// Run the debug function
debugScraper().catch(console.error);