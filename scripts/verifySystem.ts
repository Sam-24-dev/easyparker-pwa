#!/usr/bin/env node
import { parkings } from '../src/data/parkings.ts';
import { SEARCH_ZONES } from '../src/data/searchZones.ts';
import { VALIDATED_ZONES } from '../src/data/validatedZones.ts';

interface Issue {
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
}

const issues: Issue[] = [];

const GUAYAQUIL_BOUNDS = {
  minLat: -2.30,
  maxLat: -2.00,
  minLng: -80.05,
  maxLng: -79.80,
};

const CENTRO_REF = { lat: -2.195, lng: -79.885 };
const CENTRO_RADIUS_KM = 2;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1) Coordenadas dentro de límites
for (const p of parkings) {
  if (
    p.lat < GUAYAQUIL_BOUNDS.minLat ||
    p.lat > GUAYAQUIL_BOUNDS.maxLat ||
    p.lng < GUAYAQUIL_BOUNDS.minLng ||
    p.lng > GUAYAQUIL_BOUNDS.maxLng
  ) {
    issues.push({ level: 'ERROR', message: `ID ${p.id} ${p.nombre}: coordenadas fuera de Guayaquil (${p.lat}, ${p.lng})` });
  }
}

// 2) Centro histórico: zonaId centro a más de 2 km
for (const p of parkings.filter((x) => x.zonaId === 'centro')) {
  const dist = haversineKm(p.lat, p.lng, CENTRO_REF.lat, CENTRO_REF.lng);
  if (dist > CENTRO_RADIUS_KM) {
    issues.push({ level: 'WARN', message: `ID ${p.id} ${p.nombre}: ${dist.toFixed(2)} km del centro histórico (>2 km)` });
  }
}

// 3) Precios: comercial no puede ser 0
for (const p of parkings.filter((x) => x.tipo === 'comercial')) {
  if (p.precio <= 0) {
    issues.push({ level: 'ERROR', message: `ID ${p.id} ${p.nombre}: precio ${p.precio} inválido para comercial` });
  }
}

// 4) searchZones: parkingIds existen y coinciden zonaId
const parkingById = new Map(parkings.map((p) => [p.id, p]));
for (const zone of SEARCH_ZONES) {
  for (const id of zone.parkingIds) {
    const p = parkingById.get(id);
    if (!p) {
      issues.push({ level: 'ERROR', message: `Zona ${zone.id}: parkingId ${id} no existe en parkings.ts` });
      continue;
    }
    if (zone.zonaIds && zone.zonaIds.length > 0) {
      const allowed = new Set([...(zone.zonaIds ?? []), ...(zone.adjacentZonaIds ?? [])]);
      if (p.zonaId && !allowed.has(p.zonaId)) {
        issues.push({
          level: 'ERROR',
          message: `Zona ${zone.id}: parkingId ${id} tiene zonaId ${p.zonaId} no permitida (permitido: ${Array.from(allowed).join(',')})`,
        });
      }
    }
  }
}

// 5) validatedZones: parkingCount real y que existan zonas válidas
const countsByZona: Record<string, number> = {};
for (const p of parkings) {
  if (p.zonaId) {
    countsByZona[p.zonaId] = (countsByZona[p.zonaId] ?? 0) + 1;
  }
}
for (const zone of VALIDATED_ZONES) {
  const realCount = countsByZona[zone.id] ?? 0;
  if (zone.parkingCount !== realCount) {
    issues.push({ level: 'WARN', message: `validatedZones ${zone.id}: parkingCount ${zone.parkingCount} debería ser ${realCount}` });
  }
}

// 6) Reporte
const errors = issues.filter((i) => i.level === 'ERROR');
const warns = issues.filter((i) => i.level === 'WARN');

const header = '════ VALIDACIÓN DEL SISTEMA DE PARQUEOS ════';
console.log(header);
console.log(`Total errores: ${errors.length} | advertencias: ${warns.length}\n`);

if (errors.length) {
  console.log('❌ ERRORES:');
  errors.forEach((e) => console.log(` - ${e.message}`));
  console.log('');
}

if (warns.length) {
  console.log('⚠️  ADVERTENCIAS:');
  warns.forEach((w) => console.log(` - ${w.message}`));
  console.log('');
}

if (!issues.length) {
  console.log('✅ Sin problemas detectados.');
}
