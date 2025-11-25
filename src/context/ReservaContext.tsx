import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { IReserva } from '../types/index';
import { reservasMock } from '../data/reservasMock';
import { useParkingContext } from './ParkingContext';
import { useReservationReminders } from '../hooks/useReservationReminders';
import { getAdditionalSlotKeys, getSlotKeysFromTimes } from '../utils/timeSlots';

interface ReservaContextType {
  reservas: IReserva[];
  agregarReserva: (reserva: IReserva) => void;
  getReservasActivas: () => IReserva[];
  getReservasCompletadas: () => IReserva[];
  extenderReserva: (reservaId: string, horasExtra: number) => void;
  eliminarReserva: (reservaId: string) => void;
}

const ReservaContext = createContext<ReservaContextType | undefined>(undefined);

export function ReservaProvider({ children }: { children: ReactNode }) {
  const [reservas, setReservas] = useState<IReserva[]>(reservasMock);
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

  useEffect(() => {
    if (seededAvailabilityRef.current) return;
    reservasMock
      .filter((reserva) => reserva.estado === 'activa')
      .forEach((reserva) => {
        const slots = getSlotKeysFromTimes(reserva.horaInicio, reserva.horaFin);
        reserveParkingSlots(reserva.parqueoId, slots);
      });
    seededAvailabilityRef.current = true;
  }, [reserveParkingSlots]);

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
