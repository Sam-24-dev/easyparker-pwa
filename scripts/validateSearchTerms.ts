import { parkings } from '../src/data/parkings.ts';
import { SEARCH_ZONES, matchesParkingSearch } from '../src/data/searchZones.ts';

interface ZoneValidationResult {
  id: string;
  term: string;
  totalMatches: number;
  invalidIds: number[];
}

const results: ZoneValidationResult[] = [];

for (const zone of SEARCH_ZONES) {
  const term = zone.keywords[0];
  const matches = parkings.filter((parking) => matchesParkingSearch(parking, term));

  const invalid = zone.zonaIds && zone.zonaIds.length > 0
    ? matches.filter((parking) => !parking.zonaId || !zone.zonaIds!.includes(parking.zonaId))
    : [];

  results.push({
    id: zone.id,
    term,
    totalMatches: matches.length,
    invalidIds: invalid.map((parking) => parking.id),
  });
}

const zonesWithIssues = results.filter((result) => result.invalidIds.length > 0);

if (zonesWithIssues.length > 0) {
  console.error('Se encontraron coincidencias fuera de la zona esperada:');
  console.table(zonesWithIssues);
  process.exitCode = 1;
} else {
  console.log('Validación de zonas exitosa. Resumen:');
  console.table(results.map(({ id, term, totalMatches }) => ({ id, term, totalMatches })));
}
