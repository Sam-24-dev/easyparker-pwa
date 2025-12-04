import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

interface FavoriteButtonProps {
  parkingId: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteButton({ parkingId, size = 'md', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(parkingId);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(parkingId);
      }}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
        favorite
          ? 'bg-rose-500 text-white shadow-lg'
          : 'bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500 shadow-md'
      } ${className}`}
      aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart size={iconSizes[size]} fill={favorite ? 'currentColor' : 'none'} />
    </button>
  );
}
