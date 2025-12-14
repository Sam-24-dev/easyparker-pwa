import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkingContext } from '../context/ParkingContext';
import { useReservaContext } from '../context/ReservaContext';
import { useChatContext } from '../context/ChatContext';
import { IReserva, TipoVehiculo } from '../types';
import { Button } from '../components/ui/Button';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Calendar, CreditCard, Download, Share2, Wallet, MessageCircle } from 'lucide-react';
import { timeSlots as baseTimeSlots, slotKey } from '../utils/timeSlots';
import { getRandomHostWelcomeMessage } from '../data/chatMock';
import { events } from '../data/events';
import { getParkingPriceForEvent } from '../utils/pricingUtils';
import { ShieldCheck } from 'lucide-react';


const placaRegex = /^[A-Z]{3}-?[0-9]{3,4}$/;

type SlotRange = { start: number; end: number } | null;
type PaymentMethodId = 'card' | 'paypal' | 'cash';

interface PaymentOption {
  id: PaymentMethodId;
  label: string;
  helper: string;
  icon: (props: { size?: number }) => JSX.Element;
  requiresCvv: boolean;
}

const PayPalMark = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4h8c4.418 0 8 3.582 8 8s-3.582 8-8 8h-5l-1.2 8H8.2L10 4h2z"
      fill="#003087"
      opacity="0.8"
    />
    <path
      d="M11 4h8c3.314 0 6 2.686 6 6s-2.686 6-6 6h-5l-1 6H8L10 4h1z"
      fill="#009cde"
      opacity="0.8"
    />
  </svg>
);

const paymentOptions: PaymentOption[] = [
  {
    id: 'card',
    label: 'Tarjeta de crédito / débito',
    helper: 'Visa, Mastercard, Diners',
    icon: ({ size = 22 }) => <CreditCard size={size} />,
    requiresCvv: true,
  },
  {
    id: 'paypal',
    label: 'PayPal',
    helper: 'Sin compartir tu tarjeta',
    icon: ({ size = 22 }) => <PayPalMark size={size} />,
    requiresCvv: false,
  },
  {
    id: 'cash',
    label: 'Efectivo',
    helper: 'Paga al llegar al parqueo',
    icon: ({ size = 22 }) => <Wallet size={size} />,
    requiresCvv: false,
  },
];

function VehicleIllustration({ tipo }: { tipo: TipoVehiculo }) {
  if (tipo === 'Moto') {
    return (
      <svg viewBox="0 0 120 60" className="w-full h-16" aria-hidden>
        <circle cx="30" cy="40" r="12" fill="#0B1F60" opacity="0.25" />
        <circle cx="90" cy="40" r="12" fill="#0B1F60" opacity="0.25" />
        <rect x="32" y="20" width="60" height="16" rx="8" fill="#0B1F60" opacity="0.15" />
        <path d="M20 32 L40 18 L70 18" stroke="#0B1F60" strokeWidth="4" strokeLinecap="round" />
        <path d="M78 18 L98 15" stroke="#0B1F60" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 140 70" className="w-full h-16" aria-hidden>
      <rect x="20" y="28" width="100" height="24" rx="12" fill="#0B1F60" opacity="0.2" />
      <rect x="38" y="16" width="64" height="24" rx="12" fill="#0B1F60" opacity="0.15" />
      <circle cx="45" cy="56" r="12" fill="#0B1F60" opacity="0.3" />
      <circle cx="95" cy="56" r="12" fill="#0B1F60" opacity="0.3" />
      <rect x="58" y="20" width="24" height="10" rx="4" fill="#0B1F60" opacity="0.4" />
    </svg>
  );
}

export function Reservar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingById, filtros, getBlockedSlots } = useParkingContext();
  const { agregarReserva } = useReservaContext();
  const { createConversationFromReserva, sendInitialMessage } = useChatContext();
  const parking = getParkingById(Number(id));
  const parkingId = parking?.id ?? null;
  const blockedSlots = useMemo(() => {
    if (!parkingId) return [];
    return getBlockedSlots(parkingId);
  }, [parkingId, getBlockedSlots]);
  // Pricing Logic
  const priceInfo = useMemo(() => {
    if (!parking) return { basePrice: 0, finalPrice: 0, isSurge: false, surgeMultiplier: 1 };
    return getParkingPriceForEvent(parking, events);
  }, [parking]);

  // Extended Slots for Events (incluye madrugada)
  // Extended Slots for Events (incluye madrugada)
  const eventSlots = useMemo(() => {
    // Safety check: ensure priceInfo exists and has activeEvent
    if (!priceInfo || !priceInfo.activeEvent) return baseTimeSlots;
    // Si hay evento, generar slots desde (HoraInicio - 4h) hasta (HoraFin)
    // Para simplificar la demo, mostraremos un rango extendido fijo para eventos
    // Ejemplo Chayanne 20:00 -> Slots desde 16:00 hasta 03:00 (necesita slots de madrugada)
    // Ejemplo Burger Show 12:00 -> Slots desde 08:00 hasta 22:00

    // Slots Mock extendidos
    return [
      { label: '8am - 9am', start: '08:00', end: '09:00' },
      { label: '9am - 10am', start: '09:00', end: '10:00' },
      { label: '10am - 11am', start: '10:00', end: '11:00' },
      { label: '11am - 12pm', start: '11:00', end: '12:00' },
      { label: '12pm - 1pm', start: '12:00', end: '13:00' },
      { label: '1pm - 2pm', start: '13:00', end: '14:00' },
      { label: '2pm - 3pm', start: '14:00', end: '15:00' },
      { label: '3pm - 4pm', start: '15:00', end: '16:00' },
      { label: '4pm - 5pm', start: '16:00', end: '17:00' },
      { label: '5pm - 6pm', start: '17:00', end: '18:00' },
      { label: '6pm - 7pm', start: '18:00', end: '19:00' },
      { label: '7pm - 8pm', start: '19:00', end: '20:00' },
      { label: '8pm - 9pm', start: '20:00', end: '21:00' },
      { label: '9pm - 10pm', start: '21:00', end: '22:00' },
      { label: '10pm - 11pm', start: '22:00', end: '23:00' },
      { label: '11pm - 12am', start: '23:00', end: '00:00' },
      { label: '12am - 1am', start: '00:00', end: '01:00' },
      { label: '1am - 2am', start: '01:00', end: '02:00' },
      { label: '2am - 3am', start: '02:00', end: '03:00' },
    ];
  }, [priceInfo.activeEvent]);

  const slotsWithAvailability = useMemo(
    () => {
      let filtered = eventSlots;
      // Filtrar según horario del evento si existe
      if (priceInfo.activeEvent) {
        // Lógica simple: Mostrar todos los extendidos
        // Opcional: Recortar start/end según evento real
      } else {
        // Si no es evento, usar los baseTimeSlots normales
        filtered = baseTimeSlots;
      }

      return filtered.map((slot) => ({ ...slot, available: !blockedSlots.includes(slotKey(slot)) }))
    },
    [blockedSlots, eventSlots, priceInfo.activeEvent]
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRange, setSelectedRange] = useState<SlotRange>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('card');
  const [cvv, setCvv] = useState('');
  const [reservaCode, setReservaCode] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<TipoVehiculo>('Auto');
  const [placa, setPlaca] = useState('');
  const [slotError, setSlotError] = useState('');
  const [placaError, setPlacaError] = useState('');
  const [cvvError, setCvvError] = useState('');
  const [confirmedHoraInicio, setConfirmedHoraInicio] = useState('');
  const [confirmedHoraFin, setConfirmedHoraFin] = useState('');
  const [conversationId, setConversationId] = useState('');
  const voucherRef = useRef<HTMLDivElement | null>(null);

  // VIP Escort State (Solo para Burger Show / Centro)
  const [wantsEscort, setWantsEscort] = useState(false);



  // Burger Show Check (solo ejemplo por ID o zona)
  const canRequestEscort = useMemo(() => {
    return priceInfo.activeEvent?.id === 'evt-002' || parking?.zonaId === 'centro';
  }, [priceInfo, parking]);


  const selectedSlots = useMemo(() => {
    if (!selectedRange) return [];
    return slotsWithAvailability.slice(selectedRange.start, selectedRange.end + 1);
  }, [selectedRange, slotsWithAvailability]);

  const totalHours = selectedSlots.length;
  const horaInicio = selectedSlots[0]?.start ?? '';
  const horaFin = selectedSlots[selectedSlots.length - 1]?.end ?? '';
  const horarioResumen = totalHours ? `${horaInicio} - ${horaFin}` : 'Selecciona un rango';

  // Calcular Total con Surge Price y Escolta
  const parkingCost = totalHours * priceInfo.finalPrice;
  const escortCost = wantsEscort ? 1.00 : 0;
  const totalPrice = parkingCost + escortCost;



  const vehiculoBase = useMemo<TipoVehiculo | null>(() => {
    if (!parking) return null;
    if (parking.vehiculosPermitidos.includes(filtros.tipoVehiculo)) {
      return filtros.tipoVehiculo;
    }
    return parking.vehiculosPermitidos[0] ?? 'Auto';
  }, [parking, filtros.tipoVehiculo]);

  useEffect(() => {
    if (vehiculoBase) {
      setVehiculoSeleccionado(vehiculoBase);
    }
  }, [vehiculoBase]);

  useEffect(() => {
    if (selectedSlots.length) {
      setSlotError('');
    }
  }, [selectedSlots.length]);

  useEffect(() => {
    if (!selectedRange) return;
    const currentRange = slotsWithAvailability.slice(selectedRange.start, selectedRange.end + 1);
    if (currentRange.some((slot) => !slot.available)) {
      setSelectedRange(null);
    }
  }, [slotsWithAvailability, selectedRange]);

  useEffect(() => {
    if (selectedMethod !== 'card') {
      setCvv('');
      setCvvError('');
    }
  }, [selectedMethod]);

  const qrValue = useMemo(() => {
    if (!reservaCode || !parking) return '';
    const horarioQR = confirmedHoraInicio && confirmedHoraFin
      ? `${confirmedHoraInicio} - ${confirmedHoraFin}`
      : horarioResumen;
    return JSON.stringify({ reserva: reservaCode, placa: placa.toUpperCase(), parking: parking.nombre, horario: horarioQR });
  }, [reservaCode, placa, parking, horarioResumen, confirmedHoraInicio, confirmedHoraFin]);

  if (!parking) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Parqueo no encontrado</p>
          <button
            onClick={() => navigate('/buscar')}
            className="px-4 py-2 rounded-full bg-[#0B1F60] text-white"
          >
            Volver
          </button>
        </div>
      </Layout>
    );
  }

  const handleSlotClick = (slotIndex: number) => {
    const targetSlot = slotsWithAvailability[slotIndex];
    if (!targetSlot || !targetSlot.available) return;
    setSelectedRange((prev) => {
      if (!prev) return { start: slotIndex, end: slotIndex };
      if (prev.start === slotIndex && prev.end === slotIndex) return null;
      if (prev.start === prev.end) {
        if (slotIndex === prev.start) return null;
        const start = Math.min(prev.start, slotIndex);
        const end = Math.max(prev.start, slotIndex);
        const block = slotsWithAvailability.slice(start, end + 1);
        if (block.every((slot) => slot.available)) {
          return { start, end };
        }
        return { start: slotIndex, end: slotIndex };
      }
      return { start: slotIndex, end: slotIndex };
    });
  };

  const avanzar = () => {
    if (step === 1) {
      if (!selectedSlots.length) {
        setSlotError('Selecciona al menos una hora consecutiva disponible');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!placaRegex.test(placa.toUpperCase())) {
        setPlacaError('Ingresa una placa válida (ej: ABC-1234)');
        return;
      }
      setPlacaError('');
      setStep(3);
      return;
    }

    if (step === 3) {
      if (selectedMethod === 'card' && (cvv.trim().length < 3 || cvv.trim().length > 4)) {
        setCvvError('El CVV debe tener 3 o 4 dígitos');
        return;
      }
      setCvvError('');
      confirmarReserva();
    }
  };

  const handlePlacaChange = (value: string) => {
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    const formatted = sanitized.length > 3 ? `${sanitized.slice(0, 3)}-${sanitized.slice(3)}` : sanitized;
    setPlaca(formatted);
    if (placaError) setPlacaError('');
  };

  const handleCvvChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 4);
    setCvv(sanitized);
    if (cvvError) setCvvError('');
  };

  const confirmarReserva = () => {
    if (!parking || !selectedSlots.length) return;
    const code = `EP-${Math.floor(Math.random() * 9000 + 1000)}`;
    setReservaCode(code);

    // Guardar horario confirmado antes de que se resetee el estado
    setConfirmedHoraInicio(horaInicio);
    setConfirmedHoraFin(horaFin);

    const nuevaReserva: IReserva = {
      id: code,
      parqueoId: parking.id,
      fecha: new Date().toISOString().split('T')[0],
      horaInicio,
      horaFin,
      estado: 'activa',
      vehiculo: vehiculoSeleccionado,
      placa: placa.toUpperCase(),
    };

    agregarReserva(nuevaReserva);

    // Determinar si es chat real: true si el garaje fue reclamado (claimedFromId) o creado por el anfitrión (ID >= 1000)
    // Los 35 parqueos estáticos (ID 1-35) NO tienen claimedFromId y su chat es mock
    const isRealChat = !!parking.claimedFromId || parking.id >= 1000;

    // Crear conversación con el anfitrión
    const conversation = createConversationFromReserva({
      hostId: parking.ownerId || `host-${parking.id}`,
      hostName: parking.ownerName || 'Anfitrión',
      hostPhoto: parking.ownerPhoto,
      parkingId: parking.id,
      parkingName: parking.nombre,
      reservaId: code,
      isRealChat, // Solo es real si el garaje fue reclamado/creado
    });

    // Guardar el ID de la conversación para navegar después
    setConversationId(conversation.id);

    // Solo enviar mensaje automático del anfitrión si es chat MOCK (parqueo estático)
    // Si es chat REAL (garaje reclamado/creado), el anfitrión enviará el mensaje manualmente
    if (!isRealChat) {
      setTimeout(() => {
        sendInitialMessage(
          conversation.id,
          getRandomHostWelcomeMessage(),
          { id: parking.ownerId || `host-${parking.id}`, name: parking.ownerName || 'Anfitrión', photo: parking.ownerPhoto },
          'host'
        );
      }, 1000);
    }

    setStep(4);
  };

  const handleContactHost = () => {
    // Navegar a la conversación creada
    if (conversationId) {
      navigate(`/mensajes/${conversationId}`);
    } else {
      navigate('/mensajes');
    }
  };

  const volver = () => {
    if (step === 1) {
      navigate(-1);
      return;
    }
    // Si estamos en paso 4 (QR generado), la reserva ya está hecha
    // No permitir volver al paso de pago - ir a buscar
    if (step === 4) {
      navigate(-1);
      return;
    }
    setStep(prev => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleDownloadComprobante = async () => {
    if (!voucherRef.current) return;
    try {
      const dataUrl = await toPng(voucherRef.current, { backgroundColor: '#f8fafc' });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `reserva-${reservaCode || 'easyparker'}.png`;
      link.click();
    } catch (error) {
      console.error('No se pudo generar el comprobante', error);
    }
  };

  const handleShareWhatsApp = () => {
    if (!reservaCode) return;
    const horarioMsg = confirmedHoraInicio && confirmedHoraFin
      ? `${confirmedHoraInicio} - ${confirmedHoraFin}`
      : horarioResumen;
    const message = encodeURIComponent(`Hola, esta es mi reserva ${reservaCode} en ${parking.nombre} (${horarioMsg}). Placa ${placa.toUpperCase()}.`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleAddToCalendar = () => {
    const calHoraInicio = confirmedHoraInicio || horaInicio;
    const calHoraFin = confirmedHoraFin || horaFin;
    if (!calHoraInicio || !calHoraFin || !reservaCode) return;
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(`${today}T${calHoraInicio}:00`);
    const endDate = new Date(`${today}T${calHoraFin}:00`);
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${reservaCode}@easyparker`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:Reserva EasyParker - ${parking.nombre}`,
      `DESCRIPTION:Reserva ${reservaCode} para ${placa.toUpperCase()}`,
      `LOCATION:${parking.nombre}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reserva-${reservaCode}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const StepHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">{step === 4 ? '¡Listo!' : `Paso ${step} de 4`}</p>
        <h1 className="text-2xl font-semibold text-[#0B1F60]">{title}</h1>
      </div>
      {step !== 4 && (
        <button onClick={volver} className="text-sm text-[#5A63F2] font-semibold">
          {step === 1 ? 'Volver' : 'Atrás'}
        </button>
      )}
    </div>
  );

  const CardSeleccion = () => (
    <div className="rounded-3xl bg-[#0B1F60] text-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60">Parqueo</p>
          <p className="text-3xl font-semibold">#{parking.id.toString().padStart(2, '0')}</p>
          <p className="text-white/80 text-base mt-1 leading-tight">{parking.nombre}</p>
        </div>
        <div className="text-right text-sm text-white/80">
          <p>{vehiculoSeleccionado}</p>
          <p className="font-mono tracking-[0.3em] mt-1">{placa || 'PLACA?'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-white/80">
        <div>
          <p className="text-white/60">Horario</p>
          <p className="font-semibold">{horarioResumen}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60">Total estimado</p>
          <p className="text-xl font-bold">${totalPrice.toFixed(2)}</p>
          {priceInfo.isSurge && <span className="text-[10px] bg-rose-500 px-1.5 py-0.5 rounded text-white">Tarifa Evento</span>}
        </div>

      </div>
    </div>
  );

  return (
    <Layout>
      {step === 1 && (
        <section className="space-y-6">
          <StepHeader title="Horarios disponibles" />
          <CardSeleccion />

          <div>
            <p className="text-sm text-slate-500 mb-3">Elige un rango consecutivo</p>
            <div className="grid grid-cols-3 gap-2">
              {slotsWithAvailability.map((slot, index) => {
                const isSelected = selectedRange && index >= selectedRange.start && index <= selectedRange.end;
                return (
                  <button
                    key={slot.label}
                    disabled={!slot.available}
                    onClick={() => handleSlotClick(index)}
                    className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${!slot.available
                      ? 'border-red-200 bg-red-50 text-red-300 cursor-not-allowed'
                      : isSelected
                        ? 'border-[#5A63F2] bg-[#5A63F2] text-white shadow-lg'
                        : 'border-slate-200 bg-white text-[#0B1F60] hover:border-[#5A63F2]'
                      }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
            {slotError && <p className="text-sm text-red-500 mt-2">{slotError}</p>}
          </div>

          <div className="rounded-3xl border border-slate-100 p-4 flex items-center justify-between bg-white shadow-sm">
            <div>
              <p className="text-xs text-slate-500">Duración</p>
              <p className="text-xl font-semibold text-[#0B1F60]">
                {totalHours ? `${totalHours} ${totalHours > 1 ? 'horas' : 'hora'}` : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total estimado</p>
              <p className="text-3xl font-bold text-[#0B1F60]">${totalPrice.toFixed(2)}</p>
              {priceInfo.isSurge && <span className="text-[10px] bg-rose-500 px-1.5 py-0.5 rounded text-white">Tarifa Evento</span>}
            </div>
          </div>

          {/* VIP Escort Option */}
          {canRequestEscort && (
            <div className={`rounded-3xl border p-4 flex items-center gap-3 cursor-pointer transition-all ${wantsEscort ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
              }`}
              onClick={() => setWantsEscort(!wantsEscort)}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${wantsEscort ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                }`}>
                {wantsEscort && <span className="text-white font-bold text-xs">✓</span>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#0B1F60] flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-600" />
                  Solicitar Acompañamiento (+ $1.00)
                </p>
                <p className="text-xs text-slate-500">Un guardia te acompañará desde tu auto hasta la entrada del evento.</p>
              </div>
            </div>
          )}

          <Button onClick={avanzar} className="w-full">Continuar</Button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <StepHeader title="Datos del vehículo" />
          <CardSeleccion />

          <div>
            <p className="text-sm text-slate-500 mb-3">Selecciona el tipo de vehículo</p>
            <div className="grid grid-cols-2 gap-3">
              {parking.vehiculosPermitidos.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setVehiculoSeleccionado(tipo)}
                  className={`rounded-3xl border p-4 text-left transition space-y-3 ${vehiculoSeleccionado === tipo
                    ? 'border-[#5A63F2] bg-[#5A63F2]/10'
                    : 'border-slate-200'
                    }`}
                >
                  <VehicleIllustration tipo={tipo} />
                  <p className="font-semibold text-[#0B1F60]">{tipo}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#0B1F60]">Placa del vehículo</label>
            <input
              value={placa}
              onChange={(e) => handlePlacaChange(e.target.value)}
              placeholder="ABC-1234"
              className={`mt-2 w-full border-2 rounded-2xl px-4 py-3 text-center font-mono tracking-[0.3em] focus:outline-none ${placaError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#5A63F2]'
                }`}
            />
            {placaError ? (
              <p className="text-xs text-red-500 mt-1">{placaError}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Formato automático con guion.</p>
            )}
          </div>

          <Button onClick={avanzar} className="w-full">Continuar</Button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <StepHeader title="Proceso de pago" />
          <CardSeleccion />

          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedMethod(option.id)}
                className={`w-full flex items-center justify-between rounded-3xl border px-4 py-3 text-left transition ${selectedMethod === option.id ? 'border-[#5A63F2] bg-[#5A63F2]/10' : 'border-slate-200'
                  }`}
              >
                <div>
                  <p className="text-sm font-semibold text-[#0B1F60] flex items-center gap-2">
                    {option.icon({ size: 18 })}
                    {option.label}
                  </p>
                  <p className="text-xs text-slate-500">{option.helper}</p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === option.id ? 'border-[#5A63F2]' : 'border-slate-200'
                    }`}
                >
                  {selectedMethod === option.id && <span className="w-2 h-2 rounded-full bg-[#5A63F2]" />}
                </span>
              </button>
            ))}
          </div>

          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-gradient-to-br from-[#5A63F2] to-[#7A3CF5] text-white p-6">
                <p className="text-sm text-white/80">Visa Black</p>
                <p className="text-2xl font-semibold mt-6 tracking-widest">1478 2285 4595 9874</p>
                <div className="flex items-center justify-between mt-8 text-sm">
                  <span>Mirka Sellan</span>
                  <span>12/29</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#0B1F60]">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => handleCvvChange(e.target.value)}
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`mt-2 w-full border-2 rounded-2xl px-4 py-3 focus:outline-none ${cvvError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#5A63F2]'
                    }`}
                  placeholder="000"
                />
                {cvvError && <p className="text-xs text-red-500 mt-1">{cvvError}</p>}
              </div>
            </div>
          )}

          {selectedMethod === 'paypal' && (
            <div className="rounded-3xl border border-slate-200 p-4 text-sm text-slate-600">
              Serás redirigido a PayPal para autorizar el pago seguro sin compartir tus datos con EasyParker.
            </div>
          )}

          {selectedMethod === 'cash' && (
            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              Reserva tu espacio y paga al llegar. Muestra tu QR al personal para validar la tarifa preferencial.
            </div>
          )}

          <Button onClick={avanzar} className="w-full">Confirmar pago</Button>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4 sm:space-y-6 pb-4">
          <StepHeader title="Comprobante digital" />

          <div
            ref={voucherRef}
            className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Código</p>
                <p className="text-2xl sm:text-3xl font-semibold text-[#0B1F60]">{reservaCode}</p>
              </div>
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                Confirmada
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-slate-500">Parqueo</p>
                <p className="font-semibold text-[#0B1F60] text-sm">{parking.nombre}</p>
              </div>
              <div>
                <p className="text-slate-500">Horario</p>
                <p className="font-semibold text-[#0B1F60]">{confirmedHoraInicio} - {confirmedHoraFin}</p>
              </div>
              <div>
                <p className="text-slate-500">Vehículo</p>
                <p className="font-semibold text-[#0B1F60]">{vehiculoSeleccionado}</p>
              </div>
              <div>
                <p className="text-slate-500">Placa</p>
                <p className="font-mono tracking-[0.2em] sm:tracking-[0.3em] text-[#0B1F60]">{placa.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <QRCodeCanvas value={qrValue} size={140} bgColor="#ffffff" fgColor="#0B1F60" />
              <p className="text-xs sm:text-sm text-slate-500 text-center px-2">
                Muestra este QR para abrir la barrera o compártelo con quien vaya a estacionar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            <button
              onClick={handleDownloadComprobante}
              className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 py-2.5 sm:py-3 text-[#0B1F60] font-semibold text-sm"
            >
              <Download size={16} /> Descargar comprobante
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 py-2.5 sm:py-3 text-[#0B1F60] font-semibold text-sm"
            >
              <Share2 size={16} /> Compartir por WhatsApp
            </button>
            <button
              onClick={handleAddToCalendar}
              className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 py-2.5 sm:py-3 text-[#0B1F60] font-semibold text-sm"
            >
              <Calendar size={16} /> Agregar al calendario
            </button>
          </div>

          {/* Mensaje o Botón según tipo de garaje */}
          {(!!parking.claimedFromId || parking.id >= 1000) ? (
            // Garaje reclamado/creado - botón para contactar
            <button
              onClick={handleContactHost}
              className="w-full flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-semibold text-sm transition-colors"
            >
              <MessageCircle size={18} />
              Contactar anfitrión
            </button>
          ) : (
            // Parqueo estático - solo mensaje informativo
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl sm:rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
                <MessageCircle size={18} />
                ¡El anfitrión se contactará contigo!
              </div>
              <p className="text-xs text-indigo-600">
                Recibirás un mensaje cuando el anfitrión confirme tu llegada.
              </p>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/buscar')}
              className="flex-1 rounded-xl sm:rounded-2xl border border-slate-200 py-2.5 sm:py-3 font-semibold text-[#0B1F60] text-sm"
            >
              Buscar otro parqueo
            </button>
            <button
              onClick={() => navigate('/mis-reservas')}
              className="flex-1 rounded-xl sm:rounded-2xl bg-[#0B1F60] text-white py-2.5 sm:py-3 font-semibold text-sm"
            >
              Ver mis reservas
            </button>
          </div>
        </section>
      )}
    </Layout>
  );
}
