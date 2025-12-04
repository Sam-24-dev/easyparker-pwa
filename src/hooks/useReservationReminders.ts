import { useEffect, useRef } from 'react';
import { IReserva } from '../types';

type TimerRef = number;

interface ScheduledTimers {
  before?: TimerRef;
  end?: TimerRef;
}

const MINUTES = 60 * 1000;
const FIFTEEN_MINUTES = 15 * MINUTES;

const parseDateTime = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return null;
  const iso = `${dateStr}T${timeStr}:00`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const addDayIfNeeded = (start: Date, end: Date) => {
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  return end;
};

type NotificationActionOption = {
  action: string;
  title: string;
  icon?: string;
};

type ExtendedNotificationOptions = NotificationOptions & {
  data?: Record<string, unknown>;
  actions?: NotificationActionOption[];
};

const showNotification = async (
  title: string,
  options: ExtendedNotificationOptions
) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration?.showNotification) {
      registration.showNotification(title, options);
    } else {
      // Fallback directo
      new Notification(title, options);
    }
  } catch (error) {
    console.warn('Notification error', error);
  }
};

export function useReservationReminders(
  reservas: IReserva[],
  getParkingName: (id: number) => string | undefined
) {
  const timersRef = useRef<Map<string, ScheduledTimers>>(new Map());

  useEffect(() => {
    if (!('Notification' in window)) return;
    const hasActiveReservations = reservas.some((reserva) => reserva.estado === 'activa');
    if (!hasActiveReservations) return;

    if (Notification.permission === 'default') {
      const alreadyRequested = localStorage.getItem('easyparker:notifications:requested') === 'true';
      if (alreadyRequested) return;
      Notification.requestPermission()
        .finally(() => localStorage.setItem('easyparker:notifications:requested', 'true'))
        .catch(() => undefined);
    }
  }, [reservas]);

  useEffect(() => {
    // Limpiar timers anteriores
    timersRef.current.forEach(({ before, end }) => {
      if (before) window.clearTimeout(before);
      if (end) window.clearTimeout(end);
    });
    timersRef.current.clear();

    const now = Date.now();
    reservas
      .filter((reserva) => reserva.estado === 'activa')
      .forEach((reserva) => {
        const parkingName = getParkingName(reserva.parqueoId) ?? 'EasyParker';
        const start = parseDateTime(reserva.fecha, reserva.horaInicio);
        const rawEnd = parseDateTime(reserva.fecha, reserva.horaFin);

        if (!start || !rawEnd) return;
        const end = addDayIfNeeded(start, rawEnd);

        const beforeTime = new Date(start.getTime() - FIFTEEN_MINUTES);
        const beforeDelay = beforeTime.getTime() - now;
        const endDelay = end.getTime() - now;

        const timers: ScheduledTimers = {};

        if (beforeDelay >= 0) {
          timers.before = window.setTimeout(() => {
            showNotification(`Tu reserva en ${parkingName} empieza en 15 min`, {
              body: `Placa ${reserva.placa} • ${reserva.horaInicio}`,
              tag: `before-${reserva.id}`,
              data: { url: '/mis-reservas', reservaId: reserva.id },
              actions: [
                {
                  action: 'view',
                  title: 'Ver mi reserva',
                },
              ],
            });
          }, beforeDelay);
        }

        if (endDelay >= 0) {
          timers.end = window.setTimeout(() => {
            showNotification('Tu tiempo está por terminar', {
              body: `Reserva ${parkingName} finaliza a las ${reserva.horaFin}`,
              tag: `end-${reserva.id}`,
              data: { url: `/mis-reservas?extender=${reserva.id}`, reservaId: reserva.id },
              actions: [
                {
                  action: 'extend',
                  title: 'Extender reserva',
                },
                {
                  action: 'view',
                  title: 'Ver detalle',
                },
              ],
            });
          }, endDelay);
        }

        timersRef.current.set(reserva.id, timers);
      });

    return () => {
      // Copiar la referencia actual para el cleanup
      const currentTimers = timersRef.current;
      currentTimers.forEach(({ before, end }) => {
        if (before) window.clearTimeout(before);
        if (end) window.clearTimeout(end);
      });
      currentTimers.clear();
    };
  }, [reservas, getParkingName]);
}
