import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, ChevronRight, MapPin, Signal, Battery, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVeiculos, Veiculo } from '@/hooks/useVeiculos';

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
  const { veiculos, stats, isLoading } = useVeiculos();

  const filteredVeiculos = veiculos.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-2xl font-black text-emerald-500 leading-none">{stats.ligados}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Ligados</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-black text-red-500 leading-none">{stats.desligados}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Desligados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-500 leading-none">0</p>
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
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Grupos de Frota</h3>
          <button className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">+</button>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-2xl border border-blue-50 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Grupo Padrão</p>
              <p className="text-xs font-bold text-gray-800 uppercase">ESTOQUE RASTREMIX-V. FLAMENGO</p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900 leading-none">4</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">VEÍCULOS</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
             <div className="p-4 bg-blue-50 rounded-full">
               <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando frotas...</p>
          </div>
        ) : filteredVeiculos.map((device) => (
          <motion.div 
            key={device.id_rastremix}
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                  device.ignicao 
                    ? 'bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100 group-hover:scale-110' 
                    : 'bg-gray-50 border-gray-100 group-hover:bg-gray-100 group-hover:scale-110'
                }`}>
                   <Activity className={`w-6 h-6 ${
                     device.ignicao ? 'text-emerald-500' : 'text-gray-400'
                   }`} />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 uppercase leading-none mb-1 tracking-tight">{device.placa}</h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${device.ignicao ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      device.ignicao ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {device.ignicao ? 'Ligado' : 'Desligado'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-black text-gray-900 leading-none">{device.velocidade}</p>
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">KM/H</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-2 text-blue-500">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 tracking-tight">ID: {device.id_rastremix}</p>
               </div>
               <button className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                 Detalhes <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          </motion.div>
        ))}
        
        {!isLoading && filteredVeiculos.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm italic font-medium">Nenhum veículo encontrado.</p>
          </div>
        )}
        
        <div className="py-6">
          <button className="w-full h-12 bg-white text-blue-600 border border-blue-100 font-bold rounded-2xl shadow-sm hover:bg-blue-50 transition-all uppercase tracking-widest text-[10px]">
            Carregar mais dispositivos
          </button>
        </div>
      </div>
    </div>
  );
}
