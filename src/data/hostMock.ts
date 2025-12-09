// Datos Mock para el módulo de Anfitrión

export interface HostRequest {
  id: string;
  driverName: string;
  driverImage?: string;
  vehicleModel: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface HostStats {
  earnings: number;
  activeReservations: number;
  rating: number;
  totalViews: number;
}

// Fotos placeholder de garajes para el selector - SOLO estacionamientos/garajes reales
export const GARAGE_PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&q=80', // parking structure amarillo
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&q=80', // garage interior oscuro
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80', // garage residencial vacío
  'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?w=800&q=80', // parking subterráneo moderno
  'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&q=80', // estacionamiento techado
];

// Zonas disponibles para el dropdown
export const AVAILABLE_ZONES = [
  { id: 'urdesa', name: 'Urdesa', icon: '🏘️' },
  { id: 'kennedy', name: 'Kennedy', icon: '🏥' },
  { id: 'centro', name: 'Centro / Malecón', icon: '🏛️' },
  { id: 'alborada-samanes', name: 'Norte (Alborada/Samanes)', icon: '🏙️' },
  { id: 'aeropuerto-terminal', name: 'Aeropuerto / Terminal', icon: '✈️' },
  { id: 'ceibos', name: 'Ceibos', icon: '🌳' },
  { id: 'samborondon', name: 'Vía Samborondón', icon: '🌉' },
  { id: 'sur', name: 'Sur de Guayaquil', icon: '🏢' },
  { id: 'via-costa', name: 'Vía a la Costa', icon: '⚽' },
];

// Función para detectar zona automáticamente basada en coordenadas
export const detectZoneFromCoords = (lat: number, lng: number): string => {
  // Bounds aproximados de cada zona en Guayaquil
  const zoneBounds: { id: string; latMin: number; latMax: number; lngMin: number; lngMax: number }[] = [
    { id: 'urdesa', latMin: -2.19, latMax: -2.16, lngMin: -79.92, lngMax: -79.89 },
    { id: 'kennedy', latMin: -2.18, latMax: -2.15, lngMin: -79.91, lngMax: -79.88 },
    { id: 'centro', latMin: -2.21, latMax: -2.18, lngMin: -79.90, lngMax: -79.87 },
    { id: 'alborada-samanes', latMin: -2.15, latMax: -2.10, lngMin: -79.92, lngMax: -79.87 },
    { id: 'aeropuerto-terminal', latMin: -2.17, latMax: -2.14, lngMin: -79.89, lngMax: -79.86 },
    { id: 'ceibos', latMin: -2.18, latMax: -2.14, lngMin: -79.95, lngMax: -79.92 },
    { id: 'samborondon', latMin: -2.15, latMax: -2.08, lngMin: -79.88, lngMax: -79.82 },
    { id: 'sur', latMin: -2.25, latMax: -2.21, lngMin: -79.92, lngMax: -79.88 },
    { id: 'via-costa', latMin: -2.20, latMax: -2.16, lngMin: -80.00, lngMax: -79.95 },
  ];

  for (const zone of zoneBounds) {
    if (lat >= zone.latMin && lat <= zone.latMax && lng >= zone.lngMin && lng <= zone.lngMax) {
      return zone.id;
    }
  }

  return ''; // No se detectó zona, el usuario debe elegir manualmente
};

// Nombres aleatorios para conductores
export const driverNames = [
  'Juan Pérez',
  'María López', 
  'Carlos Ruiz',
  'Ana Torres',
  'Luis Gómez',
  'Sofía Vargas',
  'Diego Mendoza',
  'Valentina Cruz',
  'Andrés Morales',
  'Camila Reyes',
  'Fernando Aguirre',
  'Isabella Paredes',
];

// Vehículos aleatorios
export const vehicles = [
  { model: 'Chevrolet Aveo', plate: 'GBA-1234' },
  { model: 'Kia Rio', plate: 'GTC-5678' },
  { model: 'Hyundai Tucson', plate: 'GSB-9012' },
  { model: 'Chevrolet Spark', plate: 'GDA-3456' },
  { model: 'Toyota Yaris', plate: 'GEF-7890' },
  { model: 'Nissan Sentra', plate: 'GHI-2345' },
  { model: 'Mazda 3', plate: 'GJK-6789' },
  { model: 'Hyundai Accent', plate: 'GLM-0123' },
  { model: 'Kia Sportage', plate: 'GNO-4567' },
  { model: 'Toyota Corolla', plate: 'GPQ-8901' },
];

// Generador de solicitudes aleatorias
export const generateRandomRequest = (): HostRequest => {
  const randomName = driverNames[Math.floor(Math.random() * driverNames.length)];
  const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
  
  // Generar placa aleatoria única
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomPlate = `G${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const now = new Date();
  const duration = Math.floor(Math.random() * 3) + 1; // 1-3 horas
  const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000);
  
  // Precio basado en duración ($2-3 por hora)
  const pricePerHour = 2 + Math.random();
  const totalPrice = parseFloat((pricePerHour * duration).toFixed(2));

  return {
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    driverName: randomName,
    driverImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=random&color=fff`,
    vehicleModel: randomVehicle.model,
    vehiclePlate: randomPlate,
    startTime: now.toISOString(),
    endTime: endTime.toISOString(),
    totalPrice,
    status: 'pending',
    timestamp: 'Ahora'
  };
};

// Stats iniciales mock
export const initialHostStats: HostStats = {
  earnings: 125.50,
  activeReservations: 2,
  rating: 4.8,
  totalViews: 45
};

// Solicitudes iniciales mock
export const initialRequests: HostRequest[] = [
  {
    id: 'req-initial-1',
    driverName: 'Juan Pérez',
    driverImage: 'https://ui-avatars.com/api/?name=Juan+Perez&background=10B981&color=fff',
    vehicleModel: 'Toyota Yaris',
    vehiclePlate: 'GBA-1234',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    totalPrice: 5.00,
    status: 'pending',
    timestamp: 'Hace 5 min'
  },
];
