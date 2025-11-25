import React, { useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useParkings } from '../hooks/useParkings';
import { useParkingContext } from '../context/ParkingContext';
import { MapPin, SlidersHorizontal, Star } from 'lucide-react';
import { MapView } from '../components/parking/MapView';
import { Modal } from '../components/ui/Modal';
import { FilterBar } from '../components/parking/FilterBar';

export function Buscar() {
  const { parkings } = useParkings();
  const { usuario } = useParkingContext();
  const [promptCoords, setPromptCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ nombre: '', comentario: '' });
  const [submitted, setSubmitted] = useState(false);

  const topResults = useMemo(() => parkings.slice(0, 4), [parkings]);

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setPromptCoords(coords);
  };

  const handleSuggestionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setPromptCoords(null);
      setSuggestionForm({ nombre: '', comentario: '' });
      setSubmitted(false);
    }, 1200);
  };

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

        <div className="relative h-80">
          <MapView
            parkings={parkings}
            userLat={usuario.lat}
            userLng={usuario.lng}
            onMapClick={handleMapClick}
          />

          {promptCoords && (
            <div className="absolute bottom-4 inset-x-4 bg-white rounded-2xl shadow-2xl px-4 py-3 flex flex-col gap-2 text-[#0B1F60]">
              <p className="text-sm font-semibold">¿Sugerir este punto como parqueo?</p>
              <p className="text-xs text-slate-500">
                {promptCoords.lat.toFixed(4)}, {promptCoords.lng.toFixed(4)}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="flex-1 py-2 rounded-full border border-slate-200 text-slate-500"
                  onClick={() => setPromptCoords(null)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 py-2 rounded-full bg-[#0B1F60] text-white font-semibold"
                  onClick={() => {
                    setSubmitted(false);
                    setIsModalOpen(true);
                  }}
                >
                  Sugerir
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-[#0B1F60]">Resultados según ubicación</h2>
          <div className="space-y-3">
            {topResults.map((parking) => (
              <div key={parking.id} className="rounded-2xl border border-slate-100 bg-[#F6F7FF] p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                    <MapPin className="text-[#0B1F60]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#0B1F60]">{parking.nombre}</p>
                    <p className="text-xs text-slate-500 capitalize">Tipo: {parking.tipo.replace('_', ' ')}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#0B1F60] text-sm">
                    <Star size={16} fill="#0B1F60" className="text-[#0B1F60]" />
                    {parking.calificacion}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{parking.plazasLibres} plazas disponibles</span>
                  <span>
                    {parking.vehiculosPermitidos.length === 2
                      ? 'Autos y motos'
                      : parking.vehiculosPermitidos[0] === 'Auto'
                        ? 'Solo autos'
                        : 'Solo motos'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
            {promptCoords && (
              <div className="rounded-2xl bg-[#F4F6FF] p-4 text-sm">
                <p className="font-semibold">Coordenadas seleccionadas</p>
                <p className="text-slate-500">
                  {promptCoords.lat.toFixed(4)}, {promptCoords.lng.toFixed(4)}
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
                placeholder="Ej: Mi Comisariato Urdesa"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Comentario</label>
              <textarea
                value={suggestionForm.comentario}
                onChange={(e) => setSuggestionForm((prev) => ({ ...prev, comentario: e.target.value }))}
                rows={3}
                className="mt-1 w-full border-2 border-[#E0E6FF] rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#0B1F60] resize-none"
                placeholder="Escribe por qué debería agregarse"
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
    </Layout>
  );
}
