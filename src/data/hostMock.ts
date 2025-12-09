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
