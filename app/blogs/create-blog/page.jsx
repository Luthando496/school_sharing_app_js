"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, X, AlertCircle, CheckCircle, FileText, Bold, Italic, List, ListOrdered, Code, Heading, Quote, Link, Minus } from "lucide-react";
import toast from "react-hot-toast";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "@/firebase";
import {uploadBlog} from '@/actions/upload'


const RichTextEditor = ({ content, setContent }) => {
    const editorRef = useRef(null);

    // Sync content state on mount and update
    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    // Handle input changes
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    }, [setContent]);
    
    // Core formatting command (execCommand is deprecated but the most reliable in this sandbox)
    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        // Manually trigger state update to capture changes
        handleInput(); 
        editorRef.current.focus();
    };
    
    const applyBlock = (tag) => {
        document.execCommand('formatBlock', false, tag);
        handleInput();
        editorRef.current.focus();
    };

    const ToolbarButton = ({ command, value, icon: Icon, title, block = false }) => (
        <button
            type="button"
            onClick={() => block ? applyBlock(command) : applyFormat(command, value)}
            title={title}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors duration-150"
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg shadow-inner overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center p-2 border-b bg-gray-50">
                <ToolbarButton command="bold" icon={Bold} title="Bold" />
                <ToolbarButton command="italic" icon={Italic} title="Italic" />
                <ToolbarButton command="insertUnorderedList" icon={List} title="Bullet List" />
                <ToolbarButton command="insertOrderedList" icon={ListOrdered} title="Numbered List" />
                <ToolbarButton command="formatBlock" value="blockquote" icon={Quote} title="Quote" block={true} />
                <ToolbarButton command="formatBlock" value="pre" icon={Code} title="Code Block" block={true} />
                <ToolbarButton command="insertHorizontalRule" icon={Minus} title="Divider" />

                {/* Dropdown for Headings */}
                <select 
                    onChange={(e) => applyBlock(e.target.value)}
                    className="p-1 text-sm bg-white border rounded ml-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    defaultValue="p"
                >
                    <option value="p">Normal text</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                </select>
                
            </div>
            
            {/* Content Area */}
            <div 
                ref={editorRef}
                contentEditable={true}
                onInput={handleInput}
                className="min-h-[300px] p-4 bg-white focus:outline-none text-base font-serif"
                dangerouslySetInnerHTML={{ __html: content }}
                placeholder="Start writing your engaging article here..."
                // Basic styles to mimic standard rich text look
                style={{ lineHeight: '1.6', fontSize: '1rem', wordWrap: 'break-word' }}
            >
            </div>
            <style jsx global>{`
                /* Ensure contenteditable styles are applied */
                [contenteditable="true"]:focus {
                    outline: none;
                }
                .min-h-\\[300px\\] h2 { font-size: 1.5em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
                .min-h-\\[300px\\] h3 { font-size: 1.25em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
                .min-h-\\[300px\\] blockquote { 
                    border-left: 4px solid #ccc; 
                    padding-left: 1rem; 
                    margin-left: 0; 
                    font-style: italic; 
                    color: #555;
                }
                .min-h-\\[300px\\] pre { 
                    background: #f4f4f4; 
                    padding: 0.75rem; 
                    border-radius: 4px; 
                    font-family: monospace; 
                    overflow-x: auto;
                }
            `}</style>
        </div>
    );
};




// --- Main React Component ---

export default function WriteBlogPage() {
  const [user, setUser] = useState(null);

  // Blog Post State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  // Content state will hold the HTML string from the RichTextEditor
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

  // 1. Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser?.displayName);
      } else {
        // Fallback for router.push("/login")
        if (typeof window !== 'undefined') {
            window.location.replace("/login");
        }
      }
    });
    return () => unsubscribe();
  }, []); // Empty dependency array as router is no longer used


  // 2. SEO Slug Generator Logic
  useEffect(() => {
    const generateSlug = (text) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric (except space/hyphen)
            .replace(/[\s-]+/g, '-') // Replace spaces/multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };
    const generatedSlug = generateSlug(title);
    setSlug(generatedSlug);
  }, [title]);


  // 3. Image Handling
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedImageTypes.includes(selectedFile.type)) {
        setErrorMessage("Please select a JPEG, PNG, or GIF image for the blog cover");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
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


  // 4. Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subtitle || !slug || !content || !user) {
      setErrorMessage(
        "Please complete all required fields (Title, Subtitle, Slug, Content) and ensure you are logged in."
      );
      return;
    }
    
    // Validate content is not empty (e.g., just "<p></p>")
    if (content.trim().replace(/<[^>]*>?/gm, '').length < 10) {
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
      formData.append("authorId",user)
      formData.append("slug", slug);
      formData.append("content", content); // HTML Content
      
      // Append image only if it exists
      if (imageFile) {
        formData.append("image", imageFile);
        setUploadProgress("Uploading blog and cover image...");
      } else {
        setUploadProgress("Publishing blog...");
      }

      // Call the self-contained Firebase action
      const result = await uploadBlog(formData, user);

      if (result && result.success) {
        setUploadStatus("success");
        setUploadProgress("Blog published successfully!");
        toast.success("Blog Post Published!");

        // Reset form fields
        setTitle("");
        setSubtitle("");
        setContent("");
        setSlug("");
        handleRemoveImage();

        setTimeout(() => {
          // Fallback for router.push("/blogs")
          if (typeof window !== 'undefined') {
            window.location.replace("/blogs");
          }
        }, 2000);
      } else {
        setUploadStatus("error");
        setErrorMessage(result?.error || "Publishing failed. Check console for details.");
        setUploadProgress("");
      }
    } catch (error) {
      console.error("Blog upload error:", error);
      setUploadStatus("error");
      setErrorMessage(
        "A critical error occurred during upload. Please try again."
      );
      setUploadProgress("");
    }

    setIsUploading(false);
  };

  console.log("MY USER FROM BLOG PAGES_DIR_ALIAS",user)


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

          {/* Upload Status Messages */}
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
            {/* Blog Cover Image */}
            <div className="space-y-2">
                <label className="block text-xl font-semibold text-gray-800">
                    Blog Cover Image (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                    Add a featured image. (Max 5MB)
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

            {/* Title and Subtitle */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-xl font-semibold text-gray-800">
                  Blog Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A Deep Dive into Quantum Computing"
                  className="mt-1 block w-full text-lg rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subtitle" className="block text-xl font-semibold text-gray-800">
                  Subtitle / Summary
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A short, catchy description for search results."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
            </div>
            
            {/* Slug */}
            <div className="space-y-2">
                <label htmlFor="slug" className="block text-xl font-semibold text-gray-800">
                  SEO Slug (URL Path)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                    Example: <code className="bg-gray-200 text-blue-600 rounded px-1 py-0.5 font-mono">/blog/{slug || 'your-title-here'}</code>
                </p>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)} // Allows manual editing
                  placeholder="auto-generated-from-title"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>

            {/* Main Content Area (Rich Text Editor) */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-xl font-semibold text-gray-800">
                Blog Content
                <span className="text-red-500 ml-1">*</span>
              </label>
              {/* Custom Rich Text Editor Component */}
              <RichTextEditor content={content} setContent={setContent} />
              
            </div>

            <div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full inline-flex justify-center py-4 px-4 border border-transparent shadow-lg text-xl font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <FileText size={24} className="mr-2" />
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
