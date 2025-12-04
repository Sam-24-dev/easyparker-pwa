import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useReservaContext } from '../context/ReservaContext';
import { useParkingContext } from '../context/ParkingContext';
import { MapPin, QrCode, Download, Share2, Calendar, X } from 'lucide-react';
import { IReserva } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';

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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState<IReserva | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [reservaParaQR, setReservaParaQR] = useState<IReserva | null>(null);
  const completadasRef = useRef<HTMLDivElement | null>(null);
  const voucherRef = useRef<HTMLDivElement | null>(null);

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
  const parkingParaCancelar = useMemo(() => {
    if (!reservaParaCancelar) return null;
    return getParkingById(reservaParaCancelar.parqueoId) ?? null;
  }, [reservaParaCancelar, getParkingById]);
  const parkingParaQR = useMemo(() => {
    if (!reservaParaQR) return null;
    return getParkingById(reservaParaQR.parqueoId) ?? null;
  }, [reservaParaQR, getParkingById]);

  const qrValue = useMemo(() => {
    if (!reservaParaQR || !parkingParaQR) return '';
    return JSON.stringify({
      reserva: reservaParaQR.id,
      placa: reservaParaQR.placa,
      parking: parkingParaQR.nombre,
      horario: `${reservaParaQR.horaInicio} - ${reservaParaQR.horaFin}`,
      fecha: reservaParaQR.fecha,
    });
  }, [reservaParaQR, parkingParaQR]);

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

  const abrirModalCancelacion = (reserva: IReserva) => {
    setReservaParaCancelar(reserva);
    setCancelModalOpen(true);
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

  const confirmarCancelacion = () => {
    if (!reservaParaCancelar) return;
    eliminarReserva(reservaParaCancelar.id);
    setCancelModalOpen(false);
    setReservaParaCancelar(null);
    setToastMessage('Reserva cancelada exitosamente');
  };

  const abrirModalQR = (reserva: IReserva) => {
    setReservaParaQR(reserva);
    setQrModalOpen(true);
  };

  const handleDownloadComprobante = async () => {
    if (!voucherRef.current) return;
    try {
      const dataUrl = await toPng(voucherRef.current, { backgroundColor: '#f8fafc' });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `reserva-${reservaParaQR?.id || 'easyparker'}.png`;
      link.click();
    } catch (error) {
      console.error('No se pudo generar el comprobante', error);
    }
  };

  const handleShareWhatsApp = () => {
    if (!reservaParaQR || !parkingParaQR) return;
    const message = encodeURIComponent(
      `Hola, esta es mi reserva ${reservaParaQR.id} en ${parkingParaQR.nombre} (${reservaParaQR.horaInicio} - ${reservaParaQR.horaFin}). Placa ${reservaParaQR.placa}.`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleAddToCalendar = () => {
    if (!reservaParaQR || !parkingParaQR) return;
    const startDate = new Date(`${reservaParaQR.fecha}T${reservaParaQR.horaInicio}:00`);
    const endDate = new Date(`${reservaParaQR.fecha}T${reservaParaQR.horaFin}:00`);
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${reservaParaQR.id}@easyparker`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:Reserva EasyParker - ${parkingParaQR.nombre}`,
      `DESCRIPTION:Reserva ${reservaParaQR.id} para ${reservaParaQR.placa}`,
      `LOCATION:${parkingParaQR.nombre}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reserva-${reservaParaQR.id}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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
            loading="lazy"
            className="w-20 h-20 rounded object-cover flex-shrink-0 bg-slate-200"
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
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => abrirModalQR(reserva)}
                    >
                      <QrCode size={16} className="mr-1" /> QR
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => abrirModalExtension(reserva)}
                    >
                      Extender
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => abrirModalCancelacion(reserva)}
                    >
                      <X size={16} className="mr-1" /> Cancelar
                    </Button>
                  </>
                )}
                {reserva.estado === 'completada' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => abrirModalEliminacion(reserva)}
                  >
                    Eliminar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/buscar')}
                >
                  Ver en mapa
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

      {/* Modal de Cancelar Reserva */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setReservaParaCancelar(null);
        }}
        title="¿Cancelar reserva?"
      >
        {reservaParaCancelar ? (
          <div className="space-y-4 text-[#0B1F60]">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm">
              <p className="font-semibold text-amber-800">No podrás recuperar tu lugar</p>
              <p className="text-slate-500 mt-1">Tu espacio quedará disponible para otros usuarios.</p>
            </div>
            <div className="rounded-2xl bg-[#EEF0FF] p-4 text-sm">
              <p className="font-semibold">{parkingParaCancelar?.nombre ?? 'Parqueo'}</p>
              <p className="text-slate-500">{reservaParaCancelar.fecha}</p>
              <p className="text-xs text-slate-500 mt-1">
                {reservaParaCancelar.horaInicio} - {reservaParaCancelar.horaFin}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{reservaParaCancelar.id}</p>
            </div>
            <div className="space-y-2">
              <Button variant="danger" className="w-full" onClick={confirmarCancelacion}>
                Sí, cancelar reserva
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setCancelModalOpen(false);
                  setReservaParaCancelar(null);
                }}
              >
                No, mantener
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Selecciona una reserva para cancelar.</p>
        )}
      </Modal>

      {/* Modal de QR */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setReservaParaQR(null);
        }}
        title="Comprobante digital"
      >
        {reservaParaQR && parkingParaQR ? (
          <div className="space-y-4">
            <div
              ref={voucherRef}
              className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Código</p>
                  <p className="text-2xl font-semibold text-[#0B1F60]">{reservaParaQR.id}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                  {reservaParaQR.estado === 'activa' ? 'Activa' : 'Completada'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Parqueo</p>
                  <p className="font-semibold text-[#0B1F60]">{parkingParaQR.nombre}</p>
                </div>
                <div>
                  <p className="text-slate-500">Horario</p>
                  <p className="font-semibold text-[#0B1F60]">{reservaParaQR.horaInicio} - {reservaParaQR.horaFin}</p>
                </div>
                <div>
                  <p className="text-slate-500">Vehículo</p>
                  <p className="font-semibold text-[#0B1F60]">{reservaParaQR.vehiculo}</p>
                </div>
                <div>
                  <p className="text-slate-500">Placa</p>
                  <p className="font-mono tracking-[0.2em] text-[#0B1F60]">{reservaParaQR.placa}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                <QRCodeCanvas value={qrValue} size={160} bgColor="#ffffff" fgColor="#0B1F60" />
                <p className="text-xs text-slate-500 text-center">
                  Muestra este QR para acceder al parqueo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={handleDownloadComprobante}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-[#0B1F60] font-semibold text-sm"
              >
                <Download size={16} /> Descargar comprobante
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-[#0B1F60] font-semibold text-sm"
              >
                <Share2 size={16} /> Compartir por WhatsApp
              </button>
              <button
                onClick={handleAddToCalendar}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-[#0B1F60] font-semibold text-sm"
              >
                <Calendar size={16} /> Agregar al calendario
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Selecciona una reserva para ver el QR.</p>
        )}
      </Modal>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0B1F60] text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg animate-slide-up z-50">
          {toastMessage}
        </div>
      )}
    </Layout>
  );
}
