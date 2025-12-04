import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IParking, IFiltros, IUsuario } from '../types/index';
import { parkings as initialParkings } from '../data/parkings';

interface ParkingContextType {
  parkings: IParking[];
  filtros: IFiltros;
  usuario: IUsuario;
  setFiltros: (filtros: IFiltros) => void;
  resetFiltros: () => void;
  getParkingById: (id: number) => IParking | undefined;
  reserveParkingSlots: (parkingId: number, slots: string[]) => void;
  releaseParkingSlots: (parkingId: number, slots: string[]) => void;
  getBlockedSlots: (parkingId: number) => string[];
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const STORAGE_KEY = 'easyparker:filtros';

const defaultFilters: IFiltros = {
  soloVerificados: false,
  distancia: 10000, // 10km para abarcar toda la ciudad
  accesiblePMR: false,
  precioMax: 10.0,
  tipoVehiculo: 'Auto',
  soloZonasValidadas: false, // Desactivado para mostrar los 35 parqueos
};

type ParkingState = IParking & {
  capacidadTotal: number;
  slotsReservados: string[];
};

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [parkingState, setParkingState] = useState<ParkingState[]>(() =>
    initialParkings.map((parking) => ({
      ...parking,
      capacidadTotal: parking.plazasLibres,
      slotsReservados: [],
    }))
  );
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

  const resetFiltros = useCallback(() => {
    setFiltros(defaultFilters);
  }, []);

  const getParkingById = useCallback(
    (id: number) => {
      return parkingState.find((p) => p.id === id);
    },
    [parkingState]
  );

  const reserveParkingSlots = useCallback((parkingId: number, slots: string[]) => {
    if (!slots.length) return;
    setParkingState((prev) =>
      prev.map((parking) => {
        if (parking.id !== parkingId) return parking;
        const uniqueSlots = Array.from(new Set([...parking.slotsReservados, ...slots]));
        const nextPlazas = Math.max(0, parking.plazasLibres - 1);
        return {
          ...parking,
          plazasLibres: nextPlazas,
          slotsReservados: uniqueSlots,
        };
      })
    );
  }, []);

  const releaseParkingSlots = useCallback((parkingId: number, slots: string[]) => {
    if (!slots.length) return;
    setParkingState((prev) =>
      prev.map((parking) => {
        if (parking.id !== parkingId) return parking;
        const remainingSlots = parking.slotsReservados.filter((slot) => !slots.includes(slot));
        const nextPlazas = Math.min(parking.capacidadTotal, parking.plazasLibres + 1);
        return {
          ...parking,
          plazasLibres: nextPlazas,
          slotsReservados: remainingSlots,
        };
      })
    );
  }, []);

  const getBlockedSlots = useCallback(
    (parkingId: number) => {
      return getParkingById(parkingId)?.slotsReservados ?? [];
    },
    [getParkingById]
  );

  return (
    <ParkingContext.Provider
      value={{
        parkings: parkingState,
        filtros,
        usuario,
        setFiltros,
        resetFiltros,
        getParkingById,
        reserveParkingSlots,
        releaseParkingSlots,
        getBlockedSlots,
      }}
    >
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
