import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostLayout } from '../../components/host/HostLayout';
import { useParkingContext } from '../../context/ParkingContext';
import { IParking, TipoVehiculo } from '../../types';
import { GARAGE_PLACEHOLDER_PHOTOS, AVAILABLE_ZONES, detectZoneFromCoords } from '../../data/hostMock';
import { parkings as staticParkings } from '../../data/parkings';
import { 
  Camera, ShieldCheck, Warehouse, Save, Clock, Car, Bike, 
  Accessibility, DollarSign, Users, CheckCircle, Zap, MapPin, 
  Navigation, Image, Plus, Edit2, Trash2, Eye, ChevronRight,
  Search, X, AlertTriangle, Power, Pause, Building2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Constantes
const MAX_GARAGES = 5;

// Marcador personalizado para el mapa
const garageMarkerIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#10B981;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 3L4 9v12h16V9l-8-6zm6 16h-3v-6H9v6H6v-9l6-4.5 6 4.5v9z"/></svg>
  </div>`,
  className: 'garage-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Componente para actualizar el centro del mapa
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
}

// Componente de Card de Garaje
function GarageCard({ 
  garage, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onView 
}: { 
  garage: IParking; 
  onEdit: () => void; 
  onDelete: () => void;
  onToggleActive: () => void;
  onView: () => void;
}) {
  const isVerified = garage.claimedBy !== undefined || garage.verificado;
  const isActive = garage.isActive !== false; // Por defecto activo

  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      {/* Imagen */}
      <div className="relative h-32">
        <img src={garage.foto} alt={garage.nombre} className="w-full h-full object-cover" />
        
        {/* Badge de estado */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
          isVerified 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {isVerified ? 'Verificado' : 'Pendiente'}
        </div>

        {/* Badge activo/pausado */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-emerald-500 text-white' 
            : 'bg-slate-400 text-white'
        }`}>
          {isActive ? 'Activo' : 'Pausado'}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-slate-800 truncate">{garage.nombre}</h3>
        <p className="text-sm text-slate-500">${garage.precio.toFixed(2)}/hora • {garage.plazasLibres} plazas</p>
        
        {/* Acciones */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={onToggleActive}
            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              isActive 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            {isActive ? <><Pause size={14} /> Pausar</> : <><Power size={14} /> Activar</>}
          </button>
          <button 
            onClick={onView}
            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            title="Ver como conductor"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={onEdit}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de Card "Agregar Nuevo"
function AddGarageCard({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex-shrink-0 w-72 h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${
        disabled 
          ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed' 
          : 'border-emerald-300 bg-emerald-50 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-100'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        disabled ? 'bg-slate-200' : 'bg-emerald-200'
      }`}>
        <Plus size={24} />
      </div>
      <span className="font-medium">Agregar Garaje</span>
      {disabled && (
        <span className="text-xs text-slate-400">Máximo {MAX_GARAGES} garajes</span>
      )}
    </button>
  );
}

export default function HostGarage() {
  const navigate = useNavigate();
  const { addParking, updateParking, removeParking, claimParking, userParkings } = useParkingContext();
  
  // Estados principales
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGarage, setEditingGarage] = useState<IParking | null>(null);
  
  // Estados de modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [garageToDelete, setGarageToDelete] = useState<IParking | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [parkingToClaim, setParkingToClaim] = useState<IParking | null>(null);
  
  // Estado de autocompletado
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<IParking>>({
    nombre: '',
    precio: 0,
    plazasLibres: 1,
    seguridad: [],
    accesiblePMR: false,
    horario: '24 horas',
    vehiculosPermitidos: ['Auto'],
    foto: '',
    lat: 0,
    lng: 0,
    zonaId: '',
    isActive: true,
  });

  // Horario
  const [is24h, setIs24h] = useState(true);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');

  // Filtrar parqueos estáticos disponibles para reclamar
  const availableToClaim = useMemo(() => {
    // Los reclamados son los que tienen claimedBy
    const claimedIds = userParkings
      .filter(p => p.claimedBy !== undefined)
      .map(p => p.id);
    
    return staticParkings.filter(p => {
      // No incluir los ya reclamados
      if (claimedIds.includes(p.id)) return false;
      // Filtrar por búsqueda
      if (searchQuery.trim()) {
        return p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [userParkings, searchQuery]);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: 0,
      plazasLibres: 1,
      seguridad: [],
      accesiblePMR: false,
      horario: '24 horas',
      vehiculosPermitidos: ['Auto'],
      foto: '',
      lat: 0,
      lng: 0,
      zonaId: '',
      isActive: true,
    });
    setSearchQuery('');
    setIs24h(true);
    setStartTime('08:00');
    setEndTime('20:00');
    setEditingGarage(null);
  };

  // Abrir formulario para nuevo garaje
  const handleNewGarage = () => {
    if (userParkings.length >= MAX_GARAGES) {
      showToastMessage(`Máximo ${MAX_GARAGES} garajes permitidos`);
      return;
    }
    resetForm();
    setShowForm(true);
  };

  // Editar garaje existente
  const handleEditGarage = (garage: IParking) => {
    setEditingGarage(garage);
    setFormData({
      ...garage,
    });
    
    // Parsear horario
    if (garage.horario === '24 horas') {
      setIs24h(true);
    } else {
      setIs24h(false);
      const parts = garage.horario.split(' - ');
      if (parts.length === 2) {
        setStartTime(parts[0]);
        setEndTime(parts[1]);
      }
    }
    
    setSearchQuery(garage.nombre);
    setShowForm(true);
  };

  // Confirmar eliminación
  const handleDeleteClick = (garage: IParking) => {
    setGarageToDelete(garage);
    setShowDeleteModal(true);
  };

  // Eliminar garaje
  const handleConfirmDelete = () => {
    if (garageToDelete) {
      // removeParking maneja tanto parqueos creados como reclamados
      removeParking(garageToDelete.id);
      showToastMessage('Garaje eliminado');
    }
    setShowDeleteModal(false);
    setGarageToDelete(null);
  };

  // Toggle activo/pausado
  const handleToggleActive = (garage: IParking) => {
    const newStatus = garage.isActive === false ? true : false;
    updateParking(garage.id, { isActive: newStatus });
    showToastMessage(newStatus ? 'Garaje activado' : 'Garaje pausado');
  };

  // Ver como conductor
  const handleViewAsDriver = (garage: IParking) => {
    navigate(`/parqueo/${garage.id}`);
  };

  // Seleccionar sugerencia de autocompletado
  const handleSelectSuggestion = (parking: IParking) => {
    setShowSuggestions(false);
    setParkingToClaim(parking);
    setShowClaimModal(true);
  };

  // Confirmar reclamar parqueo
  const handleConfirmClaim = () => {
    if (parkingToClaim && userParkings.length < MAX_GARAGES) {
      const claimed = claimParking(parkingToClaim.id);
      if (claimed) {
        showToastMessage('Parqueo reclamado exitosamente');
      } else {
        showToastMessage('No se pudo reclamar el parqueo');
      }
    }
    setShowClaimModal(false);
    setParkingToClaim(null);
    setSearchQuery('');
  };

  // Obtener ubicación actual con mejor rendimiento
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToastMessage('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLocating(true);
    
    // Primero intentar con baja precisión (más rápido)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detectedZone = detectZoneFromCoords(latitude, longitude);
        
        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          zonaId: detectedZone || prev.zonaId,
        }));
        
        setIsLocating(false);
        
        if (detectedZone) {
          const zoneName = AVAILABLE_ZONES.find(z => z.id === detectedZone)?.name;
          showToastMessage(`Zona detectada: ${zoneName}`);
        } else {
          showToastMessage('Selecciona la zona manualmente');
        }
      },
      (error) => {
        console.warn('Error con baja precisión, intentando alta precisión:', error);
        // Si falla, intentar con alta precisión
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const detectedZone = detectZoneFromCoords(latitude, longitude);
            
            setFormData(prev => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              zonaId: detectedZone || prev.zonaId,
            }));
            
            setIsLocating(false);
            
            if (detectedZone) {
              const zoneName = AVAILABLE_ZONES.find(z => z.id === detectedZone)?.name;
              showToastMessage(`Zona detectada: ${zoneName}`);
            } else {
              showToastMessage('Selecciona la zona manualmente');
            }
          },
          () => {
            setIsLocating(false);
            showToastMessage('No se pudo obtener tu ubicación');
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 }
    );
  };

  // Toggle de características
  const toggleSecurity = (feature: string) => {
    const current = formData.seguridad || [];
    const newFeatures = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    setFormData(prev => ({ ...prev, seguridad: newFeatures }));
  };

  const toggleVehicle = (type: TipoVehiculo) => {
    const current = formData.vehiculosPermitidos || [];
    if (current.includes(type) && current.length === 1) return;
    const newVehicles = current.includes(type)
      ? current.filter(v => v !== type)
      : [...current, type];
    setFormData(prev => ({ ...prev, vehiculosPermitidos: newVehicles }));
  };

  // Mostrar toast
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Validar formulario
  const validateForm = (): string | null => {
    if (!formData.nombre?.trim()) return 'Ingresa el nombre del garaje';
    if (!formData.lat || !formData.lng) return 'Obtén tu ubicación GPS';
    if (!formData.zonaId) return 'Selecciona una zona';
    if (!formData.precio || formData.precio <= 0) return 'Ingresa el precio por hora';
    if (!formData.plazasLibres || formData.plazasLibres <= 0) return 'Ingresa las plazas disponibles';
    if (!formData.foto) return 'Selecciona una foto para tu garaje';
    return null;
  };

  // Guardar garaje
  const handleSave = () => {
    const error = validateForm();
    if (error) {
      showToastMessage(error);
      return;
    }

    const finalSchedule = is24h ? '24 horas' : `${startTime} - ${endTime}`;
    
    if (editingGarage) {
      // Actualizar existente
      updateParking(editingGarage.id, {
        nombre: formData.nombre!,
        lat: formData.lat!,
        lng: formData.lng!,
        precio: formData.precio!,
        plazasLibres: formData.plazasLibres!,
        seguridad: formData.seguridad || [],
        foto: formData.foto!,
        accesiblePMR: formData.accesiblePMR || false,
        horario: finalSchedule,
        vehiculosPermitidos: formData.vehiculosPermitidos as TipoVehiculo[],
        zonaId: formData.zonaId,
      });
      showToastMessage('Garaje actualizado');
    } else {
      // Crear nuevo
      const newParking: Omit<IParking, 'id'> = {
        nombre: formData.nombre!,
        lat: formData.lat!,
        lng: formData.lng!,
        precio: formData.precio!,
        distancia: 0,
        plazasLibres: formData.plazasLibres!,
        verificado: false, // Nuevos garajes están pendientes de verificación
        seguridad: formData.seguridad || [],
        calificacion: 5.0,
        foto: formData.foto!,
        accesiblePMR: formData.accesiblePMR || false,
        tipo: 'garage_privado',
        horario: finalSchedule,
        vehiculosPermitidos: formData.vehiculosPermitidos as TipoVehiculo[],
        zonaValidada: true,
        zonaId: formData.zonaId,
        isActive: true,
        isPending: true, // Marca como pendiente de verificación
      };

      addParking(newParking);
      showToastMessage('Garaje creado exitosamente');
    }
    
    setTimeout(() => {
      resetForm();
      setShowForm(false);
    }, 1000);
  };

  // Helpers
  const hasSecurity = (key: string) => formData.seguridad?.includes(key);
  const hasVehicle = (type: TipoVehiculo) => formData.vehiculosPermitidos?.includes(type);
  const hasValidLocation = formData.lat !== 0 && formData.lng !== 0;

  // Vista principal: Mis Propiedades + Formulario
  return (
    <HostLayout showNav>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-emerald-900">Mi Garaje</h1>
        <p className="text-sm text-slate-500">
          {userParkings.length === 0 
            ? 'Publica o reclama tu primer espacio' 
            : `${userParkings.length}/${MAX_GARAGES} propiedades`}
        </p>
      </div>

      {/* Sección: Mis Propiedades */}
      {userParkings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-emerald-600" />
            Mis Propiedades
          </h2>
          
          {/* Scroll horizontal de cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {userParkings.map((garage) => (
              <GarageCard
                key={garage.id}
                garage={garage}
                onEdit={() => handleEditGarage(garage)}
                onDelete={() => handleDeleteClick(garage)}
                onToggleActive={() => handleToggleActive(garage)}
                onView={() => handleViewAsDriver(garage)}
              />
            ))}
            
            {/* Card de agregar nuevo */}
            <AddGarageCard 
              onClick={handleNewGarage} 
              disabled={userParkings.length >= MAX_GARAGES}
            />
          </div>
        </div>
      )}

      {/* Sección: Reclamar Parqueo Existente */}
      {!showForm && userParkings.length < MAX_GARAGES && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <Search size={18} className="text-emerald-600" />
            Reclamar Parqueo Existente
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            ¿Tu parqueo ya está en EasyParker? Búscalo y reclámalo como tuyo.
          </p>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              placeholder="Buscar por nombre del parqueo..."
              className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}

            {/* Sugerencias */}
            {showSuggestions && availableToClaim.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto z-20">
                {availableToClaim.slice(0, 10).map((parking) => (
                  <button
                    key={parking.id}
                    onClick={() => handleSelectSuggestion(parking)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <img 
                      src={parking.foto} 
                      alt={parking.nombre} 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-800">{parking.nombre}</p>
                      <p className="text-xs text-slate-500">${parking.precio.toFixed(2)}/hora • {parking.plazasLibres} plazas</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && searchQuery && availableToClaim.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-center z-20">
                <p className="text-slate-500 text-sm">No se encontraron parqueos disponibles</p>
                <button
                  onClick={handleNewGarage}
                  className="mt-2 text-emerald-600 text-sm font-medium hover:underline"
                >
                  Crear uno nuevo →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón para crear nuevo (cuando no hay garajes) */}
      {!showForm && userParkings.length === 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleNewGarage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Plus size={24} />
            <span className="font-medium">Crear Nuevo</span>
          </button>
          
          <div className="bg-slate-100 py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500">
            <Search size={24} />
            <span className="font-medium text-sm text-center">O busca arriba para reclamar</span>
          </div>
        </div>
      )}

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="space-y-5 pb-4">
          {/* Header del formulario */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {editingGarage ? 'Editar Garaje' : 'Crear Nuevo Garaje'}
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Foto del Garaje */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Image size={18} className="text-emerald-600" />
              Foto del Garaje
            </h3>
            
            <div 
              className="relative h-40 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 cursor-pointer hover:border-emerald-400 transition-colors"
              onClick={() => setShowPhotoSelector(true)}
            >
              {formData.foto ? (
                <>
                  <img src={formData.foto} alt="Garaje" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium text-sm">Cambiar foto</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Camera size={32} />
                  <span className="text-sm mt-2">Toca para elegir foto</span>
                </div>
              )}
            </div>
          </div>

          {/* Selector de Fotos Modal */}
          {showPhotoSelector && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
              <div className="bg-white w-full max-w-md rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-800">Elige una foto</h3>
                  <button 
                    onClick={() => setShowPhotoSelector(false)}
                    className="text-slate-400 hover:text-slate-600 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GARAGE_PLACEHOLDER_PHOTOS.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, foto: photo }));
                        setShowPhotoSelector(false);
                      }}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        formData.foto === photo ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent'
                      }`}
                    >
                      <img src={photo} alt={`Garaje ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ubicación GPS */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              Ubicación
            </h3>
            
            {/* Mini Mapa Preview */}
            <div className="h-40 rounded-xl overflow-hidden border border-slate-200">
              {hasValidLocation ? (
                <MapContainer
                  center={[formData.lat!, formData.lng!]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  touchZoom={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[formData.lat!, formData.lng!]} icon={garageMarkerIcon} />
                  <MapUpdater lat={formData.lat!} lng={formData.lng!} />
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                  <MapPin size={32} />
                  <span className="text-sm mt-2">Sin ubicación</span>
                </div>
              )}
            </div>

            {/* Botón Obtener Ubicación */}
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="w-full py-3 rounded-xl bg-emerald-100 text-emerald-700 font-medium flex items-center justify-center gap-2 hover:bg-emerald-200 transition-colors disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <Navigation size={18} />
                  Usar mi ubicación actual
                </>
              )}
            </button>

            {/* Coordenadas (solo lectura) */}
            {hasValidLocation && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500">Lat:</span>
                  <span className="ml-2 font-mono text-slate-700">{formData.lat?.toFixed(6)}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500">Lng:</span>
                  <span className="ml-2 font-mono text-slate-700">{formData.lng?.toFixed(6)}</span>
                </div>
              </div>
            )}

            {/* Selector de Zona */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Zona</label>
              <select
                value={formData.zonaId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, zonaId: e.target.value }))}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="">Selecciona una zona...</option>
                {AVAILABLE_ZONES.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.icon} {zone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Información Básica */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Warehouse size={18} className="text-emerald-600" />
              Información Básica
            </h3>
            
            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nombre del Garaje</label>
              <input
                type="text"
                value={formData.nombre || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Ej. Garaje Mi Casa"
              />
            </div>

            {/* Precio y Plazas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Precio / Hora</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.25"
                    min="0.50"
                    value={formData.precio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 pl-8 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="2.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Plazas Totales</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.plazasLibres === 0 ? '' : formData.plazasLibres}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setFormData(prev => ({ ...prev, plazasLibres: val === '' ? 0 : parseInt(val) }));
                    }}
                    onBlur={() => {
                      if (!formData.plazasLibres || formData.plazasLibres < 1) {
                        setFormData(prev => ({ ...prev, plazasLibres: 1 }));
                      } else if (formData.plazasLibres > 50) {
                        setFormData(prev => ({ ...prev, plazasLibres: 50 }));
                      }
                    }}
                    className="w-full p-3 pl-8 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-emerald-600" />
              Horario de Atención
            </h3>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">Atención 24 horas</span>
              <button
                onClick={() => setIs24h(!is24h)}
                className={`w-12 h-6 rounded-full transition-colors relative ${is24h ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${is24h ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {!is24h && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Apertura</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Cierre</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Características */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Características
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Autos */}
              <button 
                onClick={() => toggleVehicle('Auto')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  hasVehicle('Auto') ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <Car size={24} />
                <span className="text-xs font-medium">Autos</span>
              </button>

              {/* Motos */}
              <button 
                onClick={() => toggleVehicle('Moto')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  hasVehicle('Moto') ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <Bike size={24} />
                <span className="text-xs font-medium">Motos</span>
              </button>

              {/* Guardia 24/7 */}
              <button 
                onClick={() => toggleSecurity('Guardia 24h')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  hasSecurity('Guardia 24h') ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <ShieldCheck size={24} />
                <span className="text-xs font-medium">Seguridad 24/7</span>
              </button>

              {/* Cámaras */}
              <button 
                onClick={() => toggleSecurity('Cámaras')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  hasSecurity('Cámaras') ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <Camera size={24} />
                <span className="text-xs font-medium">Cámaras</span>
              </button>

              {/* PMR */}
              <button 
                onClick={() => setFormData(prev => ({ ...prev, accesiblePMR: !prev.accesiblePMR }))}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.accesiblePMR ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <Accessibility size={24} />
                <span className="text-xs font-medium">Acceso PMR</span>
              </button>

              {/* Techo */}
              <button 
                onClick={() => toggleSecurity('Techo')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  hasSecurity('Techo') ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <Warehouse size={24} />
                <span className="text-xs font-medium">Zona techada</span>
              </button>

              {/* Pago Digital - Siempre activo */}
              <div className="p-3 rounded-xl border border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center gap-2 col-span-2">
                <Zap size={24} className="text-emerald-700" />
                <span className="text-xs font-medium text-emerald-700">Pago digital incluido</span>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-semibold transition-colors"
          >
            <Save size={20} />
            {editingGarage ? 'Guardar Cambios' : 'Publicar Garaje'}
          </button>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && garageToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-in fade-in zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Eliminar Garaje</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6">
              ¿Estás seguro que deseas eliminar <strong>"{garageToDelete.nombre}"</strong>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setGarageToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Reclamar */}
      {showClaimModal && parkingToClaim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-in fade-in zoom-in">
            <div className="text-center mb-4">
              <img 
                src={parkingToClaim.foto} 
                alt={parkingToClaim.nombre}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3"
              />
              <h3 className="font-bold text-lg text-slate-800">Reclamar Parqueo</h3>
              <p className="text-sm text-slate-500">{parkingToClaim.nombre}</p>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-emerald-700">
                Al reclamar este parqueo, confirmas que eres el propietario o administrador. 
                Tu parqueo aparecerá con el badge <strong>Verificado</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setParkingToClaim(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClaim}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Reclamar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle size={20} className="text-emerald-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </HostLayout>
  );
}
