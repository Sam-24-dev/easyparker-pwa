import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useReservaContext } from '../context/ReservaContext';
import { useParkingContext } from '../context/ParkingContext';
import { MapPin } from 'lucide-react';

export function MisReservas() {
  const navigate = useNavigate();
  const { getReservasActivas, getReservasCompletadas } = useReservaContext();
  const { getParkingById } = useParkingContext();

  const activas = getReservasActivas();
  const completadas = getReservasCompletadas();

  const ReservaCard = ({ reservaId, parqueoId, fecha, horaInicio, horaFin, estado }: any) => {
    const parking = getParkingById(parqueoId);

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
              <Badge variant={estado === 'activa' ? 'success' : 'neutral'} size="sm">
                {estado === 'activa' ? 'Activa' : 'Completada'}
              </Badge>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <p>{fecha} • {horaInicio} - {horaFin}</p>
            </div>

            <div className="flex items-center justify-between">
              <code className="text-xs font-mono font-bold text-primary">{reservaId}</code>
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
      </Card>
    );
  };

  return (
    <Layout>
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
                    reservaId={reserva.id}
                    parqueoId={reserva.parqueoId}
                    fecha={reserva.fecha}
                    horaInicio={reserva.horaInicio}
                    horaFin={reserva.horaFin}
                    estado={reserva.estado}
                  />
                ))}
              </div>
            )}

            {completadas.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Reservas Completadas</h2>
                {completadas.map(reserva => (
                  <ReservaCard
                    key={reserva.id}
                    reservaId={reserva.id}
                    parqueoId={reserva.parqueoId}
                    fecha={reserva.fecha}
                    horaInicio={reserva.horaInicio}
                    horaFin={reserva.horaFin}
                    estado={reserva.estado}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
