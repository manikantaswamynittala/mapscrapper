import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import SearchForm from './components/SearchForm';
import BusinessList from './components/BusinessList';
import ExportButton from './components/ExportButton';

function AppContent() {
  const [searchParams, setSearchParams] = useState({ keyword: '', location: '' });

  const handleSearchComplete = (keyword, location) => {
    setSearchParams({ keyword, location });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Google Maps Business Scraper
          </h1>
          <p className="mt-2 text-gray-600">
            Extract business leads from Google Maps search results
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <SearchForm onSearchComplete={handleSearchComplete} />
          
          <div className="mt-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Business Results</h2>
            <ExportButton 
              keyword={searchParams.keyword} 
              location={searchParams.location} 
            />
          </div>
          
          <div className="mt-4">
            <BusinessList 
              keyword={searchParams.keyword} 
              location={searchParams.location} 
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Google Maps Business Scraper - Extract business leads efficiently
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;