export interface ValidatedZone {
  id: string;
  name: string;
  bounds: [number, number][];
  color: string;
  parkingCount: number;
}

export const VALIDATED_ZONES: ValidatedZone[] = [
  {
    id: 'urdesa',
    name: 'Urdesa',
    bounds: [
      [-2.1650, -79.9200],
      [-2.1650, -79.8900],
      [-2.1950, -79.8900],
      [-2.1950, -79.9200]
    ],
    color: '#5A63F2',
    parkingCount: 15
  },
  {
    id: 'kennedy',
    name: 'Kennedy',
    bounds: [
      [-2.1400, -79.9100],
      [-2.1400, -79.8800],
      [-2.1650, -79.8800],
      [-2.1650, -79.9100]
    ],
    color: '#8b5cf6',
    parkingCount: 10
  },
  {
    id: 'alborada-samanes',
    name: 'Alborada / Samanes',
    bounds: [
      [-2.1200, -79.9250],
      [-2.1200, -79.9000],
      [-2.1450, -79.9000],
      [-2.1450, -79.9250]
    ],
    color: '#ec4899',
    parkingCount: 6
  },
  {
    id: 'ceibos-lagos',
    name: 'Ceibos / Plaza Lagos',
    bounds: [
      [-2.1550, -79.9250],
      [-2.1550, -79.9100],
      [-2.1700, -79.9100],
      [-2.1700, -79.9250]
    ],
    color: '#06b6d4',
    parkingCount: 4
  },
  {
    id: 'puerto-santa-ana',
    name: 'Puerto Santa Ana',
    bounds: [
      [-2.1850, -79.8900],
      [-2.1850, -79.8700],
      [-2.2050, -79.8700],
      [-2.2050, -79.8900]
    ],
    color: '#10b981',
    parkingCount: 8
  },
  {
    id: 'malecon-2000',
    name: 'Malecón 2000 / Centro',
    bounds: [
      [-2.1900, -79.8950],
      [-2.1900, -79.8750],
      [-2.2150, -79.8750],
      [-2.2150, -79.8950]
    ],
    color: '#f59e0b',
    parkingCount: 6
  }
];
