import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Bell, Maximize, Layers, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVeiculos } from '@/hooks/useVeiculos';

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
  html: `<div style="width: 40px; height: 40px; background-color: ${color}; border-radius: 50%; border: 4px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
             <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
           </svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

export function MapComponent() {
  const { veiculos, isLoading } = useVeiculos();
  const center: [number, number] = veiculos.length > 0 
    ? [veiculos[0].lat, veiculos[0].lng] 
    : [-23.55052, -46.633308]; // Default to SP if no data

  return (
    <div className="flex-1 h-full relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* Camada de Satélite (Esri World Imagery) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />
        
        {/* Camada de Rótulos (opcional, para nomes de ruas sobre o satélite) */}
        <TileLayer
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png"
          opacity={0.5}
        />

        {/* Marcadores em Tempo Real */}
        {!isLoading && veiculos.map((v) => (
          <Marker 
            key={v.id_remoto} 
            position={[v.lat, v.lng]} 
            icon={createCarIcon(v.ignicao ? '#10b981' : '#ef4444')}
          >
            <Popup>
              <div className="p-1">
                <div className="font-black text-gray-800 border-b border-gray-100 pb-1 mb-1 uppercase tracking-tight">
                  {v.placa}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Velocidade</span>
                    <span className="text-sm font-black text-blue-600">{v.velocidade} km/h</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                    <span className={`text-[10px] font-black uppercase ${v.ignicao ? 'text-emerald-500' : 'text-red-500'}`}>
                      {v.ignicao ? 'Ligado' : 'Desligado'}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1 border-t border-gray-50 pt-1">
                    Última atualização: {new Date(v.updated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <ZoomControl position="bottomleft" />
      </MapContainer>

      {/* Map Controls (Top Right overlays) */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
         <motion.button 
           whileHover={{ scale: 1.1 }}
           className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors"
         >
           <Maximize className="w-5 h-5" />
         </motion.button>
         <motion.button 
           whileHover={{ scale: 1.1 }}
           className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors"
         >
           <Layers className="w-5 h-5" />
         </motion.button>
         <motion.button 
           whileHover={{ scale: 1.1 }}
           className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors"
         >
           <MapPin className="w-5 h-5" />
         </motion.button>
      </div>

      {/* Global Notifications toast like in screenshot */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-400/30"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold">Monitoramento Ativo 👍</p>
            <p className="text-xs opacity-90">Sincronizados {veiculos.length} veículos em tempo real</p>
          </div>
          <button className="ml-4 text-white/50 hover:text-white">×</button>
        </motion.div>
      </div>

      {/* Floating Buttons on the right (like reference) */}
      <div className="absolute bottom-12 right-6 z-10">
         <motion.div 
           whileHover={{ scale: 1.05 }}
           className="w-14 h-14 bg-indigo-900 rounded-2xl shadow-xl flex items-center justify-center text-white border border-indigo-800"
         >
           <Navigation className="w-8 h-8" />
         </motion.div>
      </div>
    </div>
  );
}
