import { IReserva } from '../types/index';

export const reservasMock: IReserva[] = [
  {
    id: "EP-12345",
    parqueoId: 1,
    fecha: "2025-11-11",
    horaInicio: "14:30",
    horaFin: "16:30",
    estado: "activa",
    vehiculo: "Auto",
    placa: "GAC-2345"
  },
  {
    id: "EP-12344",
    parqueoId: 3,
    fecha: "2025-11-10",
    horaInicio: "10:00",
    horaFin: "12:00",
    estado: "completada",
    vehiculo: "Moto",
    placa: "IYB-9081"
  }
];
