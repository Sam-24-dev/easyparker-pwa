import { useParkingContext } from '../context/ParkingContext';
import { IParking } from '../types/index';
import { useDistance } from './useDistance';
import { matchesParkingSearch } from '../data/searchZones';

export function useParkings(searchTerm: string = '') {
  const { parkings, filtros, usuario } = useParkingContext();
  const { calculateDistance } = useDistance();

  // Calcular distancia REAL para cada parqueo basada en ubicación del usuario
  // También filtrar garajes pausados (isActive === false)
  const parkingsWithDistance = parkings
    .filter(p => p.isActive !== false) // Solo mostrar garajes activos
    .map(p => ({
      ...p,
      distancia: calculateDistance(usuario.lat, usuario.lng, p.lat, p.lng)
    }));

  const getFilteredParkings = (): IParking[] => {
    let filtered = parkingsWithDistance;

    // 1. Búsqueda por texto (Nombre o Zona)
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => matchesParkingSearch(p, searchTerm));
    }

    // 2. Tipo de Vehículo
    filtered = filtered.filter(p => p.vehiculosPermitidos.includes(filtros.tipoVehiculo));

    // 3. Precio Máximo
    filtered = filtered.filter(p => p.precio <= filtros.precioMax);

    // 4. Distancia
    filtered = filtered.filter(p => p.distancia <= filtros.distancia);

    // 5. Solo Verificados
    if (filtros.soloVerificados) {
      filtered = filtered.filter(p => p.verificado);
    }

    // 6. Accesible PMR
    if (filtros.accesiblePMR) {
      filtered = filtered.filter(p => p.accesiblePMR);
    }

    return filtered;
  };

  const getSortedParkings = (parkingsToSort: IParking[]): IParking[] => {
    return [...parkingsToSort].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.verificado) scoreA += 100;
      if (b.verificado) scoreB += 100;

      scoreA += a.plazasLibres;
      scoreB += b.plazasLibres;

      // Usar la distancia real calculada
      scoreA -= a.distancia / 10;
      scoreB -= b.distancia / 10;

      return scoreB - scoreA;
    });
  };

  const filtered = getFilteredParkings();
  const sorted = getSortedParkings(filtered);

  return {
    parkings: sorted,
    totalParkings: parkingsWithDistance,
    totalAvailable: parkingsWithDistance.reduce((sum, p) => sum + p.plazasLibres, 0),
  };
}
