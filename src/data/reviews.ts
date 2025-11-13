import { IReview } from '../types/index';

export const reviewsVerificados: IReview[] = [
  {
    usuario: "María G.",
    fecha: "Hace 2 días",
    calificacion: 5,
    comentario: "Excelente ubicación y muy seguro. El guardia fue muy amable.",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    usuario: "Carlos R.",
    fecha: "Hace 1 semana",
    calificacion: 5,
    comentario: "Perfecto para estacionar por horas. Siempre hay espacio disponible.",
    avatar: "https://i.pravatar.cc/150?img=12"
  },
  {
    usuario: "Ana L.",
    fecha: "Hace 2 semanas",
    calificacion: 4,
    comentario: "Buen parqueo, aunque un poco caro. Pero vale la pena por la seguridad.",
    avatar: "https://i.pravatar.cc/150?img=5"
  }
];

export const reviewsNoVerificados: IReview[] = [
  {
    usuario: "Pedro M.",
    fecha: "Hace 3 días",
    calificacion: 3,
    comentario: "El precio está bien pero no hay mucha vigilancia.",
    avatar: "https://i.pravatar.cc/150?img=8"
  },
  {
    usuario: "Laura S.",
    fecha: "Hace 1 mes",
    calificacion: 3,
    comentario: "Cumple, pero preferiría uno más cerca de la entrada.",
    avatar: "https://i.pravatar.cc/150?img=9"
  }
];

export function getReviewsByParkingId(verificado: boolean): IReview[] {
  return verificado ? reviewsVerificados : reviewsNoVerificados;
}
