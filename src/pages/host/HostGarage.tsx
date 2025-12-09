import { useState, useEffect } from 'react';
import { HostLayout } from '../../components/host/HostLayout';
import { useParkingContext } from '../../context/ParkingContext';
import { IParking, TipoVehiculo } from '../../types';
import { GARAGE_PLACEHOLDER_PHOTOS, AVAILABLE_ZONES, detectZoneFromCoords } from '../../data/hostMock';
import { 
  Camera, ShieldCheck, Warehouse, Save, Clock, Car, Bike, 
  Accessibility, DollarSign, Users, CheckCircle, Zap, MapPin, Navigation, Image
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export default function HostGarage() {
  const { addParking, userParkings } = useParkingContext();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  
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
  });

  // Horario
  const [is24h, setIs24h] = useState(true);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');

  // Obtener ubicación actual
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToastMessage('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Auto-detectar zona
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
          showToastMessage(`📍 Zona detectada: ${zoneName}`);
        } else {
          showToastMessage('⚠️ Zona no encontrada. Selecciona manualmente.');
        }
      },
      (error) => {
        setIsLocating(false);
        console.error('Error getting location:', error);
        showToastMessage('No se pudo obtener tu ubicación');
      },
      { enableHighAccuracy: true, timeout: 10000 }
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
      showToastMessage(`⚠️ ${error}`);
      return;
    }

    const finalSchedule = is24h ? '24 horas' : `${startTime} - ${endTime}`;
    
    const newParking: Omit<IParking, 'id'> = {
      nombre: formData.nombre!,
      lat: formData.lat!,
      lng: formData.lng!,
      precio: formData.precio!,
      distancia: 0,
      plazasLibres: formData.plazasLibres!,
      verificado: true,
      seguridad: formData.seguridad || [],
      calificacion: 5.0,
      foto: formData.foto!,
      accesiblePMR: formData.accesiblePMR || false,
      tipo: 'garage_privado',
      horario: finalSchedule,
      vehiculosPermitidos: formData.vehiculosPermitidos as TipoVehiculo[],
      zonaValidada: true,
      zonaId: formData.zonaId,
    };

    addParking(newParking);
    showToastMessage('🎉 ¡Garaje creado exitosamente!');
    
    setTimeout(() => {
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
      });
    }, 1500);
  };

  // Helpers
  const hasSecurity = (key: string) => formData.seguridad?.includes(key);
  const hasVehicle = (type: TipoVehiculo) => formData.vehiculosPermitidos?.includes(type);
  const hasValidLocation = formData.lat !== 0 && formData.lng !== 0;

  return (
    <HostLayout showNav>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-emerald-900">Crear Garaje</h1>
        <p className="text-sm text-slate-500">Publica tu espacio de estacionamiento</p>
        {userParkings.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1">✓ Tienes {userParkings.length} garaje(s) publicado(s)</p>
        )}
      </div>

      <div className="space-y-5 pb-4">
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
                📍 Usar mi ubicación actual
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
          Publicar Garaje
        </button>
      </div>

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
