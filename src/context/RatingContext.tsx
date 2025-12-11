import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IRating } from '../types';

interface RatingContextType {
    ratings: IRating[];
    addRating: (rating: Omit<IRating, 'id' | 'fecha'>) => void;
    getRatingsByUserId: (userId: string) => IRating[];
    getRatingsGivenByUserId: (userId: string) => IRating[];
    getRatingsByGarageId: (garageId: number) => IRating[]; // Obtener ratings de un garaje
    getAverageRating: (userId: string) => number;
    hasRatedReserva: (userId: string, reservaId: string) => boolean;
    canRate: (fromUserId: string, toUserId: string, reservaId: string) => boolean;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

const RATINGS_KEY = 'easyparker-ratings';

// Ratings de ejemplo
const defaultRatings: IRating[] = [
    {
        id: 'rating-1',
        fromUserId: 'user-test',
        toUserId: 'user-conductor-top',
        reservaId: 'EP-001',
        tipo: 'conductor_a_anfitrion',
        estrellas: 5,
        comentario: 'Excelente garaje, muy seguro y el anfitrión muy amable.',
        fecha: '2024-11-15',
        fromUserName: 'Juan Pérez',
        fromUserPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 'rating-2',
        fromUserId: 'user-conductor-top',
        toUserId: 'user-test',
        reservaId: 'EP-001',
        tipo: 'anfitrion_a_conductor',
        estrellas: 5,
        comentario: 'Conductor muy puntual y respetuoso.',
        fecha: '2024-11-15',
        fromUserName: 'Carlos Mendoza',
        fromUserPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
        id: 'rating-3',
        fromUserId: 'user-test',
        toUserId: 'user-anfitrion-nuevo',
        reservaId: 'EP-002',
        tipo: 'conductor_a_anfitrion',
        estrellas: 4,
        comentario: 'Buen servicio, aunque la ubicación fue difícil de encontrar.',
        fecha: '2024-12-01',
        fromUserName: 'Juan Pérez',
        fromUserPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
];

export function RatingProvider({ children }: { children: ReactNode }) {
    const [ratings, setRatings] = useState<IRating[]>([]);

    useEffect(() => {
        const loadRatings = () => {
            try {
                const stored = localStorage.getItem(RATINGS_KEY);
                if (stored) {
                    setRatings(JSON.parse(stored));
                } else {
                    setRatings(defaultRatings);
                    localStorage.setItem(RATINGS_KEY, JSON.stringify(defaultRatings));
                }
            } catch (error) {
                console.warn('Error loading ratings:', error);
                setRatings(defaultRatings);
            }
        };
        loadRatings();
    }, []);

    const addRating = (ratingData: Omit<IRating, 'id' | 'fecha'>) => {
        const newRating: IRating = {
            ...ratingData,
            id: `rating-${Date.now()}`,
            fecha: new Date().toISOString().split('T')[0],
        };
        const updatedRatings = [...ratings, newRating];
        setRatings(updatedRatings);
        localStorage.setItem(RATINGS_KEY, JSON.stringify(updatedRatings));
    };

    const getRatingsByUserId = (userId: string): IRating[] => {
        return ratings.filter(r => r.toUserId === userId);
    };

    const getRatingsGivenByUserId = (userId: string): IRating[] => {
        return ratings.filter(r => r.fromUserId === userId);
    };

    // Obtener ratings de un garaje específico (por ID del garaje)
    const getRatingsByGarageId = (garageId: number): IRating[] => {
        // Los ratings de garaje tienen toUserId como 'garaje-{id}'
        return ratings.filter(r => r.toUserId === `garaje-${garageId}`);
    };

    const getAverageRating = (userId: string): number => {
        const userRatings = getRatingsByUserId(userId);
        if (userRatings.length === 0) return 0;
        const sum = userRatings.reduce((acc, r) => acc + r.estrellas, 0);
        return Math.round((sum / userRatings.length) * 10) / 10;
    };

    const hasRatedReserva = (userId: string, reservaId: string): boolean => {
        return ratings.some(r => r.fromUserId === userId && r.reservaId === reservaId);
    };

    const canRate = (fromUserId: string, toUserId: string, reservaId: string): boolean => {
        // No puede calificarse a sí mismo
        if (fromUserId === toUserId) return false;
        // No puede calificar dos veces la misma reserva
        if (hasRatedReserva(fromUserId, reservaId)) return false;
        return true;
    };

    return (
        <RatingContext.Provider value={{
            ratings,
            addRating,
            getRatingsByUserId,
            getRatingsGivenByUserId,
            getRatingsByGarageId,
            getAverageRating,
            hasRatedReserva,
            canRate,
        }}>
            {children}
        </RatingContext.Provider>
    );
}

export function useRating() {
    const context = useContext(RatingContext);
    if (!context) {
        throw new Error('useRating debe usarse dentro de RatingProvider');
    }
    return context;
}
