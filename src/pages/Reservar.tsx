import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkingContext } from '../context/ParkingContext';
import { useReservaContext } from '../context/ReservaContext';
import { IReserva } from '../types';

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
  const { getParkingById } = useParkingContext();
  const { agregarReserva } = useReservaContext();
  const parking = getParkingById(Number(id));

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [cvv, setCvv] = useState('');
  const [reservaCode, setReservaCode] = useState('');
  const [error, setError] = useState('');

  const chosenSlot = useMemo(() => timeSlots.find(slot => slot.label === selectedSlot), [selectedSlot]);

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

  const avanzar = () => {
    if (step === 1 && !selectedSlot) {
      setError('Selecciona un horario disponible');
      return;
    }
    if (step === 3) {
      confirmarReserva();
      return;
    }
    setError('');
    setStep(prev => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const confirmarReserva = () => {
    if (!chosenSlot) return;
    const code = `7P-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setReservaCode(code);

    const nuevaReserva: IReserva = {
      id: code,
      parqueoId: parking.id,
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: chosenSlot.start,
      horaFin: chosenSlot.end,
      estado: 'activa',
      vehiculo: 'Auto',
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
    <div className="rounded-3xl bg-[#0B1F60] text-white p-5">
      <p className="text-sm text-white/70">Seleccionaste</p>
      <h3 className="text-3xl font-semibold mt-2">7P</h3>
      <p className="text-white/60 mt-4">Mi Comisariato Urdesa</p>
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
                    setError('');
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
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
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
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
              className="mt-2 w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#5A63F2]"
              placeholder="000"
            />
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
