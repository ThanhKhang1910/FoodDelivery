import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      {/* Image Skeleton */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"></div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-3 animate-pulse"></div>

        {/* Address Skeleton */}
        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded-md w-full mb-1 animate-pulse"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded-md w-2/3 mb-4 animate-pulse"></div>

        {/* Footer Skeleton */}
        <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-12 animate-pulse"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded-md w-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
