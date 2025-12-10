import { IParking } from '../../types/index';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import { MapPin, DollarSign, CheckCircle, User } from 'lucide-react';

interface ParkingCardProps {
  parking: IParking;
  onClick?: () => void;
  onLocateClick?: () => void;
  onReserveClick?: () => void;
}

export function ParkingCard({ parking, onClick, onLocateClick, onReserveClick }: ParkingCardProps) {
  const handleViewDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onClick?.();
  };

  const handleReserve = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReserveClick?.();
  };

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLocateClick) {
      onLocateClick();
    } else {
      onClick?.();
    }
  };

  return (
    <Card hover className="overflow-hidden">
      <div
        className="aspect-video bg-gray-200 overflow-hidden relative cursor-pointer group"
        onClick={handleLocate}
        title={onLocateClick ? "Ver ubicación en mapa" : "Ver detalles"}
      >
        <img
          src={parking.foto}
          alt={parking.nombre}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {parking.zonaValidada && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium shadow-lg">
            <CheckCircle className="w-3 h-3" />
            Zona Validada
          </div>
        )}
        {/* Overlay hint for map interaction */}
        {onLocateClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 text-[#0B1F60] text-xs font-bold px-3 py-1 rounded-full shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
              Ver en mapa
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 flex-1 line-clamp-1">{parking.nombre}</h3>
          {parking.verificado && <Badge variant="success" size="sm">VERIFICADO</Badge>}
        </div>

        {/* Owner info */}
        {parking.ownerName && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              {parking.ownerPhoto ? (
                <img src={parking.ownerPhoto} alt={parking.ownerName} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <User size={12} className="text-emerald-600" />
              )}
            </div>
            <span className="text-xs text-slate-600">{parking.ownerName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-3">
          <StarRating rating={parking.calificacion} size="sm" />
          <span className="text-xs text-gray-600 ml-2">({parking.calificacion})</span>
        </div>

        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLocateClick?.();
            }}
            className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-blue-700 transition-colors group w-full text-left"
            title="Ubicar en mapa"
          >
            <div className="p-1.5 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors">
              <MapPin size={14} />
            </div>
            <span className="font-medium">{parking.distancia}m</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="p-1.5 bg-gray-50 rounded-full text-gray-500">
              <DollarSign size={14} />
            </div>
            <span>${parking.precio.toFixed(2)}/hora</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium flex items-center gap-1.5 ${
              parking.plazasLibres > 10
                ? 'text-green-600'
                : parking.plazasLibres > 3
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                parking.plazasLibres > 10
                  ? 'bg-green-500'
                  : parking.plazasLibres > 3
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`} />
              {parking.plazasLibres} plazas disponibles
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={handleViewDetails}
            >
              Ver detalles
            </Button>
            <Button
              className="w-full justify-center"
              onClick={handleReserve}
              disabled={!onReserveClick}
            >
              Reservar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
