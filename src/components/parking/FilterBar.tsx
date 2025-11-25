import React from 'react';
import { useParkingContext } from '../../context/ParkingContext';

interface FilterBarProps {
  onApply?: () => void;
  showApplyButton?: boolean;
}

export function FilterBar({ onApply, showApplyButton }: FilterBarProps) {
  const { filtros, setFiltros } = useParkingContext();

  const handleTipoVehiculoChange = (tipo: 'Auto' | 'Moto') => {
    if (filtros.tipoVehiculo === tipo) return;
    const newFiltros = { ...filtros, tipoVehiculo: tipo };
    setFiltros(newFiltros);
  };

  const handleVerificadosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, soloVerificados: e.target.checked };
    setFiltros(newFiltros);
  };

  const handleDistanciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, distancia: Number(e.target.value) };
    setFiltros(newFiltros);
  };

  const handlePMRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, accesiblePMR: e.target.checked };
    setFiltros(newFiltros);
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiltros = { ...filtros, precioMax: Number(e.target.value) };
    setFiltros(newFiltros);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4 border border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Tipo de vehículo</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Auto', icon: '🚗' },
            { label: 'Moto', icon: '🏍️' },
          ].map(option => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleTipoVehiculoChange(option.label as 'Auto' | 'Moto')}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                filtros.tipoVehiculo === option.label
                  ? 'border-[#0B1F60] bg-[#0B1F60] text-white'
                  : 'border-gray-200 text-[#0B1F60]'
              }`}
            >
              <span className="text-lg" aria-hidden>
                {option.icon}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

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
      {showApplyButton && (
        <button
          type="button"
          onClick={onApply}
          className="w-full rounded-2xl bg-[#0B1F60] text-white font-semibold py-3"
        >
          Guardar cambios
        </button>
      )}
    </div>
  );
}
