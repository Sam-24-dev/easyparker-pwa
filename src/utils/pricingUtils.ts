import { IParking, IEvent } from '../types';

// Utility para calcular distancia en km (Haversine simple)
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
};

export interface PricingResult {
    basePrice: number;
    finalPrice: number;
    isSurge: boolean;
    surgeMultiplier: number;
    activeEvent?: IEvent;
}

export const getParkingPriceForEvent = (parking: IParking, events: IEvent[]): PricingResult => {
    let highestMultiplier = 1;
    let activeEvent: IEvent | undefined;

    for (const event of events) {
        const dist = calculateDistanceKm(parking.lat, parking.lng, event.lat, event.lng);

        // Si está dentro del radio de influencia del evento
        if (dist <= event.radiusKm) {
            if (event.priceSurge > highestMultiplier) {
                highestMultiplier = event.priceSurge;
                activeEvent = event;
            }
        }
    }

    return {
        basePrice: parking.precio,
        finalPrice: Number((parking.precio * highestMultiplier).toFixed(2)),
        isSurge: highestMultiplier > 1,
        surgeMultiplier: highestMultiplier,
        activeEvent
    };
};

export const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
};

// Generar un número aleatorio de "viewers" para social proof (entre 5 y 15)
export const getFakeViewersCount = () => Math.floor(Math.random() * (15 - 5 + 1) + 5);
