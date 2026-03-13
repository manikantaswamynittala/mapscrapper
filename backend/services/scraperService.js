const puppeteer = require('puppeteer');
const Business = require('../models/Business');

// Maximum businesses to process per search.
// Increase this if you want even more results, but scraping will be slower.
const MAX_RESULTS = 200;

class ScraperService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.progress = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await this.page.setDefaultNavigationTimeout(60000);
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  // Helper function to replace waitForTimeout
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeGoogleMaps(keyword, location) {
    try {
      if (!this.page) {
        await this.initialize();
      }

      const searchQuery = `${keyword} in ${location}`;
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      
      console.log(`Scraping: ${mapsUrl}`);
      await this.page.goto(mapsUrl, { waitUntil: 'networkidle2' });
      
      // Wait for results to load
      await this.page.waitForSelector('[role="main"]');
      await this.delay(3000); // Fixed: Replaced waitForTimeout with delay

      const businesses = await this.extractBusinessData(keyword, location);
      
      // Save to database
      const savedBusinesses = [];
      for (const business of businesses) {
        try {
          const saved = await Business.create(business);
          savedBusinesses.push(saved);
        } catch (error) {
          console.error('Error saving business:', error);
        }
      }

      return savedBusinesses;
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  }

  async extractBusinessData(keyword, location) {
    const businesses = [];
    const seen = new Set();
    
    try {
      // Ensure list is visible and scroll to load more results
      try {
        await this.page.waitForSelector('[role="feed"]', { timeout: 10000 });
      } catch (_) {}
      await this.scrollToLoadMore();
      
      // Prefer extracting direct links to place details from the list
      let placeLinks = [];
      try {
        placeLinks = await this.page.$$eval('[role="feed"] a.hfpxzc', els => els.map(a => a.href));
      } catch (error) {
        console.log('⚠️  Failed to read place links:', error.message);
      }

      if (!placeLinks || placeLinks.length === 0) {
        for (let i = 0; i < 6; i++) {
          await this.scrollToLoadMore();
          try {
            const more = await this.page.$$eval('a[href*="/maps/place/"]', els => els.map(a => a.href));
            placeLinks = placeLinks.concat(more);
            placeLinks = Array.from(new Set(placeLinks));
            if (placeLinks.length > 0) break;
          } catch (_) {}
        }
        if (placeLinks.length === 0) {
          await this.page.screenshot({ path: 'debug-no-results.png' });
          return businesses;
        }
      }

      // Deduplicate links and limit count
      placeLinks = Array.from(new Set(placeLinks));
      if (MAX_RESULTS && Number.isFinite(MAX_RESULTS)) {
        placeLinks = placeLinks.slice(0, MAX_RESULTS);
      }
      this.progress = { keyword, location, processed: 0, total: placeLinks.length };
      console.log(`🔄 Processing ${placeLinks.length} businesses via direct links...`);

      for (let i = 0; i < placeLinks.length; i++) {
        const href = placeLinks[i];
        try {
          console.log(`📍 Opening business ${i + 1}: ${href}`);
          await this.gotoWithRetry(href, { waitUntil: 'domcontentloaded' }, 2);
          try {
            await this.page.waitForSelector('h1.DUwDvf', { timeout: 10000 });
          } catch (_) {}
          await this.delay(1000);

          const businessData = await this.extractBusinessDetails(keyword, location);
          const key = (businessData.name || '').trim().toLowerCase();
          if (businessData.name && !seen.has(key)) {
            seen.add(key);
            businesses.push(businessData);
            console.log(`✅ Added: ${businessData.name}`);
          } else {
            console.log('⚠️  Duplicate or missing name, skipped');
          }
        } catch (error) {
          console.error(`❌ Error processing link ${i + 1}:`, error.message);
        }
        if (this.progress) {
          this.progress.processed = Math.min(i + 1, this.progress.total);
        }
      }
      
      console.log(`✅ Successfully extracted ${businesses.length} businesses`);
      
    } catch (error) {
      console.error('❌ Error extracting business data:', error);
    }
    
    return businesses;
  }

  async gotoWithRetry(url, options, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.page.goto(url, options);
        return;
      } catch (err) {
        if (attempt === retries) throw err;
        await this.delay(2000);
      }
    }
  }

  async scrollToLoadMore() {
    // Scroll more times to load additional results from the list
    for (let i = 0; i < 12; i++) {
      await this.page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        const main = document.querySelector('[role="main"]');
        const target = feed || main;
        if (target) {
          target.scrollTop += 800;
        }
      });
      await this.delay(1500);
    }
  }

  async extractBusinessDetails(keyword, location) {
    try {
      const businessData = {
        name: '',
        address: '',
        phone: '',
        website: '',
        email: '',
        rating: null,
        totalReviews: null,
        category: '',
        searchKeyword: keyword,
        searchLocation: location,
        googleMapsUrl: this.page.url(),
      };

      // Extract name
      try {
        const nameSelectors = ['h1.DUwDvf', 'h1[aria-level="1"]', 'h1[data-attrid="title"]'];
        for (const sel of nameSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            businessData.name = await this.page.evaluate(e => e.textContent, el);
            break;
          }
        }
      } catch (error) {
        console.error('Error extracting name:', error);
      }

      // Extract address
      try {
        const addressSelectors = [
          'button[data-item-id="address"]',
          'button[aria-label^="Address:"]',
          '[data-item-id="address"]',
        ];
        for (const sel of addressSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            const text = await this.page.evaluate(e => (e.getAttribute('aria-label') || e.textContent || ''), el);
            const cleaned = text.replace(/^Address:\s*/i, '').trim();
            if (cleaned) {
              businessData.address = cleaned;
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting address:', error);
      }

      // Extract phone
      try {
        const telEl = await this.page.$('a[href^="tel:"]');
        if (telEl) {
          const href = await this.page.evaluate(e => e.getAttribute('href'), telEl);
          const num = href.replace('tel:', '').replace(/[^\d+]/g, '');
          if (num) businessData.phone = num;
        }
        if (!businessData.phone) {
          const phoneSelectors = [
            'button[data-item-id="phone"]',
            'button[aria-label*="Call"]',
            'button[aria-label^="Phone:"]'
          ];
          for (const sel of phoneSelectors) {
            const el = await this.page.$(sel);
            if (el) {
              const text = await this.page.evaluate(e => (e.getAttribute('aria-label') || e.textContent || ''), el);
              const extracted = (text.match(/\+?\d[\d\s-()]+/) || [])[0] || '';
              const num = extracted.replace(/[^\d+]/g, '');
              if (num) {
                businessData.phone = num;
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error extracting phone:', error);
      }

      // Extract website
      try {
        // Prefer explicit "Website" controls instead of any http link, otherwise
        // even listings without a real website get marked as "Yes".
        const websiteSelectors = [
          'a[data-item-id="authority"]', // primary website button
          'a[aria-label^="Website"]',
          'button[aria-label^="Website"]',
        ];

        for (const sel of websiteSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            const href = await this.page.evaluate(e => e.href || e.getAttribute('href') || '', el);
            if (href && !/https?:\/\/www\.google\./i.test(href)) {
              businessData.website = href;
              break;
            }
          }
        }

        // Fallback: look for a link whose visible text is "Website"
        if (!businessData.website) {
          const [linkEl] = await this.page.$x("//a[contains(., 'Website')]");
          if (linkEl) {
            const href = await this.page.evaluate(e => e.href || e.getAttribute('href') || '', linkEl);
            if (href && !/https?:\/\/www\.google\./i.test(href)) {
              businessData.website = href;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting website:', error);
      }

      // Extract rating
      try {
        const ratingSelectors = [
          '.F7nice span[aria-label$="stars"]',
          '.F7nice span[role="img"][aria-label*="stars"]',
        ];
        for (const sel of ratingSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            const text = await this.page.evaluate(e => e.getAttribute('aria-label'), el);
            const m = text?.match(/(\d+\.?\d*)/);
            if (m) {
              businessData.rating = parseFloat(m[1]);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting rating:', error);
      }

      // Extract total reviews
      try {
        const reviewsSelectors = [
          '.F7nice span[aria-label*="reviews"]',
          '.F7nice button[jsaction*="pane.rating.moreReviews"] span',
        ];
        for (const sel of reviewsSelectors) {
          const el = await this.page.$(sel);
          if (el) {
            const text = await this.page.evaluate(e => e.textContent, el);
            const m = text?.match(/(\d[\d,]*)/);
            if (m) {
              businessData.totalReviews = parseInt(m[1].replace(/,/g, ''));
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting reviews:', error);
      }

      // Extract category
      try {
        const categorySelectors = [
          'button[jsaction="pane.rating.category"]',
          'span[jsaction="pane.rating.category"]',
        ];
        for (const sel of categorySelectors) {
          const el = await this.page.$(sel);
          if (el) {
            businessData.category = await this.page.evaluate(e => e.textContent, el);
            break;
          }
        }
      } catch (error) {
        console.error('Error extracting category:', error);
      }

      if (!businessData.address) {
        businessData.address = 'N/A';
      }

      return businessData;
    } catch (error) {
      console.error('Error in extractBusinessDetails:', error);
      return {};
    }
  }

  getProgress() {
    return this.progress;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = new ScraperService();