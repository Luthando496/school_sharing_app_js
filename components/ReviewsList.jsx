// components/ReviewsList.jsx
"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import StarRatingDisplay from "./StarRatingDisplay";

export default function ReviewsList({ resourceId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resourceId) return;
    const reviewsRef = collection(db, "student_posts", resourceId, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resourceId]);

  if (loading) return <p className="secondary-text">Loading reviews...</p>;

  return (
    <div className="card-bg rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold primary-text mb-4">User Reviews ({reviews.length})</h2>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-center mb-1">
                <StarRatingDisplay rating={review.rating} />
                <p className="ml-4 text-sm font-medium">{review.authorName || 'Anonymous'}</p>
              </div>
              <p className="secondary-text">{review.reviewText}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="secondary-text">Be the first to leave a review!</p>
      )}
    </div>
  );
}