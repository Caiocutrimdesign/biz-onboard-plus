import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, Search, Filter, User, Calendar, CheckCircle, 
  Clock, XCircle, ChevronRight, Loader2, RefreshCw, 
  History, UserPlus, Eye, Plus, Phone, MapPin, ArrowRightCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useServices } from '@/contexts/ServiceContext';
import type { Service, ServiceStatus, ServiceType } from '@/types/service';
import { SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS, SERVICE_STATUS_ORDER } from '@/types/service';
import { getTecnicos } from '@/contexts/AuthContext';
import { customerService } from '@/lib/customerService';

type TabType = 'todos' | 'pendente' | 'designado' | 'em_andamento' | 'finalizado' | 'cancelado';

export default function ServicesPage() {
  const { services, loading, loadServices, assignTech, updateServiceStatus, createService } = useServices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('todos');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTechnicians(getTecnicos());
    loadServices();
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = !search || 
      s.cliente_name.toLowerCase().includes(search.toLowerCase()) ||
      s.cliente_phone.includes(search) ||
      s.descricao?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesTab = activeTab === 'todos' || s.status === activeTab;
    const matchesTech = techFilter === 'all' || s.tecnico_id === techFilter;
    return matchesSearch && matchesStatus && matchesTab && matchesTech;
  });

  const handleAssignTech = (serviceId: string, techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (tech) {
      assignTech(serviceId, tech.id, tech.name);
      loadData();
      if (selectedService?.id === serviceId) {
        setSelectedService(services.find(s => s.id === serviceId) || null);
      }
    }
  };

  const handleReassignTech = (serviceId: string, techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (tech) {
      assignTech(serviceId, tech.id, tech.name);
      loadData();
      setShowDetail(false);
    }
  };

  const handleUpdateStatus = (serviceId: string, status: ServiceStatus) => {
    updateServiceStatus(serviceId, status);
    loadData();
    if (selectedService?.id === serviceId) {
      setSelectedService(services.find(s => s.id === serviceId) || null);
    }
  };

  const openDetail = (service: Service) => {
    setSelectedService(service);
    setServiceHistory([]);
    setShowDetail(true);
  };

  const stats = {
    total: services.length,
    pendente: services.filter(s => s.status === 'pendente').length,
    designado: services.filter(s => s.status === 'designado').length,
    emAndamento: services.filter(s => s.status === 'em_andamento').length,
    finalized: services.filter(s => s.status === 'finalizado').length,
    cancelado: services.filter(s => s.status === 'cancelado').length,
  };

  const tabs: { id: TabType; label: string; count: number; color: string; activeBg: string }[] = [
    { id: 'todos', label: 'Todos', count: stats.total, color: 'text-gray-500', activeBg: 'bg-gray-500' },
    { id: 'pendente', label: 'Pendente', count: stats.pendente, color: 'text-yellow-600', activeBg: 'bg-yellow-500' },
    { id: 'designado', label: 'Designado', count: stats.designado, color: 'text-purple-600', activeBg: 'bg-purple-500' },
    { id: 'em_andamento', label: 'Em Andamento', count: stats.emAndamento, color: 'text-blue-600', activeBg: 'bg-blue-500' },
    { id: 'finalizado', label: 'Finalizado', count: stats.finalized, color: 'text-green-600', activeBg: 'bg-green-500' },
    { id: 'cancelado', label: 'Cancelado', count: stats.cancelado, color: 'text-red-600', activeBg: 'bg-red-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-7 h-7 text-orange-500" />
            Serviços
          </h1>
          <p className="text-muted-foreground">Gerencie todos os serviços</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.pendente}</p>
              <p className="text-xs text-muted-foreground">Pendente</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.designado}</p>
              <p className="text-xs text-muted-foreground">Designado</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ArrowRightCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.emAndamento}</p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.finalized}</p>
              <p className="text-xs text-muted-foreground">Finalizado</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.cancelado}</p>
              <p className="text-xs text-muted-foreground">Cancelado</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? `${tab.activeBg} text-white shadow-md` 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                {isActive && <CheckCircle className="w-4 h-4" />}
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-muted'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
        <Select value={techFilter} onValueChange={setTechFilter}>
          <SelectTrigger className="w-48 h-12 rounded-xl">
            <SelectValue placeholder="Técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Técnicos</SelectItem>
            {technicians.map(tech => (
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
              className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDetail(service)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    SERVICE_STATUS_COLORS[service.status]?.replace('text-', 'bg-').replace('800', '100') || 'bg-gray-100'
                  }`}>
                    <Wrench className={`w-6 h-6 ${
                      SERVICE_STATUS_COLORS[service.status]?.replace('bg-', 'text-') || 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{service.cliente_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {service.cliente_phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {SERVICE_TYPE_LABELS[service.tipo_servico as ServiceType] || service.tipo_servico}
                      {service.data_agendamento && (
                        <span className="ml-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(service.data_agendamento).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {service.tecnico_name ? (
                      <p className="text-sm font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {service.tecnico_name}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem técnico</p>
                    )}
                    <Badge className={SERVICE_STATUS_COLORS[service.status]}>
                      {SERVICE_STATUS_LABELS[service.status]}
                    </Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
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

              {/* Technician Assignment */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                <p className="text-sm font-medium text-orange-800 mb-3">Técnico Responsável</p>
                <Select
                  value={selectedService.tecnico_id || ''}
                  onValueChange={(value) => handleAssignTech(selectedService.id, value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Selecionar técnico...</SelectItem>
                    {technicians.map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Update */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-3">Status do Serviço</p>
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
        technicians={technicians}
        onCreated={() => {
          loadData();
          setShowCreate(false);
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
  const { createService } = useServices();
  const [form, setForm] = useState({
    cliente_name: '',
    cliente_phone: '',
    cliente_address: '',
    tipo_servico: 'instalacao' as ServiceType,
    descricao: '',
    data_agendamento: '',
    tecnico_id: '',
  });

  const handleSubmit = () => {
    if (!form.cliente_name || !form.cliente_phone) return;
    
    const tech = technicians.find(t => t.id === form.tecnico_id);
    
    createService({
      cliente_id: `cliente_${Date.now()}`,
      cliente_name: form.cliente_name,
      cliente_phone: form.cliente_phone,
      cliente_address: form.cliente_address,
      tipo_servico: form.tipo_servico,
      descricao: form.descricao,
      data_agendamento: form.data_agendamento || undefined,
      tecnico_id: form.tecnico_id || undefined,
      tecnico_name: tech?.name,
      criado_por: 'admin',
    });
    
    setForm({
      cliente_name: '',
      cliente_phone: '',
      cliente_address: '',
      tipo_servico: 'instalacao',
      descricao: '',
      data_agendamento: '',
      tecnico_id: '',
    });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
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
              <Label>Data Agendamento</Label>
              <Input 
                type="date"
                value={form.data_agendamento}
                onChange={(e) => setForm({...form, data_agendamento: e.target.value})}
              />
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
          <div>
            <Label>Atribuir Técnico</Label>
            <Select 
              value={form.tecnico_id}
              onValueChange={(v) => setForm({...form, tecnico_id: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar técnico (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum - Ficará pendente</SelectItem>
                {technicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit}
            className="bg-orange-500"
            disabled={!form.cliente_name || !form.cliente_phone}
          >
            Criar Serviço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
