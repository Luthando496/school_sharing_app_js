"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Download,
  Eye,
  Star,
  Calendar,
  Book,
  ArrowLeft,
  FileText,
  Share,
} from "lucide-react";
import { getPostById, getRelatedPosts } from "@/actions/resources";
import Image from "next/image";
import LoadingPage from "../loading";

// Import the new components we created
import StarRatingDisplay from "@/components/StarRatingDisplay"; // Adjust path if needed
import ReviewForm from "@/components/ReviewForm"; // Adjust path if needed
import ReviewsList from "@/components/ReviewsList"; // Adjust path if needed

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  // We wrap the data fetching logic in a function to make it reusable
  const fetchResource = async () => {
    try {
      const idParam = params?.id;
      if (!idParam) return;

      const singlePost = await getPostById(idParam);
      setResource(singlePost);

      if (singlePost?.category && singlePost?.id) {
        const related = await getRelatedPosts(
          singlePost.category,
          singlePost.id
        );
        setRelatedResources(related);
      }
    } catch (error) {
      console.error("Failed to fetch resource:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [params.id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold primary-text mb-4">
            Resource Not Found
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-btn hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg duration-500 cursor-pointer flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!resource?.fileURL) {
      alert("Download URL not available");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch("/api/increment-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: resource.id }),
      });

      if (response.ok) {
        setResource((prev) =>
          prev ? { ...prev, downloads: prev.downloads + 1 } : null
        );
      } else {
        console.error("Failed to update download count");
      }

      const link = document.createElement("a");
      link.href = resource.fileURL;
      link.download = resource.fileName || resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to start download");
    } finally {
      setIsDownloading(false);
    }
  };

  function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  const handleShare = () => {
    if (navigator.share && resource) {
      navigator
        .share({
          title: resource.title,
          text: resource.description,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Sharing failed", error);
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        });
    } else if (resource) {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-secondary py-4">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="bg-btn hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg duration-500 cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Resources
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card-bg rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div className="flex gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {resource.category}
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  {/* MODIFICATION: Display the average rating and count */}
                  <div className="flex items-center gap-2">
                    <StarRatingDisplay rating={resource.averageRating || 0} />
                    <span className="text-sm secondary-text">
                      ({resource.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold primary-text mb-4">
                  {resource.title}
                </h1>
                <p className="secondary-text text-lg mb-6">
                  {resource.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                    <Download size={20} className="text-gray-600 mb-1" />
                    <span className="text-sm font-medium">
                      {resource.downloads}
                    </span>
                    <span className="text-xs text-gray-500">Downloads</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 bg-btn hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg text-sm duration-500 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download Resource
                      </>
                    )}
                  </button>
                  <button className="px-4 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 duration-500 cursor-pointer flex items-center justify-center gap-2">
                    <Eye size={18} />
                    Preview
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 duration-500 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Share size={18} />
                    Share
                  </button>
                </div>
              </div>
            </div>
            <div className="card-bg rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold primary-text mb-4">
                Resource Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Upload Date</p>
                    <p className="font-medium">
                      {resource.uploadDate && formatDate(resource.uploadDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">File Format</p>
                    <p className="font-medium">
                      {resource.fileName.split(".").pop()?.toUpperCase() ||
                        "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Book size={18} className="text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Resource Type</p>
                    <p className="font-medium">{resource.type}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium primary-text mb-2">
                  Content Overview
                </h3>
              </div>
            </div>

            {/* NEW: Add the Review Form and Review List components */}
            {/* You might want to wrap this in a check to see if a user is logged in */}
            <ReviewForm resourceId={resource.id} onReviewSubmit={fetchResource} />
            <ReviewsList resourceId={resource.id} />

          </div>
          <div className="lg:col-span-1">
            <div className="card-bg rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold primary-text mb-4">
                Related Resources
              </h2>
              {relatedResources.length > 0 ? (
                <div className="space-y-4">
                  {relatedResources.map((related) => (
                    <div
                      key={related.id}
                      className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/resources/${related.id}`)}
                    >
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          width={500}
                          height={500}
                          src={related.image}
                          alt={related.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium primary-text truncate">
                          {related.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {related.category}
                        </p>
                        <div className="flex items-center mt-1">
                          {/* Here we can use the new display component for related items too! */}
                          <StarRatingDisplay rating={related.averageRating || 0} />
                          <span className="mx-2 text-gray-300">•</span>
                          <Download size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-500 ml-1">
                            {related.downloads}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="secondary-text text-center py-4">
                  No related resources found
                </p>
              )}
              <button
                onClick={() => router.push("/resources")}
                className="w-full mt-6 bg-btn hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg duration-500 cursor-pointer"
              >
                Browse All Resources
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}