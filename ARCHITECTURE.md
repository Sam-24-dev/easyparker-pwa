# Arquitectura de EasyParker

## Estructura General

EasyParker es una PWA construida con React 18, Vite y TypeScript. Utiliza una arquitectura modular con separación clara de responsabilidades.

## Capas

### 1. Data Layer (src/data/)

- `parkings.ts`: 15 parqueos hardcodeados con información completa
- `reviews.ts`: Reseñas diferenciadas por tipo de parqueo
- `reservasMock.ts`: Reservas de ejemplo para demostración

### 2. Types Layer (src/types/)

Define interfaces TypeScript para toda la aplicación:

- `IParking`: Información de parqueo
- `IReview`: Reseña de usuario
- `IReserva`: Datos de reserva
- `IFiltros`: Configuración de filtros
- `IUsuario`: Ubicación del usuario

### 3. Context Layer (src/context/)

Manejo de estado global con Context API:

- **ParkingContext**: Estado de parqueos, filtros y ubicación
- **ReservaContext**: Gestión de reservas activas y completadas

No utiliza Redux ni localStorage. Todo está en memoria durante la sesión.

### 4. Hooks Layer (src/hooks/)

Hooks personalizados para lógica reutilizable:

- `useDistance.ts`: Cálculo de distancia Haversine
- `useParkings.ts`: Filtrado y ordenamiento de parqueos

### 5. Components Layer (src/components/)

Componentes organizados por tipo:

#### UI Components (src/components/ui/)
Componentes reutilizables sin lógica de negocio:
- `Button.tsx`: Botones con variantes
- `Badge.tsx`: Etiquetas y badges
- `StarRating.tsx`: Visualización de calificaciones
- `Modal.tsx`: Modales con animación
- `Card.tsx`: Layout base para tarjetas

#### Layout Components (src/components/layout/)
Estructura de página:
- `Header.tsx`: Encabezado con navegación
- `Footer.tsx`: Pie de página
- `Layout.tsx`: Layout principal

#### Parking Components (src/components/parking/)
Componentes específicos de parqueo:
- `ParkingCard.tsx`: Tarjeta de parqueo
- `ParkingList.tsx`: Lista de parqueos
- `MapView.tsx`: Mapa con Leaflet
- `FilterBar.tsx`: Barra de filtros

#### Review Components (src/components/reviews/)
Manejo de reseñas:
- `ReviewCard.tsx`: Tarjeta individual
- `ReviewList.tsx`: Lista de reseñas

### 6. Pages Layer (src/pages/)

Páginas principales (React Router):

- `Home.tsx`: Landing page con acceso rápido
- `Buscar.tsx`: Búsqueda con mapa
- `Detalle.tsx`: Información completa de parqueo
- `Reservar.tsx`: Formulario de reserva
- `MisReservas.tsx`: Historial de reservas

### 7. Routing Layer (src/App.tsx)

Configuración de React Router con 5 rutas principales.

## Flujo de Datos

```
App (Router)
├── ParkingProvider (Context)
├── ReservaProvider (Context)
└── Routes
    ├── Home
    ├── Buscar
    │   ├── MapView (con Leaflet)
    │   ├── FilterBar
    │   └── ParkingList
    ├── Detalle
    │   ├── ReviewList
    │   └── Details
    ├── Reservar
    │   └── Modal (Confirmación)
    └── MisReservas
        └── ReservaCard
```

## Estado Global

### ParkingContext

```typescript
{
  parkings: IParking[]           // Array de parqueos
  filtros: IFiltros              // Estado actual de filtros
  usuario: IUsuario              // Ubicación del usuario
  setFiltros: (IFiltros) => void // Actualizar filtros
  getParkingById: (id) => IParking
}
```

### ReservaContext

```typescript
{
  reservas: IReserva[]           // Todas las reservas
  agregarReserva: (IReserva) => void
  getReservasActivas: () => IReserva[]
  getReservasCompletadas: () => IReserva[]
}
```

## Flujo de Reserva

1. Usuario en Home hace clic en "Buscar"
2. En /buscar visualiza mapa con filtros
3. Click en parqueo → /parqueo/:id
4. Ve detalle con reseñas → Click "Reservar Ahora"
5. En /reservar/:id llena formulario
6. Click "Confirmar" → Modal con código
7. Se guarda en ReservaContext
8. Puede ver en /mis-reservas

## Estilo y Temas

- **Tailwind CSS**: Sistema de utilidades
- **Colores Personalizados**: Configurados en tailwind.config.js
- **Animaciones**: Definidas en index.css
- **Mobile-first**: Diseñado para 320px - 428px

## PWA Configuration

- `public/manifest.json`: Configuración de instalación
- `public/sw.js`: Service Worker para caché
- Meta tags en `index.html` para instalación en iOS/Android

## Performance

- **Lazy Loading**: Imágenes con Unsplash
- **Code Splitting**: React Router automático
- **CSS**: Tailwind purga CSS no usado
- **Build**: Vite con optimizaciones

## Escalabilidad

La arquitectura permite fácil migración a:

- Backend API: Reemplazar data/parkings.ts
- Database: Supabase o similar
- Auth: Supabase Auth o Auth0
- State Management: Redux si es necesario

## Convenciones

- **Carpetas**: Minúsculas con guiones
- **Archivos**: PascalCase para componentes, camelCase para lógica
- **TypeScript**: Tipos para todo
- **Props**: Interfaces específicas por componente
- **Imports**: Path absoluto cuando sea posible
