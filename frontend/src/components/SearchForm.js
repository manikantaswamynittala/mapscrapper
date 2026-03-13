import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startScraping, checkScrapingStatus } from '../features/scraper/scraperSlice';

const SearchForm = ({ onSearchComplete }) => {
  const dispatch = useDispatch();
  const { isLoading, error, scrapingStatus } = useSelector((state) => state.scraper);
  
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [showStatus, setShowStatus] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) {
      alert('Please enter both keyword and location');
      return;
    }

    await dispatch(startScraping({ keyword, location }));
    if (typeof onSearchComplete === 'function') {
      onSearchComplete(keyword, location);
    }
    setShowStatus(true);
  };

  const handleCheckStatus = async () => {
    if (!keyword.trim() || !location.trim()) {
      alert('Please enter both keyword and location');
      return;
    }

    await dispatch(checkScrapingStatus({ keyword, location }));
    if (typeof onSearchComplete === 'function') {
      onSearchComplete(keyword, location);
    }
    setShowStatus(true);
  };

  useEffect(() => {
    if (!showStatus || !keyword || !location) return;
    const id = setInterval(() => {
      dispatch(checkScrapingStatus({ keyword, location }));
    }, 1000);
    return () => clearInterval(id);
  }, [showStatus, keyword, location, dispatch]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Google Maps Scraper</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
              Business Type/Keyword
            </label>
            <input
              type="text"
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., restaurants, boutiques, doctors"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, London, Hyderabad"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scraping...
              </>
            ) : (
              'Start Scraping'
            )}
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isLoading}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Check Status
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {showStatus && scrapingStatus && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            <h3 className="font-medium mb-2">Scraping Status</h3>
            <p>Keyword: {scrapingStatus.keyword}</p>
            <p>Location: {scrapingStatus.location}</p>
            <p>Total Found: {scrapingStatus.totalFound}</p>
            {scrapingStatus.progress && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>
                    {scrapingStatus.progress.total > 0
                      ? Math.round((scrapingStatus.progress.processed / scrapingStatus.progress.total) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded h-2">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${scrapingStatus.progress.total > 0 ? (scrapingStatus.progress.processed / scrapingStatus.progress.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">
                  {scrapingStatus.progress.processed} / {scrapingStatus.progress.total}
                </div>
              </div>
            )}
            {scrapingStatus.lastScraped && (
              <p>Last Scraped: {new Date(scrapingStatus.lastScraped).toLocaleString()}</p>
            )}
            <button
              onClick={() => setShowStatus(false)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Hide Status
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm;