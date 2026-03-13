import React from 'react';

const TestTailwind = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
        <p className="text-gray-700 mb-4">
          If you can see this styled properly, Tailwind CSS is working correctly!
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestTailwind;