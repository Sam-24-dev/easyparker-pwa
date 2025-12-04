# 🅿️ EasyParker PWA

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-easyparker--pwa.vercel.app-00C853?style=for-the-badge)](https://easyparker-pwa.vercel.app/)

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

> 🚗 Progressive Web App moderna para encontrar y reservar parqueo en Guayaquil en menos de 90 segundos.

### 🔗 [Ver Demo en Vivo](https://easyparker-pwa.vercel.app/)

---

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| 🗺️ **Mapa Interactivo** | Visualiza parqueos en tiempo real con marcadores de colores según disponibilidad |
| 🔍 **Búsqueda Avanzada** | Filtra por precio, distancia, verificación y accesibilidad PMR |
| 📱 **Código QR** | Genera QR único para acceso rápido al parqueo |
| ⏰ **Extensión de Tiempo** | Extiende tu reserva sin salir del parqueo |
| ❌ **Cancelación Fácil** | Cancela reservas activas con confirmación |
| ❤️ **Favoritos** | Guarda tus parqueos favoritos con persistencia |
| 🔔 **Notificaciones Push** | Recordatorios automáticos antes de que expire tu reserva |
| 📲 **PWA Instalable** | Instala como app nativa en cualquier dispositivo |
| 📴 **Funciona Offline** | Acceso básico sin conexión a internet |

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3** - Librería UI con hooks modernos
- **Vite 5.4** - Build tool ultra-rápido
- **TypeScript 5.5** - Tipado estático

### Estilos
- **Tailwind CSS 3.4** - Utility-first CSS
- **Lucide React** - Iconografía moderna

### Mapas & Geolocalización
- **Leaflet** - Mapas interactivos
- **react-leaflet** - Integración React
- **OpenStreetMap** - Tiles gratuitos

### Estado & Navegación
- **Context API** - Gestión de estado global
- **React Router DOM v6** - Navegación SPA

### PWA & Offline
- **Service Worker** - Cache y offline
- **Web App Manifest** - Instalación nativa
- **Web Notifications API** - Notificaciones push

### Generación QR
- **qrcode.react** - Códigos QR dinámicos

---

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/Sam-24-dev/easyparker-pwa.git

# Entrar al directorio
cd easyparker-pwa

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
easyparker-pwa/
├── public/
│   ├── manifest.json       # PWA Manifest
│   ├── sw.js               # Service Worker
│   └── logo/               # Iconos de la app
├── src/
│   ├── pages/              # Páginas principales
│   │   ├── Home.tsx        # Landing page
│   │   ├── Buscar.tsx      # Búsqueda con mapa
│   │   ├── Detalle.tsx     # Detalle de parqueo
│   │   ├── Reservar.tsx    # Formulario de reserva
│   │   ├── MisReservas.tsx # Historial + QR
│   │   ├── Favoritos.tsx   # Parqueos favoritos
│   │   ├── Onboarding.tsx  # Tutorial inicial
│   │   └── Splash.tsx      # Pantalla de carga
│   ├── components/
│   │   ├── layout/         # Header, Footer, Nav
│   │   ├── ui/             # Button, Card, Modal, Badge
│   │   ├── parking/        # MapView, ParkingCard, FilterBar
│   │   └── reviews/        # ReviewCard, ReviewList
│   ├── context/            # AuthContext, ParkingContext, ReservaContext, FavoritesContext
│   ├── hooks/              # useDistance, useParkings, useReservationReminders
│   ├── data/               # parkings.ts, reviews.ts, reservasMock.ts
│   ├── types/              # Interfaces TypeScript
│   └── utils/              # Funciones utilitarias
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 🗺️ Rutas de la Aplicación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Landing con mapa mini y sugerencias |
| `/buscar` | Buscar | Mapa completo + filtros + lista |
| `/parqueo/:id` | Detalle | Info completa, galería, reseñas |
| `/reservar/:id` | Reservar | Selección de fecha/hora, confirmación |
| `/mis-reservas` | MisReservas | Historial, QR, extensión, cancelación |
| `/favoritos` | Favoritos | Lista de parqueos guardados |
| `/onboarding` | Onboarding | Tutorial de bienvenida |

---

## 📱 Guía de Usuario

### 🔍 Buscar Parqueo
1. Ve a la sección **Buscar** desde el menú inferior
2. Usa el mapa interactivo para explorar la zona
3. Aplica filtros (precio, distancia, PMR, verificado)
4. Toca un marcador o tarjeta para ver detalles

### 📝 Hacer una Reserva
1. Selecciona un parqueo y toca **Reservar**
2. Elige fecha y rango horario
3. Revisa el resumen y precio total
4. Confirma la reserva

### 📲 Usar el Código QR
1. Ve a **Mis Reservas**
2. Selecciona tu reserva activa
3. Toca **Ver QR de Acceso**
4. Muestra el QR al guardia o escáner

### ⏰ Extender Tiempo
1. En tu reserva activa, toca **Extender**
2. Selecciona el nuevo horario de fin
3. Confirma la extensión

### ❌ Cancelar Reserva
1. En tu reserva activa, toca **Cancelar**
2. Confirma en el modal de cancelación
3. La reserva se eliminará inmediatamente

---

## ❓ FAQ - Preguntas Frecuentes

<details>
<summary><b>¿Cómo instalo la app en mi celular?</b></summary>
<br>
Abre la app en Chrome/Safari, busca la opción "Agregar a pantalla de inicio" o "Instalar app" en el menú del navegador.
</details>

<details>
<summary><b>¿Funciona sin internet?</b></summary>
<br>
Sí, puedes ver tus reservas guardadas y la información básica. Para hacer nuevas reservas necesitas conexión.
</details>

<details>
<summary><b>¿Cómo recibo notificaciones?</b></summary>
<br>
Acepta los permisos de notificación cuando la app lo solicite. Recibirás alertas 15 minutos antes de que expire tu reserva.
</details>

<details>
<summary><b>¿Puedo cancelar una reserva?</b></summary>
<br>
Sí, las reservas activas tienen un botón "Cancelar". Una vez cancelada, no se puede recuperar.
</details>

<details>
<summary><b>¿Cómo guardo un parqueo como favorito?</b></summary>
<br>
Toca el icono de corazón (❤️) en cualquier tarjeta de parqueo o en la página de detalle.
</details>

---

## 🎨 Sistema de Diseño

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| 🔵 Primary | `#0B1F60` | Acciones principales, texto |
| 🟢 Success | `#10b981` | Disponibilidad alta, verificado |
| 🟡 Warning | `#f59e0b` | Pocas plazas, alertas |
| 🔴 Danger | `#ef4444` | Sin plazas, errores |
| 🟣 Accent | `#5A63F2` | Enlaces, CTAs secundarios |

### Responsive

- **Mínimo**: 320px (iPhone SE)
- **Óptimo**: 375px - 428px (iPhones modernos)
- **Máximo**: 768px (tablets)

### Accesibilidad

- ✅ Contraste WCAG AA
- ✅ Botones táctiles 44px mínimo
- ✅ Labels en formularios
- ✅ Alt text en imágenes

---

## 📊 Datos de Demostración

| Tipo | Cantidad |
|------|----------|
| 🅿️ Parqueos | 35 ubicaciones en Guayaquil |
| ⭐ Reseñas | Diferenciadas por tipo de parqueo |
| 📋 Reservas | Ejemplos activas y completadas |

---

## ⚡ Performance

| Métrica | Valor |
|---------|-------|
| Build Time | ~12s |
| Bundle JS | ~470 KB |
| Bundle CSS | ~48 KB |
| Gzip Total | ~156 KB |
| First Load | < 3s |
| Flujo Completo | < 90s |

---

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# Build
npm run build

# El directorio dist/ está listo para deploy
```

### Variables de Entorno

No se requieren variables de entorno para la demo.

---

## 📜 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Ejecutar ESLint
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT © 2025 EasyParker

---

<div align="center">

**[⬆ Volver arriba](#-easyparker-pwa)**

Hecho con ❤️ en Guayaquil, Ecuador 🇪🇨

</div>
