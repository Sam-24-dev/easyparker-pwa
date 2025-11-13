import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useParkingContext } from '../context/ParkingContext';
import { useReservaContext } from '../context/ReservaContext';
import { IReserva } from '../types/index';
import { Check, Clock } from 'lucide-react';

export function Reservar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingById } = useParkingContext();
  const { agregarReserva } = useReservaContext();

  const parking = getParkingById(Number(id));
  const [vehiculo, setVehiculo] = useState<'Auto' | 'Moto' | 'Camioneta'>('Auto');
  const [horaInicio, setHoraInicio] = useState('14:00');
  const [horaFin, setHoraFin] = useState('15:00');
  const [showConfirm, setShowConfirm] = useState(false);
  const [reservaCode, setReservaCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!showConfirm) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showConfirm]);

  if (!parking) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Parqueo no encontrado</p>
          <Button onClick={() => navigate('/buscar')}>Volver</Button>
        </div>
      </Layout>
    );
  }

  const handleConfirmar = () => {
    const code = `EP-${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0')}`;
    setReservaCode(code);
    setTimeLeft(15);
    setShowConfirm(true);

    const nuevaReserva: IReserva = {
      id: code,
      parqueoId: parking.id,
      fecha: new Date().toISOString().split('T')[0],
      horaInicio,
      horaFin,
      estado: 'activa',
      vehiculo,
    };

    agregarReserva(nuevaReserva);
  };

  const calcularPrecio = () => {
    const inicio = parseInt(horaInicio.split(':')[0]);
    const fin = parseInt(horaFin.split(':')[0]);
    const horas = fin > inicio ? fin - inicio : 24 - inicio + fin;
    return (horas * parking.precio).toFixed(2);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-100 p-4 flex gap-4">
          <img
            src={parking.foto}
            alt={parking.nombre}
            className="w-20 h-20 rounded object-cover flex-shrink-0"
          />
          <div>
            <h2 className="font-semibold text-gray-900">{parking.nombre}</h2>
            <p className="text-sm text-gray-600">${parking.precio.toFixed(2)}/hora</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de vehículo
            </label>
            <select
              value={vehiculo}
              onChange={(e) => setVehiculo(e.target.value as 'Auto' | 'Moto' | 'Camioneta')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option>Auto</option>
              <option>Moto</option>
              <option>Camioneta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de inicio
            </label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de fin
            </label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Precio total</p>
            <p className="text-2xl font-bold text-primary">${calcularPrecio()}</p>
          </div>
        </div>

        <Button size="lg" onClick={handleConfirmar} className="w-full">
          Confirmar Reserva
        </Button>

        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="text-green-600" size={32} />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Reserva Confirmada</h3>
              <p className="text-gray-600">Tu plaza está reservada</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-600 mb-1">Código de reserva</p>
              <p className="text-lg font-mono font-bold text-primary">{reservaCode}</p>
            </div>

            <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-lg p-4">
              <Clock size={20} className="text-warning" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {timeLeft > 0 ? `${timeLeft} minutos` : 'Tiempo agotado'}
                </p>
                <p className="text-xs text-gray-600">para confirmar tu entrada</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button size="lg" variant="primary" onClick={() => navigate('/buscar')} className="w-full">
                Ver en mapa
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/mis-reservas')} className="w-full">
                Ir a mis reservas
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
