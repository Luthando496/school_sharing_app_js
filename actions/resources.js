// actions/resources.js
'use server';

import { db } from '../firebase';
import { collection, doc, getDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage

//  GET ALL POSTS IN FIREBASE
export async function fetchAllPosts() {
  try {
    const postsCollection = collection(db, 'student_posts');
    const querySnapshot = await getDocs(postsCollection);
    const posts = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const uploadDate = data.uploadDate && data.uploadDate.toDate
        ? data.uploadDate.toDate().toISOString()
        : data.uploadDate || '';

      posts.push({
        id: doc.id,
        title: data.title || '',
        authorId: data.authorId || '',
        description: data.description || '',
        category: data.category || '',
        type: data.type || '',
        uploadDate,
        downloads: data.downloads || 0,
        image: data.image || '',
        fileName: data.fileName || '',
      });
    });

    return posts;
  } catch (error) {
    console.error('Failed to fetch all posts:', error);
    return [];
  }
}

//  GET POSTS BY ID IN FIREBASE
export async function getPostById(id) {
  try {
    const postId = Array.isArray(id) ? id[0] : id;

    if (!postId) {
      console.error('No ID provided');
      return null;
    }

    const docRef = doc(db, 'student_posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const uploadDate = data.uploadDate && data.uploadDate.toDate
        ? data.uploadDate.toDate().toISOString()
        : data.uploadDate || '';

      // Optionally fetch the download URL server-side
      let downloadURL = '';
      if (data.fileName && data.authorId) {
        const storage = getStorage();
        const fileRef = ref(storage, `resource_documents/${data.authorId}/${data.fileName}`);
        downloadURL = await getDownloadURL(fileRef).catch((error) => {
          console.error('Error getting download URL:', error);
          return '';
        });
      }

      return {
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        type: data.type || '',
        uploadDate,
        downloads: data.downloads || 0,
        thumbnailURL: data.thumbnailURL || '',
        authorId: data.authorId || '',
        image: data.image || '',
        fileName: data.fileName || '', // Include fileName
        downloadURL, // Optional: include download URL
        fileURL: data.fileURL
      };
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

// Update getRelatedPosts similarly (optional, if related posts need download URLs)
export async function getRelatedPosts(category, currentPostId) {
  try {
    const q = query(
      collection(db, 'student_posts'),
      where('category', '==', category),
      where('__name__', '!=', currentPostId),
      limit(3)
    );

    const querySnapshot = await getDocs(q);
    const relatedPosts = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const uploadDate = data.uploadDate && data.uploadDate.toDate
        ? data.uploadDate.toDate().toISOString()
        : data.uploadDate || '';

      // Optionally fetch download URL for related posts
      let downloadURL = '';
      if (data.fileName && data.authorId) {
        const storage = getStorage();
        const fileRef = ref(storage, `resource_documents/${data.authorId}/${data.fileName}`);
        downloadURL = await getDownloadURL(fileRef).catch((error) => {
          console.error('Error getting download URL:', error);
          return '';
        });
      }

      relatedPosts.push({
        id: doc.id,
        title: data.title || '',
        authorId: data.authorId || '',
        description: data.description || '',
        category: data.category || '',
        type: data.type || '',
        uploadDate,
        downloads: data.downloads || 0,
        image: data.image || '',
        fileName: data.fileName || '', // Include fileName
        downloadURL, // Optional
      });
    }

    return relatedPosts;
  } catch (error) {
    console.error('Error getting related posts:', error);
    return [];
  }
}