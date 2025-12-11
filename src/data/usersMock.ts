import { IUserProfile } from '../types';

// Usuarios ficticios para pruebas
export const usersMock: IUserProfile[] = [
    // ========== CONDUCTORES TOP (verificados, muchas reservas) ==========
    {
        id: 'user-conductor-top',
        nombre: 'Carlos Mendoza',
        email: 'carlos@example.com',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Guayaquil, Ecuador',
        fechaRegistro: '2022-03-15',
        rol: 'ambos',
        verificado: true,
        telefono: '+593 99 123 4567',
        bio: 'Conductor frecuente y anfitrión de 2 garajes. Me encanta mantener todo en orden y dar buen servicio.',
        estadisticas: {
            reservasCompletadas: 47,
            reservasRecibidas: 23,
            calificacionPromedio: 4.8,
            totalResenas: 35,
            tiempoRespuesta: '< 5 min',
        },
    },
    {
        id: 'driver-top-2',
        nombre: 'Andrea López',
        email: 'andrea@example.com',
        foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Guayaquil, Ecuador',
        fechaRegistro: '2022-08-10',
        rol: 'conductor',
        verificado: true,
        telefono: '+593 99 234 5678',
        bio: 'Profesional del volante, siempre puntual y cuidadosa con los espacios.',
        estadisticas: {
            reservasCompletadas: 38,
            calificacionPromedio: 4.9,
            totalResenas: 28,
        },
    },
    // ========== CONDUCTORES NORMALES (verificados, algunas reservas) ==========
    {
        id: 'user-test',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Guayaquil, Ecuador',
        fechaRegistro: '2023-06-20',
        rol: 'conductor',
        verificado: true,
        telefono: '+593 98 765 4321',
        bio: 'Busco siempre los mejores lugares para estacionar cerca del trabajo.',
        estadisticas: {
            reservasCompletadas: 12,
            calificacionPromedio: 4.5,
            totalResenas: 8,
        },
    },
    {
        id: 'driver-normal-2',
        nombre: 'Roberto Silva',
        email: 'roberto@example.com',
        foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Samborondón, Ecuador',
        fechaRegistro: '2023-09-15',
        rol: 'conductor',
        verificado: true,
        bio: 'Conductor del día a día, busco parqueo seguro.',
        estadisticas: {
            reservasCompletadas: 8,
            calificacionPromedio: 4.3,
            totalResenas: 5,
        },
    },
    // ========== CONDUCTORES NUEVOS (sin verificar, pocas reservas) ==========
    {
        id: 'driver-new-1',
        nombre: 'Laura Martínez',
        email: 'laura@example.com',
        foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Guayaquil, Ecuador',
        fechaRegistro: '2024-12-01',
        rol: 'conductor',
        verificado: false,
        bio: 'Nueva en la app, buscando buenos lugares para estacionar.',
        estadisticas: {
            reservasCompletadas: 1,
            calificacionPromedio: 0,
            totalResenas: 0,
        },
    },
    {
        id: 'driver-new-2',
        nombre: 'Miguel Torres',
        email: 'miguel@example.com',
        foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Daule, Ecuador',
        fechaRegistro: '2024-12-05',
        rol: 'conductor',
        verificado: false,
        estadisticas: {
            reservasCompletadas: 0,
            calificacionPromedio: 0,
            totalResenas: 0,
        },
    },
    // ========== ANFITRIONES (dueños de garajes) ==========
    {
        id: 'user-anfitrion-nuevo',
        nombre: 'María García',
        email: 'maria@example.com',
        foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Samborondón, Ecuador',
        fechaRegistro: '2024-10-01',
        rol: 'anfitrion',
        verificado: false,
        bio: 'Tengo un garaje disponible en zona residencial segura.',
        estadisticas: {
            reservasCompletadas: 0,
            reservasRecibidas: 3,
            calificacionPromedio: 4.0,
            totalResenas: 2,
            tiempoRespuesta: '< 30 min',
        },
    },
    {
        id: 'host-premium',
        nombre: 'Fernando Reyes',
        email: 'fernando@example.com',
        foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Urdesa, Guayaquil',
        fechaRegistro: '2021-05-20',
        rol: 'anfitrion',
        verificado: true,
        telefono: '+593 99 876 5432',
        bio: 'Propietario de varios estacionamientos en zona comercial. Servicio garantizado.',
        estadisticas: {
            reservasCompletadas: 0,
            reservasRecibidas: 156,
            calificacionPromedio: 4.9,
            totalResenas: 89,
            tiempoRespuesta: '< 5 min',
        },
    },
    {
        id: 'host-ceibos',
        nombre: 'Patricia Morales',
        email: 'patricia@example.com',
        foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        ubicacion: 'Los Ceibos, Guayaquil',
        fechaRegistro: '2023-01-10',
        rol: 'anfitrion',
        verificado: true,
        bio: 'Mi garaje es tu garaje. Zona segura con vigilancia.',
        estadisticas: {
            reservasCompletadas: 0,
            reservasRecibidas: 42,
            calificacionPromedio: 4.6,
            totalResenas: 28,
            tiempoRespuesta: '< 15 min',
        },
    },
];

// Helper para obtener usuario por ID
export const getUserById = (userId: string): IUserProfile | undefined => {
    return usersMock.find(user => user.id === userId);
};

// Helper para generar avatar por defecto
export const getDefaultAvatar = (nombre: string): string => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=4F46E5&color=fff&size=150`;
};

// Helper para calcular tiempo desde registro
export const getTimeAsMember = (fechaRegistro: string): string => {
    const registro = new Date(fechaRegistro);
    const ahora = new Date();
    const diffMs = ahora.getTime() - registro.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Hoy';
    } else if (diffDays === 1) {
        return '1 día';
    } else if (diffDays < 30) {
        return `${diffDays} días`;
    } else if (diffDays < 365) {
        const meses = Math.floor(diffDays / 30);
        return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
        const años = Math.floor(diffDays / 365);
        return `${años} ${años === 1 ? 'año' : 'años'}`;
    }
};
