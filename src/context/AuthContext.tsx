import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'easyparker-users-db';
const CURRENT_USER_KEY = 'easyparker-current-user';

const DEFAULT_USERS: Record<string, User> = {
  'demo@easyparker.com': {
    id: 'demo-user-1',
    nombre: 'Samir Demo',
    email: 'demo@easyparker.com',
    avatar: 'https://ui-avatars.com/api/?name=Samir+Demo&background=4F46E5&color=fff',
  },
};

const readUsers = (): Record<string, User> => {
  try {
    const usersDB = localStorage.getItem(USERS_DB_KEY);
    if (usersDB) {
      return JSON.parse(usersDB);
    }
  } catch (error) {
    console.warn('No se pudo leer la DB de usuarios', error);
  }
  return {};
};

const persistUsers = (users: Record<string, User>) => {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('No se pudo guardar la DB de usuarios', error);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const storedUsers = readUsers();
    const mergedUsers = { ...DEFAULT_USERS, ...storedUsers };
    persistUsers(mergedUsers);

    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validación básica
        if (email && password.length >= 6) {
          // Buscar usuario en la base de datos
          const users = readUsers();
          
          if (users[email]) {
            // Usuario encontrado - login exitoso
            const mockUser = users[email];
            setUser(mockUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
            resolve();
          } else {
            // Usuario NO existe - rechazar login
            reject(new Error('Usuario no encontrado. Por favor regístrate primero.'));
          }
        } else {
          reject(new Error('Email o contraseña inválidos'));
        }
      }, 800);
    });
  };

  const signup = async (nombre: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validación básica
        if (nombre && email && password.length >= 6) {
          const users = readUsers();
          if (users[email]) {
            reject(new Error('Este correo ya está registrado. Inicia sesión.'));
            return;
          }
          // Crear usuario
          const mockUser: User = {
            id: Date.now().toString(),
            nombre: nombre,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${nombre}&background=4F46E5&color=fff`,
          };
          
          users[email] = mockUser;
          persistUsers(users);
          
          // Guardar como usuario actual
          setUser(mockUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Datos inválidos. El password debe tener al menos 6 caracteres.'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
