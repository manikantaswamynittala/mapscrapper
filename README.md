# Google Maps Business Scraper

A powerful desktop application that automatically collects business leads from Google Maps search results. Built with React, Node.js, and Electron.

## Features

- 🗺️ **Google Maps Scraping**: Extract business data using Puppeteer automation
- 📊 **Comprehensive Data**: Collect name, address, phone, website, email, ratings, and more
- 💾 **Database Storage**: MongoDB integration for persistent data storage
- 📈 **Excel Export**: Export results to Excel (.xlsx) format
- 🖥️ **Desktop Application**: Packaged as Windows executable (.exe)
- 🎨 **Modern UI**: React + Tailwind CSS interface
- ⚡ **State Management**: Redux Toolkit for efficient state management

## Tech Stack

- **Frontend**: React, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Scraping**: Puppeteer (headless Chrome)
- **Excel Export**: exceljs
- **Packaging**: Electron, electron-builder

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Windows OS (for .exe packaging)

### Quick Start

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd google-maps-scraper
   npm run install:all
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env` in the backend directory
   - Update MongoDB connection string if needed

3. **Development Mode**
   ```bash
   npm run dev
   ```
   This starts both backend and frontend in development mode.

4. **Build Desktop Application**
   ```bash
   npm run build-win
   ```
   This creates a Windows installer in the `dist` folder.

## Usage

### Desktop Application

1. Launch the application from the Start Menu or Desktop shortcut
2. Enter a business type (e.g., "restaurants", "boutiques") and location (e.g., "Hyderabad")
3. Click "Start Scraping" to begin data collection
4. View results in the table below
5. Export data to Excel using the "Export to Excel" button

### Web Application (Development)

1. Backend runs on `http://localhost:5000`
2. Frontend runs on `http://localhost:3000`

## API Endpoints

### Scraper Routes

- `POST /api/scraper/scrape` - Start scraping Google Maps
- `GET /api/scraper/status` - Check scraping status
- `GET /api/scraper/test` - Test scraper functionality

### Business Routes

- `GET /api/businesses` - Get all businesses (with pagination)
- `GET /api/businesses/search` - Search businesses by keyword and location
- `POST /api/businesses/export` - Export businesses to Excel
- `GET /api/businesses/history/searches` - Get search history
- `DELETE /api/businesses/:id` - Delete a business

## Data Fields

Each business record contains:

- **Name**: Business name
- **Address**: Full address
- **Phone**: Contact phone number
- **Website**: Business website URL
- **Email**: Contact email (if available)
- **Rating**: Google Maps rating (1-5 stars)
- **Total Reviews**: Number of reviews
- **Category**: Business category/type
- **Search Keyword**: Search term used
- **Search Location**: Location searched
- **Google Maps URL**: Direct link to business on Google Maps
- **Scraped Date**: When the data was collected

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/google-maps-scraper
NODE_ENV=development
```

### MongoDB Setup

1. **Local MongoDB**: Install MongoDB locally and ensure it's running
2. **MongoDB Atlas**: Use cloud MongoDB for production
3. **Connection String**: Update `MONGODB_URI` in `.env` file

## Building and Deployment

### Development

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Production Build

```bash
# Build frontend
npm run build

# Build desktop application
npm run build-win
```

The installer will be created in the `dist` folder.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify MongoDB service status

2. **Puppeteer Issues**
   - May require additional system dependencies on Linux
   - Check Chrome/Chromium installation
   - Verify system permissions

3. **Build Issues**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility
   - Clear node_modules and reinstall if needed

### Performance Tips

- Use specific search terms for better results
- Limit concurrent scraping operations
- Monitor system resources during scraping
- Use pagination for large datasets

## Legal and Ethical Considerations

- **Rate Limiting**: The scraper includes delays to avoid overwhelming Google servers
- **Terms of Service**: Ensure compliance with Google Maps Terms of Service
- **Data Usage**: Use scraped data responsibly and in accordance with applicable laws
- **Rate Limits**: Implement appropriate delays between requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## Disclaimer

This tool is for educational and research purposes. Users are responsible for ensuring compliance with Google Maps Terms of Service and applicable laws. The developers are not responsible for any misuse of this tool.