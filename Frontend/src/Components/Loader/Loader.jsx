import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;
