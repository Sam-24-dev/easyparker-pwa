import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUserProfile } from '../types';
import { usersMock, getDefaultAvatar } from '../data/usersMock';
import { useAuth } from './AuthContext';

interface ProfileContextType {
    profiles: IUserProfile[];
    getProfileById: (userId: string) => IUserProfile | undefined;
    getCurrentUserProfile: () => IUserProfile | undefined;
    updateProfile: (userId: string, updates: Partial<IUserProfile>) => void;
    loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILES_KEY = 'easyparker-profiles';

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<IUserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar perfiles al iniciar
    useEffect(() => {
        const loadProfiles = () => {
            try {
                const stored = localStorage.getItem(PROFILES_KEY);
                if (stored) {
                    setProfiles(JSON.parse(stored));
                } else {
                    // Inicializar con datos mock
                    setProfiles(usersMock);
                    localStorage.setItem(PROFILES_KEY, JSON.stringify(usersMock));
                }
            } catch (error) {
                console.warn('Error loading profiles:', error);
                setProfiles(usersMock);
            }
            setLoading(false);
        };
        loadProfiles();
    }, []);

    // Si hay usuario autenticado, asegurar que tenga perfil
    useEffect(() => {
        if (user && !profiles.find(p => p.id === user.id)) {
            const newProfile: IUserProfile = {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                foto: user.avatar || getDefaultAvatar(user.nombre),
                fechaRegistro: new Date().toISOString().split('T')[0],
                rol: user.roles.driver && user.roles.host ? 'ambos' : user.roles.host ? 'anfitrion' : 'conductor',
                verificado: false,
                estadisticas: {
                    reservasCompletadas: 0,
                    calificacionPromedio: 0,
                    totalResenas: 0,
                },
            };
            const updatedProfiles = [...profiles, newProfile];
            setProfiles(updatedProfiles);
            localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
        }
    }, [user, profiles]);

    const getProfileById = (userId: string): IUserProfile | undefined => {
        return profiles.find(p => p.id === userId);
    };

    const getCurrentUserProfile = (): IUserProfile | undefined => {
        if (!user) return undefined;
        return profiles.find(p => p.id === user.id);
    };

    const updateProfile = (userId: string, updates: Partial<IUserProfile>) => {
        const updatedProfiles = profiles.map(p =>
            p.id === userId ? { ...p, ...updates } : p
        );
        setProfiles(updatedProfiles);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
    };

    return (
        <ProfileContext.Provider value={{
            profiles,
            getProfileById,
            getCurrentUserProfile,
            updateProfile,
            loading,
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile debe usarse dentro de ProfileProvider');
    }
    return context;
}
