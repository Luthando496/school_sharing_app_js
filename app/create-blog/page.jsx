"use client";
import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the styles
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Camera,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadBlog } from "@/actions/upload";
import toast from "react-hot-toast";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function UploadBlogPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const imageInputRef = useRef(null);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
      setSlug(generatedSlug);
    } else {
      setSlug("");
    }
  }, [title]);

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedImageTypes.includes(selectedFile.type)) {
        setErrorMessage(
          "Please select a JPEG, PNG, or GIF image for the blog cover"
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subtitle || !slug || !content || !user) {
      setErrorMessage(
        "Please provide title, subtitle, slug, content, and make sure you're logged in"
      );
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file size exceeds 5MB.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress("Preparing upload...");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("slug", slug);
      formData.append("content", content);
      formData.append("authorId", user.uid);

      if (imageFile) {
        formData.append("image", imageFile);
        setUploadProgress("Uploading blog and image...");
      } else {
        setUploadProgress("Uploading blog...");
      }

      const result = await uploadBlog(formData);

      if (result && result.success) {
        setUploadStatus("success");
        setUploadProgress("Upload completed successfully!");
        toast.success("Blog Posted!");

        setTitle("");
        setSubtitle("");
        setSlug("");
        setContent("");
        handleRemoveImage();

        setTimeout(() => {
          router.push("/blogs");
        }, 2000);
      } else {
        setUploadStatus("error");
        setErrorMessage(result?.error || "Upload failed");
        setUploadProgress("");
      }
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(
        "Network error. Please check your connection and try again."
      );
      setUploadProgress("");
    }

    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create a Blog Post
          </h1>
          <p className="text-gray-600 mb-8">
            Share your insights, experiences, or knowledge with fellow students
          </p>

          {/* Image Size Info */}
          {imageFile && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center mb-2">
                <Info className="text-blue-600 mr-2" size={16} />
                <span className="text-blue-800 font-medium">
                  Image Size Summary
                </span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Image: {formatFileSize(imageFile.size)} / 5 MB</div>
              </div>
            </div>
          )}

          {/* Upload Status Messages */}
          {uploadStatus === "success" && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-400 flex items-center">
              <CheckCircle className="text-green-600 mr-3" />
              <div>
                <span className="text-green-800">
                  Your blog has been posted successfully!
                </span>
                <div className="text-sm text-green-600 mt-1">
                  Redirecting to blogs...
                </div>
              </div>
            </div>
          )}
          {uploadStatus === "error" && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 flex items-center">
              <AlertCircle className="text-red-600 mr-3" />
              <span className="text-red-800">{errorMessage}</span>
            </div>
          )}
          {isUploading && uploadProgress && (
            <div className="mb-6 p-4 rounded-lg bg-blue-100 border border-blue-400 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">{uploadProgress}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Blog Cover Image (Optional)
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors duration-200 cursor-pointer">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/jpeg, image/png, image/gif"
                />
                {!imagePreview ? (
                  <div className="flex flex-col items-center">
                    <Camera size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Add a cover image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, GIF (5MB max)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. South Africa Inflammable"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subtitle"
                className="block text-sm font-medium text-gray-700"
              >
                Subtitle
              </label>
              <input
                id="subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. A brief overview of the topic"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700"
              >
                Slug (SEO-friendly URL)
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. south-africa-inflammable"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated from title, but you can edit it.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <ReactQuill
                value={content}
                onChange={setContent}
                placeholder="Write your blog content here..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "list",
                  "bullet",
                  "link",
                  "image",
                ]}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-dark transition-colors duration-200 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Uploading...
                  </>
                ) : (
                  "Post Blog"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Tips for a Great Blog Post
            </h3>
            <ul className="text-gray-600 text-sm space-y-3 list-none">
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Only post original content you have created or have permission to share
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>Ensure your content is clear, well-organized, and engaging</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Provide accurate titles and subtitles to attract readers
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Add a cover image to make your blog more visually appealing
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Accepted image formats: JPG, PNG, and GIF
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Maximum image size: 5MB
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}