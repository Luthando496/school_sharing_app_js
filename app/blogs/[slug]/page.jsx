import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/firebase";

export default async function BlogDetail({ params }) {
  const { slug } = params;

  // 1. Create a query to find the document where the 'slug' field matches the URL parameter.
  const blogsRef = collection(db, "blogs");
  const q = query(blogsRef, where("slug", "==", slug), limit(1));

  // 2. Execute the query to get the results.
  const querySnapshot = await getDocs(q);

  // 3. Check if the query returned any documents.
  if (querySnapshot.empty) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center bg-white rounded-lg shadow-md">
        <p className="text-gray-600 text-lg">Blog not found</p>
      </div>
    );
  }

  // 4. Extract the data from the first document in the results.
  const docSnap = querySnapshot.docs[0];
  const blog = { id: docSnap.id, ...docSnap.data() };

  // Convert Firestore Timestamp to a serializable format (if it exists)
  const createdAtDate = blog.createdAt?.toDate ? new Date(blog.createdAt.toDate()) : new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {blog.imageUrl && (
          <div className="relative w-full h-64 md:h-80 overflow-hidden">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{blog.subtitle}</p>
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span>By {blog.author || "Anonymous"}</span>
            <span className="mx-2">•</span>
            <span>Posted {createdAtDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div
            className="prose max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </div>
  );
}
