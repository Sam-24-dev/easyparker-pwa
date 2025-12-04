import { IReview } from '../../types/index';
import { StarRating } from '../ui/StarRating';

interface ReviewCardProps {
  review: IReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <img
          src={review.avatar}
          alt={review.usuario}
          loading="lazy"
          className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-200"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900">{review.usuario}</h4>
            <span className="text-xs text-gray-500">{review.fecha}</span>
          </div>
          <div className="mb-2">
            <StarRating rating={review.calificacion} size="sm" />
          </div>
          <p className="text-sm text-gray-600">{review.comentario}</p>
        </div>
      </div>
    </div>
  );
}
