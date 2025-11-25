import React, { createContext, useContext, useState, useEffect } from 'react';
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

const STORAGE_KEY = 'easyparker:filtros';

const defaultFilters: IFiltros = {
  soloVerificados: false,
  distancia: 500,
  accesiblePMR: false,
  precioMax: 3.5,
  tipoVehiculo: 'Auto',
};

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [filtros, setFiltros] = useState<IFiltros>(() => {
    if (typeof window === 'undefined') {
      return defaultFilters;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<IFiltros>;
        return { ...defaultFilters, ...parsed };
      }
    } catch (error) {
      console.warn('No se pudo leer filtros desde localStorage', error);
    }
    return defaultFilters;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtros));
    } catch (error) {
      console.warn('No se pudo guardar filtros en localStorage', error);
    }
  }, [filtros]);

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
