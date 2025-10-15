"use client";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function GoBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-medium rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1"
    >
      <ArrowLeft className="mr-2 h-5 w-5" />
      Go Back
    </button>
  );
}