import React from 'react';
import { Layout } from '../components/layout/Layout';
import { useParkings } from '../hooks/useParkings';
import { MapPin, SlidersHorizontal } from 'lucide-react';

export function Buscar() {
  const { parkings } = useParkings();

  return (
    <Layout showNav>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Buscar un estacionamiento</p>
            <h1 className="text-2xl font-semibold text-[#0B1F60]">Urdesa Central</h1>
          </div>
          <button className="p-3 rounded-2xl border border-slate-200">
            <SlidersHorizontal size={20} className="text-[#0B1F60]" />
          </button>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#0B1F60] to-[#122972] p-6 text-white shadow-lg">
          <p className="text-sm text-white/70">Resultados según ubicación</p>
          <div className="mt-6 space-y-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-3 h-3 bg-white rounded-full" />
                <div className="h-2 w-full bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {parkings.slice(0, 3).map((parking) => (
            <div key={parking.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B1F60]/10 flex items-center justify-center">
                  <MapPin className="text-[#0B1F60]" />
                </div>
                <div>
                  <p className="font-semibold text-[#0B1F60]">{parking.nombre}</p>
                  <p className="text-sm text-slate-500">Tipo: {parking.tipo.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Vehículos: ligeros/moto</span>
                <span className="font-semibold text-[#0B1F60]">{parking.calificacion} ★</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
