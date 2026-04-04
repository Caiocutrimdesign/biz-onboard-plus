import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, ChevronRight, MapPin, Signal, Battery, Activity, Plus } from 'lucide-react';
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
    <div className="w-[400px] h-full bg-white flex flex-col border-r border-gray-100 shadow-[8px_0_32px_rgba(0,0,0,0.01)] relative z-20">
      {/* Resumo de Dispositivos Premium */}
      <div className="p-8 border-b border-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Frota Viva</h2>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">Telemetria em tempo real</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all border border-gray-100 text-gray-400">
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Ligados', value: stats.ligados, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
            { label: 'Desligados', value: stats.desligados, color: 'text-red-500', bgColor: 'bg-red-50' },
            { label: 'Alertas', value: 0, color: 'text-amber-500', bgColor: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className={`p-4 rounded-2xl ${s.bgColor} border border-white/50 text-center transition-transform hover:scale-105 cursor-default`}>
              <p className={`text-2xl font-black ${s.color} leading-none mb-1`}>{s.value}</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar veículo ou placa..." 
            className="pl-12 h-14 bg-gray-50/50 border-gray-100 text-gray-900 rounded-2xl focus:ring-blue-50 focus:border-blue-100 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Seção de Grupos Táticos */}
      <div className="px-8 py-6 bg-gray-50/30">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Agrupamentos Profissionais</h3>
          <button className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-110">
            <Plus className="w-4 h-4 font-black" />
          </button>
        </div>
        
        <div className="space-y-4">
          <motion.div 
            whileHover={{ x: 4 }}
            className="p-5 bg-white rounded-[2rem] border border-blue-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 opacity-20" />
            <div>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5 opacity-60">Operação Local</p>
              <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Estoque Rastremix - Flamengo</p>
              <div className="flex gap-1.5 mt-3">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="w-2.5 h-1 bg-blue-100 rounded-full group-hover:bg-blue-400 transition-colors" />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900 leading-none">04</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">UNIDADES</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 hidden-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
             <div className="p-6 bg-blue-50 rounded-[2.5rem] relative">
               <div className="absolute inset-0 bg-blue-400/20 rounded-[2.5rem] blur-2xl animate-pulse" />
               <Activity className="w-10 h-10 text-blue-500 relative z-10 animate-spin-slow" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60">Interceptando sinais táticos...</p>
          </div>
        ) : filteredVeiculos.map((device) => (
          <motion.div 
            key={device.id_rastremix}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            className="p-6 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm hover:border-blue-100 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-500 ${
                  device.ignicao 
                    ? 'bg-emerald-50 border-emerald-100 group-hover:bg-emerald-500 group-hover:border-emerald-500' 
                    : 'bg-gray-50 border-gray-100 group-hover:bg-gray-900 group-hover:border-gray-900'
                }`}>
                   <Activity className={`w-7 h-7 transition-colors duration-500 ${
                     device.ignicao ? 'text-emerald-500 group-hover:text-white' : 'text-gray-300 group-hover:text-white'
                   }`} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">{device.placa}</h4>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${device.ignicao ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      device.ignicao ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {device.ignicao ? 'Operacional' : 'Estacionado'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{device.velocidade}</p>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">KM/H</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID Rastremix: <span className="text-gray-900">{device.id_rastremix}</span></p>
               </div>
               <button className="h-10 px-4 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-all">
                 Telemetria <ChevronRight className="w-3.5 h-3.5" />
               </button>
            </div>
          </motion.div>
        ))}
        
        {!isLoading && filteredVeiculos.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] mx-auto mb-6 flex items-center justify-center opacity-40">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Nenhum alvo encontrado</p>
          </div>
        )}
        
        <div className="py-10">
          <button className="w-full h-16 bg-gray-50 text-gray-400 border border-transparent font-black rounded-3xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest text-[10px] shadow-sm hover:shadow-xl hover:shadow-blue-200">
            Expandir Monitoramento
          </button>
        </div>
      </div>
    </div>
  );
}
