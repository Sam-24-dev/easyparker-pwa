import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkingContext } from '../context/ParkingContext';
import { useReservaContext } from '../context/ReservaContext';
import { IReserva, TipoVehiculo } from '../types';

const timeSlots = [
  { label: '9am - 10am', available: true, start: '09:00', end: '10:00' },
  { label: '10am - 11am', available: true, start: '10:00', end: '11:00' },
  { label: '11am - 12pm', available: false, start: '11:00', end: '12:00' },
  { label: '12pm - 1pm', available: true, start: '12:00', end: '13:00' },
  { label: '1pm - 2pm', available: false, start: '13:00', end: '14:00' },
  { label: '2pm - 3pm', available: true, start: '14:00', end: '15:00' },
  { label: '3pm - 4pm', available: true, start: '15:00', end: '16:00' },
  { label: '4pm - 5pm', available: true, start: '16:00', end: '17:00' },
  { label: '5pm - 6pm', available: false, start: '17:00', end: '18:00' },
  { label: '6pm - 7pm', available: true, start: '18:00', end: '19:00' },
  { label: '7pm - 8pm', available: true, start: '19:00', end: '20:00' },
  { label: '8pm - 9pm', available: true, start: '20:00', end: '21:00' },
];

const paymentMethods = ['Tarjeta de Débito / Crédito', 'Apple Pay', 'Efectivo'];

export function Reservar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingById, filtros } = useParkingContext();
  const { agregarReserva } = useReservaContext();
  const parking = getParkingById(Number(id));

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [cvv, setCvv] = useState('');
  const [reservaCode, setReservaCode] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<TipoVehiculo>('Auto');
  const [placa, setPlaca] = useState('');
  const [slotError, setSlotError] = useState('');
  const [placaError, setPlacaError] = useState('');
  const [cvvError, setCvvError] = useState('');

  const chosenSlot = useMemo(() => timeSlots.find(slot => slot.label === selectedSlot), [selectedSlot]);

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

  const placaRegex = /^[A-Z]{3}-?[0-9]{3,4}$/;

  const avanzar = () => {
    if (step === 1) {
      if (!selectedSlot) {
        setSlotError('Selecciona un horario disponible');
        return;
      }
      setSlotError('');
    }

    if (step === 3) {
      const normalizedPlate = placa.toUpperCase();
      if (!placaRegex.test(normalizedPlate)) {
        setPlacaError('Ingresa una placa válida (ej: ABC-1234)');
        return;
      }

      if (cvv.trim().length < 3) {
        setCvvError('Ingresa el CVV de tu tarjeta');
        return;
      }

      setPlacaError('');
      setCvvError('');
      confirmarReserva(normalizedPlate);
      return;
    }

    setStep(prev => (prev + 1) as 1 | 2 | 3 | 4);
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

  const confirmarReserva = (placaConfirmada?: string) => {
    if (!chosenSlot || !parking) return;
    const code = `7P-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setReservaCode(code);
    if (placaConfirmada) {
      setPlaca(placaConfirmada.length > 3 && !placaConfirmada.includes('-')
        ? `${placaConfirmada.slice(0, 3)}-${placaConfirmada.slice(3)}`
        : placaConfirmada);
    }

    const nuevaReserva: IReserva = {
      id: code,
      parqueoId: parking.id,
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: chosenSlot.start,
      horaFin: chosenSlot.end,
      estado: 'activa',
      vehiculo: vehiculoSeleccionado,
      placa: placaConfirmada ?? placa.toUpperCase(),
    };

    agregarReserva(nuevaReserva);
    setStep(4);
  };

  const volver = () => {
    if (step === 1) {
      navigate('/buscar');
      return;
    }
    setStep(prev => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const StepHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">Urdesa Central</p>
        <h1 className="text-2xl font-semibold text-[#0B1F60]">{title}</h1>
      </div>
      <button onClick={volver} className="text-sm text-[#5A63F2] font-semibold">
        {step === 1 ? 'Volver' : 'Atrás'}
      </button>
    </div>
  );

  const CardSeleccion = () => (
    <div className="rounded-3xl bg-[#0B1F60] text-white p-5 space-y-3">
      <p className="text-sm text-white/70">Seleccionaste</p>
      <div>
        <p className="text-3xl font-semibold">#{parking.id.toString().padStart(2, '0')}</p>
        <p className="text-white/80 text-base mt-1 leading-tight">{parking.nombre}</p>
      </div>
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>{vehiculoSeleccionado}</span>
        <span className="font-mono tracking-[0.3em]">
          {placa ? placa : 'PLACA?'}
        </span>
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
            <p className="text-sm text-slate-500 mb-3">Elige un horario</p>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot.label}
                  disabled={!slot.available}
                  onClick={() => {
                    setSelectedSlot(slot.label);
                    setSlotError('');
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    slot.available
                      ? selectedSlot === slot.label
                        ? 'border-[#5A63F2] bg-[#5A63F2] text-white'
                        : 'border-slate-200 bg-white text-[#0B1F60]'
                      : 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {slotError && <p className="text-sm text-red-500 mt-2">{slotError}</p>}
          </div>

          <button
            onClick={avanzar}
            className="w-full rounded-full bg-[#0B1F60] text-white py-3 font-semibold"
          >
            Reservar
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <StepHeader title="Método de pago" />
          <CardSeleccion />

          <div className="space-y-3">
            {paymentMethods.map(method => (
              <label
                key={method}
                className={`flex items-center gap-3 border rounded-2xl px-4 py-3 cursor-pointer ${
                  selectedMethod === method ? 'border-[#5A63F2]' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  className="accent-[#5A63F2]"
                  checked={selectedMethod === method}
                  onChange={() => setSelectedMethod(method)}
                />
                <span className="text-[#0B1F60] font-medium">{method}</span>
              </label>
            ))}
          </div>

          <button
            onClick={avanzar}
            className="w-full rounded-full bg-[#0B1F60] text-white py-3 font-semibold"
          >
            Continuar
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <StepHeader title="Proceso de pago" />
          <CardSeleccion />

          <div className="rounded-3xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0B1F60]">Acceso automático</p>
                <p className="text-xs text-slate-500">Define el vehículo que abrirá la barrera</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">LPR</span>
            </div>

            <div className="flex gap-2">
              {parking.vehiculosPermitidos.map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setVehiculoSeleccionado(tipo)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                    vehiculoSeleccionado === tipo
                      ? 'border-[#5A63F2] bg-[#5A63F2] text-white'
                      : 'border-slate-200 text-[#0B1F60]'
                  }`}
                >
                  <span aria-hidden>{tipo === 'Auto' ? '🚗' : '🏍️'}</span>
                  {tipo}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0B1F60]">Placa del vehículo</label>
              <input
                value={placa}
                onChange={(e) => handlePlacaChange(e.target.value)}
                placeholder="ABC-1234"
                autoCapitalize="characters"
                autoComplete="off"
                className={`mt-2 w-full border-2 rounded-2xl px-4 py-3 focus:outline-none ${
                  placaError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#5A63F2]'
                } font-mono tracking-[0.3em] text-center`}
              />
              {placaError ? (
                <p className="text-xs text-red-500 mt-1">{placaError}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Usamos cámaras LPR para validar tu placa.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[#5A63F2] to-[#7A3CF5] text-white p-6">
            <p className="text-sm text-white/80">Tarjeta seleccionada</p>
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
              className={`mt-2 w-full border-2 rounded-2xl px-4 py-3 focus:outline-none ${
                cvvError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#5A63F2]'
              }`}
              placeholder="000"
            />
            {cvvError && <p className="text-xs text-red-500 mt-1">{cvvError}</p>}
          </div>

          <button
            onClick={avanzar}
            className="w-full rounded-full bg-[#0B1F60] text-white py-3 font-semibold"
          >
            Pagar y terminar
          </button>
        </section>
      )}

      {step === 4 && (
        <section className="text-center space-y-6">
          <p className="text-sm text-slate-500">Reserva</p>
          <h1 className="text-2xl font-semibold text-[#0B1F60]">Reserva realizada con éxito</h1>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#0B1F60] text-white text-3xl font-bold">
            7P
          </div>
          <p className="text-[#0B1F60] font-medium">Desde {chosenSlot?.start} hasta {chosenSlot?.end}</p>
          <p className="text-sm text-slate-500">
            Vehículo {vehiculoSeleccionado} • Placa {placa || '— — —'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm">
            Recuerda respetar los horarios
          </div>
          <div className="space-x-3">
            <button
              onClick={() => navigate('/buscar')}
              className="px-5 py-3 rounded-full border border-slate-200 text-[#0B1F60] font-semibold"
            >
              Volver a buscar
            </button>
            <button
              onClick={() => navigate('/mis-reservas')}
              className="px-5 py-3 rounded-full bg-[#0B1F60] text-white font-semibold"
            >
              Ver reservas
            </button>
          </div>
        </section>
      )}
    </Layout>
  );
}
