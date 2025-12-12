import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostLayout } from '../../components/host/HostLayout';
import { useHost, HostRequest } from '../../context/HostContext';
import { useAuth } from '../../context/AuthContext';
import { useParkingContext } from '../../context/ParkingContext';
import { useRating } from '../../context/RatingContext';
import { useReport } from '../../context/ReportContext';
import { useChatContext } from '../../context/ChatContext';
import { RatingModal } from '../../components/rating/RatingModal';
import { ReportModal } from '../../components/report/ReportModal';
import { getRandomDriverInitialMessage } from '../../data/chatMock';
import {
  DollarSign, Calendar, Star, Check, X, User, Car, LogOut,
  Clock, ChevronDown, Shield, RotateCcw, TrendingUp,
  Home, Flag
} from 'lucide-react';

type TabType = 'pending' | 'in-progress' | 'completed' | 'history';

export default function HostDashboard() {
  const navigate = useNavigate();
  const {
    stats, requests, handleRequest, isOnline, toggleOnline, addRequest, toggleHostMode,
    historyRequests, recoverRequest, todayStats, generateRequestForParking, updateRequestStatus
  } = useHost();
  const { user, logout } = useAuth();
  const { userParkings } = useParkingContext();
  const { createConversationFromRequest, sendInitialMessage } = useChatContext();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [filterParkingId, setFilterParkingId] = useState<number | 'all'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Estado para modales de calificación y reporte
  const [ratingRequest, setRatingRequest] = useState<HostRequest | null>(null);
  const [reportRequest, setReportRequest] = useState<HostRequest | null>(null);
  const { addRating, hasRatedReserva } = useRating();
  const { addReport, hasReportedUser } = useReport();

  // Countdowns para recovery (60s)
  const [, forceUpdate] = useState(0);

  // userParkings YA incluye los garajes creados + reclamados (viene del contexto combinado)
  // No necesitamos volver a agregar los claimedParkings
  const allMyGarages = useMemo(() => {
    return userParkings;
  }, [userParkings]);

  // Obtener solo los garajes ACTIVOS (para generar solicitudes y contador)
  const activeGarages = useMemo(() => {
    return allMyGarages.filter(p => p.isActive !== false);
  }, [allMyGarages]);

  // Generar solicitudes automáticas cada 10 segundos si está online (SOLO para garajes activos)
  useEffect(() => {
    if (!isOnline || activeGarages.length === 0) return;

    // Función para obtener IDs de conductores con solicitudes activas para un garaje
    const getUsedDriverIds = (parkingId: number): string[] => {
      return requests
        .filter(r => r.parkingId === parkingId && (r.status === 'pending' || r.status === 'accepted' || r.status === 'in-progress'))
        .map(r => r.driverId)
        .filter((id): id is string => id !== undefined);
    };

    // Generar primera solicitud después de 5 segundos
    const initialTimeout = setTimeout(() => {
      const randomGarage = activeGarages[Math.floor(Math.random() * activeGarages.length)];
      const usedDriverIds = getUsedDriverIds(randomGarage.id);
      const newRequest = generateRequestForParking(randomGarage, usedDriverIds);
      if (newRequest) {
        addRequest(newRequest);
      }
    }, 5000);

    // Luego cada 10 segundos
    const interval = setInterval(() => {
      const randomGarage = activeGarages[Math.floor(Math.random() * activeGarages.length)];
      const usedDriverIds = getUsedDriverIds(randomGarage.id);
      const newRequest = generateRequestForParking(randomGarage, usedDriverIds);
      if (newRequest) {
        addRequest(newRequest);
      }
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isOnline, activeGarages, addRequest, generateRequestForParking, requests]);

  // Actualizar countdowns cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Verificar y actualizar solicitudes "en curso" que ya terminaron
  useEffect(() => {
    const interval = setInterval(() => {
      requests.forEach(req => {
        if (req.status === 'in-progress') {
          const endTime = new Date(req.endTime).getTime();
          if (Date.now() >= endTime) {
            updateRequestStatus(req.id, 'completed');
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [requests, updateRequestStatus]);

  const handleSwitchToDriver = () => {
    toggleHostMode();
    navigate('/home');
  };

  const handleLogout = () => {
    logout();
    navigate('/signup?mode=login');
  };

  // Manejar aceptar/rechazar con feedback visual
  const handleRequestAction = (id: string, action: 'accept' | 'reject') => {
    const request = requests.find(r => r.id === id);
    handleRequest(id, action);

    if (action === 'accept' && request) {
      const netEarning = (request.totalPrice * 0.9).toFixed(2);
      setToast({ message: `+$${netEarning} ganados (neto)`, type: 'success' });

      // Crear conversación con el conductor
      if (request.driverId) {
        const conversation = createConversationFromRequest({
          driverId: request.driverId,
          driverName: request.driverName,
          driverPhoto: request.driverImage,
          parkingId: request.parkingId,
          parkingName: request.parkingName,
          requestId: request.id,
        });

        // El conductor envía un mensaje inicial automático
        setTimeout(() => {
          sendInitialMessage(
            conversation.id,
            getRandomDriverInitialMessage(),
            { id: request.driverId!, name: request.driverName, photo: request.driverImage }
          );
        }, 1000);
      }
    } else {
      setToast({ message: 'Solicitud rechazada - 60s para recuperar', type: 'error' });
    }

    setTimeout(() => setToast(null), 2500);
  };

  // Manejar recuperación de solicitud rechazada
  const handleRecover = (id: string) => {
    recoverRequest(id);
    setToast({ message: 'Solicitud recuperada', type: 'success' });
    setTimeout(() => setToast(null), 2000);
  };

  // Filtrar solicitudes por garaje
  const filteredRequests = useMemo(() => {
    let list = requests;
    if (filterParkingId !== 'all') {
      list = list.filter(r => r.parkingId === filterParkingId);
    }
    return list;
  }, [requests, filterParkingId]);

  // Solicitudes por tab
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const inProgressRequests = filteredRequests.filter(r => r.status === 'in-progress');
  const completedRequests = filteredRequests.filter(r => r.status === 'completed');

  // Historial filtrado también por garaje
  const filteredHistory = useMemo(() => {
    let list = historyRequests;
    if (filterParkingId !== 'all') {
      list = list.filter(r => r.parkingId === filterParkingId);
    }
    return list;
  }, [historyRequests, filterParkingId]);

  // Calcular tiempo restante para recovery
  const getRecoveryTimeLeft = (rejectedAt?: number): number => {
    if (!rejectedAt) return 0;
    const elapsed = Date.now() - rejectedAt;
    return Math.max(0, 60 - Math.floor(elapsed / 1000));
  };

  // Calcular tiempo restante para solicitud "en curso"
  const getTimeRemaining = (endTime: string): string => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Finalizada';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Renderizar tarjeta de solicitud
  const renderRequestCard = (req: HostRequest, showRecovery = false) => {
    const recoveryTime = showRecovery ? getRecoveryTimeLeft(req.rejectedAt) : 0;

    return (
      <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        {/* Información del garaje */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          {req.parkingPhoto ? (
            <img src={req.parkingPhoto} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Home size={14} className="text-emerald-600" />
            </div>
          )}
          <span className="text-xs font-medium text-slate-600">{req.parkingName}</span>
        </div>

        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <img
              src={req.driverImage || `https://ui-avatars.com/api/?name=${req.driverName}`}
              alt={req.driverName}
              className={`w-10 h-10 rounded-full bg-slate-100 object-cover ${req.driverId ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition' : ''}`}
              onClick={() => req.driverId && navigate(`/perfil/${req.driverId}`)}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`font-semibold text-slate-800 ${req.driverId ? 'cursor-pointer hover:text-blue-600 transition' : ''}`}
                  onClick={() => req.driverId && navigate(`/perfil/${req.driverId}`)}
                >
                  {req.driverName}
                </h3>
                {req.driverVerified && (
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    <Shield size={10} /> Verificado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{req.vehicleModel} • {req.vehiclePlate}</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
            req.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
              req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-emerald-100 text-emerald-700'
            }`}>
            {req.status === 'pending' ? 'Pendiente' :
              req.status === 'in-progress' ? 'En curso' :
                req.status === 'rejected' ? 'Rechazada' : 'Completada'}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded-lg mb-3">
          <span className="text-slate-600">
            {new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
            {new Date(req.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="font-bold text-emerald-700">${req.totalPrice.toFixed(2)}</span>
        </div>

        {/* Countdown para "En curso" */}
        {req.status === 'in-progress' && (
          <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 rounded-lg mb-3">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Termina en {getTimeRemaining(req.endTime)}
            </span>
          </div>
        )}

        {/* Botones de acción para pendientes */}
        {req.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleRequestAction(req.id, 'reject')}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-95 transition-transform"
            >
              <X size={16} /> Rechazar
            </button>
            <button
              onClick={() => handleRequestAction(req.id, 'accept')}
              className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm flex items-center justify-center gap-1 hover:bg-emerald-700 active:scale-95 transition-transform"
            >
              <Check size={16} /> Aceptar
            </button>
          </div>
        )}

        {/* Botón de recuperación para historial */}
        {showRecovery && recoveryTime > 0 && (
          <button
            onClick={() => handleRecover(req.id)}
            className="w-full py-2 rounded-xl border-2 border-amber-400 text-amber-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-amber-50 active:scale-95 transition-transform"
          >
            <RotateCcw size={16} />
            Recuperar ({recoveryTime}s)
          </button>
        )}

        {/* Botones para solicitudes en curso o completadas */}
        {(req.status === 'in-progress' || req.status === 'completed') && (
          <div className="flex gap-2 mt-2">
            {/* Reportar - solo si no ya reportado */}
            {req.driverId && !hasReportedUser(user?.id || '', req.driverId) ? (
              <button
                onClick={() => setReportRequest(req)}
                className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 font-medium text-sm flex items-center justify-center gap-1 hover:bg-red-50 active:scale-95 transition-transform"
              >
                <Flag size={14} /> Reportar
              </button>
            ) : req.driverId && (
              <span className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-500 font-medium text-sm flex items-center justify-center gap-1">
                <Flag size={14} /> Ya reportado
              </span>
            )}
            {/* Calificar - solo para completadas y si no ya calificó */}
            {req.status === 'completed' && req.driverId && (
              hasRatedReserva(user?.id || '', req.id) ? (
                <span className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-500 font-medium text-sm flex items-center justify-center gap-1">
                  <Star size={14} /> Ya calificaste
                </span>
              ) : (
                <button
                  onClick={() => setRatingRequest(req)}
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-white font-medium text-sm flex items-center justify-center gap-1 hover:bg-amber-600 active:scale-95 transition-transform"
                >
                  <Star size={14} /> Calificar
                </button>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <HostLayout showNav>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-emerald-900">Hola, Anfitrión</h1>
          <p className="text-sm text-slate-500">Gestiona tu garaje</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
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
          <button
            onClick={() => navigate('/perfil')}
            className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition cursor-pointer"
          >
            <User className="text-emerald-700" size={20} />
          </button>
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
              {isOnline
                ? `${activeGarages.length} garaje${activeGarages.length !== 1 ? 's' : ''} activo${activeGarages.length !== 1 ? 's' : ''}`
                : 'Activa para recibir solicitudes'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleOnline}
          disabled={activeGarages.length === 0}
          className={`w-14 h-8 rounded-full transition-colors relative ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'
            } ${activeGarages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${isOnline ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* Estadísticas del día */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-2xl border border-emerald-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-600" />
          Estadísticas de Hoy
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <span className="text-lg font-bold text-slate-800">{todayStats.requests}</span>
            <p className="text-[10px] text-slate-500">Solicitudes</p>
          </div>
          <div>
            <span className="text-lg font-bold text-emerald-600">{todayStats.accepted}</span>
            <p className="text-[10px] text-slate-500">Aceptadas</p>
          </div>
          <div>
            <span className="text-lg font-bold text-emerald-700">${todayStats.earnings.toFixed(2)}</span>
            <p className="text-[10px] text-slate-500">Ganado</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-blue-600 flex items-center gap-0.5">
              {todayStats.acceptanceRate}%
            </span>
            <p className="text-[10px] text-slate-500">Tasa</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-8 h-8 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-2">
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <span className="text-lg font-bold text-slate-800">${stats.earnings.toFixed(2)}</span>
          <p className="text-[10px] text-slate-500">Total Ganancias</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Calendar size={16} className="text-blue-600" />
          </div>
          <span className="text-lg font-bold text-slate-800">{stats.activeReservations}</span>
          <p className="text-[10px] text-slate-500">En Curso</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
            <Star size={16} className="text-amber-600" />
          </div>
          <span className="text-lg font-bold text-slate-800">{stats.rating}</span>
          <p className="text-[10px] text-slate-500">Rating</p>
        </div>
      </div>

      {/* Tabs + Filtro */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            Pendientes
            {pendingRequests.length > 0 && (
              <span className="ml-1 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'in-progress'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            En Curso
            {inProgressRequests.length > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {inProgressRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'completed'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            Completadas
            {completedRequests.length > 0 && (
              <span className="ml-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {completedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history'
              ? 'bg-white text-slate-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            Historial
            {filteredHistory.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {filteredHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtro por garaje - Solo garajes ACTIVOS */}
        {activeGarages.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            >
              <Home size={14} />
              {filterParkingId === 'all' ? 'Todos' : activeGarages.find(g => g.id === filterParkingId)?.nombre?.slice(0, 12) || 'Filtrar'}
              <ChevronDown size={14} />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[160px] py-1">
                <button
                  onClick={() => { setFilterParkingId('all'); setShowFilterDropdown(false); }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${filterParkingId === 'all' ? 'text-emerald-600 font-medium' : 'text-slate-600'
                    }`}
                >
                  Todos los garajes
                </button>
                {activeGarages.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { setFilterParkingId(g.id); setShowFilterDropdown(false); }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${filterParkingId === g.id ? 'text-emerald-600 font-medium' : 'text-slate-600'
                      }`}
                  >
                    {g.foto ? (
                      <img src={g.foto} alt="" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-slate-100" />
                    )}
                    {g.nombre.length > 15 ? g.nombre.slice(0, 15) + '...' : g.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido según tab */}
      <div className="space-y-3 pb-4">
        {activeTab === 'pending' && (
          <>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
                <p>No hay solicitudes pendientes</p>
                {!isOnline && <p className="text-xs mt-2">Activa el modo "Recibiendo Reservas"</p>}
                {isOnline && activeGarages.length === 0 && (
                  <p className="text-xs mt-2">Crea o reclama un garaje primero</p>
                )}
              </div>
            ) : (
              pendingRequests.map(req => renderRequestCard(req))
            )}
          </>
        )}

        {activeTab === 'in-progress' && (
          <>
            {inProgressRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
                <Clock size={32} className="mx-auto mb-2 text-slate-300" />
                <p>No hay reservas en curso</p>
              </div>
            ) : (
              inProgressRequests.map(req => renderRequestCard(req))
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {completedRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
                <Check size={32} className="mx-auto mb-2 text-slate-300" />
                <p>No hay reservas completadas</p>
                <p className="text-xs mt-2">Las reservas aparecen aquí cuando terminan</p>
              </div>
            ) : (
              completedRequests.map(req => renderRequestCard(req))
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
                <RotateCcw size={32} className="mx-auto mb-2 text-slate-300" />
                <p>Historial vacío</p>
                <p className="text-xs mt-2">Las solicitudes rechazadas aparecen aquí por 60 segundos</p>
              </div>
            ) : (
              filteredHistory.map(req => renderRequestCard(req, true))
            )}
          </>
        )}
      </div>

      {/* Toast de feedback */}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-3 rounded-full shadow-lg text-sm font-semibold z-50 animate-bounce ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
          }`}>
          {toast.message}
        </div>
      )}

      {/* Modal de calificación */}
      <RatingModal
        isOpen={!!ratingRequest}
        onClose={() => setRatingRequest(null)}
        onSubmit={(data) => {
          if (ratingRequest && user && ratingRequest.driverId) {
            addRating({
              fromUserId: user.id,
              toUserId: ratingRequest.driverId,
              reservaId: ratingRequest.id,
              tipo: 'anfitrion_a_conductor',
              estrellas: data.estrellas,
              comentario: data.comentario,
              fromUserName: user.nombre,
              fromUserPhoto: user.avatar,
            });
            setToast({ message: '¡Gracias por tu calificación!', type: 'success' });
            setTimeout(() => setToast(null), 2500);
          }
          setRatingRequest(null);
        }}
        targetName={ratingRequest?.driverName || ''}
        tipo="conductor"
      />

      {/* Modal de reporte */}
      <ReportModal
        isOpen={!!reportRequest}
        onClose={() => setReportRequest(null)}
        onSubmit={(data) => {
          if (reportRequest && user && reportRequest.driverId) {
            addReport({
              reportadoPorId: user.id,
              reportadoAId: reportRequest.driverId,
              razon: data.razon,
              descripcion: data.descripcion,
            });
            setToast({ message: 'Reporte enviado. ¡Gracias por ayudar!', type: 'success' });
            setTimeout(() => setToast(null), 2500);
          }
          setReportRequest(null);
        }}
        targetName={reportRequest?.driverName || ''}
      />
    </HostLayout>
  );
}
