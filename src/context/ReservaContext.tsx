import React, { createContext, useContext, useState } from 'react';
import { IReserva } from '../types/index';
import { reservasMock } from '../data/reservasMock';

interface ReservaContextType {
  reservas: IReserva[];
  agregarReserva: (reserva: IReserva) => void;
  getReservasActivas: () => IReserva[];
  getReservasCompletadas: () => IReserva[];
}

const ReservaContext = createContext<ReservaContextType | undefined>(undefined);

export function ReservaProvider({ children }: { children: React.ReactNode }) {
  const [reservas, setReservas] = useState<IReserva[]>(reservasMock);

  const agregarReserva = (reserva: IReserva) => {
    setReservas([...reservas, reserva]);
  };

  const getReservasActivas = () => {
    return reservas.filter(r => r.estado === 'activa');
  };

  const getReservasCompletadas = () => {
    return reservas.filter(r => r.estado === 'completada');
  };

  return (
    <ReservaContext.Provider value={{ reservas, agregarReserva, getReservasActivas, getReservasCompletadas }}>
      {children}
    </ReservaContext.Provider>
  );
}

export function useReservaContext() {
  const context = useContext(ReservaContext);
  if (context === undefined) {
    throw new Error('useReservaContext must be used within ReservaProvider');
  }
  return context;
}
