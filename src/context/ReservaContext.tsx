import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { IReserva } from '../types/index';
import { useParkingContext } from './ParkingContext';
import { useReservationReminders } from '../hooks/useReservationReminders';
import { useNotification } from './NotificationContext';
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
  // Cargar reservas: siempre incluir reserva completada demo si no existe
  const getInitialReservas = (): IReserva[] => {
    const storedReservas = loadReservasFromStorage();

    // Reserva completada de ejemplo para probar flujo de calificación
    const mockCompletedReserva: IReserva = {
      id: 'reserva-completada-demo',
      parqueoId: 5, // Garaje Las Iguanas Premium (tiene owner: Fernando Reyes)
      fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 2 días
      horaInicio: '10:00',
      horaFin: '12:00',
      estado: 'completada',
      vehiculo: 'Auto',
      placa: 'GYE-1234',
    };

    // Si hay reservas guardadas, verificar que la demo exista
    if (storedReservas.length > 0) {
      const hasDemoReserva = storedReservas.some(r => r.id === 'reserva-completada-demo');
      if (!hasDemoReserva) {
        // Agregar la reserva demo si no existe
        return [...storedReservas, mockCompletedReserva];
      }
      return storedReservas;
    }

    // Usuario nuevo o sin reservas - empezar con la reserva demo
    if (isNewUser()) {
      markUserAsInitialized();
    }
    return [mockCompletedReserva];
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

  // Detectar aprobación de reservas y notificar
  const prevReservasRef = useRef<IReserva[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    const prevReservas = prevReservasRef.current;

    reservas.forEach(reserva => {
      const prev = prevReservas.find(p => p.id === reserva.id);

      // Caso 1: Cambio de estado Pending -> Activa
      if (prev && prev.estado === 'pending' && reserva.estado === 'activa') {
        showNotification({
          title: '¡Reserva Aprobada!',
          message: `Tu reserva para ${reserva.vehiculo} ha sido aceptada.`,
          type: 'success'
        });
      }

      // Caso 2: Nueva reserva activa (directamente aprobada)
      if (!prev && reserva.estado === 'activa' && !seededAvailabilityRef.current) {
        // Opcional: Notificar si se agregó una reserva ya activa (ej: carga inicial o sync)
        // showNotification(...) -> Mejor no, para evitar spam al cargar app
      }
    });

    prevReservasRef.current = reservas;
  }, [reservas, showNotification]);

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
