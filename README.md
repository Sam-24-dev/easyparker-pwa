# 🅿 EasyParker PWA

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-easyparker--pwa.vercel.app-00C853?style=for-the-badge)](https://easyparker-pwa.vercel.app/)

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

>  Progressive Web App moderna para encontrar y reservar parqueo en Guayaquil en menos de 90 segundos.

###  [Ver Demo en Vivo](https://easyparker-pwa.vercel.app/)

---

##  Características Principales

###  Modo Conductor

| Característica | Descripción |
|----------------|-------------|
|  **Mapa Interactivo** | Visualiza parqueos en tiempo real con marcadores de colores según disponibilidad |
|  **Búsqueda Avanzada** | Filtra por precio, distancia, verificación y accesibilidad PMR |
|  **Código QR** | Genera QR único para acceso rápido al parqueo |
|  **Extensión de Tiempo** | Extiende tu reserva sin salir del parqueo |
|  **Cancelación Fácil** | Cancela reservas activas con confirmación |
|  **Favoritos** | Guarda tus parqueos favoritos con persistencia |
|  **Chat en Tiempo Real** | Comunícate directamente con anfitriones |
|  **Calificaciones** | Califica tu experiencia con anfitriones |
|  **Reportes** | Reporta problemas o usuarios |

###  Modo Anfitrión

| Característica | Descripción |
|----------------|-------------|
|  **Dashboard** | Panel de control con estadísticas de ganancias, reservas y calificación |
|  **Gestión de Garajes** | Crea, edita y administra múltiples propiedades |
|  **Billetera Virtual** | Visualiza ganancias, transacciones y retira fondos |
|  **Solicitudes en Tiempo Real** | Acepta o rechaza reservas con notificaciones instantáneas |
|  **Notificaciones con Sonido** | Alertas audiovisuales para nuevas solicitudes |
|  **Chat con Conductores** | Mensajería directa con clientes |
|  **Calificación de Conductores** | Evalúa la experiencia con cada cliente |
|  **Sincronización Cross-Tab** | Estado sincronizado entre pestañas del navegador |

###  Sistema de Eventos

| Característica | Descripción |
|----------------|-------------|
|  **Eventos Cercanos** | Detecta eventos próximos (conciertos, shows) |
|  **Precios Dinámicos** | Tarifa surge automática durante eventos |
|  **Escolta VIP** | Servicio opcional de acompañamiento ($1.00 extra) |
|  **Horarios Extendidos** | Slots nocturnos para eventos (hasta 3am) |

### 🔐 Sistema de Autenticación

| Característica | Descripción |
|----------------|-------------|
|  **Registro/Login** | Autenticación con email y contraseña |
|  **Perfiles de Usuario** | Foto, nombre, verificación, estadísticas |
|  **Rutas Protegidas** | Acceso controlado a funciones autenticadas |
|  **Cambio de Modo** | Alterna entre Conductor y Anfitrión |

###  PWA & Offline

| Característica | Descripción |
|----------------|-------------|
|  **Instalable** | Instala como app nativa en cualquier dispositivo |
|  **Funciona Offline** | Acceso básico sin conexión a internet |
|  **Notificaciones Push** | Recordatorios antes de que expire tu reserva |

---

##  Stack Tecnológico

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
- **Context API** - Gestión de estado global (10 contextos)
- **React Router DOM v6** - Navegación SPA
- **localStorage** - Persistencia de datos

### PWA & Offline
- **Service Worker** - Cache y offline
- **Web App Manifest** - Instalación nativa
- **Web Notifications API** - Notificaciones push

### Generación QR
- **qrcode.react** - Códigos QR dinámicos
- **html-to-image** - Exportar comprobantes como imagen

---

##  Estructura del Proyecto

```
easyparker-pwa/
├── public/
│   ├── manifest.json       # PWA Manifest
│   ├── sw.js               # Service Worker
│   └── logo/               # Iconos de la app
├── src/
│   ├── pages/
│   │   ├── Home.tsx        # Landing con eventos y sugerencias
│   │   ├── Buscar.tsx      # Mapa + filtros + lista
│   │   ├── Detalle.tsx     # Detalle de parqueo con reseñas
│   │   ├── Reservar.tsx    # Flujo de reserva completo
│   │   ├── MisReservas.tsx # Historial + QR + acciones
│   │   ├── Favoritos.tsx   # Parqueos guardados
│   │   ├── Profile.tsx     # Perfil de usuario con ratings
│   │   ├── Mensajes.tsx    # Lista de chats (conductor)
│   │   ├── ChatView.tsx    # Vista de chat individual
│   │   ├── Events.tsx      # Página de eventos
│   │   ├── SignUp.tsx      # Registro/Login
│   │   └── host/           # Páginas modo anfitrión
│   │       ├── HostDashboard.tsx  # Panel principal
│   │       ├── HostGarage.tsx     # Gestión de garajes
│   │       ├── HostWallet.tsx     # Billetera
│   │       ├── HostMensajes.tsx   # Lista de chats
│   │       └── HostChatView.tsx   # Chat individual
│   ├── components/
│   │   ├── layout/         # Header, BottomNav, Layout
│   │   ├── ui/             # Button, Card, Modal, Badge, NotificationToast
│   │   ├── parking/        # MapView, ParkingCard, FilterBar
│   │   ├── chat/           # ChatHeader, ChatBubble, ChatInput, ConversationList
│   │   ├── rating/         # RatingModal
│   │   ├── report/         # ReportModal
│   │   ├── profile/        # ProfileStats, VerifiedBadge
│   │   ├── host/           # HostLayout, HostBottomNav
│   │   └── reviews/        # ReviewCard, ReviewList
│   ├── context/
│   │   ├── AuthContext.tsx         # Autenticación
│   │   ├── ParkingContext.tsx      # Parqueos + garajes reclamados
│   │   ├── ReservaContext.tsx      # Reservas del conductor
│   │   ├── HostContext.tsx         # Estado del anfitrión
│   │   ├── ChatContext.tsx         # Mensajería en tiempo real
│   │   ├── RatingContext.tsx       # Sistema de calificaciones
│   │   ├── ReportContext.tsx       # Sistema de reportes
│   │   ├── ProfileContext.tsx      # Perfiles de usuario
│   │   ├── FavoritesContext.tsx    # Favoritos
│   │   └── NotificationContext.tsx # Notificaciones globales
│   ├── data/               # parkings.ts, events.ts, chatMock.ts, usersMock.ts
│   ├── types/              # Interfaces TypeScript
│   └── utils/              # timeSlots.ts, pricingUtils.ts
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 🗺️ Rutas de la Aplicación

### Rutas Públicas
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Splash | Pantalla de carga inicial |
| `/onboarding` | Onboarding | Tutorial de bienvenida |
| `/signup` | SignUp | Registro/Login |
| `/events` | Events | Eventos próximos |

### Rutas Conductor (Protegidas)
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/home` | Home | Landing con mapa mini y eventos |
| `/buscar` | Buscar | Mapa completo + filtros + lista |
| `/parqueo/:id` | Detalle | Info completa, galería, reseñas |
| `/reservar/:id` | Reservar | Selección de fecha/hora, pago |
| `/mis-reservas` | MisReservas | Historial, QR, extensión |
| `/favoritos` | Favoritos | Parqueos guardados |
| `/mensajes` | Mensajes | Lista de conversaciones |
| `/mensajes/:id` | ChatView | Chat individual |
| `/perfil/:userId?` | Profile | Perfil propio o de otro usuario |

### Rutas Anfitrión (Protegidas)
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/host/dashboard` | HostDashboard | Panel con estadísticas y solicitudes |
| `/host/garage` | HostGarage | Gestión de propiedades |
| `/host/wallet` | HostWallet | Billetera y transacciones |
| `/host/mensajes` | HostMensajes | Lista de chats |
| `/host/mensajes/:id` | HostChatView | Chat con conductor |

---

## 📱 Guía de Usuario

### 🔍 Buscar y Reservar (Conductor)
1. Inicia sesión o regístrate
2. Ve a **Buscar** desde el menú inferior
3. Usa el mapa o aplica filtros (precio, distancia, PMR)
4. Toca un parqueo para ver detalles
5. Selecciona horas y completa el pago
6. Recibe tu código QR de acceso

### 🏠 Publicar mi Garaje (Anfitrión)
1. Inicia sesión y toca **Modo Anfitrión**
2. Ve a **Mis Garajes**
3. Toca **+ Crear Nuevo** o **Reclamar Existente**
4. Completa la información
5. Activa **Recibiendo Reservas** en el Dashboard
6. Acepta solicitudes cuando lleguen

### 💬 Chat en Tiempo Real
1. Al crear una reserva, se genera un chat automáticamente
2. Accede desde **Mensajes** en el menú
3. Los mensajes se sincronizan al instante entre pestañas
4. Toca el avatar para ver el perfil del otro usuario

### ⭐ Calificar y Reportar
1. Después de una reserva completada, aparece el botón **Calificar**
2. Elige estrellas y escribe un comentario
3. Para reportar, toca **Reportar** y describe el problema

---

##  Sistema de Diseño

### Paleta de Colores
| Color | Hex | Uso |
|-------|-----|-----|
| 🔵 Primary | `#0B1F60` | Acciones principales, texto |
| 🟢 Success | `#10b981` | Disponibilidad, verificado, anfitrión |
| 🟡 Warning | `#f59e0b` | Pocas plazas, alertas |
| 🔴 Danger | `#ef4444` | Sin plazas, errores, rechazos |
| 🟣 Accent | `#5A63F2` | Enlaces, CTAs secundarios |

### Responsive
- **Mínimo**: 320px (iPhone SE)
- **Óptimo**: 375px - 428px (iPhones modernos)
- **Máximo**: 768px (tablets)

### Accesibilidad
-  Contraste WCAG AA
-  Botones táctiles 44px mínimo
-  Labels en formularios
-  Alt text en imágenes

---

##  Datos de Demostración

| Tipo | Cantidad |
|------|----------|
|  Parqueos | 35 ubicaciones en Guayaquil |
|  Usuarios Mock | 6 conductores + 4 anfitriones |
|  Reseñas | Diferenciadas por tipo |
|  Reservas Demo | Activas y completadas |
|  Eventos | 2 eventos próximos (Chayanne, Burger Show) |

---

##  Performance

| Métrica | Valor |
|---------|-------|
| Build Time | ~15s |
| Bundle JS | ~500 KB |
| Bundle CSS | ~50 KB |
| Gzip Total | ~170 KB |
| First Load | < 3s |
| Flujo Completo | < 90s |

---

##  Instalación

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

##  Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Ejecutar ESLint
```

---

##  Deploy

### Vercel (Recomendado)
```bash
npm run build
# El directorio dist/ está listo para deploy
```

### Variables de Entorno
No se requieren variables de entorno para la demo.

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

Hecho por Samir Caizapasto con ❤️ en Guayaquil, Ecuador

</div>
