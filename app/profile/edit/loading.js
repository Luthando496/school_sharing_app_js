"use client"; // react-spinners often requires a client component

import { RingLoader } from "react-spinners";

export default function ProfileLoadingSpinner() {
  return (
    <div className="relative min-h-screen bg-primary overflow-hidden">
      {/* Blurred background skeleton */}
      <div className="absolute inset-0 filter blur-lg opacity-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Cover Image Skeleton */}
          <div className="h-48 bg-gray-300 rounded-lg"></div>
          {/* Profile Picture & Details Skeleton */}
          <div className="flex items-end -mt-20 px-6">
            <div className="w-32 h-32 bg-gray-400 rounded-full border-4 border-primary"></div>
            <div className="ml-6 flex-1">
              <div className="h-8 w-48 bg-gray-300 rounded-md mb-2"></div>
              <div className="h-5 w-64 bg-gray-300 rounded-md"></div>
            </div>
          </div>
          {/* Bio Skeleton */}
          <div className="mt-8 p-6 bg-gray-200 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Spinner and Text Overlay */}
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-20 backdrop-blur-sm">
        <RingLoader color={"#8B5CF6"} loading={true} size={100} />
        <p className="mt-6 text-xl font-semibold text-gray-800 tracking-wider">
          Loading Profile...
        </p>
      </div>
    </div>
  );
}