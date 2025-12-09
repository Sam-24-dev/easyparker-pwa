import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { IParking } from '../types';

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
  activeReservations: 2,
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

// Inicialmente vacío - las solicitudes llegan solo cuando está "Disponible"
const mockHostRequests: HostRequest[] = [];

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
  generateRequestForParking: (parking: IParking) => HostRequest; // Generar solicitud para un garaje específico
  
  // Para actualizar estado "En curso" -> "Completado"
  updateRequestStatus: (id: string, status: HostRequest['status']) => void;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

// Nombres y vehículos para generar solicitudes
const driverNames = [
  'Juan Pérez', 'María López', 'Carlos Ruiz', 'Ana Torres', 'Luis Gómez',
  'Sofía Vargas', 'Diego Mendoza', 'Valentina Cruz', 'Andrés Morales', 'Camila Reyes'
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
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<HostStats>(mockHostStats);
  const [garage, setGarage] = useState<Partial<IParking>>(mockHostGarage);
  const [requests, setRequests] = useState<HostRequest[]>(mockHostRequests);
  const [historyRequests, setHistoryRequests] = useState<HostRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  
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
  const generateRequestForParking = useCallback((parking: IParking): HostRequest => {
    const randomName = driverNames[Math.floor(Math.random() * driverNames.length)];
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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
      driverName: randomName,
      driverImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=random&color=fff`,
      driverVerified: Math.random() > 0.3, // 70% verificados
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

  // Vibración cuando llega nueva solicitud
  useEffect(() => {
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    if (pendingCount > lastRequestCountRef.current && lastRequestCountRef.current > 0) {
      // Nueva solicitud llegó - vibrar
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]); // Patrón de vibración
      }
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
