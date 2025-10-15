// components/ReviewForm.jsx
"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { db } from "@/firebase";
import { collection, addDoc, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth methods

export default function ReviewForm({ resourceId, onReviewSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // State to hold the Firebase user

  // Effect to listen for real-time authentication changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
      }
    });

    // Cleanup subscription on unmounts
    return () => unsubscribe();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Check if the currentUser state is populated
    if (!currentUser) {
      alert("Please log in to leave a review.");
      return;
    }

    if (rating === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const reviewRef = collection(db, "student_posts", resourceId, "reviews");

      // Use properties from the Firebase user object
      await addDoc(reviewRef, {
        rating: rating,
        reviewText: reviewText,
        createdAt: serverTimestamp(),
        authorId: currentUser.uid, // Firebase user ID
        authorName: currentUser.displayName || currentUser.email, // Firebase display name or email
      });

      const resourceDocRef = doc(db, "student_posts", resourceId);
      await runTransaction(db, async (transaction) => {
        const resourceDoc = await transaction.get(resourceDocRef);
        if (!resourceDoc.exists()) {
          throw "Document does not exist!";
        }

        const oldReviewCount = resourceDoc.data().reviewCount || 0;
        const oldAverageRating = resourceDoc.data().averageRating || 0;
        const newReviewCount = oldReviewCount + 1;
        const newAverageRating =
          (oldAverageRating * oldReviewCount + rating) / newReviewCount;

        transaction.update(resourceDocRef, {
          reviewCount: newReviewCount,
          averageRating: newAverageRating,
        });
      });

      setRating(0);
      setReviewText("");
      alert("Review submitted successfully!");
      if (onReviewSubmit) onReviewSubmit();

    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there's no user, show a login prompt instead of the form
  if (!currentUser) {
    return (
      <div className="card-bg rounded-xl shadow-lg p-6 mt-6 text-center">
        <p className="primary-text">Please log in to leave a review.</p>
        {/* Optional: Add a login button here */}
      </div>
    );
  }

  return (
    <div className="card-bg rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold primary-text mb-4">Leave a Review</h2>
      <form onSubmit={handleReviewSubmit}>
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <Star
                key={starValue}
                size={24}
                className={`cursor-pointer ${
                  starValue <= (hoverRating || rating)
                    ? "text-amber-500 fill-current"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
              />
            );
          })}
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts on this resource..."
          rows="4"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="bg-btn hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg duration-500 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}