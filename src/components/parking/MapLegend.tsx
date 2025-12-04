export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg p-3">
      <p className="text-xs font-semibold text-gray-700 mb-2">Disponibilidad</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          <span className="text-xs text-gray-600">&gt;10 espacios</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
          <span className="text-xs text-gray-600">3-10 espacios</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
          <span className="text-xs text-gray-600">&lt;3 espacios</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-gray-200 mt-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
          <span className="text-xs text-gray-600">Tu ubicación</span>
        </div>
      </div>
    </div>
  );
}
