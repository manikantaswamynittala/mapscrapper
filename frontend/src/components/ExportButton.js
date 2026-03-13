import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { exportBusinesses } from '../features/business/businessSlice';

const ExportButton = ({ keyword, location }) => {
  const dispatch = useDispatch();
  const { isLoading, exportResult, error } = useSelector((state) => state.business);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleExport = async (exportType, hasWebsite) => {
    await dispatch(exportBusinesses({ keyword, location, exportType, hasWebsite }));
    setShowExportOptions(false);
  };

  const downloadFile = () => {
    if (exportResult && exportResult.filePath) {
      // In a real application, you would implement file download
      // For now, we'll show a success message
      alert(`File exported successfully: ${exportResult.fileName}`);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setShowExportOptions(!showExportOptions)}
          disabled={isLoading}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
          <svg className="-mr-1 ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showExportOptions && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu">
            {keyword && location && (
              <>
                <button
                  onClick={() => handleExport('search')}
                  className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                >
                  Export Current Search Results
                </button>
                <div className="border-t my-1"></div>
                <button
                  onClick={() => handleExport('search', 'with')}
                  className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                >
                  Export Only With Website
                </button>
                <button
                  onClick={() => handleExport('search', 'without')}
                  className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                >
                  Export Only Without Website
                </button>
              </>
            )}
            <button
              onClick={() => handleExport('all')}
              className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              role="menuitem"
            >
              Export All Results
            </button>
          </div>
        </div>
      )}

      {exportResult && (
        <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <p className="font-medium">Export Successful!</p>
          <p className="text-sm">{exportResult.totalRecords} records exported</p>
          <button
            onClick={downloadFile}
            className="mt-1 text-sm text-green-600 hover:text-green-800 underline"
          >
            Download File
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Export Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ExportButton;