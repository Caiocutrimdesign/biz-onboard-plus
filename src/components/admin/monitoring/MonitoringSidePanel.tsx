import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, ChevronRight, MapPin, Signal, Battery, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Device {
  id: string;
  name: string;
  status: 'ligado' | 'desligado' | 'removido';
  plate: string;
  speed: number;
  lastUpdate: string;
  address: string;
}

const mockDevices: Device[] = [
  { id: '1', name: '511448629- CLARO', status: 'desligado', plate: 'PTY9C47', speed: 0, lastUpdate: 'Parado: 27/Fev 4h35', address: 'Avenida Norte Externa, São Luís, Maranhão' },
  { id: '2', name: '511786800- CLARO', status: 'ligado', plate: 'LMR6A22', speed: 45, lastUpdate: 'Em movimento há 12min', address: 'Rua Principal, São Luís, Maranhão' },
  { id: '3', name: '511990022- VIVO', status: 'removido', plate: 'ABC1234', speed: 0, lastUpdate: 'Offline há 3 dias', address: 'Ponto Removido' },
];

export function MonitoringSidePanel() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="w-[400px] h-full bg-white flex flex-col border-r border-gray-200">
      {/* Resumo de Dispositivos */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Dispositivos</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
              <ChevronRight className="w-4 h-4 text-gray-500 rotate-180" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-500 leading-none">169</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Ligados</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-black text-red-500 leading-none">1212</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Desligados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-500 leading-none">92</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Removidos</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar..." 
            className="pl-10 h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Lista de Grupos / Filtros Rápidos */}
      <div className="px-6 py-4 bg-gray-50/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Grupos</h3>
          <button className="w-6 h-6 rounded-full bg-indigo-900 text-white flex items-center justify-center text-lg font-bold">+</button>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-800 uppercase">ESTOQUE RASTREMIX-V. FLAMENGO</p>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-800 leading-none">4</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase">VEÍCULOS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Dispositivos */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {mockDevices.map((device) => (
          <motion.div 
            key={device.id}
            whileHover={{ y: -2 }}
            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                  device.status === 'ligado' ? 'bg-emerald-50 border-emerald-100' : 
                  device.status === 'desligado' ? 'bg-gray-50 border-gray-100' : 'bg-orange-50 border-orange-100'
                }`}>
                   <Activity className={`w-5 h-5 ${
                     device.status === 'ligado' ? 'text-emerald-500' : 
                     device.status === 'desligado' ? 'text-gray-400' : 'text-orange-500'
                   }`} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-800 uppercase leading-tight">{device.name}</h4>
                  <p className={`text-[10px] font-bold ${
                    device.status === 'ligado' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {device.lastUpdate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-xl font-black text-gray-800 leading-none">{device.speed}</p>
                 <p className="text-[8px] font-bold text-gray-400 uppercase">KM/H</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-50">
               <div className="flex items-center gap-2 text-blue-500">
                  <MapPin className="w-3 h-3" />
                  <p className="text-[10px] font-medium truncate">{device.address}</p>
               </div>
            </div>
          </motion.div>
        ))}
        
        <div className="py-4">
          <button className="w-full h-11 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-colors uppercase tracking-wider text-xs">
            Mostrar Mais
          </button>
        </div>
      </div>
    </div>
  );
}
