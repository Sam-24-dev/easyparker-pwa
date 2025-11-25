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

const DEFAULT_USERS: Record<string, User> = {
  'demo@easyparker.com': {
    id: 'demo-user-1',
    nombre: 'Samir Demo',
    email: 'demo@easyparker.com',
    avatar: 'https://ui-avatars.com/api/?name=Samir+Demo&background=4F46E5&color=fff',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const usersDB = localStorage.getItem('easyparker-users-db');
    if (usersDB) {
      const storedUsers = JSON.parse(usersDB);
      const mergedUsers = { ...DEFAULT_USERS, ...storedUsers };
      localStorage.setItem('easyparker-users-db', JSON.stringify(mergedUsers));
    } else {
      localStorage.setItem('easyparker-users-db', JSON.stringify(DEFAULT_USERS));
    }

    const currentUser = localStorage.getItem('easyparker-current-user');
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
          const usersDB = localStorage.getItem('easyparker-users-db');
          const users = usersDB ? JSON.parse(usersDB) : {};
          
          if (users[email]) {
            // Usuario encontrado - login exitoso
            const mockUser = users[email];
            setUser(mockUser);
            localStorage.setItem('easyparker-current-user', JSON.stringify(mockUser));
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
          // Crear usuario
          const mockUser: User = {
            id: Date.now().toString(),
            nombre: nombre,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${nombre}&background=4F46E5&color=fff`,
          };
          
          // Guardar en "base de datos" de usuarios
          const usersDB = localStorage.getItem('easyparker-users-db');
          const users = usersDB ? JSON.parse(usersDB) : {};
          users[email] = mockUser;
          localStorage.setItem('easyparker-users-db', JSON.stringify(users));
          
          // Guardar como usuario actual
          setUser(mockUser);
          localStorage.setItem('easyparker-current-user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Datos inválidos. El password debe tener al menos 6 caracteres.'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('easyparker-current-user');
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
