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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('easyparker-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validación básica "cortina de humo"
        if (email && password.length >= 6) {
          const mockUser: User = {
            id: Date.now().toString(),
            nombre: email.split('@')[0],
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=4F46E5&color=fff`,
          };
          setUser(mockUser);
          localStorage.setItem('easyparker-user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Credenciales inválidas'));
        }
      }, 800); // Simular delay de red
    });
  };

  const signup = async (nombre: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validación básica
        if (nombre && email && password.length >= 6) {
          const mockUser: User = {
            id: Date.now().toString(),
            nombre: nombre,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${nombre}&background=4F46E5&color=fff`,
          };
          setUser(mockUser);
          localStorage.setItem('easyparker-user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Datos inválidos. El password debe tener al menos 6 caracteres.'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('easyparker-user');
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
