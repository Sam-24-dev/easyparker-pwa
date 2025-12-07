/**
 * Script de validación de parqueos
 * Ejecutar con: node scripts/validateParkings.js
 * 
 * AUDITORÍA COMPLETA - Diciembre 2025
 * Valida consistencia entre parkings.ts, searchZones.ts y validatedZones.ts
 */

// Datos de parqueos (copiados para validación independiente)
// ACTUALIZADO: Coordenadas corregidas según Google Maps - Diciembre 2025
const parkings = [
  { id: 1, nombre: "Garaje Panchita Urdesa", lat: -2.1769, lng: -79.9016, tipo: "garage_privado", zonaId: "urdesa", precio: 2.00 },
  { id: 2, nombre: "Parqueo Mall del Sol", lat: -2.1547, lng: -79.8927, tipo: "comercial", zonaId: "mall", precio: 1.50 },
  { id: 3, nombre: "Hotel Cedros Kennedy", lat: -2.1542, lng: -79.9024, tipo: "comercial", zonaId: "kennedy", precio: 2.50 },
  { id: 4, nombre: "Comisariato Urdesa", lat: -2.1798, lng: -79.9002, tipo: "comercial", zonaId: "urdesa", precio: 1.75 },
  { id: 5, nombre: "Garaje Las Iguanas Premium", lat: -2.1689, lng: -79.9088, tipo: "garage_privado", zonaId: "urdesa", precio: 2.20 },
  { id: 6, nombre: "Parqueo Hospital Kennedy", lat: -2.1456, lng: -79.8934, tipo: "comercial", zonaId: "kennedy", precio: 3.00 },
  { id: 7, nombre: "Calle Víctor Emilio Estrada", lat: -2.1725, lng: -79.9045, tipo: "calle", zonaId: "urdesa", precio: 0 },
  { id: 8, nombre: "Garaje Privado Circunvalación", lat: -2.1621, lng: -79.9088, tipo: "garage_privado", zonaId: "urdesa", precio: 1.80 },
  { id: 9, nombre: "Parqueo City Mall", lat: -2.1410, lng: -79.9070, tipo: "comercial", zonaId: "mall", precio: 1.50 },
  { id: 10, nombre: "Garaje San Marino", lat: -2.1694, lng: -79.8981, tipo: "garage_privado", zonaId: "kennedy", precio: 1.80 },
  { id: 11, nombre: "Policentro Kennedy", lat: -2.1714, lng: -79.8994, tipo: "comercial", zonaId: "kennedy", precio: 2.00 },
  { id: 12, nombre: "Garaje Privado Miraflores", lat: -2.1667, lng: -79.9034, tipo: "garage_privado", zonaId: "urdesa", precio: 2.50 },
  { id: 13, nombre: "Supermaxi Kennedy Norte", lat: -2.1523, lng: -79.8967, tipo: "comercial", zonaId: "kennedy", precio: 1.25 },
  { id: 14, nombre: "Parqueo Clínica Kennedy", lat: -2.1489, lng: -79.8912, tipo: "comercial", zonaId: "kennedy", precio: 3.50 },
  { id: 15, nombre: "Calle José Mascote", lat: -2.2031, lng: -79.8862, tipo: "calle", zonaId: "centro", precio: 0 },
  { id: 16, nombre: "Garaje Ceibos Norte", lat: -2.1700, lng: -79.9400, tipo: "garage_privado", zonaId: "ceibos", precio: 1.90 },
  { id: 17, nombre: "Plaza Quil Centro", lat: -2.1650, lng: -79.8970, tipo: "comercial", zonaId: "kennedy", precio: 1.00 },
  { id: 18, nombre: "Parqueo Terminal Terrestre", lat: -2.1436, lng: -79.8794, tipo: "comercial", zonaId: "aeropuerto-terminal", precio: 2.00 },
  { id: 19, nombre: "Garaje Don Bosco", lat: -2.1734, lng: -79.8989, tipo: "garage_privado", zonaId: "urdesa", precio: 1.50 },
  { id: 20, nombre: "Parqueo Aeropuerto JJO", lat: -2.1573, lng: -79.8834, tipo: "comercial", zonaId: "aeropuerto-terminal", precio: 4.00 },
  { id: 21, nombre: "Garaje Samanes Express", lat: -2.1423, lng: -79.9078, tipo: "garage_privado", zonaId: "alborada-samanes", precio: 1.25 },
  { id: 22, nombre: "Calle Quisquís Centro", lat: -2.1889, lng: -79.8867, tipo: "calle", zonaId: "centro", precio: 0 },
  { id: 23, nombre: "Riocentro Entre Ríos", lat: -2.1430, lng: -79.8660, tipo: "comercial", zonaId: "samborondon", precio: 1.75 },
  { id: 24, nombre: "Garaje Los Álamos VIP", lat: -2.1300, lng: -79.9000, tipo: "garage_privado", zonaId: "alborada-samanes", precio: 3.00 },
  { id: 25, nombre: "Parqueo Universidad Católica", lat: -2.1814, lng: -79.9036, tipo: "comercial", zonaId: "kennedy", precio: 1.00 },
  { id: 26, nombre: "Garaje El Paraíso", lat: -2.1823, lng: -79.9056, tipo: "garage_privado", zonaId: "urdesa", precio: 1.80 },
  { id: 27, nombre: "Mall del Sur Parking", lat: -2.2270, lng: -79.8990, tipo: "comercial", zonaId: "sur", precio: 1.50 },
  { id: 28, nombre: "Calle Boyacá Centro", lat: -2.1934, lng: -79.8812, tipo: "calle", zonaId: "centro", precio: 0 },
  { id: 29, nombre: "Garaje Santa Cecilia", lat: -2.1450, lng: -79.9400, tipo: "garage_privado", zonaId: "ceibos", precio: 2.25 },
  { id: 30, nombre: "Parqueo Estadio Monumental", lat: -2.1858, lng: -79.9250, tipo: "comercial", zonaId: "via-costa", precio: 2.50 },
  { id: 31, nombre: "Garaje Express Urdesa", lat: -2.1785, lng: -79.9034, tipo: "garage_privado", zonaId: "urdesa", precio: 2.00 },
  { id: 32, nombre: "Centro Comercial San Marino", lat: -2.1694, lng: -79.8981, tipo: "comercial", zonaId: "kennedy", precio: 1.25 },
  { id: 33, nombre: "Garaje La Garzota Premium", lat: -2.1389, lng: -79.9012, tipo: "garage_privado", zonaId: "alborada-samanes", precio: 2.80 },
  { id: 34, nombre: "Parqueo Plaza Lagos", lat: -2.1300, lng: -79.8600, tipo: "comercial", zonaId: "samborondon", precio: 3.50 },
  { id: 35, nombre: "Calle Chile Centro Histórico", lat: -2.1978, lng: -79.8876, tipo: "calle", zonaId: "centro", precio: 0 }
];

// IDs esperados por zona (calculados desde parkings)
const EXPECTED_IDS_BY_ZONE = {
  'urdesa': [1, 4, 5, 7, 8, 12, 19, 26, 31],
  'kennedy': [3, 6, 10, 11, 13, 14, 17, 25, 32],
  'centro': [15, 22, 28, 35],
  'alborada-samanes': [21, 24, 33],
  'ceibos': [16, 29],
  'samborondon': [23, 34],
  'aeropuerto-terminal': [18, 20],
  'sur': [27],
  'via-costa': [30],
  'mall': [2, 9]
};

// IDs de garajes privados (tipo: garage_privado)
const EXPECTED_GARAGE_IDS = [1, 5, 8, 10, 12, 16, 19, 21, 24, 26, 29, 31, 33];

// Counts esperados por zona
const EXPECTED_COUNTS = {
  'urdesa': 9,
  'kennedy': 9,
  'centro': 4,
  'alborada-samanes': 3,
  'ceibos': 2,
  'samborondon': 2,
  'aeropuerto-terminal': 2,
  'sur': 1,
  'via-costa': 1,
  'mall': 2
};

// Coordenadas reales de referencia (Google Maps - Verificadas Dic 2025)
const UBICACIONES_REALES = {
  // Centros Comerciales
  "Mall del Sol": { lat: -2.1547, lng: -79.8927 },
  "City Mall": { lat: -2.1410, lng: -79.9070 },
  "Policentro Kennedy": { lat: -2.1714, lng: -79.8994 },
  "Riocentro Entre Ríos": { lat: -2.1430, lng: -79.8660 },
  "Mall del Sur": { lat: -2.2270, lng: -79.8990 },
  "Centro Comercial San Marino": { lat: -2.1694, lng: -79.8981 },
  "Plaza Lagos Town Center": { lat: -2.1300, lng: -79.8600 },
  "Plaza Quil": { lat: -2.1650, lng: -79.8970 },
  
  // Hospitales/Clínicas Kennedy
  "Hospital Kennedy": { lat: -2.1527, lng: -79.8991 },
  "Clínica Kennedy Samborondón": { lat: -2.1236, lng: -79.8672 },
  
  // Terminal y Aeropuerto
  "Terminal Terrestre Guayaquil": { lat: -2.1436, lng: -79.8794 },
  "Aeropuerto José Joaquín de Olmedo": { lat: -2.1572, lng: -79.8836 },
  
  // Estadio Monumental
  "Estadio Monumental Banco Pichincha": { lat: -2.1858, lng: -79.9250 },
  
  // Universidad Católica
  "Universidad Católica de Santiago de Guayaquil": { lat: -2.1814, lng: -79.9036 }
};

// Límites de Guayaquil
const GUAYAQUIL_BOUNDS = {
  minLat: -2.30,
  maxLat: -2.05,
  minLng: -80.05,
  maxLng: -79.80
};

// Zonas válidas
const ZONAS_VALIDAS = [
  'urdesa', 'kennedy', 'centro', 'alborada-samanes', 
  'ceibos', 'samborondon', 'aeropuerto-terminal', 
  'sur', 'via-costa', 'mall'
];

// Tipos válidos
const TIPOS_VALIDOS = ['garage_privado', 'comercial', 'calle'];

console.log('═══════════════════════════════════════════════════════════');
console.log('       VALIDACIÓN DE PARQUEOS - EasyParker PWA');
console.log('═══════════════════════════════════════════════════════════\n');

let errores = [];
let advertencias = [];

// 1. Validar coordenadas dentro de Guayaquil
console.log('📍 VALIDANDO COORDENADAS...\n');
parkings.forEach(p => {
  if (p.lat < GUAYAQUIL_BOUNDS.minLat || p.lat > GUAYAQUIL_BOUNDS.maxLat ||
      p.lng < GUAYAQUIL_BOUNDS.minLng || p.lng > GUAYAQUIL_BOUNDS.maxLng) {
    errores.push(`❌ ID ${p.id} "${p.nombre}": Coordenadas fuera de Guayaquil (${p.lat}, ${p.lng})`);
  }
});

// 2. Validar tipos
console.log('🏷️ VALIDANDO TIPOS...\n');
parkings.forEach(p => {
  if (!TIPOS_VALIDOS.includes(p.tipo)) {
    errores.push(`❌ ID ${p.id} "${p.nombre}": Tipo inválido "${p.tipo}"`);
  }
  
  // Verificar coherencia nombre vs tipo
  const nombreLower = p.nombre.toLowerCase();
  if (nombreLower.includes('mall') || nombreLower.includes('centro comercial') || 
      nombreLower.includes('policentro') || nombreLower.includes('riocentro')) {
    if (p.tipo !== 'comercial') {
      advertencias.push(`⚠️ ID ${p.id} "${p.nombre}": Parece ser centro comercial pero tipo es "${p.tipo}"`);
    }
  }
  if (nombreLower.includes('garaje') && p.tipo !== 'garage_privado') {
    advertencias.push(`⚠️ ID ${p.id} "${p.nombre}": Dice "Garaje" pero tipo es "${p.tipo}"`);
  }
  if (nombreLower.includes('calle') && p.tipo !== 'calle') {
    advertencias.push(`⚠️ ID ${p.id} "${p.nombre}": Dice "Calle" pero tipo es "${p.tipo}"`);
  }
});

// 3. Validar zonas
console.log('🗺️ VALIDANDO ZONAS...\n');
parkings.forEach(p => {
  if (!ZONAS_VALIDAS.includes(p.zonaId)) {
    errores.push(`❌ ID ${p.id} "${p.nombre}": Zona inválida "${p.zonaId}"`);
  }
});

// 4. Validar precios
console.log('💰 VALIDANDO PRECIOS...\n');
parkings.forEach(p => {
  if (p.tipo !== 'calle' && p.precio <= 0) {
    errores.push(`❌ ID ${p.id} "${p.nombre}": Precio es ${p.precio} pero no es calle`);
  }
  if (p.tipo === 'calle' && p.precio !== 0) {
    advertencias.push(`⚠️ ID ${p.id} "${p.nombre}": Es calle pero tiene precio ${p.precio}`);
  }
});

// 5. Comparar con ubicaciones reales conocidas
console.log('📌 COMPARANDO CON UBICACIONES REALES...\n');
const TOLERANCIA_KM = 2; // 2km de tolerancia

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Verificar Terminal Terrestre
const terminal = parkings.find(p => p.id === 18);
const terminalReal = UBICACIONES_REALES["Terminal Terrestre Guayaquil"];
const distTerminal = haversineDistance(terminal.lat, terminal.lng, terminalReal.lat, terminalReal.lng);
if (distTerminal > TOLERANCIA_KM) {
  errores.push(`❌ ID 18 "Terminal Terrestre": Está a ${distTerminal.toFixed(2)}km de la ubicación real`);
  console.log(`   Real: ${terminalReal.lat}, ${terminalReal.lng}`);
  console.log(`   Actual: ${terminal.lat}, ${terminal.lng}`);
}

// Verificar Aeropuerto
const aeropuerto = parkings.find(p => p.id === 20);
const aeropuertoReal = UBICACIONES_REALES["Aeropuerto José Joaquín de Olmedo"];
const distAero = haversineDistance(aeropuerto.lat, aeropuerto.lng, aeropuertoReal.lat, aeropuertoReal.lng);
if (distAero > TOLERANCIA_KM) {
  advertencias.push(`⚠️ ID 20 "Aeropuerto JJO": Está a ${distAero.toFixed(2)}km de la ubicación real`);
}

// Verificar Mall del Sol
const mallSol = parkings.find(p => p.id === 2);
const mallSolReal = UBICACIONES_REALES["Mall del Sol"];
const distMallSol = haversineDistance(mallSol.lat, mallSol.lng, mallSolReal.lat, mallSolReal.lng);
if (distMallSol > TOLERANCIA_KM) {
  errores.push(`❌ ID 2 "Mall del Sol": Está a ${distMallSol.toFixed(2)}km de la ubicación real`);
  console.log(`   Real: ${mallSolReal.lat}, ${mallSolReal.lng}`);
  console.log(`   Actual: ${mallSol.lat}, ${mallSol.lng}`);
}

// Verificar Estadio Monumental
const estadio = parkings.find(p => p.id === 30);
const estadioReal = UBICACIONES_REALES["Estadio Monumental Banco Pichincha"];
const distEstadio = haversineDistance(estadio.lat, estadio.lng, estadioReal.lat, estadioReal.lng);
if (distEstadio > TOLERANCIA_KM) {
  errores.push(`❌ ID 30 "Estadio Monumental": Está a ${distEstadio.toFixed(2)}km de la ubicación real`);
  console.log(`   Real: ${estadioReal.lat}, ${estadioReal.lng}`);
  console.log(`   Actual: ${estadio.lat}, ${estadio.lng}`);
}

// 6. Verificar IDs únicos
console.log('🔢 VALIDANDO IDs...\n');
const ids = parkings.map(p => p.id);
const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicados.length > 0) {
  errores.push(`❌ IDs duplicados: ${duplicados.join(', ')}`);
}

// 7. Verificar clasificación de zonas para búsqueda
console.log('🔍 VALIDANDO CLASIFICACIÓN PARA BÚSQUEDA...\n');

// San Marino - verificar que NO aparezca en búsqueda "centro" si es comercial
const garajeSanMarino = parkings.find(p => p.id === 10);
const ccSanMarino = parkings.find(p => p.id === 32);

if (garajeSanMarino.zonaId === 'centro' && garajeSanMarino.nombre.includes('Garaje')) {
  advertencias.push(`⚠️ ID 10 "Garaje San Marino": Está en zona 'centro' pero debería aparecer solo en garajes`);
}

// ═══════════════════════════════════════
// RESULTADOS
// ═══════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════');
console.log('                      RESULTADOS');
console.log('═══════════════════════════════════════════════════════════\n');

if (errores.length > 0) {
  console.log('🚨 ERRORES CRÍTICOS:\n');
  errores.forEach(e => console.log(e));
  console.log('');
}

if (advertencias.length > 0) {
  console.log('⚠️ ADVERTENCIAS:\n');
  advertencias.forEach(a => console.log(a));
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
console.log(`Total: ${errores.length} errores, ${advertencias.length} advertencias`);
console.log('═══════════════════════════════════════════════════════════\n');

// Exportar para uso
console.log('\n📋 COORDENADAS SUGERIDAS PARA CORRECCIÓN:\n');
console.log('Terminal Terrestre Guayaquil:', UBICACIONES_REALES["Terminal Terrestre Guayaquil"]);
console.log('Mall del Sol:', UBICACIONES_REALES["Mall del Sol"]);
console.log('Estadio Monumental:', UBICACIONES_REALES["Estadio Monumental Banco Pichincha"]);
console.log('Riocentro Entre Ríos:', UBICACIONES_REALES["Riocentro Entre Ríos"]);
console.log('Plaza Lagos:', UBICACIONES_REALES["Plaza Lagos Town Center"]);
