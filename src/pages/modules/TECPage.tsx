import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Plus, X, Check, Camera, Pen, FileText, 
  Clock, User, Phone, Car, MapPin, DollarSign, Package,
  ChevronLeft, Save, Loader2, Trash2, AlertCircle,
  CheckCircle, MapPinned, Image, Shield, Star, ThumbsUp,
  ClipboardList, CheckSquare, Calendar, Truck, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import SuperLayout from '@/components/layout/SuperLayout';
import { crmService } from '@/lib/crmService';
import { getAssignedServicesForTechnician, finishService as finishServiceCtx, updateService as updateServiceCtx, getServicesByTechnician, startService as startServiceCtx, createService as createServiceCtx } from '@/contexts/ServiceContext';
import type { Service, ServiceStatus, ServiceType, PhotoType, Technician } from '@/types/tec';
import type { Service as AppService, ServiceStatus as AppServiceStatus } from '@/types/service';
import { SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS } from '@/types/service';
import TechnicianServicesPage from './TechnicianServicesPage';
import { useData } from '@/contexts/DataContext';

// ============ TYPES & CONSTANTS ============

type TECView = 'home' | 'novo-cliente' | 'servico' | 'vendas' | 'finalizar' | 'meus-servicos' | 'servicos-designados' | 'novo-servico';
type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  vehicle?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  plate?: string;
  renavam?: string;
  technician_id?: string;
  technician_name?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: 'gps_plus' | 'central' | 'cobertura';
  isMonthly?: boolean;
};

type CompanyCategory = {
  id: 'gps_plus' | 'central' | 'cobertura';
  name: string;
  description: string;
  icon: string;
  color: string;
};

const COMPANIES: CompanyCategory[] = [
  { 
    id: 'gps_plus', 
    name: 'GPS+', 
    description: 'Rastreamento basico com localizacao em tempo real',
    icon: 'MapPinned',
    color: 'blue'
  },
  { 
    id: 'central', 
    name: 'Rastreamento com Central', 
    description: 'Rastreamento + Central 24h + Bloqueio Remoto',
    icon: 'Shield',
    color: 'purple'
  },
  { 
    id: 'cobertura', 
    name: 'Cobertura / Protecao', 
    description: 'Protecao + Seguro + Assistencia 24h (Filip / Top Pro)',
    icon: 'Star',
    color: 'amber'
  },
];

const PRODUCTS: Product[] = [
  // GPS+ Products
  { id: 'gps_1', name: 'Kit GPS+ Basic', price: 297, description: 'Equipamento + Instalacao', category: 'gps_plus' },
  { id: 'gps_2', name: 'Mensalidade GPS+ Basic', price: 49.90, description: 'Taxa mensal', category: 'gps_plus', isMonthly: true },
  
  // Central Products
  { id: 'cen_1', name: 'Kit Central Premium', price: 497, description: 'Equipamento + Central 24h + App', category: 'central' },
  { id: 'cen_2', name: 'Kit Central Gold', price: 697, description: 'Equipamento + Central + Bloqueio + App', category: 'central' },
  { id: 'cen_3', name: 'Mensalidade Central', price: 79.90, description: 'Taxa mensal', category: 'central', isMonthly: true },
  
  // Cobertura Products
  { id: 'cob_1', name: 'Protecao Filip Basic', price: 397, description: 'Protecao + Assistencia', category: 'cobertura' },
  { id: 'cob_2', name: 'Protecao Filip Plus', price: 597, description: 'Protecao + Seguro + Assistencia', category: 'cobertura' },
  { id: 'cob_3', name: 'Top Pro Cobertura', price: 797, description: 'Cobertura Total + Seguro Completo', category: 'cobertura' },
  { id: 'cob_4', name: 'Mensalidade Cobertura', price: 99.90, description: 'Taxa mensal', category: 'cobertura', isMonthly: true },
  
  // Additional Services
  { id: 'inst_1', name: 'Instalacao', price: 150, description: 'Servico de instalacao', category: 'gps_plus' },
];

// ============ HELPERS (Hoisted) ============

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
    'designado': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
    'em_andamento': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700' },
    'concluido': { label: 'Concluido', color: 'bg-green-100 text-green-700' },
    'finalizado': { label: 'Concluido', color: 'bg-green-100 text-green-700' },
  };
  const config = configs[status] || configs['pendente'];
  return (
    <Badge className={config.color}>{config.label}</Badge>
  );
}

// ============ SUB-VIEWS (Hoisted) ============

type FilterTab = 'todos' | 'pendente' | 'em_andamento' | 'concluido';

function HomeView({ services, loading, onNewClient, userName, goTo }: {
  services: Service[];
  loading: boolean;
  onNewClient: () => void;
  userName: string;
  goTo: (view: TECView) => void;
}) {
  const [filterTab, setFilterTab] = useState<FilterTab>('todos');

  // Protection: ensure services is always an array
  const safeServices = Array.isArray(services) ? services : [];

  const stats = {
    today: safeServices.filter(s => 
      s?.created_at && new Date(s.created_at).toDateString() === new Date().toDateString()
    ).length,
    pending: safeServices.filter(s => s?.status === 'pendente').length,
    inProgress: safeServices.filter(s => s?.status === 'em_andamento').length,
    completed: safeServices.filter(s => s?.status === 'concluido' || s?.status === 'finalizado').length,
    all: safeServices.length,
  };

  const filteredServices = safeServices.filter(service => {
    if (!service) return false;
    if (filterTab === 'todos') return true;
    if (filterTab === 'concluido') return service.status === 'concluido' || service.status === 'finalizado';
    return service.status === filterTab;
  });

  const filterTabs: { id: FilterTab; label: string; count: number; color: string; activeBg: string }[] = [
    { id: 'todos', label: 'Todos', count: stats.all, color: 'text-gray-500', activeBg: 'bg-gray-500' },
    { id: 'pendente', label: 'Pendentes', count: stats.pending, color: 'text-yellow-600', activeBg: 'bg-yellow-500' },
    { id: 'em_andamento', label: 'Em Andamento', count: stats.inProgress, color: 'text-blue-600', activeBg: 'bg-blue-500' },
    { id: 'concluido', label: 'Finalizadas', count: stats.completed, color: 'text-green-600', activeBg: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-7 h-7 text-orange-500" />
            Area do Tecnico
          </h1>
          <p className="text-muted-foreground">Bem-vindo, {userName}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onNewClient} 
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Servico
          </Button>
          <Button 
            variant="outline"
            onClick={() => goTo('meus-servicos')}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Meus Servicos
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluidos</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  filterTab === tab.id ? `${tab.activeBg} text-white` : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
                }`}
              >
                <span>{tab.label}</span>
                <Badge variant={filterTab === tab.id ? 'secondary' : 'outline'} className={filterTab === tab.id ? 'bg-white/20' : ''}>
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum servico encontrado.</p>
            ) : (
              filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const [expanded, setExpanded] = useState(false);
  if (!service) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">{service.client_name}</p>
              <p className="text-sm text-muted-foreground">{service.vehicle} - {service.plate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={service.status} />
            <ChevronLeft className={`w-5 h-5 transition-transform ${expanded ? '-rotate-90' : 'rotate-180'}`} />
          </div>
        </div>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 border-t"
            >
              <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{service.client_phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{service.created_at ? new Date(service.created_at).toLocaleDateString() : '---'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Endereco</p>
                  <p className="font-medium">{service.client_address}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function ClientFormView({ client, onSave, onBack, technicians }: {
  client: Client | null;
  onSave: (client: Client) => void;
  onBack: () => void;
  technicians: Technician[];
}) {
  const [form, setForm] = useState<Client & { technician_id?: string; technician_name?: string }>(client || {
    id: `client_${Date.now()}`,
    name: '',
    phone: '',
    email: '',
    cpf: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    vehicle: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    plate: '',
    renavam: '',
    technician_id: '',
    technician_name: '',
  });
  const [step, setStep] = useState(1);

  const isValid = form.name.trim() && form.phone.trim();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Cadastro do Cliente</h1>
          <p className="text-sm text-muted-foreground">Passo {step} de 2 - Dados Pessoais</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-orange-500' : 'bg-muted'}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-orange-500' : 'bg-muted'}`} />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {step === 1 && (
            <>
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})}
                      placeholder="Nome completo"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-orange-600 font-bold">Responsável pelo Cadastro / Atendimento</label>
                  <Select 
                    value={form.technician_id || ''} 
                    onValueChange={(val) => {
                      const tec = technicians.find(t => t.id === val);
                      setForm({ ...form, technician_id: val, technician_name: tec?.name || '' });
                    }}
                  >
                    <SelectTrigger className="border-orange-200">
                      <SelectValue placeholder="Selecione um técnico (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum (Venda Direta)</SelectItem>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    Escolha quem será o responsável por este cliente ou deixe vazio para venda direta.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">CPF</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={form.cpf}
                      onChange={(e) => setForm({...form, cpf: formatCPF(e.target.value)})}
                      placeholder="000.000.000-00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: formatPhone(e.target.value)})}
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value.toLowerCase()})}
                      placeholder="email@exemplo.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Endereco */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Endereco</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-2 block">Logradouro</label>
                    <div className="relative">
                      <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={form.address}
                        onChange={(e) => setForm({...form, address: e.target.value})}
                        placeholder="Rua, numero, complemento"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">CEP</label>
                    <Input
                      value={form.cep}
                      onChange={(e) => setForm({...form, cep: formatCEP(e.target.value)})}
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bairro</label>
                    <Input
                      value={form.neighborhood}
                      onChange={(e) => setForm({...form, neighborhood: e.target.value})}
                      placeholder="Bairro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cidade</label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({...form, city: e.target.value.toUpperCase()})}
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Estado</label>
                    <Input
                      value={form.state}
                      onChange={(e) => setForm({...form, state: e.target.value.toUpperCase()})}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Dados do Veiculo */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Dados do Veiculo</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Marca</label>
                    <Input
                      value={form.vehicleBrand}
                      onChange={(e) => setForm({...form, vehicleBrand: e.target.value.toUpperCase()})}
                      placeholder="Ex: Fiat, VW, Chevrolet"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Modelo</label>
                    <Input
                      value={form.vehicleModel}
                      onChange={(e) => setForm({...form, vehicleModel: e.target.value.toUpperCase()})}
                      placeholder="Ex: Toro, Saveiro, Onix"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Ano</label>
                    <Input
                      value={form.vehicleYear}
                      onChange={(e) => setForm({...form, vehicleYear: e.target.value})}
                      placeholder="Ex: 2023"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cor</label>
                    <Input
                      value={form.vehicleColor}
                      onChange={(e) => setForm({...form, vehicleColor: e.target.value.toUpperCase()})}
                      placeholder="Ex: Preto, Branco, Prata"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Placa *</label>
                    <Input
                      value={form.plate}
                      onChange={(e) => setForm({...form, plate: e.target.value.toUpperCase()})}
                      placeholder="ABC-1234"
                      className="uppercase font-mono text-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Renavam</label>
                    <Input
                      value={form.renavam}
                      onChange={(e) => setForm({...form, renavam: e.target.value})}
                      placeholder="00000000000"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-xl mt-4">
                <p className="font-medium mb-2">Resumo do Cliente:</p>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><strong>Nome:</strong> {form.name}</p>
                  <p><strong>Telefone:</strong> {form.phone}</p>
                  <p><strong>Veiculo:</strong> {form.vehicleBrand} {form.vehicleModel} {form.vehicleYear}</p>
                  <p><strong>Placa:</strong> {form.plate}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        ) : (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Cancelar
          </Button>
        )}
        
        {step < 2 ? (
          <Button 
            onClick={() => setStep(step + 1)} 
            className="flex-1 bg-orange-500"
            disabled={step === 1 && !isValid}
          >
            Proximo
            <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        ) : (
          <Button 
            onClick={() => onSave(form)}
            className="flex-1 bg-green-600"
            disabled={!form.plate}
          >
            <Check className="w-4 h-4 mr-2" />
            Continuar para Vendas
          </Button>
        )}
      </div>
    </div>
  );
}

function SalesView({ client, cart, total, products, technicians, onAddProduct, onRemoveProduct, onStartService, onBack, onNewClient }: {
  client: Client | null;
  cart: Product[];
  total: number;
  products: Product[];
  technicians: Technician[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (index: number) => void;
  onStartService: (tecId?: string, tecName?: string) => void;
  onBack: () => void;
  onNewClient: () => void;
}) {
  const [selectedTec, setSelectedTec] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<'gps_plus' | 'central' | 'cobertura' | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  const filteredProducts = selectedCompany 
    ? products.filter(p => p.category === selectedCompany)
    : [];

  const handleStartService = () => {
    const tec = technicians.find(t => t.id === selectedTec);
    onStartService(selectedTec || undefined, tec?.name || undefined);
  };

  const selectCompany = (companyId: 'gps_plus' | 'central' | 'cobertura') => {
    setSelectedCompany(companyId);
    setShowPlans(true);
  };

  const goBackToCompanies = () => {
    setSelectedCompany(null);
    setShowPlans(false);
  };

  const getCompanyColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      amber: 'bg-amber-500',
    };
    return colors[color] || 'bg-primary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={showPlans ? goBackToCompanies : onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {showPlans ? 'Selecione os Planos' : 'Escolha a Categoria'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Cliente: {client?.name}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onNewClient}>
          Trocar Cliente
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-2 ${!showPlans ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            !showPlans ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-white'
          }`}>
            {!showPlans ? '1' : <Check className="w-4 h-4" />}
          </div>
          <span>Categoria</span>
        </div>
        <div className="flex-1 h-0.5 bg-muted">
          <div className={`h-full transition-all ${showPlans ? 'bg-primary w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center gap-2 ${showPlans ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            showPlans ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          <span>Planos</span>
        </div>
      </div>

      {/* Company Selection (Step 1) */}
      {!showPlans && (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground mb-4">
            Selecione a categoria do produto/servico:
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {COMPANIES.map((company) => (
              <Card 
                key={company.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all border-2"
                onClick={() => selectCompany(company.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${getCompanyColor(company.color)} flex items-center justify-center shadow-lg`}>
                      {company.id === 'gps_plus' && <MapPinned className="w-8 h-8 text-white" />}
                      {company.id === 'central' && <Shield className="w-8 h-8 text-white" />}
                      {company.id === 'cobertura' && <Star className="w-8 h-8 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                    </div>
                    <ChevronLeft className="w-6 h-6 text-muted-foreground rotate-180" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Plans Grid (Step 2) */}
      {showPlans && selectedCompany && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Planos disponiveis para {COMPANIES.find(c => c.id === selectedCompany)?.name}:
            </p>
            <Badge variant="outline">{filteredProducts.length} planos</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => !product.isMonthly && onAddProduct(product)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        product.isMonthly ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        {product.isMonthly ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <Package className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        {product.isMonthly && (
                          <Badge variant="outline" className="mt-1 text-xs bg-yellow-50">Mensalidade</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        R$ {product.price.toFixed(2)}
                      </p>
                      {!product.isMonthly && (
                        <Button size="sm" className="mt-2 bg-green-500" onClick={() => onAddProduct(product)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                      {product.isMonthly && (
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => onAddProduct(product)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Carrinho
            </span>
            <Badge>{cart.length} item(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {showPlans ? 'Selecione os produtos para adicionar ao carrinho' : 'Selecione uma categoria primeiro'}
            </p>
          ) : (
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveProduct(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technician Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Selecionar Tecnico para o Servico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {technicians.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum técnico cadastrado. Cadastre técnicos no painel Admin &gt; Cadastro Tec
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {technicians.map((tec) => (
                <button
                  key={tec.id}
                  onClick={() => setSelectedTec(tec.id)}
                  disabled={tec.status === 'inactive'}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTec === tec.id 
                      ? 'border-orange-500 bg-orange-50' 
                      : tec.status === 'inactive'
                        ? 'opacity-50 cursor-not-allowed bg-muted/30'
                        : 'hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedTec === tec.id ? 'bg-orange-500' : tec.status === 'inactive' ? 'bg-red-400' : 'bg-muted'}`} />
                    <span className="font-medium">{tec.name}</span>
                    {tec.status === 'inactive' && (
                      <Badge variant="outline" className="text-xs ml-1">Inativo</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedTec && (
            <p className="mt-3 text-sm text-muted-foreground">
              <Check className="w-4 h-4 inline mr-1 text-green-500" />
              Tecnico selecionado: {technicians.find(t => t.id === selectedTec)?.name}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action */}
      <Button 
        onClick={handleStartService}
        className="w-full h-14 text-lg bg-orange-500"
        disabled={cart.length === 0}
      >
        <Wrench className="w-5 h-5 mr-2" />
        Iniciar Servico
      </Button>
    </div>
  );
}

function ServiceView({ service, cart, total, onFinish, onBack }: {
  service: Partial<Service> | null;
  cart: Product[];
  total: number;
  onFinish: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Registro do Servico</h1>
            <p className="text-sm text-muted-foreground">
              {service?.client_name}
            </p>
          </div>
        </div>
      </div>

      {/* Service Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes do Servico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Veiculo</p>
              <p className="font-medium">{service?.vehicle}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Placa</p>
              <p className="font-medium font-mono">{service?.plate}</p>
            </div>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Endereco</p>
            <p className="font-medium">{service?.client_address || 'Nao informado'}</p>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-600">Valor Total</p>
            <p className="font-bold text-xl text-green-600">R$ {total.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos/Servicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between p-2 border-b">
                <span>{item.name}</span>
                <span className="font-medium">R$ {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <Button 
        onClick={onFinish}
        className="w-full h-14 text-lg bg-green-600"
      >
        <Check className="w-5 h-5 mr-2" />
        Finalizar Servico
      </Button>
    </div>
  );
}

function FinalizeView({ service, onSave, onBack }: {
  service: Partial<Service> | null;
  onSave: (data: {
    photos: Array<{ url: string; type: PhotoType }>;
    signatureFuncionario: string;
    signatureCliente: string;
    observations: string;
    rating?: number;
    comment?: string;
  }) => void;
  onBack: () => void;
}) {
  const [photos, setPhotos] = useState<Array<{ url: string; type: PhotoType; file?: File }>>([]);
  const [currentPhotoStep, setCurrentPhotoStep] = useState<1 | 2 | 3>(1);
  const [showSignatures, setShowSignatures] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [signatureFuncionario, setSignatureFuncionario] = useState<string>('');
  const [signatureCliente, setSignatureCliente] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const funcCanvasRef = useRef<HTMLCanvasElement>(null);
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawingFunc, setIsDrawingFunc] = useState(false);
  const [isDrawingClient, setIsDrawingClient] = useState(false);

  const photosAntes = photos.filter(p => p.type === 'antes');
  const photosDurante = photos.filter(p => p.type === 'durante');
  const photosDepois = photos.filter(p => p.type === 'depois');

  const step1Complete = photosAntes.length >= 1;
  const step2Complete = photosDurante.length >= 1;
  const step3Complete = photosDepois.length >= 1;

  const signaturesComplete = signatureFuncionario && signatureCliente;
  const satisfactionComplete = rating > 0;
  const canFinalize = step3Complete && signaturesComplete && satisfactionComplete;

  useEffect(() => {
    if (funcCanvasRef.current) {
      const canvas = funcCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  useEffect(() => {
    if (clientCanvasRef.current) {
      const canvas = clientCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCanvasCoords = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    setter(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCanvasCoords(canvas, e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
    isDrawing: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCanvasCoords(canvas, e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(false);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const typeMap: Record<1 | 2 | 3, PhotoType> = { 1: 'antes', 2: 'durante', 3: 'depois' };
      setPhotos([...photos, { url: reader.result as string, type: typeMap[currentPhotoStep as 1|2|3], file }]);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const clearSignature = (canvasRef: React.RefObject<HTMLCanvasElement | null>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setter('');
  };

  const saveSignature = (canvasRef: React.RefObject<HTMLCanvasElement | null>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setter(dataUrl);
  };

  const handleSave = async () => {
    if (!canFinalize) return;
    setSaving(true);
    
    const finalPhotos = photos.map((p) => ({
      url: p.url,
      type: p.type
    }));

    onSave({
      photos: finalPhotos,
      signatureFuncionario,
      signatureCliente,
      observations,
      rating,
      comment,
    });
    
    setShowSuccess(true);
    setSaving(false);
  };

  const currentStepLabel = currentPhotoStep === 1 ? 'Antes' : currentPhotoStep === 2 ? 'Durante' : 'Depois';
  const currentStepBg = currentPhotoStep === 1 ? 'bg-red-500' : currentPhotoStep === 2 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-6">
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
        >
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Servico Concluido!</h2>
            <p className="text-muted-foreground mb-6">Obrigado pela sua avaliacao!</p>
            <Button onClick={() => window.location.reload()} className="bg-green-600">
              Novo Servico
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={showSatisfaction ? () => setShowSatisfaction(false) : onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {showSatisfaction ? 'Avaliacao do Cliente' : showSignatures ? 'Assinaturas' : `Fotos ${currentStepLabel}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {!showSignatures ? `Etapa ${currentPhotoStep} de 3` : showSatisfaction ? 'Avalie o servico' : 'Confirme com assinaturas'}
            </p>
          </div>
        </div>
      </div>

      {!showSignatures && (
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Progresso das Fotos</span>
            <span className="text-sm font-bold">{photos.length} foto(s)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPhotoStep(1)}
              disabled={!step1Complete && currentPhotoStep !== 1}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all flex-1 ${
                step1Complete 
                  ? 'bg-green-100 text-green-800 border-2 border-green-500 cursor-pointer' 
                  : currentPhotoStep === 1 
                    ? `${currentStepBg} text-white` 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step1Complete ? <Check className="w-5 h-5" /> : <span className="w-5 h-5 flex items-center justify-center font-bold">1</span>}
              <div className="text-left">
                <p className="font-bold text-sm">Antes</p>
                <p className="text-xs opacity-70">{photosAntes.length} foto(s)</p>
              </div>
            </button>
            <div className={`w-8 h-0.5 ${step1Complete ? 'bg-green-500' : 'bg-gray-300'}`} />
            <button
              onClick={() => step1Complete && setCurrentPhotoStep(2)}
              disabled={!step1Complete}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all flex-1 ${
                step2Complete 
                  ? 'bg-green-100 text-green-800 border-2 border-green-500 cursor-pointer' 
                  : currentPhotoStep === 2 
                    ? `${currentStepBg} text-white` 
                    : !step1Complete 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-yellow-50 text-yellow-600 border-2 border-yellow-400 cursor-pointer'
              }`}
            >
              {step2Complete ? <Check className="w-5 h-5" /> : <span className="w-5 h-5 flex items-center justify-center font-bold">2</span>}
              <div className="text-left">
                <p className="font-bold text-sm">Durante</p>
                <p className="text-xs opacity-70">{photosDurante.length} foto(s)</p>
              </div>
            </button>
            <div className={`w-8 h-0.5 ${step2Complete ? 'bg-green-500' : 'bg-gray-300'}`} />
            <button
              onClick={() => step2Complete && setCurrentPhotoStep(3)}
              disabled={!step2Complete}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all flex-1 ${
                step3Complete 
                  ? 'bg-green-100 text-green-800 border-2 border-green-500 cursor-pointer' 
                  : currentPhotoStep === 3 
                    ? `${currentStepBg} text-white` 
                    : !step2Complete 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-50 text-green-600 border-2 border-green-400 cursor-pointer'
              }`}
            >
              {step3Complete ? <Check className="w-5 h-5" /> : <span className="w-5 h-5 flex items-center justify-center font-bold">3</span>}
              <div className="text-left">
                <p className="font-bold text-sm">Depois</p>
                <p className="text-xs opacity-70">{photosDepois.length} foto(s)</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {!showSignatures && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className={`w-5 h-5 ${
                  currentPhotoStep === 1 ? 'text-red-500' : 
                  currentPhotoStep === 2 ? 'text-yellow-500' : 'text-green-500'
                }`} />
                Fotos {currentStepLabel}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                currentPhotoStep === 1 ? 'border-red-300 hover:border-red-500 hover:bg-red-50' : 
                currentPhotoStep === 2 ? 'border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50' : 'border-green-300 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <Camera className={`w-16 h-16 mb-3 ${
                currentPhotoStep === 1 ? 'text-red-400' : 
                currentPhotoStep === 2 ? 'text-yellow-400' : 'text-green-400'
              }`} />
              <p className="font-medium">Toque para tirar foto</p>
            </button>

            <div className="grid grid-cols-3 gap-2">
              {photos.filter(p => p.type === (currentPhotoStep === 1 ? 'antes' : currentPhotoStep === 2 ? 'durante' : 'depois')).map((photo, index) => (
                <div key={index} className="relative group">
                  <img src={photo.url} alt="work" className="w-full h-24 object-cover rounded-lg" />
                  <button onClick={() => removePhoto(photos.indexOf(photo))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              {currentPhotoStep === 1 && step1Complete && (
                <Button onClick={() => setCurrentPhotoStep(2)} className="w-full h-12 bg-yellow-500">Continuar para Durante</Button>
              )}
              {currentPhotoStep === 2 && step2Complete && (
                <Button onClick={() => setCurrentPhotoStep(3)} className="w-full h-12 bg-green-500">Continuar para Depois</Button>
              )}
              {currentPhotoStep === 3 && step3Complete && (
                <Button onClick={() => setShowSignatures(true)} className="w-full h-12 bg-primary">Ir para Assinaturas</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showSignatures && !showSatisfaction && (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setShowSignatures(false)} className="w-full">Voltar para Fotos</Button>
          <Card>
            <CardHeader><CardTitle>Assinatura do Funcionario</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-xl bg-white">
                <canvas ref={funcCanvasRef} width={500} height={150} className="w-full touch-none" 
                  onMouseDown={(e) => startDrawing(e, funcCanvasRef.current!, setIsDrawingFunc)}
                  onMouseMove={(e) => draw(e, funcCanvasRef.current!, isDrawingFunc, setIsDrawingFunc)}
                  onMouseUp={() => stopDrawing(setIsDrawingFunc)}
                  onTouchStart={(e) => startDrawing(e, funcCanvasRef.current!, setIsDrawingFunc)}
                  onTouchMove={(e) => draw(e, funcCanvasRef.current!, isDrawingFunc, setIsDrawingFunc)}
                  onTouchEnd={() => stopDrawing(setIsDrawingFunc)}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => clearSignature(funcCanvasRef, setSignatureFuncionario)}>Limpar</Button>
                <Button size="sm" className="bg-orange-500" onClick={() => saveSignature(funcCanvasRef, setSignatureFuncionario)}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Assinatura do Cliente</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-xl bg-white">
                <canvas ref={clientCanvasRef} width={500} height={150} className="w-full touch-none"
                  onMouseDown={(e) => startDrawing(e, clientCanvasRef.current!, setIsDrawingClient)}
                  onMouseMove={(e) => draw(e, clientCanvasRef.current!, isDrawingClient, setIsDrawingClient)}
                  onMouseUp={() => stopDrawing(setIsDrawingClient)}
                  onTouchStart={(e) => startDrawing(e, clientCanvasRef.current!, setIsDrawingClient)}
                  onTouchMove={(e) => draw(e, clientCanvasRef.current!, isDrawingClient, setIsDrawingClient)}
                  onTouchEnd={() => stopDrawing(setIsDrawingClient)}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => clearSignature(clientCanvasRef, setSignatureCliente)}>Limpar</Button>
                <Button size="sm" className="bg-green-600" onClick={() => saveSignature(clientCanvasRef, setSignatureCliente)}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
          {signaturesComplete && <Button onClick={() => setShowSatisfaction(true)} className="w-full h-14 bg-primary">Avaliar Servico</Button>}
        </div>
      )}

      {showSatisfaction && (
        <Card>
          <CardHeader><CardTitle>Avaliacao do Servico</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button key={num} onClick={() => setRating(num)} className={`h-10 rounded-lg font-bold ${rating === num ? 'bg-primary text-white' : 'bg-muted'}`}>{num}</button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comentario opcional" className="w-full p-3 border rounded-xl" />
            <Button onClick={handleSave} disabled={!canFinalize || saving} className="w-full h-14 bg-green-600">Finalizar e Salvar</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TECPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { customers, saveCustomer, isLoading: dataLoading } = useData();
  const [view, setView] = useState<TECView>('home');
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current client being registered
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  // Current service being created
  const [currentService, setCurrentService] = useState<Partial<Service>>({});
  
  // Sales cart
  const [cart, setCart] = useState<Product[]>([]);
  const [saleTotal, setSaleTotal] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, user?.role]);

  // Protection: wait for auth and data to load
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Protection: if no user, show error
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Faça login para acessar esta área.</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let servicesData: Service[] = [];
      let tecnicosData: any[] = [];
      
      try {
        servicesData = await crmService.getServicos() || [];
      } catch (e) {
        console.error('Error loading services:', e);
        servicesData = [];
      }
      
      try {
        tecnicosData = await crmService.getTecnicos() || [];
      } catch (e) {
        console.error('Error loading technicians:', e);
        tecnicosData = [];
      }
      
      const userRole = (user?.role as string);
      const isTechnician = userRole === 'technician' || userRole === 'tecnico';
      const userId = user?.id || '';
      
      let filteredServices = servicesData || [];
      if (isTechnician && userId) {
        filteredServices = (servicesData || []).filter((s: any) => s && s.technician_id === userId);
      }
      
      const registeredTecnicos = (tecnicosData || []).map((t: any) => ({
        id: t.id,
        name: t.nome || t.name,
        email: t.email,
        phone: t.phone || '',
        cpf: t.cpf || '',
        status: 'active' as const,
        created_at: t.created_at || new Date().toISOString(),
      }));
      
      setServices(filteredServices || []);
      setTechnicians(registeredTecnicos || []);
    } catch (e: any) {
      console.error('Error loading data:', e);
      setError(e.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const goTo = (newView: TECView) => {
    setView(newView);
  };

  const startNewClient = () => {
    setCurrentClient({
      id: `client_${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      cpf: '',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
      vehicle: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      plate: '',
      renavam: '',
      // @ts-ignore
      technician_id: '',
      technician_name: '',
    });
    setCurrentService({});
    setCart([]);
    setSaleTotal(0);
    goTo('novo-cliente');
  };

  const saveClient = (client: Client) => {
    setCurrentClient(client);
    goTo('vendas');
  };

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    setSaleTotal(saleTotal + product.price);
  };

  const removeFromCart = (index: number) => {
    const removed = cart[index];
    setCart(cart.filter((_, i) => i !== index));
    setSaleTotal(saleTotal - removed.price);
  };

  const handleStartService = (selectedTecId?: string, selectedTecName?: string) => {
    if (!currentClient) return;
    
    setCurrentService({
      client_id: currentClient.id,
      client_name: currentClient.name,
      client_phone: currentClient.phone,
      client_address: `${currentClient.address}, ${currentClient.neighborhood} - ${currentClient.city}/${currentClient.state}`,
      vehicle: `${currentClient.vehicleBrand} ${currentClient.vehicleModel} ${currentClient.vehicleYear}`.trim(),
      plate: currentClient.plate,
      type: 'instalacao',
      status: 'pendente',
      technician_id: selectedTecId || user?.id || 'unknown',
      technician_name: selectedTecName || user?.name,
      photos: [],
      observations: '',
    });
    goTo('servico');
  };

  const handleFinishStep = () => {
    goTo('finalizar');
  };

  const saveFinalizedService = async (serviceData: {
    photos: Array<{ url: string; type: PhotoType; file?: File }>;
    signatureFuncionario: string;
    signatureCliente: string;
    observations: string;
    rating?: number;
    comment?: string;
  }) => {
    if (!currentService || !currentClient) return;
    
    try {
      const loadingToast = toast.loading('Salvando serviço...');
      
      // 1. Garantir que o cliente existe no Supabase e pegar o UUID real
      let finalClientId = currentClient.id;
      if (finalClientId.startsWith('client_')) {
         const { data: newClient, success: clientSuccess } = await crmService.createCliente({
           full_name: currentClient.name,
           phone: currentClient.phone,
           email: currentClient.email,
           cpf_cnpj: currentClient.cpf,
           street: currentClient.address,
           neighborhood: currentClient.neighborhood,
           city: currentClient.city,
           state: currentClient.state,
           cep: currentClient.cep,
           brand: currentClient.vehicleBrand,
           model: currentClient.vehicleModel,
           year: currentClient.vehicleYear,
           color: currentClient.vehicleColor,
           plate: currentClient.plate,
           renavam: currentClient.renavam,
           status: 'active',
           // @ts-ignore
           technician_id: (currentClient as any).technician_id || null,
           // @ts-ignore
           technician_name: (currentClient as any).technician_name || null
         });
         
         if (clientSuccess && newClient) {
           finalClientId = newClient.id;
         } else {
           throw new Error('Falha ao criar cliente no banco de dados');
         }
      }

      // 2. Criar o serviço no Supabase (com o client_id real)
      const { data: newService, success: serviceSuccess } = await crmService.createServico({
        ...currentService,
        client_id: finalClientId,
        observations: serviceData.observations,
        status: 'concluido',
      });

      if (!serviceSuccess || !newService) throw new Error('Erro ao criar serviço');

      // 3. Upload das fotos para o Storage
      const uploadedPhotos = [];
      for (const photo of serviceData.photos) {
        if (photo.file) {
          const uploadRes = await crmService.uploadPhoto(photo.file, newService.id, photo.type);
          if (uploadRes.success) {
            uploadedPhotos.push({ url: uploadRes.url, type: photo.type });
          }
        }
      }
      
      if (uploadedPhotos.length > 0) {
        await crmService.savePhotos(newService.id, uploadedPhotos);
      }

      // 4. Upload das assinaturas para o Storage
      const signaturesToSave = [];
      if (serviceData.signatureFuncionario) {
        const sigRes = await crmService.uploadSignature(serviceData.signatureFuncionario, newService.id, 'tecnico');
        if (sigRes.success) {
          signaturesToSave.push({ url: sigRes.url, signed_by: 'Técnico' });
        }
      }
      if (serviceData.signatureCliente) {
        const sigRes = await crmService.uploadSignature(serviceData.signatureCliente, newService.id, 'cliente');
        if (sigRes.success) {
          signaturesToSave.push({ url: sigRes.url, signed_by: 'Cliente' });
        }
      }
      
      if (signaturesToSave.length > 0) {
        await crmService.saveSignatures(newService.id, signaturesToSave);
        // Atualiza a assinatura principal no serviço (usando a do cliente como principal se houver)
        await crmService.updateServico(newService.id, { 
          signature: signaturesToSave.find(s => s.signed_by === 'Cliente')?.url || signaturesToSave[0].url 
        });
      }

      toast.dismiss(loadingToast);
      toast.success('Serviço finalizado com sucesso!');
      await loadData();
      
      // Reset tudo
      setCurrentClient(null);
      setCurrentService({});
      setCart([]);
      setSaleTotal(0);
    } catch (e: any) {
      toast.error(`Erro ao salvar: ${e.message}`);
      console.error('Error saving service:', e);
    }
  };

  // Protection: show loading while data loads
  if (loading) {
    return (
      <SuperLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="text-muted-foreground">Carregando serviços...</p>
          </div>
        </div>
      </SuperLayout>
    );
  }

  // Protection: show error if any
  if (error) {
    return (
      <SuperLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro ao carregar</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData} className="bg-orange-500">
              Tentar novamente
            </Button>
          </div>
        </div>
      </SuperLayout>
    );
  }

  return (
    <SuperLayout>
      <div className="p-4 md:p-6">
        {view === 'home' && (
          <HomeView 
            services={services} 
            loading={loading} 
            onNewClient={startNewClient}
            userName={user?.name || 'Tecnico'}
            goTo={goTo}
          />
        )}
        
        {view === 'novo-cliente' && (
          <ClientFormView 
            client={currentClient}
            onSave={saveClient}
            onBack={() => goTo('home')}
            technicians={technicians}
          />
        )}
        
        {view === 'vendas' && (
          <SalesView 
            client={currentClient}
            cart={cart}
            total={saleTotal}
            products={PRODUCTS}
            technicians={technicians}
            onAddProduct={addToCart}
            onRemoveProduct={removeFromCart}
            onStartService={handleStartService}
            onBack={() => goTo('novo-cliente')}
            onNewClient={() => { setCurrentClient(null); goTo('novo-cliente'); }}
          />
        )}
        
        {view === 'servico' && (
          <ServiceView 
            service={currentService}
            cart={cart}
            total={saleTotal}
            onFinish={handleFinishStep}
            onBack={() => goTo('vendas')}
          />
        )}
        
        {view === 'finalizar' && (
          <FinalizeView 
            service={currentService}
            onSave={saveFinalizedService}
            onBack={() => goTo('servico')}
          />
        )}

        {view === 'meus-servicos' && (
          <TechnicianServicesPage 
            tecnicoId={user?.id || ''}
            tecnicoName={user?.name || 'Técnico'}
          />
        )}
      </div>
    </SuperLayout>
  );
}
