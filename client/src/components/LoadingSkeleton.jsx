import React from "react";

const LoadingSkeleton = ({ variant = "card", count = 1 }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="bg-white rounded-3xl overflow-hidden shadow-soft animate-pulse">
            <div className="h-48 bg-gray-200 shimmer"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded-lg shimmer w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-lg shimmer w-1/2"></div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded-full shimmer w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full shimmer w-20"></div>
              </div>
            </div>
          </div>
        );

      case "list":
        return (
          <div className="bg-white rounded-2xl p-4 shadow-soft animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl shimmer flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded-lg shimmer w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-lg shimmer w-1/2"></div>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded-lg shimmer w-full"></div>
            <div className="h-4 bg-gray-200 rounded-lg shimmer w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-lg shimmer w-4/6"></div>
          </div>
        );

      case "restaurant":
        return (
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft animate-pulse">
            <div className="h-44 bg-gray-200 shimmer"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded-lg shimmer w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded-lg shimmer w-full"></div>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-5 bg-gray-200 rounded-full shimmer w-16"></div>
                <div className="h-5 bg-gray-200 rounded-full shimmer w-24"></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
