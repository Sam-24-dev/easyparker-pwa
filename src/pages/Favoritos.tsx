import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkingContext } from '../context/ParkingContext';
import { useFavorites } from '../context/FavoritesContext';
import { Button } from '../components/ui/Button';
import { Heart, MapPin, Star, ArrowLeft } from 'lucide-react';

export function Favoritos() {
  const navigate = useNavigate();
  const { parkings } = useParkingContext();
  const { favorites, removeFavorite } = useFavorites();

  const favoriteParkings = parkings.filter((p) => favorites.includes(p.id));

  return (
    <Layout showNav>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <ArrowLeft size={20} className="text-[#0B1F60]" />
          </button>
          <h1 className="text-2xl font-bold text-[#0B1F60]">Mis Favoritos</h1>
        </div>

        {favoriteParkings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Heart size={48} className="text-slate-300 mx-auto" />
            <h3 className="text-xl font-semibold text-[#0B1F60]">No tienes favoritos aún</h3>
            <p className="text-sm text-slate-500">
              Guarda tus parqueos preferidos tocando el ❤️
            </p>
            <Button onClick={() => navigate('/buscar')}>Explorar parqueos</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteParkings.map((parking) => (
              <div
                key={parking.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <img
                    src={parking.foto}
                    alt={parking.nombre}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[#0B1F60] truncate">{parking.nombre}</h3>
                      <button
                        onClick={() => removeFavorite(parking.id)}
                        className="p-1.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition flex-shrink-0"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 capitalize mt-1">
                      {parking.tipo.replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {parking.distancia}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={14} fill="#0B1F60" className="text-[#0B1F60]" />
                        {parking.calificacion.toFixed(1)}
                      </span>
                      <span className="font-semibold text-[#0B1F60]">${parking.precio}/h</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/parqueo/${parking.id}`)}
                      >
                        Ver detalle
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/reservar/${parking.id}`)}
                      >
                        Reservar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
