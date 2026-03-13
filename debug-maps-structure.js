// Debug script to see what's actually on the Google Maps page
const puppeteer = require('puppeteer');

async function debugGoogleMaps() {
  console.log('🔍 Debugging Google Maps HTML structure...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to Google Maps
    const searchQuery = 'restaurants in kphb';
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    
    console.log(`🌐 Navigating to: ${mapsUrl}`);
    await page.goto(mapsUrl, { waitUntil: 'networkidle2' });
    
    // Wait for results to load
    await page.waitForSelector('[role="main"]', { timeout: 10000 });
    
    // Wait a bit more for dynamic content
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'maps-debug.png', fullPage: true });
    
    // Get all possible business selectors
    console.log('🔍 Analyzing page structure...');
    
    const selectors = [
      '[data-result-index]',
      '[data-result-type]',
      '.section-result',
      '.section-result-content',
      '[role="article"]',
      '.place-card',
      '.business-item',
      '[data-place-id]',
      '.section-layout-section',
      '.section-result-text-content'
    ];
    
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`✅ ${selector}: Found ${elements.length} elements`);
        
        if (elements.length > 0) {
          // Get first element details
          const firstElement = elements[0];
          const text = await page.evaluate(el => el.textContent, firstElement);
          const html = await page.evaluate(el => el.outerHTML.substring(0, 200), firstElement);
          console.log(`   Sample text: ${text.substring(0, 100)}...`);
          console.log(`   HTML snippet: ${html}...`);
        }
      } catch (error) {
        console.log(`❌ ${selector}: Error - ${error.message}`);
      }
    }
    
    // Try to find business names
    console.log('\n🏪 Looking for business names...');
    const businessNames = await page.evaluate(() => {
      const possibleSelectors = [
        'h3',
        '.section-result-title',
        '.place-name',
        '[data-attrid="title"]',
        '.section-result-text-content h3'
      ];
      
      const names = [];
      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          names.push({
            selector,
            count: elements.length,
            examples: Array.from(elements).slice(0, 3).map(el => el.textContent.trim())
          });
        }
      }
      return names;
    });
    
    businessNames.forEach(result => {
      console.log(`📋 ${result.selector}: ${result.count} elements found`);
      console.log(`   Examples: ${result.examples.join(', ')}`);
    });
    
    console.log('\n✅ Debug complete! Check maps-debug.png for visual reference');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
}

debugGoogleMaps().catch(console.error);