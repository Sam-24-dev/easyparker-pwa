# Guía de Deployment - EasyParker

## Local Development

```bash
# Instalar dependencias (si no lo hiciste)
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Acceder en http://localhost:5173
```

## Build Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

## Deploy en Vercel

### Opción 1: CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Seguir los pasos interactivos
```

### Opción 2: GitHub Integration

1. Pushear código a GitHub
2. Ir a vercel.com
3. Importar proyecto desde repositorio
4. Vercel deploya automáticamente

### Opción 3: Manual

```bash
# Build
npm run build

# La carpeta 'dist/' está lista para deployar
# Subir a cualquier hosting (Netlify, Vercel, Firebase, etc)
```

## URLs de Deployment

Una vez deployado, acceder a:

- Home: `https://tu-url.com/`
- Buscar: `https://tu-url.com/buscar`
- Detalle: `https://tu-url.com/parqueo/1`
- Reservar: `https://tu-url.com/reservar/1`
- Mis Reservas: `https://tu-url.com/mis-reservas`

## PWA Installation

Una vez deployado:

1. Abrir en navegador
2. Buscar ícono de "Instalar" o "Agregar a pantalla de inicio"
3. La app se instala como nativa

## Variables de Entorno

Actualmente no usa variables (todo es hardcodeado).

Cuando migres a backend, crear `.env`:
```
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## Optimizaciones Post-Deploy

- Monitorear Core Web Vitals en Vercel Analytics
- Usar CDN para imágenes (Cloudinary, Imgix)
- Habilitar Edge Caching
- Configurar SSL/HTTPS (automático en Vercel)

## Troubleshooting

### El mapa no carga
- Verificar conexión a internet
- Revisar console por errores de Leaflet
- Leaflet requiere HTTPS en producción

### PWA no instala
- Acceder vía HTTPS
- Verificar manifest.json disponible
- Limpiar caché del navegador

### Rutas no funcionan
- Verificar que sea SPA (single page app)
- En Vercel, esto es automático
- Para otros hosts, redirigir 404 a index.html

## Checklist Pre-Deploy

- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin warnings
- [ ] Testear todas las 5 rutas localmente
- [ ] Verificar responsive en 320px
- [ ] Probar instalación PWA en móvil
- [ ] Revisar console sin errores
- [ ] Actualizar URLs en documentación

## Monitoreo

Después de deploy:

1. Verificar Vercel Analytics
2. Revisar Core Web Vitals
3. Monitorear errores en console
4. Testear en dispositivos reales

## Rollback

Si algo falla post-deploy:

```bash
# Vercel guarda historial
# Puedes hacer rollback desde dashboard de Vercel
```

---

Listo para deploy! ✓
