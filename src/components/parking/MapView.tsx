import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L, { LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { IParking } from '../../types/index';
import { useNavigate } from 'react-router-dom';
import { VALIDATED_ZONES } from '../../data/validatedZones';
import { MapLegend } from './MapLegend';
import { analytics } from '../../utils/analytics';

interface MapViewProps {
  parkings: IParking[];
  userLat: number;
  userLng: number;
  highlightedId?: number | null;
  updatedIds?: number[];
  suggestionPoint?: { lat: number; lng: number } | null;
  onMapLongPress?: (coords: { lat: number; lng: number }) => void;
  onLiveUpdate?: (changedIds: number[]) => void;
  flyToCoords?: { lat: number; lng: number } | null;
  selectedId?: number | null;
  height?: number;
}

const markerColors: Record<'green' | 'yellow' | 'red' | 'blue' | 'orange', string> = {
  green: '#16a34a',
  yellow: '#eab308',
  red: '#dc2626',
  blue: '#2563eb',
  orange: '#ea580c',
};

const createMarkerIcon = (
  color: keyof typeof markerColors,
  options?: { highlighted?: boolean; pulsing?: boolean }
) => {
  const { highlighted = false, pulsing = false } = options || {};
  const baseColor = markerColors[color];

  const html = `
    <div class="marker-pin ${highlighted ? 'marker-pin--active' : ''}">
      ${pulsing ? `<span class="marker-ping" style="border-color:${baseColor}"></span>` : ''}
      <span class="marker-dot" style="background:${baseColor}"></span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
};

function MapInteractions({
  onLongPress,
}: {
  onLongPress?: (coords: { lat: number; lng: number }) => void;
}) {
  const holdTimer = React.useRef<number | null>(null);

  const clearHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const scheduleHold = (event: LeafletMouseEvent) => {
    if (!onLongPress) return;
    const { lat, lng } = event.latlng;
    clearHold();
    holdTimer.current = window.setTimeout(() => {
      onLongPress({ lat, lng });
      if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    }, 500);
  };

  useMapEvents({
    mousedown(event: LeafletMouseEvent) {
      scheduleHold(event);
    },
    mouseup: clearHold,
    dragstart: clearHold,
    movestart: clearHold,
    moveend: clearHold,
  });

  return null;
}

export function MapView({
  parkings,
  userLat,
  userLng,
  highlightedId,
  updatedIds,
  suggestionPoint,
  onMapLongPress,
  onLiveUpdate,
  flyToCoords,
  selectedId,
  height = 400,
}: MapViewProps) {
  const mapRef = React.useRef<LeafletMap | null>(null);
  const markerRefs = React.useRef<Record<number, L.Marker | null>>({});
  const [mapReady, setMapReady] = React.useState(false);

  const handleMapInstance = React.useCallback((instance: LeafletMap | null) => {
    if (instance) {
      mapRef.current = instance;
      setMapReady(true);
    } else {
      mapRef.current = null;
      setMapReady(false);
    }
  }, []);
  const navigate = useNavigate();
  const [displayParkings, setDisplayParkings] = React.useState<IParking[]>(parkings);
  const [secondsFromUpdate, setSecondsFromUpdate] = React.useState(0);
  const [ping, setPing] = React.useState(false);
  const [recentUpdated, setRecentUpdated] = React.useState<number[]>([]);

  React.useEffect(() => {
    setDisplayParkings(parkings);
  }, [parkings]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || !parkings.length) return;
    const bounds = L.latLngBounds([
      [userLat, userLng],
      ...parkings.map((p) => [p.lat, p.lng] as [number, number]),
    ]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [parkings, userLat, userLng, mapReady]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || !flyToCoords) return;
    mapRef.current.flyTo([flyToCoords.lat, flyToCoords.lng], 16, { duration: 0.8 });
  }, [flyToCoords, mapReady]);

  React.useEffect(() => {
    if (selectedId && markerRefs.current[selectedId]) {
      markerRefs.current[selectedId]?.openPopup();
    }
  }, [selectedId]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisplayParkings((prev) => {
        if (!prev.length) return prev;

        const updatedIdsLocal: number[] = [];
        const updated = prev.map((parking) => {
          if (Math.random() > 0.35) return parking;
          const delta = Math.floor(Math.random() * 5) - 2;
          const plazasLibres = Math.max(0, Math.min(parking.plazasLibres + delta, 50));
          if (plazasLibres !== parking.plazasLibres) {
            updatedIdsLocal.push(parking.id);
          }
          return { ...parking, plazasLibres };
        });

        if (updatedIdsLocal.length) {
          setPing(true);
          setSecondsFromUpdate(0);
          setRecentUpdated(updatedIdsLocal);
          onLiveUpdate?.(updatedIdsLocal);
          setTimeout(() => {
            setPing(false);
            setRecentUpdated([]);
          }, 1000);
        }

        return updated;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [onLiveUpdate]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsFromUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getMarkerColor = (plazas: number): 'green' | 'yellow' | 'red' => {
    if (plazas > 10) return 'green';
    if (plazas >= 3) return 'yellow';
    return 'red';
  };

  const handleCenterUser = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([userLat, userLng], 16, { duration: 0.8 });
    }
  };

  const handleMarkerClick = (parking: IParking) => {
    analytics.track('marcador_clickeado', {
      parkingId: parking.id,
      nombre: parking.nombre,
      zonaId: parking.zonaId,
      zonaValidada: parking.zonaValidada
    });
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-0" style={{ height }}>
      <MapContainer
        center={[userLat, userLng]}
        zoom={14}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={handleMapInstance}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Polígonos de zonas validadas */}
        {VALIDATED_ZONES.map(zone => (
          <Polygon
            key={zone.id}
            positions={zone.bounds}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.15,
              weight: 3,
              dashArray: '10, 10'
            }}
          >
            <Popup>
              <div className="text-center p-1">
                <strong className="text-base text-[#0B1F60]">{zone.name}</strong>
                <p className="text-sm text-green-600 mt-1 font-medium">
                  Zona Validada
                </p>
                <p className="text-xs text-gray-500">
                  {zone.parkingCount} parqueos verificados
                </p>
              </div>
            </Popup>
          </Polygon>
        ))}

        <Marker
          position={[userLat, userLng]}
          icon={createMarkerIcon('blue', { highlighted: true })}
        >
          <Popup>
            <div className="text-center">
              <strong className="text-[#0B1F60]">Tu ubicación</strong>
            </div>
          </Popup>
        </Marker>

        {displayParkings.map((parking) => (
          <Marker
            key={parking.id}
            position={[parking.lat, parking.lng]}
            ref={(ref) => {
              if (ref) markerRefs.current[parking.id] = ref;
            }}
            icon={createMarkerIcon(getMarkerColor(parking.plazasLibres), {
              highlighted: parking.id === highlightedId,
              pulsing: recentUpdated.includes(parking.id) || updatedIds?.includes(parking.id),
            })}
            eventHandlers={{
              click: () => handleMarkerClick(parking)
            }}
          >
            <Popup>
              <div className="w-56 text-sm text-[#0B1F60] space-y-2">
                <div className="rounded-lg overflow-hidden h-28">
                  <img src={parking.foto} alt={parking.nombre} loading="lazy" className="w-full h-full object-cover bg-slate-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-base">{parking.nombre}</h4>
                    {parking.zonaValidada && (
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 capitalize">{parking.tipo.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">${parking.precio}/hora</span>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-[11px] font-semibold ${
                      parking.plazasLibres > 10
                        ? 'bg-emerald-500'
                        : parking.plazasLibres >= 3
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                  >
                    {parking.plazasLibres} plazas
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/parqueo/${parking.id}`)}
                  className="w-full rounded-full bg-[#0B1F60] text-white text-xs font-semibold py-2 hover:bg-[#152978] transition"
                >
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {suggestionPoint && (
          <Marker
            position={[suggestionPoint.lat, suggestionPoint.lng]}
            icon={createMarkerIcon('orange', { highlighted: true })}
          />
        )}

        <MapInteractions onLongPress={onMapLongPress} />
      </MapContainer>

      {/* Leyenda del mapa */}
      <MapLegend />

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs text-[#0B1F60]">
        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${ping ? 'bg-green-500 animate-ping' : 'bg-green-500'}`} />
        Actualizado hace {secondsFromUpdate}s
      </div>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={handleCenterUser}
          className="inline-flex items-center gap-2 rounded-full bg-white/95 text-[#0B1F60] text-xs font-semibold px-4 py-2 shadow-lg hover:bg-white"
        >
          <MapPin size={14} />
          Mi ubicación
        </button>
        <div className="rounded-2xl bg-white/90 shadow-lg overflow-hidden">
          <button className="w-10 h-10 text-[#0B1F60] font-bold" onClick={() => mapRef.current?.zoomIn()}>
            +
          </button>
          <div className="h-[1px] bg-slate-200" />
          <button className="w-10 h-10 text-[#0B1F60] font-bold" onClick={() => mapRef.current?.zoomOut()}>
            -
          </button>
        </div>
      </div>
    </div>
  );
}
