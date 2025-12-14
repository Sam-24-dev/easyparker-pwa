import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkings } from '../hooks/useParkings';
import { useParkingContext } from '../context/ParkingContext';
import { MapPin, SlidersHorizontal, Search as SearchIcon, Loader2, MapPinOff, Bell, Clock, X, Navigation } from 'lucide-react';
import { MapView } from '../components/parking/MapView';
import { ParkingCard } from '../components/parking/ParkingCard';
import { Modal } from '../components/ui/Modal';
import { FilterBar } from '../components/parking/FilterBar';
import { Button } from '../components/ui/Button';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { analytics } from '../utils/analytics';
import { SEARCH_ZONES, getZoneNameFromSearch } from '../data/searchZones';
import { TipoVehiculo, IEvent } from '../types';
import { events } from '../data/events';
import { getParkingPriceForEvent, PricingResult } from '../utils/pricingUtils';
import { useLocation } from 'react-router-dom';


type SortMode = 'distance' | 'price' | 'rating';

const NOTIFICATION_STORAGE_KEY = 'easyparker-notify-availability';

export function Buscar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { usuario, resetFiltros, filtros, setFiltros } = useParkingContext();
  const { history, addSearch, clearHistory } = useSearchHistory();

  // Inicializar searchTerm desde URL si existe
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortMode, setSortMode] = useState<SortMode>('distance');
  const [hoveredId, setHoveredId] = useState<number | null>(null);



  // Restaurar filtros desde URL al montar
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const price = searchParams.get('price');
    const verified = searchParams.get('verified');

    if (q || type || price || verified) {
      if (q) setSearchTerm(q);
      setFiltros({
        ...filtros,
        tipoVehiculo: (type as TipoVehiculo) || filtros.tipoVehiculo,
        precioMax: price ? Number(price) : filtros.precioMax,
        soloVerificados: verified === 'true',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // Pasamos searchTerm al hook para que filtre combinando con los demás filtros
  const { parkings: recommendedParkings } = useParkings(searchTerm);

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestionCoords, setSuggestionCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestionForm, setSuggestionForm] = useState({ nombre: '', comentario: '' });
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdatedIds, setLastUpdatedIds] = useState<number[]>([]);
  const [mapFlyTo, setMapFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);

  // Active Event State
  const [activeEvent, setActiveEvent] = useState<IEvent | null>(null);

  // Efecto para manejar navegación desde Eventos
  // Efecto para manejar navegación y URL param de evento
  useEffect(() => {
    // Prioridad: 1. Estado de navegación (al hacer click en evento) 2. URL param (al recargar/volver)
    const eventIdFromState = location.state?.activeEventId;
    const eventIdFromUrl = searchParams.get('eventId');
    const targetEventId = eventIdFromState || eventIdFromUrl;

    if (targetEventId) {
      const foundEvent = events.find(e => e.id === targetEventId);
      if (foundEvent) {
        setActiveEvent(foundEvent);
        if (eventIdFromState) {
          // Solo si viene de navegación directa limpiamos y mostramos toast inicial
          setSearchTerm('');
          setSortMode('distance');
          setToastMessage(`📍 Mostrando parqueos cerca de: ${foundEvent.title}`);
          setMapFlyTo({ lat: foundEvent.lat, lng: foundEvent.lng });
        }
      }
    }
  }, [location.state, searchParams]);

  // Sincronizar URL cuando cambian searchTerm o filtros
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.q = searchTerm;
    if (filtros.tipoVehiculo) params.type = filtros.tipoVehiculo;
    if (filtros.precioMax < 10) params.price = filtros.precioMax.toString();
    if (filtros.soloVerificados) params.verified = 'true';
    if (activeEvent) params.eventId = activeEvent.id;

    setSearchParams(params, { replace: true });
  }, [searchTerm, filtros, activeEvent, setSearchParams]);

  // GPS/Location states

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleLocateParking = (id: number, lat: number, lng: number) => {
    setMapFlyTo({ lat, lng });
    setSelectedParkingId(id);
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Check GPS permission on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setLocationDenied(true);
          setLocationModalOpen(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!suggestionCoords) return;
    const timer = setTimeout(() => setSuggestionCoords(null), 3000);
    return () => clearTimeout(timer);
  }, [suggestionCoords]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const visibleParkings = useMemo(() => {
    // Ahora recommendedParkings ya viene filtrado por searchTerm y filtros del contexto
    const filtered = recommendedParkings.filter((parking) => parking.plazasLibres > 0);

    // Calcular precios dinámicos y distancia al evento si hay uno activo
    const processed = filtered.map(p => {
      // Si hay evento, recalcular precio y atributos
      if (activeEvent) {
        const pricing = getParkingPriceForEvent(p, [activeEvent]);
        return { ...p, pricingResult: pricing };
      }
      // Si no, precio normal
      return { ...p, pricingResult: { basePrice: p.precio, finalPrice: p.precio, isSurge: false, surgeMultiplier: 1 } as PricingResult };
    });

    // Si hay evento, filtrar por radio (o mostrar todos pero ordenados?)
    // Mejor filtrar algo amplio para no mostrar toda la ciudad
    const inRange = activeEvent
      ? processed.filter(p => !p.zonaId || p.pricingResult.isSurge || p.distancia < 2000) // Mostrar si tiene surge o está cerca
      : processed;

    const sorted = [...inRange].sort((a, b) => {
      // Si hay evento activo, priorizar distancia al Evento, no al usuario (a menos que sortMode cambie)
      // Pero por simplicidad, mantenemos distancia al usuario, PERO los de surge primero.
      if (activeEvent) {
        if (a.pricingResult.isSurge && !b.pricingResult.isSurge) return -1;
        if (!a.pricingResult.isSurge && b.pricingResult.isSurge) return 1;
      }

      if (sortMode === 'price') return a.pricingResult.finalPrice - b.pricingResult.finalPrice;
      if (sortMode === 'rating') return b.calificacion - a.calificacion;
      return a.distancia - b.distancia;
    });

    return sorted;
  }, [recommendedParkings, sortMode, activeEvent]);


  // Obtener nombre de zona dinámico
  const currentZoneName = useMemo(() => {
    return getZoneNameFromSearch(searchTerm);
  }, [searchTerm]);

  const handleLiveUpdate = (ids: number[]) => {
    setIsUpdating(true);
    setLastUpdatedIds(ids);
    setTimeout(() => {
      setIsUpdating(false);
      setLastUpdatedIds([]);
    }, 1200);
  };

  const handleSuggestionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setSuggestionForm({ nombre: '', comentario: '' });
      setToastMessage('¡Gracias! Revisaremos tu sugerencia');
    }, 900);
  };

  const handleLongPress = (coords: { lat: number; lng: number }) => {
    setSuggestionCoords(coords);
    setIsModalOpen(true);
    setSuggestionForm({ nombre: '', comentario: '' });
  };

  const handleRequestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationModalOpen(false);
        setLocationDenied(false);
        setToastMessage('Ubicación activada');
      },
      () => {
        setToastMessage('No se pudo obtener tu ubicación');
      }
    );
  };

  const handleManualSearch = () => {
    setLocationModalOpen(false);
    if (manualAddress) {
      setToastMessage(`Buscando en: ${manualAddress}`);
    }
  };

  const handleExpandRadius = () => {
    setFiltros({ ...filtros, distancia: 1000 });
    setToastMessage('Radio expandido a 1km');
  };

  const handleNotifyMe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
        setToastMessage('Te notificaremos cuando haya espacio');

        // Simular notificación después de 10 segundos
        setTimeout(() => {
          new Notification('EasyParker', {
            body: '¡Ya hay espacios disponibles en Urdesa!',
            icon: '/logo/easyparker-icon.png',
          });
        }, 10000);
      } else {
        setToastMessage('Necesitamos permiso para notificarte');
      }
    } catch {
      setToastMessage('Tu navegador no soporta notificaciones');
    }
  };

  const showEmptyState = !isLoading && visibleParkings.length === 0;

  return (
    <Layout showNav>
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Buscar estacionamiento en</p>
            <h1 className="text-2xl font-semibold text-[#0B1F60]">
              {activeEvent ? 'Zona del Evento' : currentZoneName}
            </h1>
          </div>

          <button
            className="p-3 rounded-2xl border border-slate-200"
            onClick={() => setIsFiltersOpen(true)}
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal size={20} className="text-[#0B1F60]" />
          </button>
        </div>

        <div>
          <label className="sr-only" htmlFor="search-parking">Buscar parqueo</label>
          <div className="relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-parking"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchTerm.trim()) {
                  addSearch(searchTerm.trim());
                  analytics.track('search', { query: searchTerm.trim() });
                }
              }}
              placeholder="Buscar por zona: mall, centro, kennedy..."
              className="w-full rounded-2xl border-2 border-[#E0E6FF] bg-white px-12 py-3 text-sm font-medium text-[#0B1F60] focus:border-[#0B1F60] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </div>

          {/* Zonas sugeridas - mostrar cuando no hay búsqueda */}
          {!searchTerm && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Navigation size={12} />
                Explora por zona:
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Botón especial para Eventos */}
                {/* Botón especial para Eventos */}
                <button
                  onClick={() => navigate('/events')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 border border-rose-300 rounded-full text-xs text-white font-bold shadow-sm animate-pulse"
                >
                  <span>🎉</span>
                  <span>Zona Eventos</span>
                </button>
                {SEARCH_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setSearchTerm(zone.keywords[0]);
                      analytics.track('zone_select', { zone: zone.name });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 border border-slate-200 hover:border-blue-300 rounded-full text-xs text-slate-700 hover:text-blue-700 transition-all"
                  >
                    <span>{zone.icon}</span>
                    <span>{zone.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Historial de búsquedas */}
          {history.length > 0 && !searchTerm && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              {history.map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchTerm(term)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors"
                >
                  {term}
                </button>
              ))}
              <button
                onClick={clearHistory}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Limpiar historial"
              >
                <X size={14} className="text-slate-400" />
              </button>
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500">
            Mostrando {visibleParkings.length} parqueos disponibles
          </p>

          {/* Warning Banner de Tarifa Dinámica para Eventos */}
          {activeEvent && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3 shadow-sm animate-fade-in">
              <div className="bg-amber-100 p-2 rounded-full shrink-0">
                <Clock size={16} className="text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Tarifa ajustada por evento</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Los parqueos dentro del radio de <strong>{activeEvent.radiusKm * 1000}m</strong> del evento tienen tarifa especial hasta las <strong>{activeEvent.endTime}</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-[320px] rounded-3xl bg-slate-200/50 animate-pulse" />
            <div className="rounded-3xl bg-white p-5 shadow-lg space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          </div>
        ) : showEmptyState ? (
          <div className="rounded-3xl bg-white p-8 text-center text-[#0B1F60] space-y-5 shadow-lg">
            <div className="flex justify-center">
              <MapPinOff size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold">No hay parqueos disponibles</h3>
            <p className="text-sm text-slate-500">
              No encontramos parqueos con los filtros seleccionados. Puedes expandir tu búsqueda o recibir una notificación cuando haya disponibilidad.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleExpandRadius}
                className="w-full rounded-full bg-[#0B1F60] text-white font-semibold px-6 py-3 flex items-center justify-center gap-2"
              >
                <MapPin size={18} />
                Expandir búsqueda a 1km
              </button>
              <button
                onClick={() => {
                  resetFiltros();
                  setSearchTerm('');
                }}
                className="w-full rounded-full border-2 border-[#0B1F60] text-[#0B1F60] font-semibold px-6 py-3"
              >
                Limpiar filtros
              </button>
              <button
                onClick={handleNotifyMe}
                className="w-full rounded-full bg-amber-500 text-white font-semibold px-6 py-3 flex items-center justify-center gap-2"
              >
                <Bell size={18} />
                Notificarme cuando haya espacio
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4" ref={mapContainerRef}>
              <MapView
                parkings={visibleParkings}
                userLat={usuario.lat}
                userLng={usuario.lng}
                highlightedId={hoveredId}
                updatedIds={lastUpdatedIds}
                suggestionPoint={suggestionCoords}
                onMapLongPress={handleLongPress}
                onLiveUpdate={handleLiveUpdate}
                flyToCoords={mapFlyTo}
                selectedId={selectedParkingId}
                height={400}
                activeEvent={activeEvent}
              />

              <div className="flex items-center justify-between text-xs text-[#0B1F60]">
                <span>Resultados según filtros activos</span>
                {isUpdating && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-3 py-1 font-semibold">
                    <Loader2 size={14} className="animate-spin" />
                    ACTUALIZANDO...
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-[#0B1F60]">Ordenar por</h2>
                <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1">
                  {[
                    { label: 'Más cerca', value: 'distance' },
                    { label: 'Más barato', value: 'price' },
                    { label: 'Mejor calificado', value: 'rating' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`px-4 py-2 text-xs font-semibold rounded-full transition ${sortMode === option.value
                        ? 'bg-white text-[#0B1F60] shadow'
                        : 'text-slate-500'
                        }`}
                      onClick={() => setSortMode(option.value as SortMode)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {visibleParkings.map((parking) => (
                  <div
                    key={parking.id}
                    onMouseEnter={() => setHoveredId(parking.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <ParkingCard
                      parking={parking}
                      onClick={() => navigate(`/parqueo/${parking.id}`)}
                      onLocateClick={() => handleLocateParking(parking.id, parking.lat, parking.lng)}

                      priceInfo={parking.pricingResult}
                      showSocialProof={!!(activeEvent && parking.pricingResult?.isSurge)}
                      onReserveClick={() => navigate(`/reservar/${parking.id}`)}
                    />

                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSubmitted(false);
        }}
        title="Sugerir nuevo parqueo"
      >
        {submitted ? (
          <div className="text-center text-[#0B1F60] space-y-4">
            <p className="text-lg font-semibold">¡Gracias!</p>
            <p className="text-sm text-slate-500">Revisaremos tu sugerencia pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSuggestionSubmit} className="space-y-4 text-[#0B1F60]">
            {suggestionCoords && (
              <div className="rounded-2xl bg-[#F4F6FF] p-4 text-sm">
                <p className="font-semibold">Coordenadas seleccionadas</p>
                <p className="text-slate-500">
                  {suggestionCoords.lat.toFixed(4)}, {suggestionCoords.lng.toFixed(4)}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Nombre del lugar</label>
              <input
                type="text"
                value={suggestionForm.nombre}
                onChange={(e) => setSuggestionForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
                className="mt-1 w-full border-2 border-[#E0E6FF] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#0B1F60]"
                placeholder="Ej: Garaje Las Lomas"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Comentario (opcional)</label>
              <textarea
                value={suggestionForm.comentario}
                onChange={(e) => setSuggestionForm((prev) => ({ ...prev, comentario: e.target.value }))}
                rows={3}
                className="mt-1 w-full border-2 border-[#E0E6FF] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#0B1F60] resize-none"
                placeholder="Servicios, referencias, horarios..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#0B1F60] text-white font-semibold py-3"
            >
              Enviar sugerencia
            </button>
          </form>
        )}
      </Modal>

      {
        isFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsFiltersOpen(false)}
            />
            <div className="relative w-full bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto z-50 pb-safe">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0B1F60]">Filtros avanzados</h3>
                <button
                  className="text-sm font-semibold text-[#5A63F2]"
                  onClick={() => setIsFiltersOpen(false)}
                >
                  Cerrar
                </button>
              </div>
              <FilterBar
                showApplyButton
                onApply={() => setIsFiltersOpen(false)}
              />
            </div>
          </div>
        )
      }

      {/* Modal de ubicación GPS */}
      <Modal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        title="Necesitamos tu ubicación"
      >
        <div className="space-y-4">
          {locationDenied ? (
            <>
              <p className="text-sm text-slate-600">
                Has denegado el acceso a tu ubicación. Puedes buscar manualmente o permitir el acceso desde la configuración de tu navegador.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Ingresa una dirección o zona..."
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-[#0B1F60] focus:outline-none"
                />
                <Button
                  onClick={handleManualSearch}
                  className="w-full"
                  disabled={!manualAddress.trim()}
                >
                  Buscar en esta zona
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Para mostrarte los parqueos más cercanos, necesitamos acceder a tu ubicación GPS.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleRequestLocation} className="w-full">
                  <MapPin size={18} className="mr-2" />
                  Permitir ubicación
                </Button>
                <button
                  onClick={() => setLocationDenied(true)}
                  className="w-full rounded-full border-2 border-slate-300 text-slate-600 font-semibold px-6 py-3"
                >
                  Buscar manualmente
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {
        toastMessage && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0B1F60] text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg animate-slide-up z-50">
            {toastMessage}
          </div>
        )
      }
    </Layout >
  );
}
