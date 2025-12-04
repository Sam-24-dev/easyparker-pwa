import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ParkingProvider } from './context/ParkingContext';
import { ReservaProvider } from './context/ReservaContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import SignUp from './pages/SignUp';
import { Home } from './pages/Home';
import { Buscar } from './pages/Buscar';
import { Detalle } from './pages/Detalle';
import { Reservar } from './pages/Reservar';
import { MisReservas } from './pages/MisReservas';
import { Favoritos } from './pages/Favoritos';

function AppRoutes() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Ruta raíz - Siempre muestra Splash primero */}
        <Route path="/" element={<Splash />} />

        {/* Rutas públicas (auth flow) */}
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Rutas protegidas (requieren autenticación) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buscar"
          element={
            <ProtectedRoute>
              <Buscar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parqueo/:id"
          element={
            <ProtectedRoute>
              <Detalle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservar/:id"
          element={
            <ProtectedRoute>
              <Reservar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute>
              <MisReservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favoritos"
          element={
            <ProtectedRoute>
              <Favoritos />
            </ProtectedRoute>
          }
        />

        {/* Redirigir cualquier ruta desconocida a splash */}
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ParkingProvider>
          <FavoritesProvider>
            <ReservaProvider>
              <AppRoutes />
            </ReservaProvider>
          </FavoritesProvider>
        </ParkingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
