import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Bell, Maximize, Layers, Search, Car, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVeiculos } from '@/hooks/useVeiculos';

// Component to handle map resizing issues in dynamic containers
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Trigger on window resize too
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  return null;
}

// Fix for default Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom car icon for tracking
const createCarIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="width: 44px; height: 44px; background-color: ${color}; border-radius: 12px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transform: rotate(0deg); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
             <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
           </svg>
         </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

export function MapComponent() {
  const { veiculos, isLoading, isSyncing, syncWithLegacy } = useVeiculos();
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('satellite');
  
  const center: [number, number] = veiculos.length > 0 
    ? [veiculos[0].latitude, veiculos[0].longitude] 
    : [-23.55052, -46.633308]; // Default to SP if no data

  return (
    <div className="flex-1 h-full relative bg-slate-100 overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <MapResizer />
        
        {/* Layer Toggle Logic */}
        {mapType === 'streets' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        ) : (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
            {/* Reliable Labels Layer (CartoDB Labels Only) */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
              opacity={0.8}
              zIndex={10}
            />
          </>
        )}
        
        {/* Marcadores em Tempo Real */}
        <AnimatePresence>
          {!isLoading && veiculos.map((v) => (
            <Marker 
              key={v.id_rastremix} 
              position={[v.latitude, v.longitude]} 
              icon={createCarIcon(v.ignicao ? '#10b981' : '#ef4444')}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${v.ignicao ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="font-black text-gray-800 uppercase tracking-tight">{v.placa}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Velocidade</span>
                      <span className="text-sm font-black text-blue-600">{v.velocidade} km/h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Ignição</span>
                      <span className={`text-[10px] font-black uppercase ${v.ignicao ? 'text-emerald-500' : 'text-red-500'}`}>
                        {v.ignicao ? 'Ligada' : 'Desligada'}
                      </span>
                    </div>
                    <div className="pt-2 mt-1 border-t border-gray-50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[9px] text-gray-400">
                        <span>Atualizado:</span>
                        <span className="font-medium">{new Date(v.ultima_atualizacao).toLocaleTimeString()}</span>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${v.latitude},${v.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-50 text-blue-600 py-1.5 rounded-lg text-[8px] font-black uppercase text-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                      >
                        Abrir Street View
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </AnimatePresence>

        <ZoomControl position="bottomleft" />
      </MapContainer>

      {/* Map Content Overlay System - Premium UI */}
      
      {/* Search Bar Overlay */}
      <div className="absolute top-6 left-6 z-[1000] w-72 md:w-80">
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
           <input 
             placeholder="Localizar veículo..." 
             className="w-full bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-blue-900/10"
           />
        </div>
      </div>

      {/* Map Tools Sidebar */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
           className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all border border-white/20 shadow-blue-900/10"
           title="Mudar visualização"
         >
           <Layers className="w-5 h-5" />
         </motion.button>
         
         {/* Sync Button */}
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => syncWithLegacy()}
           disabled={isSyncing}
           className={`w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center transition-all border border-white/20 shadow-blue-900/10 ${isSyncing ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
           title="Sincronizar agora"
         >
           <Loader2 className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
         </motion.button>

         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all border border-white/20 shadow-blue-900/10"
         >
           <Maximize className="w-5 h-5" />
         </motion.button>
      </div>

      {/* Connection Status Toast */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
        <AnimatePresence>
          {isSyncing || isLoading ? (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/30"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-sm font-bold">Sincronizando frotas táticas...</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              <p className="text-sm font-bold">{veiculos.length} Veículos Conectados</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Actions */}
      <div className="absolute bottom-12 right-6 z-[1000] flex flex-col gap-4">
         <motion.div 
           whileHover={{ scale: 1.1, rotate: 5 }}
           whileTap={{ scale: 0.9 }}
           className="w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl flex items-center justify-center text-white border-2 border-blue-500/50 cursor-pointer shadow-blue-600/30"
         >
           <Navigation className="w-8 h-8 fill-white/20" />
         </motion.div>
      </div>
    </div>
  );
}
