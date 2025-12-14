import { IEvent } from '../types';

export const events: IEvent[] = [
    {
        id: 'evt-001',
        title: 'Concierto Chayanne - Bailemos Otra Vez',
        description: 'El astro boricua regresa a Guayaquil para una noche inolvidable llena de romanticismo y ritmo. ¡No te quedes sin parqueo cerca del estadio!',
        date: '2025-12-21',
        time: '20:00',
        endTime: '03:00', // Termina 3AM del día siguiente
        locationName: 'Estadio Modelo Alberto Spencer',
        lat: -2.1775,
        lng: -79.9075,
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1000&q=80',
        priceSurge: 1.5,
        radiusKm: 1.2,
        type: 'concert',
        attendees: 15400
    },
    {
        id: 'evt-002',
        title: 'Burger Show Premium 2025',
        description: 'El festival gastronómico más exclusivo de la ciudad. Las mejores hamburguesas de autor en la explanada del Malecón.',
        date: '2025-12-20',
        time: '12:00',
        endTime: '02:00', // Termina 2AM
        locationName: 'Explanada Malecón 2000',
        lat: -2.1930,
        lng: -79.8810,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80',
        priceSurge: 1.25,
        radiusKm: 0.8,
        type: 'food',
        attendees: 5200
    }
];
