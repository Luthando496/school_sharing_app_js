// app/api/increment-download/route.js
import { db } from '@/firebase';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const postRef = doc(db, 'student_posts', postId);
    await updateDoc(postRef, {
      downloads: increment(1)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json({ error: 'Failed to increment download count' }, { status: 500 });
  }
}