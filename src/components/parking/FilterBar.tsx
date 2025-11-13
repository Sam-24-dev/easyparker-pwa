import React from 'react';
import { IFiltros } from '../../types/index';
import { useParkingContext } from '../../context/ParkingContext';

interface FilterBarProps {
  onFiltersChange?: () => void;
}

export function FilterBar({ onFiltersChange }: FilterBarProps) {
  const { filtros, setFiltros } = useParkingContext();

  const handleVerificadosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, soloVerificados: e.target.checked };
    setFiltros(newFiltros);
    onFiltersChange?.();
  };

  const handleDistanciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, distancia: Number(e.target.value) };
    setFiltros(newFiltros);
    onFiltersChange?.();
  };

  const handlePMRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, accesiblePMR: e.target.checked };
    setFiltros(newFiltros);
    onFiltersChange?.();
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, precioMax: Number(e.target.value) };
    setFiltros(newFiltros);
    onFiltersChange?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4 border border-gray-100">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="verificados"
          checked={filtros.soloVerificados}
          onChange={handleVerificadosChange}
          className="w-5 h-5 text-primary rounded cursor-pointer"
        />
        <label htmlFor="verificados" className="text-sm font-medium text-gray-700 cursor-pointer">
          Solo verificados
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Distancia: {filtros.distancia}m
        </label>
        <input
          type="range"
          min="0"
          max="1000"
          value={filtros.distancia}
          onChange={handleDistanciaChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Precio máximo: ${filtros.precioMax.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.25"
          value={filtros.precioMax}
          onChange={handlePrecioChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="pmr"
          checked={filtros.accesiblePMR}
          onChange={handlePMRChange}
          className="w-5 h-5 text-primary rounded cursor-pointer"
        />
        <label htmlFor="pmr" className="text-sm font-medium text-gray-700 cursor-pointer">
          Accesible PMR
        </label>
      </div>
    </div>
  );
}
