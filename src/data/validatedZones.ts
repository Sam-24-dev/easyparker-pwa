export interface ValidatedZone {
  id: string;
  name: string;
  bounds: [number, number][];
  color: string;
  parkingCount: number;
}

/**
 * ZONAS VALIDADAS PARA VISUALIZACIÓN EN MAPA
 * ===========================================
 * Los bounds definen polígonos rectangulares [lat, lng] en sentido horario
 * parkingCount se calcula contando parqueos por zonaId en parkings.ts
 * 
 * FRONTERAS AJUSTADAS:
 * - Kennedy: Norte -2.1400, Sur -2.1600 (ajustado para no incluir parqueos de Urdesa)
 * - Urdesa: Norte -2.1600, Sur -2.1950 (ajustado frontera norte)
 */

export const VALIDATED_ZONES: ValidatedZone[] = [
  {
    id: 'urdesa',
    name: 'Urdesa',
    // Frontera norte ajustada a -2.1600 para incluir Circunvalación (-2.1621)
    bounds: [
      [-2.1600, -79.9200],
      [-2.1600, -79.8900],
      [-2.1950, -79.8900],
      [-2.1950, -79.9200]
    ],
    color: '#5A63F2',
    parkingCount: 9 // IDs: 1, 4, 5, 7, 8, 12, 19, 26, 31
  },
  {
    id: 'kennedy',
    name: 'Kennedy',
    // Frontera sur ajustada a -2.1600 para no cubrir parqueos de Urdesa
    bounds: [
      [-2.1400, -79.9100],
      [-2.1400, -79.8800],
      [-2.1600, -79.8800],
      [-2.1600, -79.9100]
    ],
    color: '#8b5cf6',
    parkingCount: 9 // IDs: 3, 6, 10, 11, 13, 14, 17, 25, 32
  },
  {
    id: 'alborada-samanes',
    name: 'Alborada / Samanes',
    bounds: [
      [-2.1200, -79.9250],
      [-2.1200, -79.8900],
      [-2.1450, -79.8900],
      [-2.1450, -79.9250]
    ],
    color: '#ec4899',
    parkingCount: 3 // IDs: 21, 24, 33
  },
  {
    id: 'ceibos',
    name: 'Ceibos',
    // Zona expandida para incluir Santa Cecilia (-2.1450, -79.9400)
    bounds: [
      [-2.1400, -79.9500],
      [-2.1400, -79.9200],
      [-2.1750, -79.9200],
      [-2.1750, -79.9500]
    ],
    color: '#06b6d4',
    parkingCount: 2 // IDs: 16, 29
  },
  {
    id: 'samborondon',
    name: 'Vía Samborondón',
    // Zona separada para Samborondón (cruzando el puente)
    bounds: [
      [-2.1250, -79.8700],
      [-2.1250, -79.8550],
      [-2.1500, -79.8550],
      [-2.1500, -79.8700]
    ],
    color: '#10b981',
    parkingCount: 2 // IDs: 23, 34
  },
  {
    id: 'centro',
    name: 'Centro de la ciudad',
    bounds: [
      [-2.1850, -79.8950],
      [-2.1850, -79.8750],
      [-2.2100, -79.8750],
      [-2.2100, -79.8950]
    ],
    color: '#f59e0b',
    parkingCount: 4 // IDs: 15, 22, 28, 35
  },
  {
    id: 'aeropuerto-terminal',
    name: 'Aeropuerto / Terminal',
    bounds: [
      [-2.1350, -79.8900],
      [-2.1350, -79.8700],
      [-2.1650, -79.8700],
      [-2.1650, -79.8900]
    ],
    color: '#ef4444',
    parkingCount: 2 // IDs: 18, 20
  },
  {
    id: 'sur',
    name: 'Sur de Guayaquil',
    bounds: [
      [-2.2150, -79.9100],
      [-2.2150, -79.8900],
      [-2.2400, -79.8900],
      [-2.2400, -79.9100]
    ],
    color: '#84cc16',
    parkingCount: 1 // ID: 27
  },
  {
    id: 'via-costa',
    name: 'Vía a la Costa',
    bounds: [
      [-2.1750, -79.9350],
      [-2.1750, -79.9150],
      [-2.1950, -79.9150],
      [-2.1950, -79.9350]
    ],
    color: '#f97316',
    parkingCount: 1 // ID: 30
  }
  // NOTA: La zona 'mall' fue eliminada porque sus bounds solapaban con Kennedy.
  // Los malls (IDs 2, 9) siguen disponibles en searchZones.ts para búsquedas.
];
