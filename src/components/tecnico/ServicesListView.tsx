import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Calendar, Search, Clock, CheckCircle, 
  Wrench, Phone, MapPin, Loader2, Package, Car,
  RefreshCw, LogOut, Play, Eye, MessageSquare, User,
  ChevronDown, ChevronUp, MapPinned, CalendarClock, ClipboardCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Service, STATUS_CONFIG } from '@/types/tec';
import { TECView } from './TecTypes';
import { crmService } from '@/lib/crmService';
import { useNavigate } from 'react-router-dom';

interface ServicesListViewProps {
  services: Service[];
  loading: boolean;
  onBack: () => void;
  goTo: (view: TECView) => void;
  onSelectService?: (service: Service) => void;
  filter?: 'pending' | 'completed' | 'all' | 'pendente' | 'concluido';
}

type TabType = 'todos' | 'pendente' | 'em_andamento' | 'concluido';

const STATUS_COLORS = {
  pendente: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: 'bg-yellow-100 text-yellow-600',
    progress: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  em_andamento: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    progress: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  concluido: {
    bg: 'bg-green-50 border-green-200',
    icon: 'bg-green-100 text-green-600',
    progress: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 border-green-300'
  },
  designado: {
    bg: 'bg-purple-50 border-purple-200',
    icon: 'bg-purple-100 text-purple-600',
    progress: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-800 border-purple-300'
  }
};

function ServiceCard({ service, onClick, onAction }: { 
  service: Service; 
  onClick: () => void;
  onAction: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const colors = STATUS_COLORS[service.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pendente;
  
  const getActionButton = () => {
    switch (service.status) {
      case 'pendente':
        return (
          <Button 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600 text-white gap-1"
            onClick={(e) => { e.stopPropagation(); onAction(); }}
          >
            <Play className="w-4 h-4" />
            Iniciar
          </Button>
        );
      case 'em_andamento':
        return (
          <Button 
            size="sm" 
            className="bg-blue-500 hover:bg-blue-600 text-white gap-1"
            onClick={(e) => { e.stopPropagation(); onAction(); }}
          >
            <ClipboardCheck className="w-4 h-4" />
            Continuar
          </Button>
        );
      case 'concluido':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="gap-1"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-3"
    >
      <Card className={`${colors.bg} border-2 transition-all hover:shadow-lg cursor-pointer overflow-hidden`}
        onClick={onClick}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <motion.div 
            className={`h-full ${colors.progress}`}
            initial={{ width: 0 }}
            animate={{ 
              width: service.status === 'concluido' ? '100%' : 
                     service.status === 'em_andamento' ? '60%' : 
                     service.status === 'designado' ? '30%' : '10%'
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                <Wrench className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg truncate">{service.client_name || 'Cliente'}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Phone className="w-4 h-4" />
                  <span>{service.client_phone || 'Sem telefone'}</span>
                </div>
              </div>
            </div>
            <Badge className={`${colors.badge} border font-semibold px-3 py-1`}>
              {STATUS_CONFIG[service.status as keyof typeof STATUS_CONFIG]?.label || service.status}
            </Badge>
          </div>

          {/* Vehicle Info */}
          {(service.vehicle || service.plate) && (
            <div className={`mt-3 p-3 rounded-xl ${colors.icon} bg-opacity-20`}>
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5" />
                <div>
                  <p className="font-semibold">{service.vehicle || 'Veículo não informado'}</p>
                  {service.plate && (
                    <p className="text-sm font-mono bg-white px-2 py-0.5 rounded mt-1 inline-block">
                      {service.plate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Expandable Details */}
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-gray-700 mt-2"
          >
            {expanded ? 'Menos detalhes' : 'Mais detalhes'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-2 border-t">
                  {service.client_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                      <span className="text-gray-600">{service.client_address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarClock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Agendado: {formatDate(service.scheduled_date)}
                    </span>
                  </div>
                  {service.technician_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Técnico: {service.technician_name}</span>
                    </div>
                  )}
                  {service.observations && (
                    <div className="bg-white/50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Observações:</p>
                      <p className="text-sm">{service.observations}</p>
                    </div>
                  )}
                  {service.completed_date && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Concluído em: {formatDate(service.completed_date)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <span className="text-xs text-gray-500">
              {formatDate(service.created_at)}
            </span>
            {getActionButton()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ServicesListView({ services, loading, onBack, goTo, onSelectService, filter = 'all' }: ServicesListViewProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [localLoading, setLocalLoading] = useState(false);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      if (services && services.length > 0) {
        setAllServices(services);
        setInitialized(true);
      } else {
        loadAllServices();
        setInitialized(true);
      }
    }
  }, [services, initialized]);

  const loadAllServices = useCallback(async () => {
    setLocalLoading(true);
    try {
      const data = await crmService.getServicos();
      setAllServices(data as any as Service[]);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadAllServices();
  }, [loadAllServices]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
  }, [onBack]);

  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'todos', label: 'Todos', icon: Calendar },
    { id: 'pendente', label: 'Pendentes', icon: Clock },
    { id: 'em_andamento', label: 'Em Andamento', icon: Package },
    { id: 'concluido', label: 'Concluídos', icon: CheckCircle },
  ];

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
    if (onSelectService) {
      onSelectService(service);
      goTo('servico');
    } else if (goTo) {
      goTo('servico');
    }
  };

  const handleServiceAction = (service: Service) => {
    if (onSelectService) {
      onSelectService(service);
      goTo('servico');
    } else if (goTo) {
      goTo('servico');
    }
  };

  const isLoading = loading || localLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-10 w-10 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Agenda de Serviços</h1>
              <p className="text-sm text-gray-500">{stats.todos} serviços no total</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh} className="h-10 w-10">
                <RefreshCw className={`w-5 h-5 ${localLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExit} className="h-10 w-10 text-red-500">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tabs.map((tab) => {
            const count = stats[tab.id as keyof typeof stats] || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-xl text-center transition-all ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'bg-white border hover:border-orange-300'
                }`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className={`text-xs ${isActive ? 'text-orange-100' : 'text-gray-500'}`}>{tab.label}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por cliente, placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-white border shadow-sm"
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white border hover:border-orange-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-orange-400' : 'bg-gray-100'
              }`}>
                {stats[tab.id as keyof typeof stats] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Services List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <p className="mt-4 text-gray-500">Carregando serviços...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Nenhum serviço encontrado</h3>
            <p className="text-sm text-gray-500 mt-1">
              {search ? 'Tente buscar por outro termo' : 'Serviços aparecerão aqui quando criados'}
            </p>
          </div>
        ) : (
          <div className="pb-20">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <ServiceCard 
                  key={service.id || Math.random()} 
                  service={service as Service}
                  onClick={() => handleServiceClick(service as Service)}
                  onAction={() => handleServiceAction(service as Service)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
