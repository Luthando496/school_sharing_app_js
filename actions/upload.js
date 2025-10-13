// actions/upload.js
"use server";
import { revalidatePath } from "next/cache";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";



export async function uploadDocument(formData) {
  console.log("Starting document upload process...");
  
  try {
    const file = formData.get("file");
    const thumbnailFile = formData.get("thumbnail");
    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const type = formData.get("type");
    const authorId = formData.get("authorId");

    console.log("File sizes:", {
      documentSize: file?.size,
      thumbnailSize: thumbnailFile?.size,
      totalSize: (file?.size || 0) + (thumbnailFile?.size || 0)
    });

    if (!file || !title || !authorId) {
      return { error: "File, title, and author ID are required" };
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { error: "Only PDF, Word documents, images, and text files are allowed" };
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return { error: "Document file size must be less than 20MB" };
    }

    // Validate thumbnail file if provided
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (thumbnailFile && thumbnailFile.size > 0) {
      if (!allowedImageTypes.includes(thumbnailFile.type)) {
        return { error: "Thumbnail must be a JPEG, PNG, or GIF image" };
      }
      // Validate thumbnail size (max 5MB)
      if (thumbnailFile.size > 5 * 1024 * 1024) {
        return { error: "Thumbnail file size must be less than 5MB" };
      }
    }

    // Check total size doesn't exceed reasonable limits
    const totalSize = file.size + (thumbnailFile?.size || 0);
    if (totalSize > 25 * 1024 * 1024) {
      return { error: "Combined file size must be less than 25MB" };
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    console.log("Uploading document to Firebase Storage...");
    
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `resource_documents/${authorId}/${fileName}`);
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: file.type,
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Document upload successful:", downloadURL);
    
    let thumbnailURL = downloadURL; // Default to file URL
    
    // Upload thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log("Uploading thumbnail to Firebase Storage...");
      
      const thumbnailExtension = thumbnailFile.name.split('.').pop();
      const sanitizedThumbnailName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const thumbnailFileName = `thumb_${timestamp}_${sanitizedThumbnailName}`;
      const thumbnailStorageRef = ref(storage, `resource_thumbnails/${authorId}/${thumbnailFileName}`);
      
      const thumbnailArrayBuffer = await thumbnailFile.arrayBuffer();
      const thumbnailBuffer = new Uint8Array(thumbnailArrayBuffer);
      
      const thumbnailSnapshot = await uploadBytes(thumbnailStorageRef, thumbnailBuffer, {
        contentType: thumbnailFile.type,
      });
      
      thumbnailURL = await getDownloadURL(thumbnailSnapshot.ref);
      console.log("Thumbnail upload successful:", thumbnailURL);
    }
    
    console.log("Saving metadata to Firestore...");
    
    // Store metadata in Firestore
    const resourceId = `${authorId}_${timestamp}`;
    const resourceRef = doc(db, "student_posts", resourceId);
    
    await setDoc(resourceRef, {
      id: resourceId,
      title: title.trim(),
      description: description.trim() || "",
      category: category || "Uncategorized",
      type: type || "Document",
      fileURL: downloadURL,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      authorId: authorId,
      uploadDate: serverTimestamp(),
      downloads: 0,
      image: thumbnailURL, // Use thumbnail URL or file URL as fallback
      thumbnailURL: thumbnailURL, // Store thumbnail URL separately
      hasThumbnail: thumbnailFile && thumbnailFile.size > 0, // Flag to indicate if custom thumbnail was uploaded
    });

    console.log("Metadata saved successfully. Resource ID:", resourceId);

    // Revalidate cache for updated resource list
    revalidatePath("/resources");

    return { 
      success: true, 
      url: downloadURL, 
      fileId: resourceId, 
      thumbnailURL,
      message: "Document uploaded successfully!"
    };
    
  } catch (error) {
    console.error("Upload error details:", error);
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('storage/unauthorized')) {
        return { error: "You don't have permission to upload files. Please check your authentication." };
      } else if (error.message.includes('storage/quota-exceeded')) {
        return { error: "Storage quota exceeded. Please try again later." };
      } else if (error.message.includes('storage/retry-limit-exceeded')) {
        return { error: "Upload timeout. Please check your internet connection and try again." };
      } else if (error.message.includes('firestore')) {
        return { error: "Failed to save document information. Please try again." };
      }
    }
    
    return { error: "Upload failed. Please check your internet connection and try again." };
  }
}






export async function uploadBlog(formData) {
  try {
    const title = formData.get("title");
    const subtitle = formData.get("subtitle");
    const slug = formData.get("slug");
    const content = formData.get("content");
    const authorId = formData.get("authorId");
    const imageFile = formData.get("image");

    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `blogs/${authorId}/${slug}/cover_${Date.now()}.${imageFile.name.split('.').pop()}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const blogData = {
      title,
      subtitle,
      slug,
      content,
      authorId,
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "blogs"), blogData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error uploading blog:", error);
    return { success: false, error: error.message };
  }
}