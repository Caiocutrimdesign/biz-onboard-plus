import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Calendar, Search, Clock, CheckCircle, 
  Wrench, Phone, MapPin, Loader2, Filter, Package, Car,
  Eye, MessageSquare, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Service, SERVICE_TYPE_LABELS, STATUS_CONFIG } from '@/types/tec';
import { TECView } from './TecTypes';
import { crmService } from '@/lib/crmService';

interface ServicesListViewProps {
  services: Service[];
  loading: boolean;
  onBack: () => void;
  goTo: (view: TECView) => void;
  filter?: 'pending' | 'completed' | 'all' | 'pendente' | 'concluido';
}

type TabType = 'todos' | 'pendente' | 'em_andamento' | 'concluido';

export function ServicesListView({ services, loading, onBack, goTo, filter = 'all' }: ServicesListViewProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [localLoading, setLocalLoading] = useState(false);
  const [allServices, setAllServices] = useState<Service[]>([]);

  // Load all services on mount
  useEffect(() => {
    loadAllServices();
  }, []);

  const loadAllServices = async () => {
    setLocalLoading(true);
    try {
      const data = await crmService.getServicos();
      console.log('ServicesListView: Loaded', data.length, 'services');
      setAllServices(data as any as Service[]);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'todos', label: 'Todos', icon: Calendar },
    { id: 'pendente', label: 'Pendentes', icon: Clock },
    { id: 'em_andamento', label: 'Em Andamento', icon: Package },
    { id: 'concluido', label: 'Concluídos', icon: CheckCircle },
  ];

  // Use all services for display
  const displayServices = allServices.length > 0 ? allServices : services;

  const filteredServices = useMemo(() => {
    let result = displayServices;
    
    if (activeTab !== 'todos') {
      result = result.filter(s => s.status === activeTab);
    }
    
    if (search) {
      result = result.filter(s => 
        s.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.client_phone?.includes(search) ||
        s.plate?.toLowerCase().includes(search.toLowerCase()) ||
        s.vehicle?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return result;
  }, [displayServices, activeTab, search]);

  const stats = useMemo(() => ({
    todos: displayServices.length,
    pendente: displayServices.filter(s => s.status === 'pendente').length,
    em_andamento: displayServices.filter(s => s.status === 'em_andamento').length,
    concluido: displayServices.filter(s => s.status === 'concluido' || s.status === 'finalizado').length,
  }), [displayServices]);

  const handleServiceClick = (service: Service) => {
    console.log('Service clicked:', service);
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;
    return (
      <Badge className={`${config.bgColor} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const isLoading = loading || localLoading;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-bold">Agenda de Serviços</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Controle de todos os serviços</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={loadAllServices}
          className="h-10 w-10"
        >
          <RefreshCw className={`w-4 h-4 ${localLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {tabs.map((tab) => {
          const count = stats[tab.id as keyof typeof stats] || 0;
          return (
            <Card 
              key={tab.id}
              className={`cursor-pointer transition-all ${activeTab === tab.id ? 'border-orange-500 bg-orange-50' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-2 md:p-3 flex items-center gap-2 md:gap-3">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold">{count}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{tab.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente, telefone ou placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 md:h-12 rounded-xl text-sm md:text-base"
        />
      </div>

      {/* Tabs - Horizontal Scroll on Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={`gap-1 md:gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-500' : ''} text-xs md:text-sm`}
          >
            <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden xs:inline">{tab.label}</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
              {stats[tab.id as keyof typeof stats] || 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Services List - Responsive Cards */}
      {isLoading ? (
        <div className="text-center py-12 md:py-20">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 mx-auto animate-spin text-orange-500" />
          <p className="mt-4 text-sm md:text-base text-muted-foreground">Carregando serviços...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 md:py-20 text-muted-foreground">
          <Wrench className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-30" />
          <p className="text-sm md:text-base">Nenhum serviço encontrado</p>
          <p className="text-xs md:text-sm mt-2">Serviços aparecerão aqui quando criados</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 md:gap-4">
                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    service.status === 'concluido' ? 'bg-green-100' :
                    service.status === 'em_andamento' ? 'bg-blue-100' :
                    service.status === 'pendente' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Wrench className={`w-5 h-5 md:w-6 md:h-6 ${
                      service.status === 'concluido' ? 'text-green-600' :
                      service.status === 'em_andamento' ? 'text-blue-600' :
                      service.status === 'pendente' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold md:font-bold truncate text-sm md:text-base">{service.client_name}</p>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground mt-0.5">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{service.client_phone || 'Sem telefone'}</span>
                    </div>
                    {(service.vehicle || service.plate) && (
                      <div className="flex items-center gap-1 text-xs md:text-sm text-orange-600 mt-0.5">
                        <Car className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {service.vehicle && `${service.vehicle}`}
                          {service.vehicle && service.plate && ' • '}
                          {service.plate && service.plate}
                        </span>
                      </div>
                    )}
                    {service.observations && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 hidden md:block">
                        {service.observations}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 md:gap-2 flex-shrink-0">
                  {getStatusBadge(service.status)}
                  <span className="text-[10px] md:text-xs text-muted-foreground">
                    {formatDate(service.completed_date || service.scheduled_date)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
