import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IParking, IFiltros, IUsuario } from '../types/index';
import { parkings as staticParkings } from '../data/parkings';

const USER_PARKINGS_KEY = 'easyparker:user-parkings';

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
  addParking: (parking: Omit<IParking, 'id'>) => IParking;
  userParkings: IParking[];
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

// Leer parqueos del usuario desde localStorage
const readUserParkings = (): IParking[] => {
  try {
    const stored = localStorage.getItem(USER_PARKINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('No se pudo leer parqueos del usuario desde localStorage', error);
  }
  return [];
};

// Guardar parqueos del usuario en localStorage
const saveUserParkings = (parkings: IParking[]) => {
  try {
    localStorage.setItem(USER_PARKINGS_KEY, JSON.stringify(parkings));
  } catch (error) {
    console.warn('No se pudo guardar parqueos del usuario en localStorage', error);
  }
};

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  // Parqueos creados por el usuario (persistidos en localStorage)
  const [userParkings, setUserParkings] = useState<IParking[]>(() => readUserParkings());

  // Combinar parqueos estáticos + parqueos del usuario
  const allParkings = [...staticParkings, ...userParkings];

  const [parkingState, setParkingState] = useState<ParkingState[]>(() =>
    allParkings.map((parking) => ({
      ...parking,
      capacidadTotal: parking.plazasLibres,
      slotsReservados: [],
    }))
  );

  // Actualizar parkingState cuando cambian los userParkings
  useEffect(() => {
    const combined = [...staticParkings, ...userParkings];
    setParkingState(
      combined.map((parking) => {
        // Mantener el estado de slots si ya existe
        const existing = parkingState.find(p => p.id === parking.id);
        return {
          ...parking,
          capacidadTotal: existing?.capacidadTotal ?? parking.plazasLibres,
          slotsReservados: existing?.slotsReservados ?? [],
        };
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userParkings]);

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

  // Agregar nuevo parqueo creado por el anfitrión
  const addParking = useCallback((parkingData: Omit<IParking, 'id'>): IParking => {
    // Generar ID único que no colisione con los 35 estáticos (1-35)
    // Usamos 1000 + timestamp para garantizar unicidad
    const newId = 1000 + (Date.now() % 1000000);
    
    const newParking: IParking = {
      ...parkingData,
      id: newId,
    };

    setUserParkings(prev => {
      const updated = [...prev, newParking];
      saveUserParkings(updated);
      return updated;
    });

    return newParking;
  }, []);

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
        addParking,
        userParkings,
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
