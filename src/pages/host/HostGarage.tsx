import { useState, useEffect, useRef } from 'react';
import { HostLayout } from '../../components/host/HostLayout';
import { useHost } from '../../context/HostContext';
import { parkings } from '../../data/parkings';
import { IParking, TipoVehiculo } from '../../types';
import { 
  Camera, ShieldCheck, Warehouse, Save, Clock, Car, Bike, 
  Accessibility, DollarSign, Users, CheckCircle, Zap 
} from 'lucide-react';

export default function HostGarage() {
  const { garage, updateGarage } = useHost();
  const [showToast, setShowToast] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<IParking>>({
    nombre: '',
    precio: 0,
    plazasLibres: 0,
    seguridad: [],
    accesiblePMR: false,
    horario: '24 horas',
    vehiculosPermitidos: ['Auto'],
    foto: '',
    ...garage
  });

  // Autocomplete
  const [suggestions, setSuggestions] = useState<IParking[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Horario
  const [is24h, setIs24h] = useState(formData.horario === '24 horas');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');

  // Cargar horario si existe
  useEffect(() => {
    if (formData.horario && formData.horario !== '24 horas') {
      const [start, end] = formData.horario.split(' - ');
      if (start) setStartTime(start);
      if (end) setEndTime(end);
      setIs24h(false);
    }
  }, [formData.horario]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar búsqueda de nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, nombre: value }));
    
    if (value.length > 2) {
      const matches = parkings.filter(p => 
        p.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Seleccionar parqueo del autocomplete
  const selectParking = (parking: IParking) => {
    // Normalizar seguridad para los toggles
    const normalizedSecurity: string[] = [];
    
    if (parking.seguridad.some(s => /guardia|vigilancia|seguridad/i.test(s))) {
      normalizedSecurity.push('Guardia 24h');
    }
    if (parking.seguridad.some(s => /c[áa]mara|video|cctv/i.test(s))) {
      normalizedSecurity.push('Cámaras');
    }
    if (parking.seguridad.some(s => /techo|cubierto|techada|sombra/i.test(s))) {
      normalizedSecurity.push('Techo');
    }

    setFormData({
      ...formData,
      nombre: parking.nombre,
      precio: parking.precio,
      plazasLibres: parking.plazasLibres,
      seguridad: normalizedSecurity,
      accesiblePMR: parking.accesiblePMR,
      horario: parking.horario,
      vehiculosPermitidos: [...parking.vehiculosPermitidos],
      foto: parking.foto,
      lat: parking.lat,
      lng: parking.lng,
      tipo: parking.tipo,
    });
    setShowSuggestions(false);
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
    if (current.includes(type) && current.length === 1) return; // No permitir quitar el último
    const newVehicles = current.includes(type)
      ? current.filter(v => v !== type)
      : [...current, type];
    setFormData(prev => ({ ...prev, vehiculosPermitidos: newVehicles }));
  };

  // Guardar cambios
  const handleSave = () => {
    const finalSchedule = is24h ? '24 horas' : `${startTime} - ${endTime}`;
    updateGarage({ ...formData, horario: finalSchedule });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Helpers
  const hasSecurity = (key: string) => formData.seguridad?.includes(key);
  const hasVehicle = (type: TipoVehiculo) => formData.vehiculosPermitidos?.includes(type);

  // Fix precio: manejar string vacío correctamente
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, precio: value === '' ? 0 : parseFloat(value) }));
  };

  return (
    <HostLayout showNav>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-emerald-900">Mi Garaje</h1>
        <p className="text-sm text-slate-500">Gestiona tu espacio de estacionamiento</p>
      </div>

      <div className="space-y-5 pb-4">
        {/* Imagen */}
        <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-200 border-2 border-dashed border-slate-300">
          {formData.foto ? (
            <img src={formData.foto} alt="Garaje" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Camera size={32} />
              <span className="text-sm mt-2">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Información Básica */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Warehouse size={18} className="text-emerald-600" />
            Información Básica
          </h3>
          
          {/* Nombre con Autocomplete */}
          <div className="relative" ref={searchRef}>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nombre del Garaje</label>
            <input
              type="text"
              value={formData.nombre || ''}
              onChange={handleNameChange}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="Ej. Garaje Centro Seguro"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                {suggestions.map((parking) => (
                  <button
                    key={parking.id}
                    onClick={() => selectParking(parking)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-slate-50 last:border-0 flex items-center gap-3"
                  >
                    <img src={parking.foto} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{parking.nombre}</p>
                      <p className="text-xs text-slate-500">${parking.precio}/h • {parking.plazasLibres} plazas</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Precio y Plazas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Precio / Hora</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={formData.precio || ''}
                  onChange={handlePriceChange}
                  className="w-full p-3 pl-8 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Plazas Totales</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={formData.plazasLibres || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, plazasLibres: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 pl-8 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="0"
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-semibold"
        >
          <Save size={20} />
          Guardar Cambios
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle size={20} className="text-emerald-400" />
          <span className="font-medium">¡Garaje actualizado!</span>
        </div>
      )}
    </HostLayout>
  );
}
