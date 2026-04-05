import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
    map.invalidateSize();
  }, [center, map]);
  return null;
}

interface MiniMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export const MiniMap = ({ lat, lng, zoom = 15 }: MiniMapProps) => {
  const position: [number, number] = [lat, lng];

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50 relative z-0">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <ChangeView center={position} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
      </MapContainer>
      
      {/* Street View Link */}
      <a 
        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-gray-800 uppercase shadow-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 border border-blue-100"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Ver no Street View
      </a>
    </div>
  );
};
