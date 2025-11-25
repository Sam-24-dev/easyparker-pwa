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
  accesiblePMR: boolean;
  tipo: 'garage_privado' | 'comercial' | 'calle';
  horario: string;
  vehiculosPermitidos: TipoVehiculo[];
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
}

export interface IUsuario {
  lat: number;
  lng: number;
}
