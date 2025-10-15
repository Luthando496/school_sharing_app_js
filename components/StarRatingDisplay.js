// components/StarRatingDisplay.jsx
import { Star } from "lucide-react";

export default function StarRatingDisplay({ rating, totalStars = 5 }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={16} className="text-amber-500 fill-current" />
      ))}
      {halfStar && <Star size={16} className="text-amber-500" />} {/* Simplified half-star */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={16} className="text-gray-300" />
      ))}
      <span className="ml-2 text-sm font-medium primary-text">
        {rating > 0 ? rating.toFixed(1) : 'No Ratings'}
      </span>
    </div>
  );
}