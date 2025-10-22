"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Book,
  Download,
  Eye,
  Star,
  Calendar,
} from "lucide-react";
import { fetchAllPosts } from "../../actions/resources";
import Link from "next/link";
import LoadingPage from "./loading";

const categories = [
  "All",
  "Mathematics",
  "Computer Science",
  "History",
  "Chemistry",
  "Literature",
  "Physics",
];
const resourceTypes = [
  "All",
  "Notes",
  "Exercises",
  "Study Guide",
  "Infographic",
  "Reference",
  "Guide",
];

export default function ResourcesPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const getPosts = async () => {
      try {
        const fetchedPosts = await fetchAllPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false); // ✅ hide loader when finished
      }
    };

    getPosts();
  }, []);

  if (loading) {
    return <LoadingPage />; // ✅ show loading screen
  }

  // Filter resources based on search and filters
  const filteredResources = posts.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;
    const matchesType =
      selectedType === "All" || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === "popular") return b.downloads - a.downloads;
    if (sortBy === "newest")
      return (
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Browse Resources
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Discover study materials, notes, and resources shared by students
            worldwide
          </p>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Filter Options */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <span className="font-medium">Category:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <span className="font-medium">Type:</span>
            </div>
            {resourceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full ${
                  selectedType === type
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {sortedResources.length} Resources Found
            </h2>
            <a
              href="/upload-resources"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-500 cursor-pointer flex items-center gap-2"
            >
              <Book size={18} />
              Upload Resource
            </a>
          </div>

          {sortedResources.length === 0 ? (
            <div className="text-center py-12">
              <Book size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No resources found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 overflow-hidden bg-gray-200">
                    <img
                      src={resource.image || "/api/placeholder/300/200"}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {resource.category}
                      </span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        {resource.type}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-5">
                      {resource.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <Star
                          size={16}
                          className="text-amber-500 fill-current"
                        />
                        {/* <span className="ml-1 text-sm font-medium">{resource.rating.toFixed(1)}</span> */}
                      </div>
                      <div className="flex items-center">
                        <Download size={16} className="text-gray-500" />
                        <span className="ml-1 text-sm text-gray-600">
                          {resource.downloads.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="ml-1 text-sm text-gray-600">
                          {new Date(resource.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-500 cursor-pointer flex items-center justify-center gap-1">
                        <Download size={16} />
                        Download
                      </button>
                      <Link
                        href={`/resources/${resource.id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition duration-500 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye size={16} />
                        Preview
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
