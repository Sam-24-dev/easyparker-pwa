import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ParkingProvider } from './context/ParkingContext';
import { ReservaProvider } from './context/ReservaContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { HostProvider } from './context/HostContext';
import { ProfileProvider } from './context/ProfileContext';
import { RatingProvider } from './context/RatingContext';
import { ReportProvider } from './context/ReportContext';
import { ChatProvider } from './context/ChatContext';
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
import { Profile } from './pages/Profile';
import { Mensajes } from './pages/Mensajes';
import { ChatView } from './pages/ChatView';
// Host Pages
import HostDashboard from './pages/host/HostDashboard';
import HostGarage from './pages/host/HostGarage';
import HostWallet from './pages/host/HostWallet';
import HostMensajes from './pages/host/HostMensajes';
import HostChatView from './pages/host/HostChatView';

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

        {/* Ruta de Mensajes (Conductor) */}
        <Route
          path="/mensajes"
          element={
            <ProtectedRoute>
              <Mensajes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mensajes/:conversationId"
          element={
            <ProtectedRoute>
              <ChatView />
            </ProtectedRoute>
          }
        />

        {/* Ruta de Perfil */}
        <Route
          path="/perfil/:userId?"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Rutas del Modo Anfitrión */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/garage"
          element={
            <ProtectedRoute>
              <HostGarage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/wallet"
          element={
            <ProtectedRoute>
              <HostWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/mensajes/:conversationId"
          element={
            <ProtectedRoute>
              <HostChatView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/mensajes"
          element={
            <ProtectedRoute>
              <HostMensajes />
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
        <ProfileProvider>
          <RatingProvider>
            <ReportProvider>
              <ParkingProvider>
                <FavoritesProvider>
                  <ReservaProvider>
                    <HostProvider>
                      <ChatProvider>
                        <AppRoutes />
                      </ChatProvider>
                    </HostProvider>
                  </ReservaProvider>
                </FavoritesProvider>
              </ParkingProvider>
            </ReportProvider>
          </RatingProvider>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
