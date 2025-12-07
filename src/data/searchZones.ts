import type { IParking } from '../types';

const MIN_TOKEN_LENGTH = 3;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .toLowerCase()
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter(Boolean);
}

function createKeywordMatcher(term: string) {
  const normalizedTerm = normalizeText(term);
  const termTokens = tokenize(term);

  return (keyword: string): boolean => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword || !normalizedTerm) return false;

    if (normalizedTerm.includes(normalizedKeyword)) {
      return true;
    }

    if (
      normalizedKeyword.startsWith(normalizedTerm) &&
      normalizedTerm.length >= MIN_TOKEN_LENGTH
    ) {
      return true;
    }

    const keywordTokens = tokenize(keyword);
    return termTokens.some((token) => {
      if (token.length < MIN_TOKEN_LENGTH) return false;
      return keywordTokens.some(
        (kToken) =>
          kToken === token ||
          kToken.startsWith(token) ||
          token.startsWith(kToken)
      );
    });
  };
}

// Zonas de búsqueda para agrupar parqueos por sector
// Keywords basadas en los 35 parqueos de parkings.ts
export interface SearchZone {
  id: string;
  name: string;
  keywords: string[]; // Palabras clave que coinciden con nombres de parqueos
  parkingIds: number[]; // IDs de parqueos en esta zona
  zonaIds?: string[]; // zonaId (definido en getZone) que debe coincidir para búsquedas estrictas
  adjacentZonaIds?: string[]; // zonas toleradas en los bordes
  icon: string;
}

export const SEARCH_ZONES: SearchZone[] = [
  // =====================================================
  // ZONAS GEOGRÁFICAS (filtran por zonaId de parkings.ts)
  // =====================================================
  {
    id: 'urdesa',
    name: 'Urdesa',
    keywords: ['urdesa', 'panchita', 'iguanas', 'victor emilio', 'estrada', 'miraflores', 'circunvalacion', 'don bosco', 'paraiso', 'express'],
    parkingIds: [1, 4, 5, 7, 8, 12, 19, 26, 31], // zonaId: 'urdesa'
    zonaIds: ['urdesa'],
    icon: '🏘️'
  },
  {
    id: 'kennedy',
    name: 'Kennedy',
    keywords: ['kennedy', 'cedros', 'hospital', 'clinica', 'san marino', 'policentro', 'plaza quil', 'catolica', 'universidad', 'supermaxi'],
    parkingIds: [3, 6, 10, 11, 13, 14, 17, 25, 32], // zonaId: 'kennedy'
    zonaIds: ['kennedy'],
    icon: '🏥'
  },
  {
    id: 'centro',
    name: 'Centro / Malecón',
    keywords: ['centro', 'malecon', 'boyaca', 'chile', 'quisquis', 'historico', 'mascote'],
    parkingIds: [15, 22, 28, 35], // zonaId: 'centro'
    zonaIds: ['centro'],
    icon: '🏛️'
  },
  {
    id: 'norte',
    name: 'Norte (Alborada/Samanes)',
    keywords: ['alborada', 'samanes', 'garzota', 'norte', 'alamos'],
    parkingIds: [21, 24, 33], // zonaId: 'alborada-samanes'
    zonaIds: ['alborada-samanes'],
    icon: '🏙️'
  },
  {
    id: 'aeropuerto',
    name: 'Aeropuerto / Terminal',
    keywords: ['aeropuerto', 'terminal', 'terrestre', 'jjo'],
    parkingIds: [18, 20], // zonaId: 'aeropuerto-terminal'
    zonaIds: ['aeropuerto-terminal'],
    icon: '✈️'
  },
  {
    id: 'ceibos',
    name: 'Ceibos',
    keywords: ['ceibos', 'santa cecilia'],
    parkingIds: [16, 29], // zonaId: 'ceibos'
    zonaIds: ['ceibos'],
    icon: '🌳'
  },
  {
    id: 'samborondon',
    name: 'Vía Samborondón',
    keywords: ['samborondon', 'entre rios', 'plaza lagos', 'riocentro'],
    parkingIds: [23, 34], // zonaId: 'samborondon'
    zonaIds: ['samborondon'],
    icon: '🌉'
  },
  {
    id: 'sur',
    name: 'Sur de Guayaquil',
    keywords: ['sur'],
    parkingIds: [27], // zonaId: 'sur'
    zonaIds: ['sur'],
    icon: '🏢'
  },
  {
    id: 'via-costa',
    name: 'Vía a la Costa',
    keywords: ['via costa', 'estadio', 'monumental', 'barcelona'],
    parkingIds: [30], // zonaId: 'via-costa'
    zonaIds: ['via-costa'],
    icon: '⚽'
  },

  // =====================================================
  // FILTROS POR TIPO (basados en tipo de parkings.ts)
  // =====================================================
  {
    id: 'malls',
    name: 'Malls / Centros Comerciales',
    // Todos los parqueos con tipo: 'comercial' que son centros comerciales
    keywords: [
      'malls',
      'mall',
      'centros comerciales',
      'comerciales',
      'policentro',
      'riocentro',
      'mall del sol',
      'city mall',
      'mall del sur',
      'san marino',
      'plaza lagos'
    ],
    parkingIds: [2, 9, 11, 23, 27, 32, 34], // Malls y CC en cualquier zona
    icon: '🛍️'
  },
  {
    id: 'garajes',
    name: 'Garajes Privados',
    // Todos los parqueos con tipo: 'garage_privado'
    keywords: ['garaje', 'privado', 'garage'],
    parkingIds: [1, 5, 8, 12, 16, 19, 21, 24, 26, 29, 31, 33], // tipo: garage_privado
    icon: '🚗'
  }
];

// Función para obtener el nombre de zona basado en el término de búsqueda
function findSearchZone(searchTerm: string): SearchZone | null {
  if (!searchTerm.trim()) return null;
  const matcher = createKeywordMatcher(searchTerm);

  for (const zone of SEARCH_ZONES) {
    if (zone.keywords.some((keyword) => matcher(keyword))) {
      return zone;
    }
  }

  return null;
}

export function getZoneNameFromSearch(searchTerm: string): string {
  if (!searchTerm.trim()) return 'Guayaquil';
  const zone = findSearchZone(searchTerm);
  return zone?.name ?? searchTerm;
}

// Función para filtrar parqueos por zona/término - usa zonaId prioritariamente
export function matchesParkingSearch(parking: IParking, searchTerm: string): boolean {
  const normalizedName = normalizeText(parking.nombre);
  const normalizedTerm = normalizeText(searchTerm);
  
  if (!normalizedTerm) return true;

  const zone = findSearchZone(searchTerm);
  
  // Si se detecta una zona, aplicamos lógica estricta de zona
  if (zone) {
    // 1. Prioridad absoluta: Si el parqueo está explícitamente en la lista de la zona
    if (zone.parkingIds.includes(parking.id)) {
      return true;
    }

    const allowedZonaIds = new Set([
      ...(zone.zonaIds ?? []),
      ...(zone.adjacentZonaIds ?? [])
    ]);

    // 2. Si la zona tiene restricciones geográficas (zonaIds), las aplicamos estrictamente
    if (allowedZonaIds.size > 0) {
      if (parking.zonaId && allowedZonaIds.has(parking.zonaId)) {
        return true;
      }
      // Si tiene zonaId pero no coincide, y no estaba en parkingIds, es un rechazo.
      return false;
    }

    // 3. Si la zona NO tiene restricciones geográficas (ej. "Malls" o "Garajes"),
    // permitimos coincidencia por keywords de la zona en el nombre del parqueo
    const normalizedKeywords = zone.keywords.map((keyword) => normalizeText(keyword));
    return normalizedKeywords.some((keyword) => keyword && normalizedName.includes(keyword));
  }

  // Si NO se detecta zona, búsqueda simple por nombre
  return normalizedName.includes(normalizedTerm);
}

// Función para obtener IDs de parqueos por zona
export function getParkingIdsByZone(zoneId: string): number[] {
  const zone = SEARCH_ZONES.find(z => z.id === zoneId);
  return zone?.parkingIds || [];
}
