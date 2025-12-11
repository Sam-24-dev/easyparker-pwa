import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkingContext } from '../context/ParkingContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { Search, Compass, Megaphone, Calendar, LogOut, Heart, Star, MapPin, Home as HomeIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { FavoriteButton } from '../components/ui/FavoriteButton';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marcador simple para el mini-mapa
const miniMapMarkerIcon = L.divIcon({
  html: `<div style="width:12px;height:12px;background:#0B1F60;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  className: 'custom-mini-marker',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export function Home() {
  const navigate = useNavigate();
  const { parkings: allParkings, usuario } = useParkingContext();
  const { favorites } = useFavorites();
  const { user, logout, enableHostMode } = useAuth();
  const [toastMessage, setToastMessage] = useState('');

  // DEBUG: Verificar roles del usuario
  console.log('Home - User:', user);
  console.log('Home - Roles:', user?.roles);

  const firstName = user?.nombre?.split(' ')[0] || 'Usuario';
  
  // Obtener los 3 parqueos más cercanos para el mini-mapa
  const nearbyParkings = allParkings
    .filter(p => p.plazasLibres > 0)
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, 3);
  
  const availableParkingsCount = allParkings.filter(p => p.plazasLibres > 0).length;

  // Obtener los últimos 2 favoritos
  const favoriteParkings = allParkings.filter(p => favorites.includes(p.id)).slice(0, 2);

  const handleAnunciosClick = () => {
    setToastMessage('Próximamente: Ofertas y promociones');
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handler para convertirse en anfitrión
  const handleBecomeHost = async () => {
    try {
      await enableHostMode();
      setToastMessage('¡Ahora eres Anfitrión! Redirigiendo...');
      setTimeout(() => {
        navigate('/host/dashboard');
      }, 1500);
    } catch {
      setToastMessage('Error al activar modo anfitrión');
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  const suggestionCards = [
    { label: 'Explorar', icon: Compass, action: () => navigate('/buscar') },
    { label: 'Anuncios', icon: Megaphone, action: handleAnunciosClick },
    { label: 'Reservas', icon: Calendar, action: () => navigate('/mis-reservas') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/signup?mode=login');
  };

  return (
    <Layout showNav backgroundClassName="bg-[#0A1F63]">
      <div className="space-y-5">
        {/* BANNER: Conviértete en Anfitrión - Solo visible si NO es host */}
        {user && !user.roles?.host && (
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl text-white shadow-lg cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all"
            onClick={handleBecomeHost}
          >
            <h3 className="font-bold text-lg">¿Tienes un garaje vacío?</h3>
            <p className="text-sm text-white/90 mt-1">Conviértete en Anfitrión y gana dinero alquilando tu espacio.</p>
            <span className="inline-block mt-2 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
              Activar ahora →
            </span>
          </div>
        )}

        <section className="rounded-3xl bg-gradient-to-br from-[#0A1F63] to-[#132A74] text-white p-6 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/70">Hola {firstName}!</p>
              <h1 className="text-2xl font-semibold mt-1 leading-snug">
                ¿Quieres buscar estacionamiento?
              </h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Botón Modo Anfitrión - Solo si es host */}
              {user?.roles?.host === true && (
                <button
                  onClick={() => navigate('/host/dashboard')}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition"
                >
                  <HomeIcon size={14} />
                  Modo Anfitrión
                </button>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                <LogOut size={14} />
                Salir
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/buscar')}
            className="mt-6 w-full bg-white rounded-2xl px-5 py-3 flex items-center gap-3 text-[#0B1F60] font-semibold shadow-lg"
          >
            <Search size={18} />
            Buscar parqueo cercano
          </button>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg space-y-5">
          <article className="rounded-2xl bg-gradient-to-b from-[#0C1F63] to-[#1C2F74] text-white p-5 relative overflow-hidden">
            <p className="text-sm text-white/70">Parqueos cerca de</p>
            <h2 className="text-xl font-semibold">Guayaquil</h2>
            
            {/* Mini-mapa con marcadores */}
            <div className="mt-4 h-[150px] rounded-2xl overflow-hidden border border-white/20">
              <MapContainer
                center={[usuario.lat, usuario.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {nearbyParkings.map((parking) => (
                  <Marker
                    key={parking.id}
                    position={[parking.lat, parking.lng]}
                    icon={miniMapMarkerIcon}
                  />
                ))}
              </MapContainer>
            </div>
            
            <p className="mt-3 text-sm text-white/80">
              {availableParkingsCount} parqueos disponibles
            </p>
            
            <button
              onClick={() => navigate('/buscar')}
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition"
            >
              Ver mapa completo →
            </button>
          </article>

          {/* Sección de Favoritos */}
          {favoriteParkings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#0B1F60] flex items-center gap-2">
                  <Heart size={18} className="text-rose-500" fill="currentColor" />
                  Tus favoritos
                </h3>
                <button
                  onClick={() => navigate('/favoritos')}
                  className="text-sm font-semibold text-[#5A63F2]"
                >
                  Ver todos
                </button>
              </div>
              <div className="space-y-2">
                {favoriteParkings.map((parking) => (
                  <div
                    key={parking.id}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3 text-left hover:bg-slate-100 transition"
                  >
                    <button
                      onClick={() => navigate(`/parqueo/${parking.id}`)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <img
                        src={parking.foto}
                        alt={parking.nombre}
                        loading="lazy"
                        className="w-14 h-14 rounded-xl object-cover bg-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0B1F60] truncate">{parking.nombre}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {parking.distancia}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={12} fill="#0B1F60" className="text-[#0B1F60]" />
                            {parking.calificacion.toFixed(1)}
                          </span>
                          <span className="font-semibold text-[#0B1F60]">${parking.precio}/h</span>
                        </div>
                      </div>
                    </button>
                    <FavoriteButton parkingId={parking.id} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-[#0B1F60] mb-3">Sugerencias</h3>
            <div className="grid grid-cols-3 gap-3">
              {suggestionCards.map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center py-4 gap-2 text-[#0B1F60] shadow-sm"
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Toast de mensaje */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0B1F60] text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg animate-slide-up z-50">
          {toastMessage}
        </div>
      )}
    </Layout>
  );
}
