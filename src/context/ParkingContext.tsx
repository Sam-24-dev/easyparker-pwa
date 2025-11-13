import React, { createContext, useContext, useState } from 'react';
import { IParking, IFiltros, IUsuario } from '../types/index';
import { parkings } from '../data/parkings';

interface ParkingContextType {
  parkings: IParking[];
  filtros: IFiltros;
  usuario: IUsuario;
  setFiltros: (filtros: IFiltros) => void;
  getParkingById: (id: number) => IParking | undefined;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [filtros, setFiltros] = useState<IFiltros>({
    soloVerificados: false,
    distancia: 500,
    accesiblePMR: false,
    precioMax: 3.5,
  });

  const usuario: IUsuario = {
    lat: -2.1769,
    lng: -79.9016,
  };

  const getParkingById = (id: number) => {
    return parkings.find(p => p.id === id);
  };

  return (
    <ParkingContext.Provider value={{ parkings, filtros, usuario, setFiltros, getParkingById }}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParkingContext() {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParkingContext must be used within ParkingProvider');
  }
  return context;
}
