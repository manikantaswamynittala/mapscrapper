import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBusinesses, deleteBusiness } from '../features/business/businessSlice';

const BusinessList = ({ keyword, location }) => {
  const dispatch = useDispatch();
  const { businesses, searchResults, pagination, isLoading, error } = useSelector(
    (state) => state.business
  );

  const displayData = keyword && location ? searchResults : businesses;

  useEffect(() => {
    if (keyword && location) {
      dispatch(fetchBusinesses({ keyword, location }));
    } else {
      dispatch(fetchBusinesses({ page: pagination.page }));
    }
  }, [dispatch, keyword, location, pagination.page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      await dispatch(deleteBusiness(id));
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchBusinesses({ page: newPage }));
  };

  if (isLoading && displayData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">Error loading businesses:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No businesses found. Try scraping some data first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          {keyword && location 
            ? `Search Results for "${keyword}" in "${location}"`
            : 'All Businesses'
          }
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({displayData.length} results)
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((business) => (
              <tr key={business._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {business.name}
                  </div>
                  {business.website && (
                    <div className="text-sm text-gray-500">
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {business.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {business.phone || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {business.website && /^https?:\/\//i.test(business.website) ? 'Yes' : 'No'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {business.rating && (
                      <>
                        <span className="text-sm font-medium text-gray-900">
                          {business.rating}
                        </span>
                        <span className="text-yellow-400 ml-1">★</span>
                      </>
                    )}
                    {business.totalReviews && (
                      <span className="text-sm text-gray-500 ml-1">
                        ({business.totalReviews})
                      </span>
                    )}
                    {!business.rating && <span className="text-sm text-gray-500">N/A</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {business.category || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(business._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!keyword && !location && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing page {pagination.page} of {pagination.pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessList;