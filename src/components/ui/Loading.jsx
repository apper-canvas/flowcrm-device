import React from "react";

const Loading = ({ rows = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="card p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
            </div>
            <div className="w-20 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loading;