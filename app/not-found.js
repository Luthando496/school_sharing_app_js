import Link from 'next/link';
import { SearchX, Home } from 'lucide-react';
import GoBackButton from '@/components/GoBackbutton'; // We will create this next

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-6 animate-pulse">
          <SearchX className="mx-auto h-24 w-24 text-purple-400" strokeWidth={1} />
        </div>
        <h1 className="text-8xl font-bold text-purple-600 tracking-tighter">
          404
        </h1>
        <p className="mt-4 text-2xl font-semibold text-gray-700">
          Page Not Found
        </p>
        <p className="mt-2 text-gray-500">
          Oops! The page you are looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <GoBackButton />
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-full text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors duration-300"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
