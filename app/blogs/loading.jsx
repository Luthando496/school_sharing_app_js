"use client";

import { Loader2, BookOpenCheck } from 'lucide-react';

const LoadingPage = () => {
  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center p-8 rounded-2xl shadow-xl bg-white border border-gray-200">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 animate-pulse">
          <BookOpenCheck size={40} className="text-white" />
        </div>
    <div className="flex items-center space-x-2">
          <Loader2 size={24} className="text-amber-500 animate-spin" />
          <p className="text-xl font-medium text-gray-700">Loading resources...</p>
    </div>
    <p className="mt-2 text-sm text-gray-500">
          This won't take long.
        </p>
      </div>
    </section>
  );
};

export default LoadingPage;