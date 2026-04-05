import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wrench, Search, Filter, User, Calendar, CheckCircle, 
  Clock, XCircle, ChevronRight, Loader2, RefreshCw, 
  History, UserPlus, Eye, Plus, Phone, MapPin, ArrowRightCircle,
  Image, FileText, Pencil, Trash2, ArrowLeft, Car
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { type Servico, crmService } from '@/lib/crmService';
import type { Service, ServiceStatus, ServiceType } from '@/types/service';
import { SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS, SERVICE_STATUS_ORDER } from '@/types/service';
import { toast } from 'sonner';

type TabType = 'todos' | 'pendente' | 'designado' | 'em_andamento' | 'finalizado' | 'cancelado';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { servicos, tecnicos: contextTecnicos, isLoading: loading, refreshServices, addServico, updateServico, deleteServico } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [technicians, setTechnicians] = useState<any[]>([]);

  // Load technicians directly
  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const data = await crmService.getTecnicos();
      console.log('ServicesPage: Loaded technicians:', data.length);
      setTechnicians(data || []);
    } catch (error) {
      console.error('Error loading technicians:', error);
      setTechnicians(contextTecnicos || []);
    }
  };

  useEffect(() => {
    loadData();
    
    // Refresh services when page gains focus (in case technician added new services)
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    await refreshServices();
  };

  // Map Servico (Supabase) to UI Service type if needed, or use directly
  const services: any[] = (servicos || []).map(s => ({
    ...s,
    cliente_name: s.client_name,
    cliente_phone: s.client_phone,
    cliente_address: s.client_address,
    descricao: s.observations,
    data_agendamento: s.scheduled_date,
    status: s.status as ServiceStatus,
    tecnico_id: s.technician_id,
    tecnico_name: s.technician_name,
    data_criacao: s.created_at,
    data_finalizacao: s.completed_date,
  }));
  
  const safeServices = services;
  const safeTechnicians = technicians.length > 0 ? technicians : (contextTecnicos || []);

  const filteredServices = safeServices.filter(s => {
    const matchesSearch = !search || 
      (s.cliente_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.cliente_phone?.includes(search) ||
      s.descricao?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesTab = activeTab === 'todos' || s.status === activeTab;
    const matchesTech = techFilter === 'all' || s.tecnico_id === techFilter;
    return matchesSearch && matchesStatus && matchesTab && matchesTech;
  });

  const handleAssignTech = async (serviceId: string, techId: string) => {
    const tech = safeTechnicians.find(t => t.id === techId);
    if (tech) {
      await updateServico(serviceId, {
        technician_id: tech.id,
        technician_name: tech.name,
        status: 'designado' as any,
      });
      if (selectedService?.id === serviceId) {
        const updated = services.find(s => s.id === serviceId);
        if (updated) setSelectedService(updated);
      }
    }
  };

  const handleReassignTech = async (serviceId: string, techId: string) => {
    const tech = safeTechnicians.find(t => t.id === techId);
    if (tech) {
      await updateServico(serviceId, {
        technician_id: tech.id,
        technician_name: tech.name,
        status: 'designado' as any,
      });
      setShowDetail(false);
    }
  };

  const handleUpdateStatus = async (serviceId: string, status: ServiceStatus) => {
    await updateServico(serviceId, { status: status as any });
    if (selectedService?.id === serviceId) {
      const updated = services.find(s => s.id === serviceId);
      if (updated) setSelectedService(updated);
    }
  };

  const handleDeleteService = async (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) {
      await deleteServico(serviceId);
      if (selectedService?.id === serviceId) {
        setSelectedService(null);
        setShowDetail(false);
      }
    }
  };

  const handleEditService = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedService(service);
    setShowEdit(true);
  };

  const handleUpdateService = async (serviceId: string, data: Partial<Service>) => {
    await updateServico(serviceId, {
      client_name: data.cliente_name,
      client_phone: data.cliente_phone,
      client_address: data.cliente_address,
      technician_id: data.tecnico_id,
      technician_name: data.tecnico_name,
      status: data.status as any,
      observations: data.descricao,
      scheduled_date: data.data_agendamento,
    });
    setShowEdit(false);
  };

  const openDetail = (service: Service) => {
    setSelectedService(service);
    setServiceHistory([]);
    setShowDetail(true);
  };

  const stats = {
    total: safeServices.length,
    pendente: safeServices.filter(s => s.status === 'pendente').length,
    designado: safeServices.filter(s => s.status === 'designado').length,
    emAndamento: safeServices.filter(s => s.status === 'em_andamento').length,
    finalized: safeServices.filter(s => s.status === 'finalizado').length,
    cancelado: safeServices.filter(s => s.status === 'cancelado').length,
  };

  const tabs: { id: TabType; label: string; count: number; color: string; activeBg: string }[] = [
    { id: 'todos', label: 'Todos', count: stats.total, color: 'text-gray-500', activeBg: 'bg-gray-500' },
    { id: 'pendente', label: 'Pendente', count: stats.pendente, color: 'text-yellow-600', activeBg: 'bg-yellow-500' },
    { id: 'designado', label: 'Designado', count: stats.designado, color: 'text-red-600', activeBg: 'bg-red-600' },
    { id: 'em_andamento', label: 'Em Andamento', count: stats.emAndamento, color: 'text-red-600', activeBg: 'bg-red-500' },
    { id: 'finalizado', label: 'Finalizado', count: stats.finalized, color: 'text-green-600', activeBg: 'bg-green-500' },
    { id: 'cancelado', label: 'Cancelado', count: stats.cancelado, color: 'text-red-600', activeBg: 'bg-red-600' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/admin')}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Wrench className="w-5 h-5 md:w-7 md:h-7 text-red-600" />
              <span className="hidden sm:inline">Serviços</span>
              <span className="sm:hidden">OS</span>
            </h1>
            <p className="text-muted-foreground text-sm">Gerencie todos os serviços</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)} className="bg-red-600 hover:bg-red-700 h-9 md:h-10 text-white shadow-lg shadow-red-500/20 border-none">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Novo Serviço</span>
            <span className="md:hidden">Novo</span>
          </Button>
          <Button onClick={loadData} variant="outline" size="icon" className="h-9 md:h-10 md:w-auto md:px-3">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline ml-2">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center">
              <Wrench className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg md:rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{stats.pendente}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Pendente</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{stats.designado}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Designado</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <ArrowRightCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{stats.emAndamento}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Em Andamento</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg md:rounded-xl flex items-center justify-center">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{stats.finalized}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Finalizado</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-lg md:rounded-xl flex items-center justify-center">
              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{stats.cancelado}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Cancelado</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border p-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all whitespace-nowrap text-sm md:text-base
                  ${isActive 
                    ? `${tab.activeBg} text-white shadow-md` 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.replace('Em Andamento', 'Andamento').replace('Finalizado', 'Final.')}</span>
                <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-muted'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 md:pl-10 h-10 md:h-12 rounded-lg md:rounded-xl"
          />
        </div>
        <Select value={techFilter} onValueChange={setTechFilter}>
          <SelectTrigger className="w-full sm:w-40 md:w-48 h-10 md:h-12 rounded-lg md:rounded-xl">
            <SelectValue placeholder="Técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {safeTechnicians.map(tech => (
              <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-muted-foreground" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Wrench className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhum serviço encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDetail(service)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 md:gap-4 min-w-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    SERVICE_STATUS_COLORS[service.status]?.replace('text-', 'bg-').replace('800', '100') || 'bg-gray-100'
                  }`}>
                    <Wrench className={`w-5 h-5 md:w-6 md:h-6 ${
                      SERVICE_STATUS_COLORS[service.status]?.replace('bg-', 'text-') || 'text-gray-600'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{service.cliente_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 md:gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{service.cliente_phone}</span>
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {SERVICE_TYPE_LABELS[service.tipo_servico as ServiceType] || service.tipo_servico}
                      {service.data_agendamento && (
                        <span className="ml-1 md:ml-2 flex items-center gap-0.5 md:gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(service.data_agendamento).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    {service.tecnico_name ? (
                      <p className="text-sm font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {service.tecnico_name}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Sem técnico</p>
                    )}
                    <Badge className={SERVICE_STATUS_COLORS[service.status]}>
                      {SERVICE_STATUS_LABELS[service.status]}
                    </Badge>
                  </div>
                  <div className="sm:hidden">
                    <Badge className={SERVICE_STATUS_COLORS[service.status]}>
                      {SERVICE_STATUS_LABELS[service.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={(e) => handleEditService(service, e)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={(e) => handleDeleteService(service.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Detalhes do Serviço
            </DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedService.cliente_name}</p>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedService.cliente_phone}
                  </p>
                  {selectedService.cliente_address && (
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedService.cliente_address}
                    </p>
                  )}
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Tipo de Serviço</p>
                  <p className="font-medium">
                    {SERVICE_TYPE_LABELS[selectedService.tipo_servico as ServiceType] || selectedService.tipo_servico}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado por: {selectedService.criado_por === 'admin' ? 'Admin' : 'Técnico'}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="font-medium">{selectedService.descricao || 'Sem descrição'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedService.data_agendamento && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Data Agendada</p>
                    <p className="font-medium">
                      {new Date(selectedService.data_agendamento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {selectedService.data_inicio && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Data Início</p>
                    <p className="font-medium">
                      {new Date(selectedService.data_inicio).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                {selectedService.data_finalizacao && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Data Finalização</p>
                    <p className="font-medium">
                      {new Date(selectedService.data_finalizacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                {selectedService.finalizado_por && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Finalizado por</p>
                    <p className="font-medium">{selectedService.finalizado_por}</p>
                  </div>
                )}
              </div>

              {selectedService.observacoes_tecnico && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-xs text-green-600">Observações do Técnico</p>
                  <p className="font-medium">{selectedService.observacoes_tecnico}</p>
                </div>
              )}

              {/* Fotos do Início */}
              {selectedService.fotos_inicio && selectedService.fotos_inicio.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    Fotos do Início ({selectedService.fotos_inicio.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedService.fotos_inicio.map((foto, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={foto} alt={`Foto início ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fotos da Finalização */}
              {selectedService.fotos_final && selectedService.fotos_final.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    Fotos da Finalização ({selectedService.fotos_final.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedService.fotos_final.map((foto, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={foto} alt={`Foto final ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assinatura do Cliente */}
              {selectedService.assinatura_cliente && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Assinatura do Cliente
                  </p>
                  <div className="border rounded-lg p-2 bg-white">
                    <img src={selectedService.assinatura_cliente} alt="Assinatura do Cliente" className="h-24 mx-auto" />
                  </div>
                </div>
              )}

              {/* Technician Assignment */}
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                <p className="text-sm font-medium text-red-800 mb-3">Técnico Responsável</p>
                <Select
                  value={selectedService.tecnico_id || ''}
                  onValueChange={(value) => handleAssignTech(selectedService.id, value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sem_tecnico">Nenhum técnico</SelectItem>
            {safeTechnicians.map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Update */}
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                <p className="text-sm font-medium text-red-800 mb-3">Status do Serviço</p>
                <div className="flex gap-2 flex-wrap">
                  {SERVICE_STATUS_ORDER.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedService.status === status ? 'default' : 'outline'}
                      className={selectedService.status === status ? SERVICE_STATUS_COLORS[status] : ''}
                      onClick={() => handleUpdateStatus(selectedService.id, status)}
                    >
                      {SERVICE_STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* History Button */}
              <Button variant="outline" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                Ver Histórico
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico de Alterações</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {serviceHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum histórico disponível</p>
            ) : (
              serviceHistory.map(h => (
                <div key={h.id} className="border-b pb-2">
                  <p className="font-medium text-sm">{h.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.old_value && `${h.old_value} → `}{h.new_value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Por: {h.changed_by} em {new Date(h.changed_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Service Dialog */}
      <CreateServiceDialog 
        open={showCreate} 
        onOpenChange={setShowCreate}
        technicians={safeTechnicians}
        onCreated={() => {
          setShowCreate(false);
          loadData(); // Refresh services list
        }}
      />

      {/* Edit Service Dialog */}
      <EditServiceDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        service={selectedService}
        technicians={safeTechnicians}
        onUpdated={() => {
          loadData();
        }}
      />
    </div>
  );
}

function CreateServiceDialog({ open, onOpenChange, technicians, onCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicians: any[];
  onCreated: () => void;
}) {
  const { addServico, saveCustomer } = useData();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    cliente_name: '',
    cliente_phone: '',
    cliente_email: '',
    cliente_cpf: '',
    cliente_address: '',
    cliente_city: '',
    cliente_state: '',
    tipo_servico: 'instalacao' as ServiceType,
    descricao: '',
    data_agendamento: '',
    tecnico_id: 'sem_tecnico',
    vehicle: '',
    plate: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_color: '',
  });

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    console.log("🚀 Iniciando criação de serviço e cliente...");
    
    if (!form.cliente_name || !form.cliente_phone) {
      alert("Nome e telefone do cliente são obrigatórios!");
      return;
    }
    
    setSaving(true);
    
    try {
      // 1. Criar o cliente primeiro
      const clienteResult = await saveCustomer({
        full_name: form.cliente_name,
        phone: form.cliente_phone,
        email: form.cliente_email || null,
        cpf_cnpj: form.cliente_cpf || null,
        street: form.cliente_address || null,
        city: form.cliente_city || null,
        state: form.cliente_state || null,
        brand: form.vehicle_brand || null,
        model: form.vehicle_model || null,
        color: form.vehicle_color || null,
        plate: form.plate || null,
        status: 'novo_cadastro',
      });

      if (!clienteResult?.success) {
        throw new Error(clienteResult?.error || "Erro ao cadastrar cliente");
      }

      console.log("✅ Cliente criado com sucesso");

      // 2. Criar o serviço
      const tech = technicians.find(t => t.id === form.tecnico_id && form.tecnico_id !== 'sem_tecnico');
      const tecnicoId = form.tecnico_id !== 'sem_tecnico' ? form.tecnico_id : '';
      
      const serviceData = {
        client_name: form.cliente_name,
        client_phone: form.cliente_phone,
        client_address: form.cliente_address || null,
        observations: form.descricao || null,
        scheduled_date: form.data_agendamento || null,
        technician_id: tecnicoId || null,
        technician_name: tech?.name || tech?.nome || null,
        status: tecnicoId ? 'designado' : 'pendente',
        vehicle: `${form.vehicle_brand} ${form.vehicle_model}`.trim() || form.vehicle || null,
        plate: form.plate || null,
      };

      const serviceResult = await addServico(serviceData);
      
      if (!serviceResult?.success) {
        throw new Error(serviceResult?.error || "Erro ao cadastrar serviço");
      }
      
      console.log("✅ Serviço criado com sucesso!");
      
      alert("Cliente e Serviço cadastrados com sucesso!");
      
      setForm({
        cliente_name: '',
        cliente_phone: '',
        cliente_email: '',
        cliente_cpf: '',
        cliente_address: '',
        cliente_city: '',
        cliente_state: '',
        tipo_servico: 'instalacao',
        descricao: '',
        data_agendamento: '',
        tecnico_id: 'sem_tecnico',
        vehicle: '',
        plate: '',
        vehicle_brand: '',
        vehicle_model: '',
        vehicle_color: '',
      });
      
      onCreated();
    } catch (err: any) {
      console.error("❌ Erro:", err);
      alert(`Erro: ${err.message || "Erro desconhecido"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Serviço + Cliente
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Cadastra cliente e serviço ao mesmo tempo</p>
        </DialogHeader>
        <div className="space-y-4">
          {/* Cliente Info */}
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Cliente
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome do Cliente *</Label>
              <Input 
                value={form.cliente_name}
                onChange={(e) => setForm({...form, cliente_name: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input 
                value={form.cliente_phone}
                onChange={(e) => setForm({...form, cliente_phone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                value={form.cliente_email}
                onChange={(e) => setForm({...form, cliente_email: e.target.value})}
                placeholder="email@exemplo.com"
                type="email"
              />
            </div>
            <div>
              <Label>CPF</Label>
              <Input 
                value={form.cliente_cpf}
                onChange={(e) => setForm({...form, cliente_cpf: e.target.value})}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="col-span-2">
              <Label>Endereço</Label>
              <Input 
                value={form.cliente_address}
                onChange={(e) => setForm({...form, cliente_address: e.target.value})}
                placeholder="Rua, número, bairro"
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input 
                value={form.cliente_city}
                onChange={(e) => setForm({...form, cliente_city: e.target.value})}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Input 
                value={form.cliente_state}
                onChange={(e) => setForm({...form, cliente_state: e.target.value})}
                placeholder="UF"
                maxLength={2}
                className="uppercase"
              />
            </div>
          </div>

          {/* Veículo Info */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Dados do Veículo
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Marca</Label>
              <Input 
                value={form.vehicle_brand}
                onChange={(e) => setForm({...form, vehicle_brand: e.target.value})}
                placeholder="Ex: Toyota"
              />
            </div>
            <div>
              <Label>Modelo</Label>
              <Input 
                value={form.vehicle_model}
                onChange={(e) => setForm({...form, vehicle_model: e.target.value})}
                placeholder="Ex: Corolla"
              />
            </div>
            <div>
              <Label>Cor</Label>
              <Input 
                value={form.vehicle_color}
                onChange={(e) => setForm({...form, vehicle_color: e.target.value})}
                placeholder="Ex: Prata"
              />
            </div>
            <div>
              <Label>Placa</Label>
              <Input 
                value={form.plate}
                onChange={(e) => setForm({...form, plate: e.target.value.toUpperCase()})}
                placeholder="ABC-1234"
                className="uppercase"
              />
            </div>
          </div>

          {/* Serviço Info */}
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Dados do Serviço
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo de Serviço</Label>
              <Select 
                value={form.tipo_servico}
                onValueChange={(v) => setForm({...form, tipo_servico: v as ServiceType})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Agendamento</Label>
              <Input 
                type="date"
                value={form.data_agendamento}
                onChange={(e) => setForm({...form, data_agendamento: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label>Atribuir Técnico</Label>
              <Select 
                value={form.tecnico_id}
                onValueChange={(v) => setForm({...form, tecnico_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar técnico (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem_tecnico">Nenhum técnico</SelectItem>
                  {(technicians || []).map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>{tech.name || tech.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Descrição / Observações</Label>
              <Textarea 
                value={form.descricao}
                onChange={(e) => setForm({...form, descricao: e.target.value})}
                placeholder="Descrição do serviço..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={saving || !form.cliente_name || !form.cliente_phone}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Cliente + Serviço
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditServiceDialog({ open, onOpenChange, service, technicians, onUpdated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  technicians: any[];
  onUpdated: () => void;
}) {
  const { updateServico } = useData();
  const [form, setForm] = useState({
    cliente_name: '',
    cliente_phone: '',
    cliente_address: '',
    tipo_servico: 'instalacao' as ServiceType,
    status: 'pendente' as ServiceStatus,
    descricao: '',
    data_agendamento: '',
    tecnico_id: '',
    tecnico_name: '',
    vehicle: '',
    plate: '',
  });

  useEffect(() => {
    if (service) {
      setForm({
        cliente_name: service.cliente_name || '',
        cliente_phone: service.cliente_phone || '',
        cliente_address: service.cliente_address || '',
        tipo_servico: service.tipo_servico as ServiceType || 'instalacao',
        status: service.status || 'pendente',
        descricao: service.descricao || '',
        data_agendamento: service.data_agendamento ? service.data_agendamento.split('T')[0] : '',
        tecnico_id: service.tecnico_id || 'sem_tecnico',
        tecnico_name: service.tecnico_name || '',
        vehicle: service.vehicle || '',
        plate: service.plate || '',
      });
    }
  }, [service]);

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!form.cliente_name || !form.cliente_phone || !service) return;
    
    console.log("🚀 Atualizando serviço:", service.id);
    
    try {
      const tech = technicians.find(t => t.id === form.tecnico_id && form.tecnico_id !== 'sem_tecnico');
      
      const updateData = {
        client_id: service.cliente_id,
        client_name: form.cliente_name,
        client_phone: form.cliente_phone,
        client_address: form.cliente_address,
        type: form.tipo_servico,
        technician_id: form.tecnico_id && form.tecnico_id !== 'sem_tecnico' ? form.tecnico_id : undefined,
        technician_name: tech?.nome,
        status: form.status as any,
        observations: form.descricao,
        scheduled_date: form.data_agendamento || undefined,
        vehicle: form.vehicle,
        plate: form.plate,
      };

      console.log("📋 Novos dados:", updateData);
      
      await updateServico(service.id, updateData);
      
      console.log("✅ Serviço atualizado com sucesso!");
      
      onUpdated();
      onOpenChange(false);
    } catch (err: any) {
      console.error("❌ Erro ao atualizar serviço:", err);
      const errorMessage = err.message || "Erro desconhecido";
      alert(`Erro ao atualizar serviço: ${errorMessage}. Verifique o console para mais detalhes.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Editar Serviço
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do Cliente *</Label>
            <Input 
              value={form.cliente_name}
              onChange={(e) => setForm({...form, cliente_name: e.target.value})}
              placeholder="Nome completo"
            />
          </div>
          <div>
            <Label>Telefone *</Label>
            <Input 
              value={form.cliente_phone}
              onChange={(e) => setForm({...form, cliente_phone: e.target.value})}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input 
              value={form.cliente_address}
              onChange={(e) => setForm({...form, cliente_address: e.target.value})}
              placeholder="Endereço completo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Serviço</Label>
              <Select 
                value={form.tipo_servico}
                onValueChange={(v) => setForm({...form, tipo_servico: v as ServiceType})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select 
                value={form.status}
                onValueChange={(v) => setForm({...form, status: v as ServiceStatus})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>{SERVICE_STATUS_LABELS[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Agendamento</Label>
              <Input 
                type="date"
                value={form.data_agendamento}
                onChange={(e) => setForm({...form, data_agendamento: e.target.value})}
              />
            </div>
            <div>
              <Label>Atribuir Técnico</Label>
              <Select 
                value={form.tecnico_id}
                onValueChange={(v) => setForm({...form, tecnico_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem_tecnico">Nenhum técnico</SelectItem>
                  {(technicians || []).map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>{tech.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea 
              value={form.descricao}
              onChange={(e) => setForm({...form, descricao: e.target.value})}
              placeholder="Descrição do serviço..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Veículo *</Label>
              <Input 
                value={form.vehicle}
                onChange={(e) => setForm({...form, vehicle: e.target.value})}
                placeholder="Ex: Corolla"
              />
            </div>
            <div>
              <Label>Placa *</Label>
              <Input 
                value={form.plate}
                onChange={(e) => setForm({...form, plate: e.target.value})}
                placeholder="ABC-1234"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600"
            disabled={!form.cliente_name || !form.cliente_phone}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
