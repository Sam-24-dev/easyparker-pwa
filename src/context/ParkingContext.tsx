import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IParking, IFiltros, IUsuario } from '../types/index';
import { parkings as staticParkings } from '../data/parkings';

const USER_PARKINGS_KEY = 'easyparker:user-parkings';
const CLAIMED_PARKINGS_KEY = 'easyparker:claimed-parkings';

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
  updateParking: (id: number, data: Partial<IParking>) => void;
  removeParking: (id: number) => void;
  claimParking: (staticParkingId: number, ownerName?: string) => IParking | null;
  userParkings: IParking[];
  claimedParkingIds: number[];
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

// Leer IDs de parqueos reclamados desde localStorage
const readClaimedParkingIds = (): number[] => {
  try {
    const stored = localStorage.getItem(CLAIMED_PARKINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('No se pudo leer parqueos reclamados desde localStorage', error);
  }
  return [];
};

// Guardar IDs de parqueos reclamados en localStorage
const saveClaimedParkingIds = (ids: number[]) => {
  try {
    localStorage.setItem(CLAIMED_PARKINGS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn('No se pudo guardar parqueos reclamados en localStorage', error);
  }
};

// Leer estado de parqueos reclamados (activo/pausado + datos editados)
const CLAIMED_STATE_KEY = 'easyparker:claimed-state';

interface ClaimedParkingState {
  isActive: boolean;
  ownerName?: string;
  descripcion?: string;
  precio?: number;
  plazasLibres?: number;
  horario?: string;
  seguridad?: string[];
  accesiblePMR?: boolean;
  vehiculosPermitidos?: string[];
}

const readClaimedState = (): Record<number, ClaimedParkingState> => {
  try {
    const stored = localStorage.getItem(CLAIMED_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('No se pudo leer estado de reclamados desde localStorage', error);
  }
  return {};
};

const saveClaimedState = (state: Record<number, ClaimedParkingState>) => {
  try {
    localStorage.setItem(CLAIMED_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('No se pudo guardar estado de reclamados en localStorage', error);
  }
};

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  // Parqueos creados por el usuario (persistidos en localStorage)
  const [userParkings, setUserParkings] = useState<IParking[]>(() => readUserParkings());
  
  // IDs de parqueos estáticos reclamados por el usuario
  const [claimedParkingIds, setClaimedParkingIds] = useState<number[]>(() => readClaimedParkingIds());
  
  // Estado de parqueos reclamados (activo/pausado + ownerName + datos editados)
  const [claimedState, setClaimedState] = useState<Record<number, ClaimedParkingState>>(() => readClaimedState());

  // Obtener los parqueos reclamados como objetos IParking con su estado
  const claimedParkings = staticParkings
    .filter(p => claimedParkingIds.includes(p.id))
    .map(p => {
      const state = claimedState[p.id] || {};
      return {
        ...p,
        claimedBy: 'Propietario',
        isActive: state.isActive !== false, // Por defecto activos
        ownerName: state.ownerName || 'Propietario',
        verificado: true, // Reclamados pasan por verificación
        // Campos editables
        descripcion: state.descripcion ?? p.descripcion,
        precio: state.precio ?? p.precio,
        plazasLibres: state.plazasLibres ?? p.plazasLibres,
        horario: state.horario ?? p.horario,
        seguridad: state.seguridad ?? p.seguridad,
        accesiblePMR: state.accesiblePMR ?? p.accesiblePMR,
        vehiculosPermitidos: state.vehiculosPermitidos ?? p.vehiculosPermitidos,
      };
    });

  // Combinar parqueos estáticos (SIN los reclamados) + parqueos del usuario
  // Los reclamados NO se muestran como estáticos normales, solo aparecen en "Mis Propiedades"
  const allParkings = [
    ...staticParkings
      .filter(p => !claimedParkingIds.includes(p.id)) // Excluir los reclamados de los estáticos
      .map(p => ({ ...p })),
    ...claimedParkings, // Añadir los reclamados con su estado
    ...userParkings
  ];

  const [parkingState, setParkingState] = useState<ParkingState[]>(() =>
    allParkings.map((parking) => ({
      ...parking,
      capacidadTotal: parking.plazasLibres,
      slotsReservados: [],
    }))
  );

  // Actualizar parkingState cuando cambian los userParkings, claimedParkingIds o claimedState
  useEffect(() => {
    // Recalcular claimedParkings con el estado actual
    const currentClaimedParkings = staticParkings
      .filter(p => claimedParkingIds.includes(p.id))
      .map(p => {
        const state = claimedState[p.id] || {};
        return {
          ...p,
          claimedBy: 'Propietario',
          isActive: state.isActive !== false,
          ownerName: state.ownerName || 'Propietario',
          verificado: true,
          // Campos editables
          descripcion: state.descripcion ?? p.descripcion,
          precio: state.precio ?? p.precio,
          plazasLibres: state.plazasLibres ?? p.plazasLibres,
          horario: state.horario ?? p.horario,
          seguridad: state.seguridad ?? p.seguridad,
          accesiblePMR: state.accesiblePMR ?? p.accesiblePMR,
          vehiculosPermitidos: state.vehiculosPermitidos ?? p.vehiculosPermitidos,
        };
      });

    const combined = [
      ...staticParkings
        .filter(p => !claimedParkingIds.includes(p.id))
        .map(p => ({ ...p })),
      ...currentClaimedParkings,
      ...userParkings
    ];
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
  }, [userParkings, claimedParkingIds, claimedState]);

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

  // Actualizar un parqueo existente del usuario O un parqueo reclamado
  const updateParking = useCallback((id: number, data: Partial<IParking>) => {
    // Si es un parqueo reclamado (ID está en claimedParkingIds)
    if (claimedParkingIds.includes(id)) {
      // Actualizar el estado del parqueo reclamado con todos los campos editables
      setClaimedState(prev => {
        const updated = {
          ...prev,
          [id]: {
            ...prev[id],
            isActive: data.isActive ?? prev[id]?.isActive ?? true,
            ownerName: data.ownerName ?? prev[id]?.ownerName,
            descripcion: data.descripcion ?? prev[id]?.descripcion,
            precio: data.precio ?? prev[id]?.precio,
            plazasLibres: data.plazasLibres ?? prev[id]?.plazasLibres,
            horario: data.horario ?? prev[id]?.horario,
            seguridad: data.seguridad ?? prev[id]?.seguridad,
            accesiblePMR: data.accesiblePMR ?? prev[id]?.accesiblePMR,
            vehiculosPermitidos: data.vehiculosPermitidos ?? prev[id]?.vehiculosPermitidos,
          }
        };
        saveClaimedState(updated);
        return updated;
      });
      return;
    }
    
    // Si es un parqueo creado por el usuario
    setUserParkings(prev => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, ...data } : p
      );
      saveUserParkings(updated);
      return updated;
    });
  }, [claimedParkingIds]);

  // Eliminar un parqueo del usuario o liberar un parqueo reclamado
  const removeParking = useCallback((id: number) => {
    // Si es un parqueo reclamado, liberarlo
    if (claimedParkingIds.includes(id)) {
      setClaimedParkingIds(prev => {
        const updated = prev.filter(pid => pid !== id);
        saveClaimedParkingIds(updated);
        return updated;
      });
      // También limpiar su estado
      setClaimedState(prev => {
        const updated = { ...prev };
        delete updated[id];
        saveClaimedState(updated);
        return updated;
      });
      return;
    }
    
    // Si es un parqueo creado por el usuario
    setUserParkings(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveUserParkings(updated);
      return updated;
    });
  }, [claimedParkingIds]);

  // Reclamar un parqueo estático existente (solo guardar referencia, no duplicar)
  const claimParking = useCallback((staticParkingId: number, ownerName?: string): IParking | null => {
    // Buscar el parqueo estático
    const staticParking = staticParkings.find(p => p.id === staticParkingId);
    if (!staticParking) return null;

    // Verificar si ya está reclamado
    if (claimedParkingIds.includes(staticParkingId)) return null;

    // Agregar el ID a la lista de reclamados
    setClaimedParkingIds(prev => {
      const updated = [...prev, staticParkingId];
      saveClaimedParkingIds(updated);
      return updated;
    });

    // Inicializar estado como activo con ownerName
    setClaimedState(prev => {
      const updated = { ...prev, [staticParkingId]: { isActive: true, ownerName: ownerName || 'Propietario' } };
      saveClaimedState(updated);
      return updated;
    });

    // Retornar el parqueo marcado como reclamado
    return {
      ...staticParking,
      claimedBy: 'Propietario',
      isActive: true,
      ownerName: ownerName || 'Propietario',
    };
  }, [claimedParkingIds]);

  // Combinar userParkings con claimedParkings para "Mis Propiedades"
  const allUserParkings = [...claimedParkings, ...userParkings];

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
        updateParking,
        removeParking,
        claimParking,
        userParkings: allUserParkings,
        claimedParkingIds,
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
