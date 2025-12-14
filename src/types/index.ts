export type TipoVehiculo = 'Auto' | 'Moto';

export interface IParking {
  id: number;
  nombre: string;
  descripcion?: string; // Descripción breve del garaje
  lat: number;
  lng: number;
  precio: number;
  distancia: number;
  plazasLibres: number;
  verificado: boolean;
  seguridad: string[];
  calificacion: number;
  foto: string;
  galeria?: string[];
  accesiblePMR: boolean;
  tipo: 'garage_privado' | 'comercial' | 'calle';
  horario: string;
  vehiculosPermitidos: TipoVehiculo[];
  zonaValidada?: boolean;
  zonaId?: string;
  // Campos para gestión de garajes del anfitrión
  claimedFromId?: number; // ID del parqueo estático del que se reclamó (para copias en userParkings)
  claimedBy?: string; // Nombre del propietario que reclamó este parqueo
  ownerId?: string; // ID del dueño del garaje (para perfil)
  ownerName?: string; // Nombre del dueño del garaje
  ownerPhoto?: string; // Foto del dueño
  isActive?: boolean; // Si el garaje está activo o pausado
  isPending?: boolean; // Si está pendiente de verificación (creado desde cero)
  // Campos de verificación
  verificationDocs?: {
    cedula?: string; // URL/nombre del archivo de cédula
    document?: string; // URL/nombre del documento (planilla/escritura)
    submittedAt?: string; // Fecha de envío
  };
}

export interface IReview {
  usuario: string;
  fecha: string;
  calificacion: number;
  comentario: string;
  avatar: string;
}

export interface IReserva {
  id: string;
  parqueoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'activa' | 'completada' | 'pending' | 'rejected';
  vehiculo: TipoVehiculo;
  placa: string;
}

export interface IFiltros {
  soloVerificados: boolean;
  distancia: number;
  accesiblePMR: boolean;
  precioMax: number;
  tipoVehiculo: TipoVehiculo;
  soloZonasValidadas?: boolean;
}

export interface IUsuario {
  lat: number;
  lng: number;
}

// ========== FASE 2: Perfiles Públicos y Confianza ==========

export interface IUserProfile {
  id: string;
  nombre: string;
  email: string;
  foto: string;
  ubicacion?: string;
  fechaRegistro: string;
  rol: 'conductor' | 'anfitrion' | 'ambos';
  verificado: boolean;
  telefono?: string;
  bio?: string;
  estadisticas: {
    reservasCompletadas: number;
    reservasRecibidas?: number;
    calificacionPromedio: number;
    totalResenas: number;
    tiempoRespuesta?: string;
  };
}

export interface IRating {
  id: string;
  fromUserId: string;
  toUserId: string;
  reservaId: string;
  tipo: 'conductor_a_anfitrion' | 'anfitrion_a_conductor';
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  fecha: string;
  fromUserName?: string;
  fromUserPhoto?: string;
}

export type RazonReporte =
  | 'comportamiento_inapropiado'
  | 'danos_propiedad'
  | 'no_se_presento'
  | 'informacion_falsa'
  | 'spam'
  | 'otro';

export interface IReport {
  id: string;
  reportadoPorId: string;
  reportadoAId: string;
  razon: RazonReporte;
  descripcion?: string;
  fecha: string;
  status: 'pendiente' | 'revisado';
}

// ========== FASE 3: Sistema de Mensajes ==========

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderType?: 'driver' | 'host' | 'support'; // Nuevo campo para identificar el rol del remitente
  content: string;
  timestamp: string;
  isRead: boolean;
  isFromCurrentUser?: boolean; // Ahora opcional/calculado
}

export interface IConversation {
  id: string;
  type: 'host' | 'driver' | 'support';
  participantId: string;
  participantName: string;
  participantPhoto?: string;
  // Campos para identificar ambas partes en chats reales
  driverId?: string;
  driverName?: string;
  driverPhoto?: string;
  hostId?: string;
  hostName?: string;
  hostPhoto?: string;
  // Otros campos
  reservaId?: string;
  parkingId?: number;
  parkingName?: string;
  parkingPhoto?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  unreadCountDriver?: number; // Nuevo: contador específico para conductor
  unreadCountHost?: number;   // Nuevo: contador específico para anfitrión
  isActive: boolean;
  isRealChat?: boolean; // true = chat real sin auto-reply (garaje reclamado/creado), false/undefined = mock con auto-reply
}

// ========== FASE 4: Eventos ==========

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  locationName: string;
  lat: number;
  lng: number;
  image: string;
  priceSurge: number; // Multiplicador de precio (ej: 1.5)
  radiusKm: number; // Radio de efecto en km
  type: 'concert' | 'food' | 'sport' | 'other';
  attendees: number; // Para social proof
  endTime?: string;
}
