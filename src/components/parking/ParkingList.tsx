import { IParking } from '../../types/index';
import { ParkingCard } from './ParkingCard';
import { useNavigate } from 'react-router-dom';

interface ParkingListProps {
  parkings: IParking[];
}

export function ParkingList({ parkings }: ParkingListProps) {
  const navigate = useNavigate();

  if (parkings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron parqueos con estos filtros</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parkings.map(parking => (
        <ParkingCard
          key={parking.id}
          parking={parking}
          onClick={() => navigate(`/parqueo/${parking.id}`)}
        />
      ))}
    </div>
  );
}
