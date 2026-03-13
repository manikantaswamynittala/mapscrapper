const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelService {
  async exportToExcel(businesses, filename = 'google-maps-leads') {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Business Leads');

      // Define columns
      worksheet.columns = [
        { header: 'Business Name', key: 'name', width: 30 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Phone Number', key: 'phone', width: 20 },
        { header: 'Phone Available', key: 'hasPhone', width: 16 },
        { header: 'Website', key: 'website', width: 30 },
        { header: 'Website Available', key: 'hasWebsite', width: 18 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Email Available', key: 'hasEmail', width: 16 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Total Reviews', key: 'totalReviews', width: 15 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Search Keyword', key: 'searchKeyword', width: 20 },
        { header: 'Search Location', key: 'searchLocation', width: 20 },
        { header: 'Google Maps URL', key: 'googleMapsUrl', width: 50 },
        { header: 'Scraped Date', key: 'scrapedAt', width: 20 },
      ];

      // Style the header row
      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: 'FFFFFF' },
      };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' },
      };

      // Add data rows
      businesses.forEach(business => {
        worksheet.addRow({
          name: business.name || 'N/A',
          address: business.address || 'N/A',
          phone: business.phone || 'N/A',
          hasPhone: business.phone ? 'Yes' : 'No',
          website: business.website || 'N/A',
          hasWebsite: business.website && business.website.startsWith('http') ? 'Yes' : 'No',
          email: business.email || 'N/A',
          hasEmail: business.email ? 'Yes' : 'No',
          rating: business.rating || 'N/A',
          totalReviews: business.totalReviews || 'N/A',
          category: business.category || 'N/A',
          searchKeyword: business.searchKeyword || 'N/A',
          searchLocation: business.searchLocation || 'N/A',
          googleMapsUrl: business.googleMapsUrl || 'N/A',
          scrapedAt: business.scrapedAt ? new Date(business.scrapedAt).toLocaleDateString() : 'N/A',
        });
      });

      // Create exports directory if it doesn't exist
      const exportsDir = path.join(__dirname, '../exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(exportsDir, `${filename}-${timestamp}.xlsx`);

      // Write the file
      await workbook.xlsx.writeFile(filePath);

      return {
        success: true,
        filePath: filePath,
        fileName: `${filename}-${timestamp}.xlsx`,
        totalRecords: businesses.length,
      };
    } catch (error) {
      console.error('Excel export error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async exportSearchResults(searchKeyword, searchLocation, filter) {
    try {
      // Fetch businesses from database
      const businesses = await require('../models/Business').find({
        searchKeyword: searchKeyword,
        searchLocation: searchLocation,
      }).sort({ scrapedAt: -1 });

      if (businesses.length === 0) {
        return {
          success: false,
          error: 'No businesses found for the specified search criteria',
        };
      }
      let filtered = businesses;
      if (filter && filter.hasWebsite === 'with') {
        filtered = businesses.filter(b => b.website && /^https?:\/\//i.test(b.website));
      } else if (filter && filter.hasWebsite === 'without') {
        filtered = businesses.filter(b => !b.website || !/^https?:\/\//i.test(b.website));
      }

      return await this.exportToExcel(
        filtered,
        `${searchKeyword}-${searchLocation}-leads${filter && filter.hasWebsite ? `-${filter.hasWebsite}-website` : ''}`
      );
    } catch (error) {
      console.error('Export search results error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async exportAllResults(filter) {
    try {
      // Fetch all businesses from database
      const businesses = await require('../models/Business').find({}).sort({ scrapedAt: -1 });

      if (businesses.length === 0) {
        return {
          success: false,
          error: 'No businesses found in the database',
        };
      }
      let filtered = businesses;
      if (filter && filter.hasWebsite === 'with') {
        filtered = businesses.filter(b => b.website && /^https?:\/\//i.test(b.website));
      } else if (filter && filter.hasWebsite === 'without') {
        filtered = businesses.filter(b => !b.website || !/^https?:\/\//i.test(b.website));
      }

      return await this.exportToExcel(filtered, `all-leads${filter && filter.hasWebsite ? `-${filter.hasWebsite}-website` : ''}`);
    } catch (error) {
      console.error('Export all results error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new ExcelService();