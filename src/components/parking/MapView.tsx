import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { IParking } from '../../types/index';
import { useNavigate } from 'react-router-dom';

interface MapViewProps {
  parkings: IParking[];
  userLat: number;
  userLng: number;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onLiveUpdate?: (data: IParking[]) => void;
}

const createMarkerIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function MapContent({ parkings, userLat, userLng }: Omit<MapViewProps, 'onMapClick' | 'onLiveUpdate'>) {
  const map = useMap();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (parkings.length > 0) {
      const bounds = L.latLngBounds([
        [userLat, userLng],
        ...parkings.map(p => [p.lat, p.lng] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [parkings, map, userLat, userLng]);

  const getMarkerColor = (plazas: number) => {
    if (plazas > 10) return 'green';
    if (plazas >= 3) return 'yellow';
    return 'red';
  };

  return (
    <>
      <Marker position={[userLat, userLng]} icon={createMarkerIcon('blue')} />
      {parkings.map(parking => (
        <Marker
          key={parking.id}
          position={[parking.lat, parking.lng]}
          icon={createMarkerIcon(getMarkerColor(parking.plazasLibres))}
        >
          <Popup>
            <div className="w-48 text-sm">
              <h4 className="font-semibold mb-1">{parking.nombre}</h4>
              <p className="text-gray-600 mb-1">${parking.precio}/hora</p>
              <p className="text-gray-600 mb-3">{parking.plazasLibres} plazas</p>
              <button
                onClick={() => navigate(`/parqueo/${parking.id}`)}
                className="w-full bg-primary text-white text-xs font-medium py-1.5 rounded hover:bg-blue-700 transition-colors"
              >
                Ver detalle
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function MapClickHandler({ onMapClick }: { onMapClick?: MapViewProps['onMapClick'] }) {
  useMapEvents({
    click: (event) => {
      onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export function MapView({ parkings, userLat, userLng, onMapClick }: MapViewProps) {
  // Estado local para simulación de actualizaciones (sin causar re-renders en padre)
  const [displayParkings, setDisplayParkings] = React.useState<IParking[]>(parkings);
  const [secondsFromUpdate, setSecondsFromUpdate] = React.useState(0);
  const [ping, setPing] = React.useState(false);

  // Sincronizar cuando parkings del padre cambie
  React.useEffect(() => {
    setDisplayParkings(parkings);
  }, [parkings]);

  // Simulación de actualizaciones cada 8 segundos (solo visual, no actualiza padre)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisplayParkings((prev) => {
        if (!prev.length) return prev;
        
        const updated = prev.map((parking) => {
          // 30% chance de cambiar
          if (Math.random() > 0.3) return parking;
          const delta = Math.floor(Math.random() * 5) - 2;
          const plazasLibres = Math.max(0, Math.min(parking.plazasLibres + delta, 50));
          return { ...parking, plazasLibres };
        });

        setPing(true);
        setSecondsFromUpdate(0);
        setTimeout(() => setPing(false), 800);
        
        return updated;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Contador de segundos
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsFromUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        center={[userLat, userLng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapContent parkings={displayParkings} userLat={userLat} userLng={userLng} />
        <MapClickHandler onMapClick={onMapClick} />
      </MapContainer>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs text-[#0B1F60]">
        <span className={`inline-flex w-2 h-2 rounded-full ${ping ? 'bg-green-500 animate-ping' : 'bg-green-500'}`} />
        Actualizado hace {secondsFromUpdate}s
      </div>
    </div>
  );
}
