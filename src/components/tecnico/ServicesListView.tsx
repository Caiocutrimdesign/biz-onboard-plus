import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Calendar, Search, Clock, CheckCircle, 
  Wrench, Phone, MapPin, Loader2, Filter, Package
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Service, SERVICE_TYPE_LABELS, STATUS_CONFIG } from '@/types/tec';
import { TECView } from './TecTypes';

interface ServicesListViewProps {
  services: Service[];
  loading: boolean;
  onBack: () => void;
  goTo: (view: TECView) => void;
  filter?: 'pending' | 'completed' | 'all';
}

type TabType = 'todos' | 'pendente' | 'em_andamento' | 'concluido';

export function ServicesListView({ services, loading, onBack, goTo, filter = 'all' }: ServicesListViewProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(filter === 'all' ? 'todos' : filter);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'todos', label: 'Todos', icon: Calendar },
    { id: 'pendente', label: 'Pendentes', icon: Clock },
    { id: 'em_andamento', label: 'Em Andamento', icon: Package },
    { id: 'concluido', label: 'Concluídos', icon: CheckCircle },
  ];

  const filteredServices = useMemo(() => {
    let result = services;
    
    if (activeTab !== 'todos') {
      result = result.filter(s => s.status === activeTab);
    }
    
    if (search) {
      result = result.filter(s => 
        s.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.client_phone?.includes(search) ||
        s.plate?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return result;
  }, [services, activeTab, search]);

  const stats = useMemo(() => ({
    todos: services.length,
    pendente: services.filter(s => s.status === 'pendente').length,
    em_andamento: services.filter(s => s.status === 'em_andamento').length,
    concluido: services.filter(s => s.status === 'concluido' || s.status === 'finalizado').length,
  }), [services]);

  const handleServiceClick = (service: Service) => {
    // Navigate to service details
    console.log('Service clicked:', service.id);
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;
    return (
      <Badge className={config.bgColor}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Agenda de Serviços</h1>
          <p className="text-sm text-muted-foreground">Visualize todos os serviços</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const count = stats[tab.id as keyof typeof stats] || 0;
          return (
            <Card 
              key={tab.id}
              className={`cursor-pointer transition-all ${activeTab === tab.id ? 'border-orange-500 bg-orange-50' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{tab.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente, telefone ou placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 rounded-xl"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={`gap-2 ${activeTab === tab.id ? 'bg-orange-500' : ''}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-orange-500" />
          <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Wrench className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhum serviço encontrado</p>
          <p className="text-sm mt-2">Serviços aparecerão aqui quando criados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleServiceClick(service)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    service.status === 'concluido' ? 'bg-green-100' :
                    service.status === 'em_andamento' ? 'bg-blue-100' :
                    service.status === 'pendente' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Wrench className={`w-6 h-6 ${
                      service.status === 'concluido' ? 'text-green-600' :
                      service.status === 'em_andamento' ? 'text-blue-600' :
                      service.status === 'pendente' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{service.client_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {service.client_phone || 'Sem telefone'}
                    </p>
                    <p className="text-sm text-orange-600 font-medium">
                      {SERVICE_TYPE_LABELS[service.type] || service.type}
                      {service.plate && ` • ${service.plate}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(service.status)}
                  {service.vehicle && (
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {service.vehicle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
