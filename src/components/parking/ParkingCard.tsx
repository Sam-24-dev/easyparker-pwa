import { IParking } from '../../types/index';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { MapPin, DollarSign } from 'lucide-react';

interface ParkingCardProps {
  parking: IParking;
  onClick?: () => void;
}

export function ParkingCard({ parking, onClick }: ParkingCardProps) {
  return (
    <Card hover onClick={onClick} className="overflow-hidden">
      <div className="aspect-video bg-gray-200 overflow-hidden">
        <img
          src={parking.foto}
          alt={parking.nombre}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 flex-1">{parking.nombre}</h3>
          {parking.verificado && <Badge variant="success" size="sm">VERIFICADO</Badge>}
        </div>

        <div className="flex items-center gap-1 mb-3">
          <StarRating rating={parking.calificacion} size="sm" />
          <span className="text-xs text-gray-600 ml-2">{parking.calificacion}</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>{parking.distancia}m</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={16} />
            <span>${parking.precio.toFixed(2)}/hora</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${
              parking.plazasLibres > 10
                ? 'text-green-600'
                : parking.plazasLibres > 3
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {parking.plazasLibres} plazas disponibles
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
