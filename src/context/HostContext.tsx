import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { IParking } from '../types';
import { useNotification } from './NotificationContext';

// Interfaces para datos del Host
export interface HostStats {
  earnings: number;
  activeReservations: number;
  rating: number;
  totalViews: number;
}

export interface HostRequest {
  id: string;
  parkingId: number; // ID del garaje al que pertenece la solicitud
  parkingName: string; // Nombre del garaje
  parkingPhoto?: string; // Foto del garaje
  driverId?: string; // ID del conductor para vincular con perfil
  driverName: string;
  driverImage?: string;
  driverVerified: boolean; // Identidad verificada
  vehicleModel: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed';
  timestamp: string;
  rejectedAt?: number; // Timestamp de cuando fue rechazada (para recovery de 60s)
}

export interface Transaction {
  id: string;
  type: 'payout' | 'earning';
  amount: number;
  grossAmount?: number; // Monto bruto antes de comisión
  commission?: number; // Comisión de EasyParker (10%)
  date: string;
  timestamp: number; // Para ordenar y filtrar por fecha
  status: 'completed' | 'processing';
  description: string;
  parkingId?: number; // Para filtrar por garaje
  parkingName?: string;
}

// Mock Data
const mockHostStats: HostStats = {
  earnings: 125.50,
  activeReservations: 0, // 0 porque las solicitudes mock son completadas, no en curso
  rating: 4.8,
  totalViews: 45
};

const mockHostGarage: Partial<IParking> = {
  id: 999,
  nombre: 'Mi Garaje',
  lat: -2.19616,
  lng: -79.88621,
  precio: 2.50,
  distancia: 0,
  plazasLibres: 2,
  verificado: false,
  seguridad: [],
  calificacion: 0,
  foto: '',
  accesiblePMR: false,
  tipo: 'garage_privado',
  horario: '24 horas',
  vehiculosPermitidos: ['Auto'],
};

// Generar transacciones mock de los últimos 7 días
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Datos mock por día (últimos 7 días)
  const dailyData = [
    { day: 0, earnings: [12.50, 8.00] },
    { day: 1, earnings: [15.00] },
    { day: 2, earnings: [6.50, 9.00, 4.50] },
    { day: 3, earnings: [18.00] },
    { day: 4, earnings: [7.50, 11.00] },
    { day: 5, earnings: [22.00, 5.00] },
    { day: 6, earnings: [14.00] },
  ];

  const names = ['María López', 'Carlos Ruiz', 'Ana Torres', 'Luis Gómez', 'Juan Pérez', 'Sofía Vargas'];
  let txId = 1;

  dailyData.forEach(({ day, earnings }) => {
    earnings.forEach((gross, idx) => {
      const commission = gross * 0.10;
      const net = gross - commission;
      const date = new Date(now - day * dayMs);
      date.setHours(9 + idx * 3, Math.floor(Math.random() * 60));

      transactions.push({
        id: `tx-${txId++}`,
        type: 'earning',
        amount: net,
        grossAmount: gross,
        commission,
        date: date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: date.getTime(),
        status: 'completed',
        description: `Reserva - ${names[Math.floor(Math.random() * names.length)]}`,
        parkingId: Math.random() > 0.5 ? 1 : 2,
        parkingName: Math.random() > 0.5 ? 'Garaje Principal' : 'Cochera Urdesa',
      });
    });
  });

  // Agregar un retiro
  transactions.push({
    id: `tx-${txId++}`,
    type: 'payout',
    amount: -50.00,
    date: '01 Dic 2025',
    timestamp: now - 8 * dayMs,
    status: 'completed',
    description: 'Retiro a cuenta bancaria',
  });

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
};

// Inicialmente con 2 solicitudes COMPLETADAS para probar calificación/reporte de conductores
const mockHostRequests: HostRequest[] = [
  {
    id: 'req-completed-demo-1',
    parkingId: 999, // ID del garaje mock - se actualizará al crear/reclamar garaje
    parkingName: 'Mi Garaje', // Se actualizará al crear/reclamar garaje
    driverId: 'user-conductor-top', // ID correcto de Carlos Mendoza en usersMock
    driverName: 'Carlos Mendoza',
    driverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', // Foto original correcta
    driverVerified: true,
    vehicleModel: 'Chevrolet Aveo',
    vehiclePlate: 'GBA-1234',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Hace 3 horas
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Terminó hace 1 hora
    totalPrice: 5.00,
    status: 'completed',
    timestamp: 'Hace 3 horas'
  },
  {
    id: 'req-completed-demo-2',
    parkingId: 999,
    parkingName: 'Mi Garaje',
    driverId: 'driver-top-2', // ID correcto de Andrea López en usersMock
    driverName: 'Andrea López',
    driverImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', // Foto correcta de Andrea
    driverVerified: true,
    vehicleModel: 'Toyota Yaris',
    vehiclePlate: 'GEF-5678',
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Hace 5 horas
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Terminó hace 2 horas
    totalPrice: 6.00,
    status: 'completed',
    timestamp: 'Hace 5 horas'
  }
];

const mockTransactions: Transaction[] = generateMockTransactions();

// Context Type
interface HostContextType {
  // Estado del modo
  isHostMode: boolean;
  toggleHostMode: () => void;

  // Estado online/offline
  isOnline: boolean;
  toggleOnline: () => void;

  // Datos
  stats: HostStats;
  garage: Partial<IParking>;
  requests: HostRequest[];
  transactions: Transaction[];
  historyRequests: HostRequest[]; // Solicitudes rechazadas (historial)
  balance: number; // Balance calculado

  // Estadísticas del día
  todayStats: {
    requests: number;
    accepted: number;
    earnings: number;
    acceptanceRate: number;
  };

  // Acciones
  updateGarage: (data: Partial<IParking>) => void;
  handleRequest: (id: string, action: 'accept' | 'reject') => void;
  addRequest: (request: HostRequest) => void;
  recoverRequest: (id: string) => void; // Recuperar solicitud rechazada
  addTransaction: (transaction: Transaction) => void;
  generateRequestForParking: (parking: IParking, usedDriverIds?: string[]) => HostRequest | null; // Generar solicitud para un garaje específico

  // Para actualizar estado "En curso" -> "Completado"
  updateRequestStatus: (id: string, status: HostRequest['status']) => void;

  // Para actualizar el nombre del garaje en solicitudes completadas cuando se crea/reclama un garaje
  updateCompletedRequestsGarage: (parkingId: number, parkingName: string) => void;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

// Conductores mock vinculados a perfiles de usuario (6 únicos: 2 top, 2 normales, 2 nuevos)
const mockDrivers = [
  // Top drivers (verificados, muchas reservas)
  {
    id: 'user-conductor-top',
    name: 'Carlos Mendoza',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    verified: true,
    tier: 'top' as const
  },
  {
    id: 'driver-top-2',
    name: 'Andrea López',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    verified: true,
    tier: 'top' as const
  },
  // Normal drivers (verificados, algunas reservas)
  {
    id: 'user-test',
    name: 'Juan Pérez',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    verified: true,
    tier: 'normal' as const
  },
  {
    id: 'driver-normal-2',
    name: 'Roberto Silva',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    verified: true,
    tier: 'normal' as const
  },
  // New drivers (sin verificar, pocas reservas)
  {
    id: 'driver-new-1',
    name: 'Laura Martínez',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    verified: false,
    tier: 'new' as const
  },
  {
    id: 'driver-new-2',
    name: 'Miguel Torres',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    verified: false,
    tier: 'new' as const
  },
];

const vehicles = [
  { model: 'Chevrolet Aveo', plate: 'GBA' },
  { model: 'Kia Rio', plate: 'GTC' },
  { model: 'Hyundai Tucson', plate: 'GSB' },
  { model: 'Toyota Yaris', plate: 'GEF' },
  { model: 'Nissan Sentra', plate: 'GHI' },
  { model: 'Mazda 3', plate: 'GJK' },
];

export const HostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHostMode, setIsHostMode] = useState(false);
  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem('ep_host_online');
    return saved === 'true';
  });
  const [stats, setStats] = useState<HostStats>(mockHostStats);
  const [garage, setGarage] = useState<Partial<IParking>>(mockHostGarage);
  // Inicializar solicitudes desde localStorage o usar mock por defecto
  const [requests, setRequests] = useState<HostRequest[]>(() => {
    const saved = localStorage.getItem('ep_host_requests');
    return saved ? JSON.parse(saved) : mockHostRequests;
  });
  const [historyRequests, setHistoryRequests] = useState<HostRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const { showNotification } = useNotification();

  // Ref para vibración
  const lastRequestCountRef = useRef(0);

  // Calcular balance (suma de transacciones de tipo earning)
  const balance = transactions
    .filter(t => t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0)
    + transactions
      .filter(t => t.type === 'payout')
      .reduce((sum, t) => sum + t.amount, 0);

  // Calcular estadísticas del día
  const todayStats = React.useMemo(() => {
    const today = new Date().toDateString();
    const todayRequests = [...requests, ...historyRequests].filter(r => {
      const reqDate = new Date(r.startTime).toDateString();
      return reqDate === today;
    });

    const accepted = todayRequests.filter(r => r.status === 'accepted' || r.status === 'in-progress' || r.status === 'completed').length;
    const earnings = todayRequests
      .filter(r => r.status === 'accepted' || r.status === 'in-progress' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalPrice * 0.9), 0); // Ganancia neta (90%)

    return {
      requests: todayRequests.length,
      accepted,
      earnings,
      acceptanceRate: todayRequests.length > 0 ? Math.round((accepted / todayRequests.length) * 100) : 0
    };
  }, [requests, historyRequests]);

  const toggleHostMode = () => setIsHostMode(prev => !prev);
  const toggleOnline = () => setIsOnline(prev => !prev);

  const updateGarage = (data: Partial<IParking>) => {
    setGarage(prev => ({ ...prev, ...data }));
  };

  // Generar solicitud para un garaje específico
  // usedDriverIds: IDs de conductores que ya tienen solicitud activa (aceptada o en curso) para ESTE garaje
  const generateRequestForParking = useCallback((parking: IParking, usedDriverIds: string[] = []): HostRequest | null => {
    // Filtrar conductores disponibles (que no ya tengan solicitud activa en este garaje)
    const availableDrivers = mockDrivers.filter(d => !usedDriverIds.includes(d.id));

    // Si no hay conductores disponibles, retornar null
    if (availableDrivers.length === 0) {
      return null;
    }

    const randomDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const randomPlate = `${randomVehicle.plate}-${Math.floor(1000 + Math.random() * 9000)}`;

    const now = new Date();
    const duration = Math.floor(Math.random() * 3) + 1; // 1-3 horas
    const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000);

    const totalPrice = parseFloat((parking.precio * duration).toFixed(2));

    return {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parkingId: parking.id,
      parkingName: parking.nombre,
      parkingPhoto: parking.foto,
      driverId: randomDriver.id,
      driverName: randomDriver.name,
      driverImage: randomDriver.photo,
      driverVerified: randomDriver.verified,
      vehicleModel: randomVehicle.model,
      vehiclePlate: randomPlate,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      totalPrice,
      status: 'pending',
      timestamp: 'Ahora'
    };
  }, []);

  const handleRequest = (id: string, action: 'accept' | 'reject') => {
    const request = requests.find(r => r.id === id);

    if (action === 'reject') {
      // Mover a historial con timestamp de rechazo
      if (request) {
        const rejectedRequest: HostRequest = {
          ...request,
          status: 'rejected',
          rejectedAt: Date.now()
        };
        setHistoryRequests(prev => [rejectedRequest, ...prev]);
      }
      setRequests(prev => prev.filter(r => r.id !== id));
    } else {
      // Aceptar -> cambiar a "in-progress"
      setRequests(prev => prev.map(req =>
        req.id === id
          ? { ...req, status: 'in-progress' as const }
          : req
      ));

      if (request) {
        // Agregar transacción con comisión
        const grossAmount = request.totalPrice;
        const commission = grossAmount * 0.10;
        const netAmount = grossAmount - commission;

        const newTransaction: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'earning',
          amount: netAmount,
          grossAmount,
          commission,
          date: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
          timestamp: Date.now(),
          status: 'completed',
          description: `Reserva - ${request.driverName}`,
          parkingId: request.parkingId,
          parkingName: request.parkingName,
        };

        setTransactions(prev => [newTransaction, ...prev]);

        setStats(prev => ({
          ...prev,
          earnings: prev.earnings + netAmount,
          activeReservations: prev.activeReservations + 1
        }));
      }
    }
  };

  // Recuperar solicitud rechazada (dentro de los 60 segundos)
  const recoverRequest = useCallback((id: string) => {
    const request = historyRequests.find(r => r.id === id);
    if (request && request.rejectedAt) {
      const elapsed = Date.now() - request.rejectedAt;
      if (elapsed <= 60000) { // 60 segundos
        // Restaurar a pendiente
        const restoredRequest: HostRequest = {
          ...request,
          status: 'pending',
          rejectedAt: undefined
        };
        setRequests(prev => [restoredRequest, ...prev]);
        setHistoryRequests(prev => prev.filter(r => r.id !== id));
      }
    }
  }, [historyRequests]);

  // Actualizar estado de solicitud (para countdown "En curso" -> "Completado")
  const updateRequestStatus = useCallback((id: string, status: HostRequest['status']) => {
    setRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status } : req
    ));

    if (status === 'completed') {
      setStats(prev => ({
        ...prev,
        activeReservations: Math.max(0, prev.activeReservations - 1)
      }));
    }
  }, []);

  const addRequest = useCallback((request: HostRequest) => {
    setRequests(prev => [request, ...prev]);
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  // Actualizar solicitudes completadas con el garaje real cuando se crea/reclama
  const updateCompletedRequestsGarage = useCallback((parkingId: number, parkingName: string) => {
    setRequests(prev => prev.map(req => {
      // Solo actualizar solicitudes con parkingId 999 (el mock genérico)
      if (req.parkingId === 999 && req.status === 'completed') {
        return { ...req, parkingId, parkingName };
      }
      return req;
    }));
  }, []);

  // Vibración cuando llega nueva solicitud
  useEffect(() => {
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    if (pendingCount > lastRequestCountRef.current && lastRequestCountRef.current > 0) {
      // Nueva solicitud llegó - vibrar y notificar
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]); // Patrón de vibración
      }
      showNotification({
        title: '¡Nueva Solicitud!',
        message: 'Un conductor quiere reservar tu garaje',
        type: 'success', // Green for money/success
        duration: 6000
      });
    }
    lastRequestCountRef.current = pendingCount;
  }, [requests]);

  // Limpiar solicitudes del historial después de 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoryRequests(prev => prev.filter(r => {
        if (!r.rejectedAt) return true;
        return Date.now() - r.rejectedAt <= 60000;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sincronizar estado online
  useEffect(() => {
    localStorage.setItem('ep_host_online', String(isOnline));
  }, [isOnline]);

  useEffect(() => {
    const handleOnlineChange = (e: StorageEvent) => {
      if (e.key === 'ep_host_online' && e.newValue) {
        setIsOnline(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleOnlineChange);
    return () => window.removeEventListener('storage', handleOnlineChange);
  }, []);

  // Sincronizar con LocalStorage para comunicación entre pestañas (Tab Conductor -> Tab Anfitrión)
  // 1. Guardar cambios
  useEffect(() => {
    localStorage.setItem('ep_host_requests', JSON.stringify(requests));
  }, [requests]);

  // 2. Escuchar cambios de otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ep_host_requests' && e.newValue) {
        setRequests(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <HostContext.Provider value={{
      isHostMode,
      toggleHostMode,
      isOnline,
      toggleOnline,
      stats,
      garage,
      requests,
      transactions,
      historyRequests,
      balance,
      todayStats,
      updateGarage,
      handleRequest,
      addRequest,
      recoverRequest,
      addTransaction,
      generateRequestForParking,
      updateRequestStatus,
      updateCompletedRequestsGarage,
    }}>
      {children}
    </HostContext.Provider>
  );
};

export const useHost = () => {
  const context = useContext(HostContext);
  if (context === undefined) {
    throw new Error('useHost debe usarse dentro de HostProvider');
  }
  return context;
};
