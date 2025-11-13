import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IParking } from '../../types/index';
import { useNavigate } from 'react-router-dom';

interface MapViewProps {
  parkings: IParking[];
  userLat: number;
  userLng: number;
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

function MapContent({ parkings, userLat, userLng }: MapViewProps) {
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

export function MapView({ parkings, userLat, userLng }: MapViewProps) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-100">
      <MapContainer
        center={[userLat, userLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapContent parkings={parkings} userLat={userLat} userLng={userLng} />
      </MapContainer>
    </div>
  );
}
