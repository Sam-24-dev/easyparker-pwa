import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useParkings } from '../hooks/useParkings';
import { useParkingContext } from '../context/ParkingContext';
import { MapPin, SlidersHorizontal, Star, Search as SearchIcon, Loader2 } from 'lucide-react';
import { MapView } from '../components/parking/MapView';
import { Modal } from '../components/ui/Modal';
import { FilterBar } from '../components/parking/FilterBar';
import { Button } from '../components/ui/Button';

type SortMode = 'distance' | 'price' | 'rating';

export function Buscar() {
  const navigate = useNavigate();
  const { parkings } = useParkings();
  const { usuario, resetFiltros } = useParkingContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('distance');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestionCoords, setSuggestionCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestionForm, setSuggestionForm] = useState({ nombre: '', comentario: '' });
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdatedIds, setLastUpdatedIds] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
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
    const filtered = parkings
      .filter((parking) => parking.plazasLibres > 0)
      .filter((parking) => parking.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === 'price') return a.precio - b.precio;
      if (sortMode === 'rating') return b.calificacion - a.calificacion;
      return a.distancia - b.distancia;
    });

    return sorted;
  }, [parkings, searchTerm, sortMode]);

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

  const showEmptyState = !isLoading && visibleParkings.length === 0;

  return (
    <Layout showNav>
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Buscar un estacionamiento</p>
            <h1 className="text-2xl font-semibold text-[#0B1F60]">Urdesa Central</h1>
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
              placeholder="Buscar parqueo por nombre..."
              className="w-full rounded-2xl border-2 border-[#E0E6FF] bg-white px-12 py-3 text-sm font-medium text-[#0B1F60] focus:border-[#0B1F60] focus:outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Mostrando {visibleParkings.length} parqueos disponibles
          </p>
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
          <div className="rounded-3xl bg-white p-8 text-center text-[#0B1F60] space-y-4 shadow-lg">
            <div className="text-5xl">🅿️</div>
            <h3 className="text-xl font-semibold">No hay parqueos disponibles con estos filtros</h3>
            <p className="text-sm text-slate-500">
              Intenta ajustar los filtros o busca por otro nombre.
            </p>
            <button
              onClick={() => {
                resetFiltros();
                setSearchTerm('');
              }}
              className="rounded-full bg-[#0B1F60] text-white font-semibold px-6 py-3"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <MapView
                parkings={visibleParkings}
                userLat={usuario.lat}
                userLng={usuario.lng}
                highlightedId={hoveredId}
                updatedIds={lastUpdatedIds}
                suggestionPoint={suggestionCoords}
                onMapLongPress={handleLongPress}
                onLiveUpdate={handleLiveUpdate}
                height={400}
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
                      className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                        sortMode === option.value
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

              <div className="space-y-3">
                {visibleParkings.map((parking) => (
                  <div
                    key={parking.id}
                    onMouseEnter={() => setHoveredId(parking.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`rounded-2xl border px-4 py-4 flex items-center justify-between gap-3 transition ${
                      hoveredId === parking.id
                        ? 'border-[#0B1F60] bg-[#EEF0FF]'
                        : 'border-slate-100 bg-[#F6F7FF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-inner">
                        <MapPin className="text-[#0B1F60]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0B1F60]">{parking.nombre}</p>
                        <p className="text-xs text-slate-500 capitalize">{parking.tipo.replace('_', ' ')}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span>{parking.distancia} m</span>
                          <span>•</span>
                          <span>${parking.precio}/h</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center justify-end gap-1 text-[#0B1F60] font-semibold">
                        <Star size={14} fill="#0B1F60" className="text-[#0B1F60]" />
                        {parking.calificacion.toFixed(1)}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-white text-[11px] font-semibold ${
                          parking.plazasLibres > 10
                            ? 'bg-emerald-500'
                            : parking.plazasLibres >= 3
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                      >
                        {parking.plazasLibres} plazas
                      </span>
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => navigate(`/reservar/${parking.id}`)}
                        aria-label={`Reservar en ${parking.nombre}`}
                      >
                        Reservar
                      </Button>
                    </div>
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

      {isFiltersOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-[60px] z-40 flex items-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsFiltersOpen(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
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
      )}

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0B1F60] text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg animate-in">
          {toastMessage}
        </div>
      )}
    </Layout>
  );
}
