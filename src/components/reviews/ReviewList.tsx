import { IReview } from '../../types/index';
import { ReviewCard } from './ReviewCard';

interface ReviewListProps {
  reviews: IReview[];
  maxDisplay?: number;
}

export function ReviewList({ reviews, maxDisplay = 3 }: ReviewListProps) {
  const displayedReviews = reviews.slice(0, maxDisplay);

  return (
    <div className="space-y-4">
      {displayedReviews.map((review, idx) => (
        <ReviewCard key={idx} review={review} />
      ))}
    </div>
  );
}
