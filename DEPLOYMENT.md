# Guía de Deployment - EasyParker PWA

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Cuenta en Vercel (opcional pero recomendado)

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Acceder en http://localhost:5173
```

---

## Build de Producción

```bash
# Crear build optimizado
npm run build

# Preview del build localmente
npm run preview
```

### Métricas del Build
| Métrica | Valor |
|---------|-------|
| Build Time | ~15s |
| Bundle JS | ~500 KB |
| Bundle CSS | ~50 KB |
| Gzip Total | ~170 KB |

---

## Deploy en Vercel

### Opción 1: CLI (Recomendado)

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Deploy (seguir pasos interactivos)
vercel

# Deploy a producción
vercel --prod
```

### Opción 2: GitHub Integration

1. Pushear código a GitHub
2. Ir a [vercel.com](https://vercel.com)
3. Importar proyecto desde repositorio
4. Vercel detecta Vite automáticamente
5. Deploy automático en cada push

### Opción 3: Manual (Otros Hosts)

```bash
# Build
npm run build

# La carpeta 'dist/' está lista para subir a:
# - Netlify
# - Firebase Hosting
# - AWS S3 + CloudFront
# - Cualquier hosting estático
```

---

## Rutas de la Aplicación

Una vez deployado, estas son las rutas disponibles:

### Rutas Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Splash screen |
| `/onboarding` | Tutorial inicial |
| `/signup` | Registro/Login |
| `/events` | Eventos próximos |

### Rutas Conductor (Protegidas)
| Ruta | Descripción |
|------|-------------|
| `/home` | Landing principal |
| `/buscar` | Mapa + búsqueda |
| `/parqueo/:id` | Detalle de parqueo |
| `/reservar/:id` | Flujo de reserva |
| `/mis-reservas` | Historial + QR |
| `/favoritos` | Parqueos guardados |
| `/mensajes` | Lista de chats |
| `/mensajes/:id` | Chat individual |
| `/perfil/:userId?` | Perfil de usuario |

### Rutas Anfitrión (Protegidas)
| Ruta | Descripción |
|------|-------------|
| `/host/dashboard` | Panel principal |
| `/host/garage` | Gestión de garajes |
| `/host/wallet` | Billetera |
| `/host/mensajes` | Lista de chats |
| `/host/mensajes/:id` | Chat individual |

---

## Instalación como PWA

Una vez deployado en HTTPS:

1. Abrir la app en Chrome/Safari
2. En Chrome: Menú → "Instalar EasyParker"
3. En Safari (iOS): Compartir → "Agregar a pantalla de inicio"
4. La app se instala como aplicación nativa

---

## Variables de Entorno

Actualmente la app funciona sin variables (datos mock).

Cuando migres a backend real, crear `.env`:

```env
VITE_API_URL=https://api.tudominio.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

---

## Configuración SPA (Single Page App)

### Vercel
Automático, no requiere configuración adicional.

### Netlify
Crear `public/_redirects`:
```
/*    /index.html   200
```

### Firebase
En `firebase.json`:
```json
{
  "hosting": {
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## Troubleshooting

### El mapa no carga
- Verificar conexión a internet
- Leaflet requiere HTTPS en producción
- Revisar console por errores

### PWA no se instala
- Debe estar en HTTPS
- Verificar que `manifest.json` sea accesible
- Limpiar caché del navegador

### Rutas devuelven 404
- Configurar rewrite de SPA (ver sección anterior)
- En Vercel es automático

### Chat no sincroniza
- Verificar que localStorage esté habilitado
- La sincronización usa eventos `storage` entre pestañas

### Notificaciones no suenan
- El navegador puede bloquear autoplay de audio
- El usuario debe interactuar primero con la página

---

## Checklist Pre-Deploy

- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin warnings críticos
- [ ] Testear flujo completo en localhost
- [ ] Verificar responsive en 320px-428px
- [ ] Probar PWA en dispositivo real
- [ ] Revisar console sin errores
- [ ] Testear modo Conductor y Anfitrión

---

## Monitoreo Post-Deploy

1. **Vercel Analytics**: Activar en dashboard
2. **Core Web Vitals**: Revisar LCP, FID, CLS
3. **Console Errors**: Monitorear con Sentry (opcional)
4. **Uptime**: UptimeRobot o similar

---

## Rollback

Si algo falla después del deploy:

### Vercel
- Ir a dashboard → Deployments
- Seleccionar versión anterior
- Click en "Promote to Production"

### Git
```bash
git revert HEAD
git push origin main
```

---

## Optimizaciones Recomendadas

- **Imágenes**: Usar CDN (Cloudinary, Imgix)
- **Caché**: Configurar headers de caché largo para assets
- **Compresión**: Vercel/Netlify lo hacen automáticamente
- **HTTPS**: Obligatorio para PWA y geolocalización

---

¡Listo para deploy! 🚀
