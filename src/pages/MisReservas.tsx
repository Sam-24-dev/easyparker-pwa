import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useReservaContext } from '../context/ReservaContext';
import { useParkingContext } from '../context/ParkingContext';
import { MapPin } from 'lucide-react';
import { IReserva } from '../types';

export function MisReservas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getReservasActivas, getReservasCompletadas, extenderReserva, eliminarReserva } = useReservaContext();
  const { getParkingById } = useParkingContext();
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<IReserva | null>(null);
  const [extraSeleccionada, setExtraSeleccionada] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservaParaEliminar, setReservaParaEliminar] = useState<IReserva | null>(null);
  const completadasRef = useRef<HTMLDivElement | null>(null);

  const activas = getReservasActivas();
  const completadas = getReservasCompletadas();
  const selectedParking = useMemo(() => {
    if (!reservaSeleccionada) return null;
    return getParkingById(reservaSeleccionada.parqueoId) ?? null;
  }, [reservaSeleccionada, getParkingById]);
  const parkingParaEliminar = useMemo(() => {
    if (!reservaParaEliminar) return null;
    return getParkingById(reservaParaEliminar.parqueoId) ?? null;
  }, [reservaParaEliminar, getParkingById]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const extendId = params.get('extender');
    const view = params.get('view');
    let shouldReset = false;

    if (extendId) {
      const target = activas.find(reserva => reserva.id === extendId);
      if (target) {
        abrirModalExtension(target);
      }
      shouldReset = true;
    }

    if (view === 'history') {
      shouldReset = true;
      setTimeout(() => {
        completadasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }

    if (shouldReset) {
      navigate('/mis-reservas', { replace: true });
    }
  }, [location.search, activas, navigate, completadasRef]);

  const opcionesExtra = [
    { label: '+30 min', value: 0.5 },
    { label: '+1 hora', value: 1 },
    { label: '+2 horas', value: 2 },
  ];

  const sumarHoras = (hora: string, horasExtra: number) => {
    const [hour, minute] = hora.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    date.setMinutes(date.getMinutes() + horasExtra * 60);
    return date.toISOString().substring(11, 16);
  };

  const abrirModalExtension = (reserva: IReserva) => {
    setReservaSeleccionada(reserva);
    setExtraSeleccionada(1);
    setExtendModalOpen(true);
  };

  const abrirModalEliminacion = (reserva: IReserva) => {
    setReservaParaEliminar(reserva);
    setDeleteModalOpen(true);
  };

  const confirmarExtension = () => {
    if (!reservaSeleccionada) return;
    extenderReserva(reservaSeleccionada.id, extraSeleccionada);
    setExtendModalOpen(false);
    setToastMessage('Reserva extendida exitosamente');
  };

  const confirmarEliminacion = () => {
    if (!reservaParaEliminar) return;
    eliminarReserva(reservaParaEliminar.id);
    setDeleteModalOpen(false);
    setReservaParaEliminar(null);
    setToastMessage('Reserva eliminada');
  };

  const ReservaCard: React.FC<{ reserva: IReserva }> = ({ reserva }) => {
    const parking = getParkingById(reserva.parqueoId);

    if (!parking) return null;

    return (
      <Card className="p-4 mb-3">
        <div className="flex gap-4">
          <img
            src={parking.foto}
            alt={parking.nombre}
            className="w-20 h-20 rounded object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{parking.nombre}</h3>
                <p className="text-xs text-gray-600 mt-1">{parking.tipo}</p>
              </div>
              <Badge variant={reserva.estado === 'activa' ? 'success' : 'neutral'} size="sm">
                {reserva.estado === 'activa' ? 'Activa' : 'Completada'}
              </Badge>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <p>{reserva.fecha} • {reserva.horaInicio} - {reserva.horaFin}</p>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {reserva.vehiculo === 'Moto' ? '🏍️' : '🚗'} {reserva.vehiculo}
              </span>
              <span className="font-mono text-sm text-[#0B1F60] tracking-[0.3em]">{reserva.placa || 'PLACA'}</span>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <code className="text-xs font-mono font-bold text-primary">{reserva.id}</code>
              <div className="flex gap-2 flex-wrap justify-end">
                {reserva.estado === 'activa' && (
                  <Button
                    size="sm"
                    onClick={() => abrirModalExtension(reserva)}
                  >
                    Extender
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/buscar')}
                >
                  Ver en mapa
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => abrirModalEliminacion(reserva)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Layout showNav>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mis Reservas</h1>

        {activas.length === 0 && completadas.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tienes reservas aún</p>
            <Button onClick={() => navigate('/buscar')}>Buscar parqueo</Button>
          </div>
        ) : (
          <>
            {activas.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Reservas Activas</h2>
                {activas.map(reserva => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                  />
                ))}
              </div>
            )}

            {completadas.length > 0 && (
              <div ref={completadasRef}>
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Reservas Completadas</h2>
                {completadas.map(reserva => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title="Extender reserva"
      >
        {reservaSeleccionada && selectedParking ? (
          <div className="space-y-4 text-[#0B1F60]">
            <div className="rounded-2xl bg-[#EEF0FF] p-4 text-sm">
              <p className="font-semibold">{selectedParking.nombre}</p>
              <p className="text-slate-500">{reservaSeleccionada.fecha}</p>
              <p className="text-xs text-slate-500 mt-1">
                Actual: {reservaSeleccionada.horaInicio} - {reservaSeleccionada.horaFin}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Tiempo adicional</p>
              <div className="grid grid-cols-3 gap-2">
                {opcionesExtra.map((opcion) => (
                  <button
                    key={opcion.value}
                    onClick={() => setExtraSeleccionada(opcion.value)}
                    className={`rounded-2xl border px-2 py-2 text-sm font-semibold transition ${
                      extraSeleccionada === opcion.value
                        ? 'border-[#0B1F60] bg-[#0B1F60] text-white'
                        : 'border-slate-200 bg-white text-[#0B1F60]'
                    }`}
                  >
                    {opcion.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between text-sm">
              <div>
                <p className="text-slate-500">Nuevo horario</p>
                <p className="font-semibold text-lg">
                  {reservaSeleccionada.horaInicio} - {sumarHoras(reservaSeleccionada.horaFin, extraSeleccionada)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Total extra</p>
                <p className="text-xl font-bold">
                  ${ (selectedParking.precio * extraSeleccionada).toFixed(2) }
                </p>
              </div>
            </div>

            <Button className="w-full" onClick={confirmarExtension}>
              Extender por ${ (selectedParking.precio * extraSeleccionada).toFixed(2) }
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Selecciona una reserva para extender.</p>
        )}
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReservaParaEliminar(null);
        }}
        title="Eliminar reserva"
      >
        {reservaParaEliminar ? (
          <div className="space-y-4 text-[#0B1F60]">
            <div className="rounded-2xl bg-[#FDECEC] border border-red-100 p-4 text-sm">
              <p className="font-semibold text-red-700">Esta acción no se puede deshacer</p>
              <p className="text-slate-500">Liberaremos el espacio reservado y quitaremos el comprobante.</p>
            </div>
            <div className="rounded-2xl bg-[#EEF0FF] p-4 text-sm">
              <p className="font-semibold">{parkingParaEliminar?.nombre ?? 'Parqueo'}</p>
              <p className="text-slate-500">{reservaParaEliminar.fecha}</p>
              <p className="text-xs text-slate-500 mt-1">
                {reservaParaEliminar.horaInicio} - {reservaParaEliminar.horaFin}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{reservaParaEliminar.id}</p>
            </div>
            <div className="space-y-2">
              <Button variant="danger" className="w-full" onClick={confirmarEliminacion}>
                Sí, eliminar reserva
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setReservaParaEliminar(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Selecciona una reserva para eliminar.</p>
        )}
      </Modal>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0B1F60] text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg animate-in">
          {toastMessage}
        </div>
      )}
    </Layout>
  );
}
