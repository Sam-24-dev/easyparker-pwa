import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FavoritesContextType {
  favorites: number[];
  isFavorite: (parkingId: number) => boolean;
  toggleFavorite: (parkingId: number) => void;
  addFavorite: (parkingId: number) => void;
  removeFavorite: (parkingId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'easyparker-favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('No se pudo leer favoritos desde localStorage', error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.warn('No se pudo guardar favoritos en localStorage', error);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (parkingId: number) => favorites.includes(parkingId),
    [favorites]
  );

  const toggleFavorite = useCallback((parkingId: number) => {
    setFavorites((prev) =>
      prev.includes(parkingId)
        ? prev.filter((id) => id !== parkingId)
        : [...prev, parkingId]
    );
  }, []);

  const addFavorite = useCallback((parkingId: number) => {
    setFavorites((prev) =>
      prev.includes(parkingId) ? prev : [...prev, parkingId]
    );
  }, []);

  const removeFavorite = useCallback((parkingId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== parkingId));
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
