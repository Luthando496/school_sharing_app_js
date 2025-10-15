import { getAllBlogs } from "@/actions/upload";
import Link from "next/link";
import { Pencil } from "lucide-react";

export default async function BlogsPage() {
  const blogs = await getAllBlogs();

  if (!blogs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Student Blog Hub</h1>
        <p className="text-gray-600 mb-12">
          No blogs available yet. Be the first to share your insights!
        </p>
        <Link
          href="/blogs/create-blog"
          className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          <Pencil size={18} />
          Create Your First Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in">
          Student Blog Hub
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Explore insights, experiences, and knowledge shared by your peers.
        </p>

        <div className="text-center mb-12">
          <Link
            href="/create-blogs"
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <Pencil size={18} />
            Create a New Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              href={`/blogs/${blog.slug}`}
              key={blog.id}
              className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
            >
              {blog.imageUrl && (
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 text-white font-semibold">
                      Read More
                    </div>
                  </div>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {blog.subtitle}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    By {blog?.author || blog.authorId || "Anonymous"} •{" "}
                    {blog.createdAt
                      ? blog.createdAt.toDate
                        ? new Date(blog.createdAt.toDate()).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : new Date(blog.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                      : "No date available"}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {blog.category || "Uncategorized"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}