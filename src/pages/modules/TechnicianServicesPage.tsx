import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, Search, Plus, Check, Clock, User, Phone, 
  MapPin, Calendar, CheckCircle, Play, XCircle,
  ChevronLeft, Loader2, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  getAssignedServicesForTechnician, 
  getServicesByTechnician,
  startService, 
  finishService as finishServiceCtx, 
  createService 
} from '@/contexts/ServiceContext';
import type { Service, ServiceStatus, ServiceType } from '@/types/service';
import { SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS } from '@/types/service';
import ServiceDetailPage from './ServiceDetailPage';

type TabType = 'designados' | 'todos';

interface TechnicianServicesPageProps {
  tecnicoId: string;
  tecnicoName: string;
}

export default function TechnicianServicesPage({ tecnicoId, tecnicoName }: TechnicianServicesPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('designados');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [finishObs, setFinishObs] = useState('');

  useEffect(() => {
    loadServices();
  }, [tecnicoId]);

  const loadServices = () => {
    setLoading(true);
    if (activeTab === 'designados') {
      setServices(getAssignedServicesForTechnician(tecnicoId));
    } else {
      setServices(getServicesByTechnician(tecnicoId));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, [activeTab, tecnicoId]);

  const handleStartService = () => {
    if (selectedService) {
      startService(selectedService.id);
      loadServices();
      setShowStartDialog(false);
      setSelectedService(null);
    }
  };

  const handleFinishService = () => {
    if (selectedService && finishObs.trim()) {
      finishServiceCtx(selectedService.id, finishObs, tecnicoName);
      loadServices();
      setShowFinishDialog(false);
      setFinishObs('');
      setSelectedService(null);
    }
  };

  const stats = {
    designado: services.filter(s => s.status === 'designado').length,
    emAndamento: services.filter(s => s.status === 'em_andamento').length,
    finalized: services.filter(s => s.status === 'finalizado').length,
    total: services.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-7 h-7 text-orange-500" />
            Meus Serviços
          </h1>
          <p className="text-muted-foreground">Gerencie seus serviços</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.designado}</p>
              <p className="text-xs text-muted-foreground">Designados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600" />
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
              <p className="text-xs text-muted-foreground">Finalizados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('designados')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'designados' 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Designados</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'designados' ? 'bg-white/20' : 'bg-muted'}`}>
              {stats.designado}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'todos' 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Todos</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'todos' ? 'bg-white/20' : 'bg-muted'}`}>
              {stats.total}
            </span>
          </button>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Wrench className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhum serviço encontrado</p>
          {activeTab === 'designados' && (
            <p className="text-sm mt-2">Você não tem serviços designados no momento</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedService(service);
                setShowDetailPage(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    SERVICE_STATUS_COLORS[service.status]?.replace('text-', 'bg-').replace('800', '100') || 'bg-gray-100'
                  }`}>
                    <Wrench className={`w-6 h-6 ${
                      SERVICE_STATUS_COLORS[service.status]?.replace('bg-', 'text-').replace('100', '600') || 'text-gray-600'
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
                    </p>
                    {service.data_agendamento && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(service.data_agendamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={SERVICE_STATUS_COLORS[service.status]}>
                    {SERVICE_STATUS_LABELS[service.status]}
                  </Badge>
                  {service.status === 'designado' && (
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                        setShowStartDialog(true);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  {service.status === 'em_andamento' && (
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                        setShowDetailPage(true);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Finalizar
                    </Button>
                  )}
                </div>
              </div>
              {service.descricao && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Descrição:</span> {service.descricao}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Start Service Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Serviço</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">{selectedService.cliente_name}</p>
                <p className="text-sm text-muted-foreground">{selectedService.cliente_phone}</p>
                <p className="text-sm">
                  {SERVICE_TYPE_LABELS[selectedService.tipo_servico as ServiceType]}
                </p>
              </div>
              <p>Ao iniciar, a data de início será registrada.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>Cancelar</Button>
            <Button onClick={handleStartService} className="bg-blue-500">
              <Play className="w-4 h-4 mr-2" />
              Iniciar Serviço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Service Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Serviço</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">{selectedService.cliente_name}</p>
                <p className="text-sm text-muted-foreground">{selectedService.cliente_phone}</p>
                <p className="text-sm">
                  {SERVICE_TYPE_LABELS[selectedService.tipo_servico as ServiceType]}
                </p>
              </div>
              <div>
                <Label>Observações *</Label>
                <Textarea 
                  value={finishObs}
                  onChange={(e) => setFinishObs(e.target.value)}
                  placeholder="Descreva o serviço realizado..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>Cancelar</Button>
            <Button 
              onClick={handleFinishService} 
              className="bg-green-500"
              disabled={!finishObs.trim()}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar Serviço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Service Dialog */}
      <CreateServiceDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        tecnicoId={tecnicoId}
        tecnicoName={tecnicoName}
        onCreated={() => {
          loadServices();
          setShowCreateDialog(false);
        }}
      />

      {/* Service Detail Page */}
      {showDetailPage && selectedService && (
        <ServiceDetailPage
          service={selectedService}
          tecnicoId={tecnicoId}
          tecnicoName={tecnicoName}
          onBack={() => {
            setShowDetailPage(false);
            setSelectedService(null);
            loadServices();
          }}
          onUpdated={() => {
            loadServices();
          }}
        />
      )}
    </div>
  );
}

function CreateServiceDialog({ open, onOpenChange, tecnicoId, tecnicoName, onCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tecnicoId: string;
  tecnicoName: string;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    cliente_name: '',
    cliente_phone: '',
    cliente_address: '',
    tipo_servico: 'instalacao' as ServiceType,
    descricao: '',
    data_agendamento: '',
  });

  const handleSubmit = () => {
    if (!form.cliente_name || !form.cliente_phone) return;
    
    createService({
      cliente_id: `cliente_${Date.now()}`,
      cliente_name: form.cliente_name,
      cliente_phone: form.cliente_phone,
      cliente_address: form.cliente_address,
      tipo_servico: form.tipo_servico,
      descricao: form.descricao,
      data_agendamento: form.data_agendamento || undefined,
      tecnico_id: tecnicoId,
      tecnico_name: tecnicoName,
      criado_por: 'tecnico',
    });
    
    setForm({
      cliente_name: '',
      cliente_phone: '',
      cliente_address: '',
      tipo_servico: 'instalacao',
      descricao: '',
      data_agendamento: '',
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
