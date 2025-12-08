import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostLayout } from '../../components/host/HostLayout';
import { useHost } from '../../context/HostContext';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Calendar, Star, Check, X, User, Car, LogOut } from 'lucide-react';

// Generador de solicitudes aleatorias
const generateRandomRequest = () => {
  const names = ['Juan Pérez', 'María López', 'Carlos Ruiz', 'Ana Torres', 'Luis Gómez', 'Sofía Vargas'];
  const vehicles = [
    { model: 'Chevrolet Aveo', plate: 'GBA-1234' },
    { model: 'Kia Rio', plate: 'GTC-5678' },
    { model: 'Hyundai Tucson', plate: 'GSB-9012' },
    { model: 'Chevrolet Spark', plate: 'GDA-3456' },
    { model: 'Toyota Yaris', plate: 'GEF-7890' },
  ];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
  const now = new Date();
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return {
    id: `req-${Date.now()}`,
    driverName: randomName,
    driverImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=random`,
    vehicleModel: randomVehicle.model,
    vehiclePlate: randomVehicle.plate,
    startTime: now.toISOString(),
    endTime: endTime.toISOString(),
    totalPrice: parseFloat((Math.random() * 5 + 2).toFixed(2)),
    status: 'pending' as const,
    timestamp: 'Ahora'
  };
};

export default function HostDashboard() {
  const navigate = useNavigate();
  const { stats, requests, handleRequest, isOnline, toggleOnline, addRequest, toggleHostMode } = useHost();
  const { user, logout } = useAuth();

  // Generar solicitudes automáticas cada 15 segundos si está online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      const newRequest = generateRandomRequest();
      addRequest(newRequest);
    }, 15000);

    return () => clearInterval(interval);
  }, [isOnline, addRequest]);

  const handleSwitchToDriver = () => {
    toggleHostMode();
    navigate('/home');
  };

  const handleLogout = () => {
    logout();
    navigate('/signup?mode=login');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <HostLayout showNav>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Hola, Anfitrión</h1>
          <p className="text-sm text-slate-500">Gestiona tu garaje</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón Conductor - Solo si también es driver */}
          {user?.roles?.driver === true && (
            <button 
              onClick={handleSwitchToDriver}
              className="text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition"
            >
              <Car size={14} className="inline mr-1" />
              Conductor
            </button>
          )}
          {/* Botón Salir */}
          <button 
            onClick={handleLogout}
            className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition"
          >
            <LogOut size={14} className="inline mr-1" />
            Salir
          </button>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="text-emerald-700" size={20} />
          </div>
        </div>
      </div>

      {/* Toggle Online/Offline */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <h3 className="font-semibold text-slate-800">
              {isOnline ? 'Recibiendo Reservas' : 'No disponible'}
            </h3>
            <p className="text-xs text-slate-500">
              {isOnline ? 'Tu garaje es visible para conductores' : 'Activa para recibir solicitudes'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleOnline}
          className={`w-14 h-8 rounded-full transition-colors relative ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${isOnline ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-8 h-8 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-2">
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <span className="text-lg font-bold text-slate-800">${stats.earnings.toFixed(2)}</span>
          <p className="text-[10px] text-slate-500">Ganancias</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Calendar size={16} className="text-blue-600" />
          </div>
          <span className="text-lg font-bold text-slate-800">{stats.activeReservations}</span>
          <p className="text-[10px] text-slate-500">Reservas</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
            <Star size={16} className="text-amber-600" />
          </div>
          <span className="text-lg font-bold text-slate-800">{stats.rating}</span>
          <p className="text-[10px] text-slate-500">Rating</p>
        </div>
      </div>

      {/* Solicitudes */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          Solicitudes
          {isOnline && pendingRequests.length > 0 && (
            <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingRequests.length} nuevas
            </span>
          )}
        </h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <p>No hay solicitudes pendientes</p>
            {!isOnline && <p className="text-xs mt-2">Activa el modo "Recibiendo Reservas"</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={req.driverImage || `https://ui-avatars.com/api/?name=${req.driverName}`} 
                      alt={req.driverName}
                      className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{req.driverName}</h3>
                      <p className="text-xs text-slate-500">{req.vehicleModel} • {req.vehiclePlate}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status === 'pending' ? 'Pendiente' : req.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded-lg mb-3">
                  <span className="text-slate-600">
                    {new Date(req.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                    {new Date(req.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="font-bold text-emerald-700">${req.totalPrice.toFixed(2)}</span>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequest(req.id, 'reject')}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm flex items-center justify-center gap-1 hover:bg-slate-50"
                    >
                      <X size={16} /> Rechazar
                    </button>
                    <button 
                      onClick={() => handleRequest(req.id, 'accept')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm flex items-center justify-center gap-1 hover:bg-emerald-700"
                    >
                      <Check size={16} /> Aceptar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </HostLayout>
  );
}
