"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { uploadBlog } from "@/actions/upload";

// ✅ Load ReactQuill dynamically (avoids SSR issues)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// ✅ Simple Rich Text Editor using ReactQuill
const RichTextEditor = ({ content, setContent }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list", // Covers both ordered and bullet lists
  "link",
  "image",
];

  return (
    <div className="bg-white rounded-lg shadow-inner border border-gray-300">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="Start writing your engaging article here..."
        className="min-h-[300px]"
      />
    </div>
  );
};

export default function WriteBlogPage() {
  const [user, setUser] = useState(null);

  // Blog Post State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  // UI State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");

  // 1️⃣ Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser?.displayName);
      } else {
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2️⃣ SEO Slug Generator
  useEffect(() => {
    const generateSlug = (text) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };
    const generatedSlug = generateSlug(title);
    setSlug(generatedSlug);
  }, [title]);

  // 3️⃣ Image Handling
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedImageTypes.includes(selectedFile.type)) {
        setErrorMessage(
          "Please select a JPEG, PNG, or GIF image for the blog cover."
        );
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage("Image file size must be less than 5MB");
        return;
      }

      setImageFile(selectedFile);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setErrorMessage(null);
  };

  // 4️⃣ Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subtitle || !slug || !content || !user) {
      setErrorMessage(
        "Please complete all required fields and ensure you are logged in."
      );
      return;
    }

    if (content.trim().replace(/<[^>]*>?/gm, "").length < 10) {
      setErrorMessage("Please write some meaningful content for your blog post.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress("Preparing blog post...");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("authorId", user);
      formData.append("slug", slug);
      formData.append("content", content);

      if (imageFile) {
        formData.append("image", imageFile);
        setUploadProgress("Uploading blog and cover image...");
      } else {
        setUploadProgress("Publishing blog...");
      }

      const result = await uploadBlog(formData, user);

      if (result && result.success) {
        setUploadStatus("success");
        setUploadProgress("Blog published successfully!");
        toast.success("Blog Post Published!");

        setTitle("");
        setSubtitle("");
        setContent("");
        setSlug("");
        handleRemoveImage();

        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.replace("/blogs");
          }
        }, 2000);
      } else {
        setUploadStatus("error");
        setErrorMessage(result?.error || "Publishing failed.");
        setUploadProgress("");
      }
    } catch (error) {
      console.error("Blog upload error:", error);
      setUploadStatus("error");
      setErrorMessage("A critical error occurred during upload. Please try again.");
      setUploadProgress("");
    }

    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 border border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Create a Blog Post
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Share your insights, experiences, or knowledge with fellow students
          </p>

          {/* Status Messages */}
          {uploadStatus === "success" && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-400 flex items-center">
              <CheckCircle className="text-green-600 mr-3" />
              <div>
                <span className="text-green-800 font-medium">
                  Your blog has been published successfully!
                </span>
                <div className="text-sm text-green-600 mt-1">
                  Redirecting to blogs...
                </div>
              </div>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 flex items-center">
              <AlertCircle className="text-red-600 mr-3" />
              <span className="text-red-800 font-medium">{errorMessage}</span>
            </div>
          )}
          {isUploading && uploadProgress && (
            <div className="mb-6 p-4 rounded-lg bg-blue-100 border border-blue-400 flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
              <span className="text-blue-800 font-medium">{uploadProgress}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block text-xl font-semibold text-gray-800">
                Blog Cover Image (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Add a featured image (Max 5MB)
              </p>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors duration-200 cursor-pointer">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/jpeg, image/png, image/gif"
                />
                {!imagePreview ? (
                  <div className="flex flex-col items-center">
                    <Camera size={40} className="text-gray-400 mb-3" />
                    <p className="text-base text-gray-600 font-medium">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, GIF (5MB max)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Blog Cover Preview"
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg text-red-500 hover:text-red-700 transition-transform hover:scale-105"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title + Subtitle */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xl font-semibold text-gray-800">
                  Blog Title<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A Deep Dive into Quantum Computing"
                  className="w-full text-lg rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xl font-semibold text-gray-800">
                  Subtitle / Summary<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A short, catchy description for search results."
                  className="w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="block text-xl font-semibold text-gray-800">
                SEO Slug (URL Path)
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Example: <code className="bg-gray-200 text-blue-600 rounded px-1 py-0.5 font-mono">
                  /blog/{slug || "your-title-here"}
                </code>
              </p>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
                className="w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            {/* ✅ Main Rich Text Editor */}
            <div className="space-y-2">
              <label className="block text-xl font-semibold text-gray-800">
                Blog Content<span className="text-red-500 ml-1">*</span>
              </label>
              <RichTextEditor content={content} setContent={setContent} />
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 px-4 text-xl font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3 inline-block"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <FileText size={24} className="mr-2 inline-block" />
                    Publish Blog Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
