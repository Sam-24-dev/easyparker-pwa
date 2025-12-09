import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export interface Transaction {
  id: string;
  type: 'payout' | 'earning';
  amount: number;
  date: string;
  status: 'completed' | 'processing';
  description: string;
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

// Inicialmente vacío - las solicitudes llegan solo cuando está "Disponible"
const mockHostRequests: HostRequest[] = [];

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'earning',
    amount: 5.00,
    date: '07 Dic 2025',
    status: 'completed',
    description: 'Reserva #1234 - María López'
  },
  {
    id: 'tx-2',
    type: 'earning',
    amount: 7.50,
    date: '06 Dic 2025',
    status: 'completed',
    description: 'Reserva #1230 - Carlos Ruiz'
  },
  {
    id: 'tx-3',
    type: 'payout',
    amount: -50.00,
    date: '01 Dic 2025',
    status: 'completed',
    description: 'Retiro a cuenta bancaria'
  }
];

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
  
  // Acciones
  updateGarage: (data: Partial<IParking>) => void;
  handleRequest: (id: string, action: 'accept' | 'reject') => void;
  addRequest: (request: HostRequest) => void;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

export const HostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHostMode, setIsHostMode] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<HostStats>(mockHostStats);
  const [garage, setGarage] = useState<Partial<IParking>>(mockHostGarage);
  const [requests, setRequests] = useState<HostRequest[]>(mockHostRequests);
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const toggleHostMode = () => setIsHostMode(prev => !prev);
  const toggleOnline = () => setIsOnline(prev => !prev);

  const updateGarage = (data: Partial<IParking>) => {
    setGarage(prev => ({ ...prev, ...data }));
  };

  const handleRequest = (id: string, action: 'accept' | 'reject') => {
    setRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' } 
        : req
    ));

    if (action === 'accept') {
      const request = requests.find(r => r.id === id);
      if (request) {
        setStats(prev => ({
          ...prev,
          earnings: prev.earnings + request.totalPrice,
          activeReservations: prev.activeReservations + 1
        }));
      }
    }
  };

  const addRequest = (request: HostRequest) => {
    setRequests(prev => [request, ...prev]);
  };

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
      updateGarage,
      handleRequest,
      addRequest,
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
