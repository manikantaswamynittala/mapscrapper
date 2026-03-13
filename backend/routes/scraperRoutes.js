const express = require('express');
const router = express.Router();
const scraperService = require('../services/scraperService');
const Business = require('../models/Business');

// Start scraping
router.post('/scrape', async (req, res) => {
  try {
    const { keyword, location, async: isAsync } = req.body;

    if (!keyword || !location) {
      return res.status(400).json({
        success: false,
        error: 'Keyword and location are required',
      });
    }

    // NOTE: Previously we skipped scraping when data already existed for this
    // keyword+location. That meant repeated searches never fetched more than
    // whatever was scraped the first time (often only 20). We now always
    // trigger a fresh scrape so repeated searches can collect additional
    // businesses.

    if (isAsync) {
      scraperService.scrapeGoogleMaps(keyword, location)
        .catch((error) => console.error('Async scraping error:', error));

      return res.json({
        success: true,
        message: 'Scraping started',
        progress: scraperService.getProgress() || { keyword, location, processed: 0, total: 0 },
      });
    }

    const businesses = await scraperService.scrapeGoogleMaps(keyword, location);

    res.json({
      success: true,
      message: 'Scraping completed successfully',
      data: businesses,
      totalFound: businesses.length,
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scrape Google Maps',
      details: error.message,
    });
  }
});

// Get scraping status
router.get('/status', async (req, res) => {
  try {
    const { keyword, location } = req.query;

    if (!keyword || !location) {
      return res.status(400).json({
        success: false,
        error: 'Keyword and location are required',
      });
    }

    const businesses = await Business.find({
      searchKeyword: keyword,
      searchLocation: location,
    });

    res.json({
      success: true,
      data: {
        keyword,
        location,
        totalFound: businesses.length,
        lastScraped: businesses.length > 0 ? businesses[0].scrapedAt : null,
        progress: scraperService.getProgress() || null,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check scraping status',
    });
  }
});

// Test scraper connection
router.get('/test', async (req, res) => {
  try {
    await scraperService.initialize();
    await scraperService.close();
    
    res.json({
      success: true,
      message: 'Scraper service is working correctly',
    });
  } catch (error) {
    console.error('Scraper test error:', error);
    res.status(500).json({
      success: false,
      error: 'Scraper service test failed',
      details: error.message,
    });
  }
});

module.exports = router;