import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { MapView } from '../components/parking/MapView';
import { ParkingList } from '../components/parking/ParkingList';
import { FilterBar } from '../components/parking/FilterBar';
import { useParkings } from '../hooks/useParkings';
import { useParkingContext } from '../context/ParkingContext';

export function Buscar() {
  const { parkings } = useParkings();
  const { usuario } = useParkingContext();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Buscar Parqueo</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-primary font-medium text-sm"
          >
            {showFilters ? 'Ocultar' : 'Filtros'}
          </button>
        </div>

        {showFilters && (
          <FilterBar onFiltersChange={() => {}} />
        )}

        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 h-64 md:h-96">
          <MapView parkings={parkings} userLat={usuario.lat} userLng={usuario.lng} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {parkings.length} parqueo{parkings.length !== 1 ? 's' : ''} disponible{parkings.length !== 1 ? 's' : ''}
          </h2>
          <ParkingList parkings={parkings} />
        </div>
      </div>
    </Layout>
  );
}
