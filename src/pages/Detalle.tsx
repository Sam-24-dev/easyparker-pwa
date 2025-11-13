import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { ReviewList } from '../components/reviews/ReviewList';
import { useParkingContext } from '../context/ParkingContext';
import { getReviewsByParkingId } from '../data/reviews';
import { MapPin, Clock, Shield, Camera, Home } from 'lucide-react';

export function Detalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingById } = useParkingContext();

  const parking = getParkingById(Number(id));

  if (!parking) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Parqueo no encontrado</p>
          <Button onClick={() => navigate('/buscar')}>Volver a Búsqueda</Button>
        </div>
      </Layout>
    );
  }

  const reviews = getReviewsByParkingId(parking.verificado);
  const securityIcons: Record<string, React.ReactNode> = {
    'Guardia': <Shield size={20} className="text-primary" />,
    'Cámaras': <Camera size={20} className="text-primary" />,
    'Techo': <Home size={20} className="text-primary" />,
    'Guardia 24h': <Shield size={20} className="text-primary" />,
    'Acceso controlado': <Shield size={20} className="text-primary" />,
    'Alarma': <Shield size={20} className="text-primary" />,
    'Portón eléctrico': <Shield size={20} className="text-primary" />,
    'Cerco eléctrico': <Shield size={20} className="text-primary" />,
    'Techo cubierto': <Home size={20} className="text-primary" />,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <img
            src={parking.foto}
            alt={parking.nombre}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="text-2xl font-bold">{parking.nombre}</h1>
            {parking.verificado && <Badge variant="success">VERIFICADO</Badge>}
          </div>

          <div className="flex items-center gap-1 mb-4">
            <StarRating rating={parking.calificacion} size="md" />
            <span className="text-lg font-semibold text-gray-900 ml-2">{parking.calificacion}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg">
              <span className="font-bold text-primary">${parking.precio.toFixed(2)}</span>
              <span className="text-gray-600">/hora</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span>{parking.distancia}m de distancia</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span>{parking.horario}</span>
            </div>
          </div>
        </div>

        {parking.seguridad.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Características de Seguridad</h3>
            <div className="space-y-2">
              {parking.seguridad.map((seg, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-700">
                  {securityIcons[seg] || <Shield size={20} />}
                  <span>{seg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plazas disponibles</p>
              <p className={`text-2xl font-bold ${
                parking.plazasLibres > 10
                  ? 'text-green-600'
                  : parking.plazasLibres > 3
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {parking.plazasLibres}
              </p>
            </div>
          </div>
        </div>

        {parking.accesiblePMR && (
          <Badge variant="success" size="md">
            Espacio PMR disponible
          </Badge>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Reseñas de Usuarios</h3>
          <ReviewList reviews={reviews} maxDisplay={2} />
        </div>

        <Button
          size="lg"
          onClick={() => navigate(`/reservar/${parking.id}`)}
          className="w-full"
        >
          Reservar Ahora
        </Button>
      </div>
    </Layout>
  );
}
