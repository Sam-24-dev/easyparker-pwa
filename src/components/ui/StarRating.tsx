import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export function StarRating({ rating, size = 'md', readOnly = true }: StarRatingProps) {
  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={sizeMap[size]}
          className={`${
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
