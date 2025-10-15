import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default async function BlogDetail({ params }) {
  const { slug } = params;
  // Adjust the ID logic to match your uploadBlog action (e.g., ${authorId}_${slug}_${Date.now()})
  // For simplicity, we'll assume the slug is part of the ID; refine this based on your data structure
  const docRef = doc(db, "blogs", `26proIEzA8WmeVBMcaxvUp3LeVX2_lalalalala_1760346074961`); // Replace with actual ID generation logic
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center bg-white rounded-lg shadow-md">
        <p className="text-gray-600 text-lg">Blog not found</p>
      </div>
    );
  }

  const blog = { id: docSnap.id, ...docSnap.data() };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {blog.imageUrl && (
          <div className="relative w-full h-64 overflow-hidden">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          <p className="text-gray-600 mb-6">{blog.subtitle}</p>
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span>By {blog.author || "Anonymous"}</span>
            <span className="mx-2">•</span>
            <span>Posted {new Date(blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
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