# EasyParker - PWA de Reserva de Parqueo en Guayaquil

Una Progressive Web App moderna que permite encontrar y reservar parqueo en Guayaquil en menos de 90 segundos.

## Características

- **Mapa Interactivo**: Visualiza parqueos en tiempo real con marcadores de colores según disponibilidad
- **Búsqueda Avanzada**: Filtra por precio, distancia, verificación y accesibilidad PMR
- **Detalles Completos**: Información de seguridad, reseñas de usuarios y horarios
- **Reserva Rápida**: Confirma tu reserva en segundos con código único
- **Historial de Reservas**: Acceso a tus reservas activas y completadas
- **PWA Instalable**: Instala como app nativa en tu dispositivo
- **Diseño Minimalista**: Inspirado en Airbnb con interfaz limpia y profesional

## Stack Tecnológico

- React 18 + Vite
- TypeScript
- Tailwind CSS
- React Router DOM v6
- Leaflet + react-leaflet (Mapas)
- Lucide React (Íconos)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Construcción

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── pages/                 # Páginas principales
│   ├── Home.tsx          # Página de inicio
│   ├── Buscar.tsx        # Búsqueda con mapa
│   ├── Detalle.tsx       # Detalle de parqueo
│   ├── Reservar.tsx      # Formulario de reserva
│   └── MisReservas.tsx   # Historial de reservas
├── components/
│   ├── layout/           # Componentes de layout
│   ├── ui/               # Componentes UI reutilizables
│   ├── parking/          # Componentes de parqueo
│   └── reviews/          # Componentes de reseñas
├── context/              # Context API
├── hooks/                # Hooks personalizados
├── data/                 # Datos hardcodeados
└── types/                # Definiciones de TypeScript
```

## Rutas

- `/` - Página de inicio
- `/buscar` - Búsqueda de parqueos con mapa
- `/parqueo/:id` - Detalle de parqueo
- `/reservar/:id` - Formulario de reserva
- `/mis-reservas` - Historial de reservas

## Datos

La aplicación utiliza datos hardcodeados para demostración:

- **15 Parqueos** en Guayaquil con información completa
- **Reseñas diferenciadas** según tipo de parqueo
- **Reservas de ejemplo** para demostración

## PWA

La aplicación es completamente instalable:

1. Abre en navegador
2. Busca la opción "Instalar" o "Agregar a pantalla de inicio"
3. Usa como app nativa

## Características de Diseño

- **Colores Personalizados**:
  - Primary: #2563eb (Azul confianza)
  - Success: #10b981 (Verde disponible)
  - Warning: #f59e0b (Amarillo pocas plazas)
  - Danger: #ef4444 (Rojo lleno)

- **Responsive**: Optimizado para 320px - 428px
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Accesibilidad**: Contraste WCAG AA, botones 44px mínimo

## Flujo de Usuario

1. **Home**: Acceso rápido a zonas populares
2. **Búsqueda**: Mapa interactivo con filtros
3. **Detalle**: Información completa del parqueo
4. **Reserva**: Confirmar con código único
5. **Historial**: Ver reservas activas y completadas

## Performance

- Tiempo de carga: < 3 segundos
- Flujo completo: < 90 segundos
- Tamaño JS comprimido: ~111KB

## Deploy

Listo para deploy en Vercel:

```bash
npm run build
# Deploy la carpeta dist/
```

## Licencia

MIT
