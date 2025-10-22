"use client";
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Camera,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/actions/upload";
import toast from "react-hot-toast";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [type, setType] = useState("Document");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
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

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Calculate total file size
  const getTotalFileSize = () => {
    const fileSize = file?.size || 0;
    const thumbnailSize = thumbnailFile?.size || 0;
    return fileSize + thumbnailSize;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
        "text/plain",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage(
          "Please select a PDF, Word document, image, or text file"
        );
        return;
      }

      if (selectedFile.size > 20 * 1024 * 1024) {
        setErrorMessage("Document file size must be less than 20MB");
        return;
      }

      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage(null);

      const newTotalSize = selectedFile.size + (thumbnailFile?.size || 0);
      if (newTotalSize > 25 * 1024 * 1024) {
        setErrorMessage(
          "Combined file size would exceed 25MB. Please reduce file sizes."
        );
      }
    }
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedImageTypes.includes(selectedFile.type)) {
        setErrorMessage(
          "Please select a JPEG, PNG, or GIF image for thumbnail"
        );
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage("Thumbnail file size must be less than 5MB");
        return;
      }

      const newTotalSize = (file?.size || 0) + selectedFile.size;
      if (newTotalSize > 25 * 1024 * 1024) {
        setErrorMessage(
          "Combined file size would exceed 25MB. Please reduce file sizes."
        );
        return;
      }

      setThumbnailFile(selectedFile);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadStatus("idle");
    setErrorMessage(null);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !user) {
      setErrorMessage(
        "Please provide a file, title, and make sure you're logged in"
      );
      return;
    }

    if (getTotalFileSize() > 25 * 1024 * 1024) {
      setErrorMessage(
        "Combined file size exceeds 25MB. Please reduce file sizes."
      );
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress("Preparing upload...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("authorId", user.uid);

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
        setUploadProgress("Uploading document and thumbnail...");
      } else {
        setUploadProgress("Uploading document...");
      }

      const result = await uploadDocument(formData);

      if (result && result.success) {
        setUploadStatus("success");
        setUploadProgress("Upload completed successfully!");
        toast.success("Resource Shared!");

        setTitle("");
        setDescription("");
        setCategory("Uncategorized");
        setType("Document");
        handleRemoveFile();
        handleRemoveThumbnail();

        setTimeout(() => {
          router.push("/resources");
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

  const getFileIcon = () => {
    if (!file) return <FileText size={48} className="text-accent" />;

    if (file.type === "application/pdf") {
      return <FileText size={48} className="text-red-500" />;
    } else if (file.type.startsWith("image/")) {
      return <FileText size={48} className="text-green-500" />;
    } else {
      return <File size={48} className="text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Share Your Knowledge
          </h1>
          <p className="text-gray-600 mb-8">
            Upload study materials, notes, or resources to help fellow students
          </p>

          {/* File Size Info */}
          {(file || thumbnailFile) && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center mb-2">
                <Info className="text-blue-600 mr-2" size={16} />
                <span className="text-blue-800 font-medium">
                  File Size Summary
                </span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                {file && <div>Document: {formatFileSize(file.size)}</div>}
                {thumbnailFile && (
                  <div>Thumbnail: {formatFileSize(thumbnailFile.size)}</div>
                )}
                <div className="font-medium">
                  Total: {formatFileSize(getTotalFileSize())} / 25 MB
                </div>
              </div>
            </div>
          )}

          {/* Upload Status Messages */}
          {uploadStatus === "success" && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-400 flex items-center">
              <CheckCircle className="text-green-600 mr-3" />
              <div>
                <span className="text-green-800">
                  Your document has been uploaded successfully!
                </span>
                <div className="text-sm text-green-600 mt-1">
                  Redirecting to resources...
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Document File
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors duration-200 cursor-pointer">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  {!file ? (
                    <div className="flex flex-col items-center">
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload a document
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, TXT, or Image (20MB max)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileIcon()}
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Thumbnail (Optional)
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors duration-200 cursor-pointer">
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/jpeg, image/png, image/gif"
                  />
                  {!thumbnailPreview ? (
                    <div className="flex flex-col items-center">
                      <Camera size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Add a thumbnail
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, GIF (5MB max)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
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
                placeholder="e.g. Introduction to Data Structures"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide a brief summary of the document content"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="Uncategorized">Uncategorized</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="History">History</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Literature">Literature</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="Document">Document</option>
                  <option value="Notes">Notes</option>
                  <option value="Exercises">Exercises</option>
                  <option value="Study Guide">Study Guide</option>
                  <option value="Infographic">Infographic</option>
                  <option value="Reference">Reference</option>
                  <option value="Guide">Guide</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-lg font-medium bg-green-600 rounded-md text-gray-700 bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-dark transition-colors duration-200 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Uploading...
                  </>
                ) : (
                  "Share Resource"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Tips for a Great Upload
            </h3>
            <ul className="text-gray-600 text-sm space-y-3 list-none">
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Only upload content you have created or have permission to
                  share
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>Ensure your documents are clear and well-organized</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Provide accurate titles and descriptions to help others find
                  your content
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Add a thumbnail image to help others preview your document
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Accepted document formats: PDF, DOC, DOCX, JPG, PNG, GIF, and
                  TXT
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>Accepted thumbnail formats: JPG, PNG, and GIF</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span>
                  Maximum file size: 20MB for documents, 5MB for thumbnails,
                  25MB total
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
