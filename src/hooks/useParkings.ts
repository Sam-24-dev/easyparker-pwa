import { useParkingContext } from '../context/ParkingContext';
import { IParking } from '../types/index';
import { useDistance } from './useDistance';

export function useParkings() {
  const { parkings, filtros, usuario } = useParkingContext();
  const { calculateDistance } = useDistance();

  const getFilteredParkings = (): IParking[] => {
    let filtered = parkings;

    filtered = filtered.filter(p => p.vehiculosPermitidos.includes(filtros.tipoVehiculo));

    if (filtros.soloVerificados) {
      filtered = filtered.filter(p => p.verificado);
    }

    if (filtros.accesiblePMR) {
      filtered = filtered.filter(p => p.accesiblePMR);
    }

    filtered = filtered.filter(p => p.precio <= filtros.precioMax);

    filtered = filtered.filter(p => {
      const dist = calculateDistance(usuario.lat, usuario.lng, p.lat, p.lng);
      return dist <= filtros.distancia;
    });

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

      scoreA -= a.distancia / 10;
      scoreB -= b.distancia / 10;

      return scoreB - scoreA;
    });
  };

  const filtered = getFilteredParkings();
  const sorted = getSortedParkings(filtered);

  return {
    parkings: sorted,
    totalParkings: parkings,
    totalAvailable: parkings.reduce((sum, p) => sum + p.plazasLibres, 0),
  };
}
