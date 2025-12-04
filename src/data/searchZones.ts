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
  // ZONAS GEOGRÁFICAS (con zonaIds estrictos)
  {
    id: 'urdesa',
    name: 'Urdesa',
    // Solo parqueos con zonaId: 'urdesa'
    keywords: ['urdesa', 'panchita', 'iguanas', 'victor emilio', 'estrada', 'miraflores', 'don bosco', 'alamos', 'paraiso', 'santa cecilia', 'circunvalacion'],
    parkingIds: [1, 4, 5, 7, 8, 12, 19, 24, 26, 29, 31],
    zonaIds: ['urdesa'],
    icon: '🏘️'
  },
  {
    id: 'kennedy',
    name: 'Kennedy',
    // Solo parqueos con zonaId: 'kennedy' (hospitales, clínicas)
    keywords: ['kennedy', 'cedros', 'hospital', 'clinica', 'supermaxi kennedy', 'catolica', 'universidad'],
    parkingIds: [3, 6, 13, 14, 25],
    zonaIds: ['kennedy'],
    icon: '🏥'
  },
  {
    id: 'centro',
    name: 'Centro / Malecón',
    // Solo parqueos con zonaId: 'centro'
    keywords: ['centro', 'malecon', 'boyaca', 'chile', 'quisquis', 'historico', 'mascote', 'san marino'],
    parkingIds: [10, 15, 22, 28, 32, 35],
    zonaIds: ['centro'],
    icon: '🏛️'
  },
  {
    id: 'norte',
    name: 'Norte (Alborada/Samanes)',
    // Solo parqueos con zonaId: 'alborada-samanes'
    keywords: ['alborada', 'samanes', 'garzota', 'norte'],
    parkingIds: [11, 21, 33],
    zonaIds: ['alborada-samanes'],
    icon: '🏙️'
  },
  {
    id: 'aeropuerto',
    name: 'Aeropuerto / Terminal',
    // Solo parqueos con zonaId: 'aeropuerto-terminal'
    keywords: ['aeropuerto', 'terminal', 'terrestre', 'jjo'],
    parkingIds: [18, 20],
    zonaIds: ['aeropuerto-terminal'],
    icon: '✈️'
  },
  {
    id: 'ceibos',
    name: 'Ceibos',
    // Solo parqueos con zonaId: 'ceibos' (NO incluye Samborondón)
    keywords: ['ceibos'],
    parkingIds: [16],
    zonaIds: ['ceibos'],
    icon: '🌳'
  },
  {
    id: 'samborondon',
    name: 'Vía Samborondón',
    // Solo parqueos con zonaId: 'samborondon' (cruzando el puente)
    keywords: ['samborondon', 'entre rios', 'plaza lagos', 'riocentro'],
    parkingIds: [23, 34],
    zonaIds: ['samborondon'],
    icon: '🌉'
  },
  {
    id: 'sur',
    name: 'Sur de Guayaquil',
    // Solo parqueos con zonaId: 'sur'
    keywords: ['sur', 'plaza quil'],
    parkingIds: [17, 27],
    zonaIds: ['sur'],
    icon: '🏢'
  },
  {
    id: 'via-costa',
    name: 'Vía a la Costa',
    // Solo parqueos con zonaId: 'via-costa'
    keywords: ['via costa', 'estadio', 'monumental', 'barcelona'],
    parkingIds: [30],
    zonaIds: ['via-costa'],
    icon: '⚽'
  },

  // FILTROS POR TIPO (sin zonaIds, usan parkingIds directamente)
  {
    id: 'malls',
    name: 'Centros Comerciales',
    // Todos los centros comerciales (por tipo, no por zona)
    keywords: ['mall', 'centro comercial', 'city mall', 'mall del sol', 'mall del sur', 'policentro', 'riocentro'],
    parkingIds: [2, 9, 11, 23, 27, 32],
    // NO tiene zonaIds - filtra solo por parkingIds
    icon: '🛍️'
  },
  {
    id: 'garajes',
    name: 'Garajes Privados',
    // Todos los garajes privados (por tipo, no por zona)
    keywords: ['garaje', 'privado', 'garage'],
    parkingIds: [1, 5, 8, 10, 12, 16, 19, 21, 24, 26, 29, 31, 33],
    // NO tiene zonaIds - filtra solo por parkingIds y keywords
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
