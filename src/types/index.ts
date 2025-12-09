export type TipoVehiculo = 'Auto' | 'Moto';

export interface IParking {
  id: number;
  nombre: string;
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
  isActive?: boolean; // Si el garaje está activo o pausado
  isPending?: boolean; // Si está pendiente de verificación (creado desde cero)
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
  estado: 'activa' | 'completada';
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
