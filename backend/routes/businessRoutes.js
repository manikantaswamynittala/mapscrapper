const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const excelService = require('../services/excelService');

// Get all businesses
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, keyword, location } = req.query;
    const query = {};

    if (keyword) {
      query.searchKeyword = { $regex: keyword, $options: 'i' };
    }

    if (location) {
      query.searchLocation = { $regex: location, $options: 'i' };
    }

    const businesses = await Business.find(query)
      .sort({ scrapedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Business.countDocuments(query);

    res.json({
      success: true,
      data: businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch businesses',
    });
  }
});

// Get businesses by search criteria
router.get('/search', async (req, res) => {
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
    }).sort({ scrapedAt: -1 });

    res.json({
      success: true,
      data: businesses,
      total: businesses.length,
    });
  } catch (error) {
    console.error('Search businesses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search businesses',
    });
  }
});

// Export businesses to Excel
router.post('/export', async (req, res) => {
  try {
    const { keyword, location, exportType = 'search', hasWebsite } = req.body;

    let result;

    if (exportType === 'all') {
      result = await excelService.exportAllResults({ hasWebsite });
    } else if (keyword && location) {
      result = await excelService.exportSearchResults(keyword, location, { hasWebsite });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Keyword and location are required for search export',
      });
    }

    if (result.success) {
      res.json({
        success: true,
        message: 'Export completed successfully',
        filePath: result.filePath,
        fileName: result.fileName,
        totalRecords: result.totalRecords,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export businesses',
    });
  }
});

// Get business by ID
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
      });
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business',
    });
  }
});

// Delete business
router.delete('/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found',
      });
    }

    res.json({
      success: true,
      message: 'Business deleted successfully',
    });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete business',
    });
  }
});

// Get search history
router.get('/history/searches', async (req, res) => {
  try {
    const searches = await Business.aggregate([
      {
        $group: {
          _id: {
            keyword: '$searchKeyword',
            location: '$searchLocation',
          },
          totalResults: { $sum: 1 },
          lastScraped: { $max: '$scrapedAt' },
        },
      },
      {
        $project: {
          _id: 0,
          keyword: '$_id.keyword',
          location: '$_id.location',
          totalResults: 1,
          lastScraped: 1,
        },
      },
      {
        $sort: { lastScraped: -1 },
      },
    ]);

    res.json({
      success: true,
      data: searches,
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch search history',
    });
  }
});

module.exports = router;