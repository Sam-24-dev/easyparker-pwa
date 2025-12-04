import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { IReserva } from '../types/index';
import { useParkingContext } from './ParkingContext';
import { useReservationReminders } from '../hooks/useReservationReminders';
import { getAdditionalSlotKeys, getSlotKeysFromTimes } from '../utils/timeSlots';

// Clave para persistir reservas del usuario en localStorage
const RESERVAS_STORAGE_KEY = 'easyparker-user-reservas';
const USER_INITIALIZED_KEY = 'easyparker-reservas-initialized';

interface ReservaContextType {
  reservas: IReserva[];
  agregarReserva: (reserva: IReserva) => void;
  getReservasActivas: () => IReserva[];
  getReservasCompletadas: () => IReserva[];
  extenderReserva: (reservaId: string, horasExtra: number) => void;
  eliminarReserva: (reservaId: string) => void;
}

const ReservaContext = createContext<ReservaContextType | undefined>(undefined);

// Función para cargar reservas desde localStorage
const loadReservasFromStorage = (): IReserva[] => {
  try {
    const stored = localStorage.getItem(RESERVAS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error cargando reservas desde localStorage', error);
  }
  return [];
};

// Función para guardar reservas en localStorage
const saveReservasToStorage = (reservas: IReserva[]) => {
  try {
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(reservas));
  } catch (error) {
    console.warn('Error guardando reservas en localStorage', error);
  }
};

// Verificar si es un usuario nuevo (nunca ha tenido reservas inicializadas)
const isNewUser = (): boolean => {
  return !localStorage.getItem(USER_INITIALIZED_KEY);
};

// Marcar al usuario como inicializado
const markUserAsInitialized = () => {
  localStorage.setItem(USER_INITIALIZED_KEY, 'true');
};

export function ReservaProvider({ children }: { children: ReactNode }) {
  // Cargar reservas: usuarios nuevos empiezan sin reservas, usuarios existentes mantienen sus datos
  const getInitialReservas = (): IReserva[] => {
    const storedReservas = loadReservasFromStorage();
    
    // Si hay reservas guardadas, usarlas
    if (storedReservas.length > 0) {
      return storedReservas;
    }
    
    // Si es un usuario nuevo, empezar sin reservas
    if (isNewUser()) {
      markUserAsInitialized();
      return [];
    }
    
    // Usuario existente sin reservas guardadas pero ya inicializado - mantener vacío
    return [];
  };

  const [reservas, setReservas] = useState<IReserva[]>(getInitialReservas);
  const { getParkingById, reserveParkingSlots, releaseParkingSlots } = useParkingContext();
  const seededAvailabilityRef = useRef(false);

  const formatHoraWithExtra = useCallback((hora: string, horasExtra: number) => {
    const [hours, minutes] = hora.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0, 0);
    const extraMinutes = Math.round(horasExtra * 60);
    date.setMinutes(date.getMinutes() + extraMinutes);
    return date.toISOString().substring(11, 16);
  }, []);

  const agregarReserva = (reserva: IReserva) => {
    const slots = getSlotKeysFromTimes(reserva.horaInicio, reserva.horaFin);
    reserveParkingSlots(reserva.parqueoId, slots);
    setReservas((prev) => [...prev, reserva]);
  };

  const extenderReserva = (reservaId: string, horasExtra: number) => {
    setReservas(prev =>
      prev.map(reserva =>
        reserva.id === reservaId
          ? (() => {
              const nuevoFin = formatHoraWithExtra(reserva.horaFin, horasExtra);
              const nuevosSlots = getAdditionalSlotKeys(reserva.horaFin, nuevoFin);
              if (nuevosSlots.length) {
                reserveParkingSlots(reserva.parqueoId, nuevosSlots);
              }
              return { ...reserva, horaFin: nuevoFin };
            })()
          : reserva
      )
    );
  };

  const eliminarReserva = (reservaId: string) => {
    setReservas((prev) => {
      const target = prev.find((reserva) => reserva.id === reservaId);
      if (!target) return prev;
      if (target.estado === 'activa') {
        const slots = getSlotKeysFromTimes(target.horaInicio, target.horaFin);
        releaseParkingSlots(target.parqueoId, slots);
      }
      return prev.filter((reserva) => reserva.id !== reservaId);
    });
  };

  const getReservasActivas = () => {
    return reservas.filter(r => r.estado === 'activa');
  };

  const getReservasCompletadas = () => {
    return reservas.filter(r => r.estado === 'completada');
  };

  const parkingNameGetter = useCallback((id: number) => getParkingById(id)?.nombre, [getParkingById]);

  useReservationReminders(reservas, parkingNameGetter);

  // Persistir reservas en localStorage cuando cambien
  useEffect(() => {
    saveReservasToStorage(reservas);
  }, [reservas]);

  // Sincronizar disponibilidad de slots con las reservas activas actuales
  useEffect(() => {
    if (seededAvailabilityRef.current) return;
    // Usar las reservas actuales del estado (no las mock)
    reservas
      .filter((reserva) => reserva.estado === 'activa')
      .forEach((reserva) => {
        const slots = getSlotKeysFromTimes(reserva.horaInicio, reserva.horaFin);
        reserveParkingSlots(reserva.parqueoId, slots);
      });
    seededAvailabilityRef.current = true;
  }, [reserveParkingSlots, reservas]);

  return (
    <ReservaContext.Provider
      value={{ reservas, agregarReserva, getReservasActivas, getReservasCompletadas, extenderReserva, eliminarReserva }}
    >
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
