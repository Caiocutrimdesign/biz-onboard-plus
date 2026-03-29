import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Plus, X, Check, Camera, Pen, FileText, 
  Clock, User, Phone, Car, MapPin, DollarSign, Package,
  ChevronLeft, Save, Loader2, Trash2, AlertCircle,
  CheckCircle, MapPinned, Image, Shield, Star, ThumbsUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth, getTecnicos } from '@/contexts/AuthContext';
import SuperLayout from '@/components/layout/SuperLayout';
import { tecService } from '@/lib/tecService';
import type { Service, ServiceStatus, ServiceType, PhotoType, Technician } from '@/types/tec';

type TECView = 'home' | 'novo-cliente' | 'servico' | 'vendas' | 'finalizar';
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

export default function TECPage() {
  const { user } = useAuth();
  const [view, setView] = useState<TECView>('home');
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Current client being registered
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  // Current service being created
  const [currentService, setCurrentService] = useState<Partial<Service>>({});
  
  // Sales cart
  const [cart, setCart] = useState<Product[]>([]);
  const [saleTotal, setSaleTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [user?.id, user?.role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesData] = await Promise.all([
        tecService.getAllServices(),
      ]);
      
      const isTechnician = (user?.role as string) === 'technician';
      const userId = user?.id || '';
      
      let filteredServices = servicesData;
      if (isTechnician) {
        filteredServices = servicesData.filter((s: Service) => s.technician_id === userId);
      }
      
      const tecnicosFromStorage = getTecnicos();
      console.log('Técnicos do storage:', tecnicosFromStorage);
      
      const registeredTecnicos = tecnicosFromStorage.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone || '',
        cpf: t.cpf || '',
        status: 'active' as const,
        created_at: t.created_at || new Date().toISOString(),
      }));
      
      console.log('Técnicos carregados:', registeredTecnicos);
      
      setServices(filteredServices);
      setTechnicians(registeredTecnicos);
    } catch (e) {
      console.error('Error loading data:', e);
    }
    setLoading(false);
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

  const startService = (selectedTecId?: string, selectedTecName?: string) => {
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

  const finishService = () => {
    goTo('finalizar');
  };

  const saveFinalizedService = async (serviceData: {
    photos: Array<{ url: string; type: PhotoType }>;
    signatureFuncionario: string;
    signatureCliente: string;
    observations: string;
    rating?: number;
    comment?: string;
  }) => {
    if (!currentService) return;
    
    try {
      const newService = await tecService.saveService({
        ...currentService,
        observations: serviceData.observations,
        signature: serviceData.signatureFuncionario,
        status: 'concluido',
      } as any);

      // Save ALL photos to the service
      if (serviceData.photos.length > 0) {
        console.log(`📸 Salvando ${serviceData.photos.length} fotos para serviço ${newService.id}`);
        await tecService.savePhotos(newService.id, serviceData.photos);
      }

      // Save signatures
      const signaturesToSave = [];
      if (serviceData.signatureFuncionario) {
        signaturesToSave.push({
          url: serviceData.signatureFuncionario,
          signed_by: 'Funcionario',
        });
      }
      if (serviceData.signatureCliente) {
        signaturesToSave.push({
          url: serviceData.signatureCliente,
          signed_by: 'Cliente',
        });
      }
      
      if (signaturesToSave.length > 0) {
        console.log(`✍️ Salvando ${signaturesToSave.length} assinaturas para serviço ${newService.id}`);
        await tecService.saveSignatures(newService.id, signaturesToSave);
      }

      // Save satisfaction rating linked to client
      if (serviceData.rating !== undefined) {
        try {
          const satisfactionData = {
            service_id: newService.id,
            client_id: currentService.client_id || currentClient?.id,
            client_name: currentService.client_name || currentClient?.name,
            rating: serviceData.rating,
            comment: serviceData.comment || '',
            created_at: new Date().toISOString(),
          };
          
          // Save to localStorage
          localStorage.setItem(`tec_satisfaction_${newService.id}`, JSON.stringify(satisfactionData));
          
          // Also save to rastremix_customers for CRM visibility
          const customerData = {
            id: currentService.client_id || currentClient?.id,
            full_name: currentService.client_name || currentClient?.name,
            phone: currentService.client_phone || currentClient?.phone,
            email: currentClient?.email || '',
            address: currentService.client_address || '',
            vehicle: currentService.vehicle || '',
            plate: currentService.plate || '',
            plan: cart.length > 0 ? cart[0].name : '',
            status: 'active' as const,
            brand: currentClient?.vehicleBrand || '',
            model: currentClient?.vehicleModel || '',
            created_at: new Date().toISOString(),
          };
          
          // Save to customer registrations
          const clientRegistrations = JSON.parse(localStorage.getItem('rastremix_customers') || '[]');
          const clientIndex = clientRegistrations.findIndex((c: any) => 
            c.id === customerData.id || 
            c.phone === customerData.phone ||
            c.full_name === customerData.full_name
          );
          
          if (clientIndex >= 0) {
            clientRegistrations[clientIndex].satisfaction = satisfactionData;
            clientRegistrations[clientIndex].tec_service_id = newService.id;
            localStorage.setItem('rastremix_customers', JSON.stringify(clientRegistrations));
          } else {
            clientRegistrations.push({
              ...customerData,
              satisfaction: satisfactionData,
              tec_service_id: newService.id,
            });
            localStorage.setItem('rastremix_customers', JSON.stringify(clientRegistrations));
          }
        } catch (e) {
          console.error('Error saving satisfaction:', e);
        }
      }

      console.log('✅ Serviço finalizado com sucesso!');
      await loadData();
      
      // Reset everything
      setCurrentClient(null);
      setCurrentService({});
      setCart([]);
      setSaleTotal(0);
    } catch (e) {
      console.error('Error saving service:', e);
      alert('Erro ao salvar servico');
    }
  };

  return (
    <SuperLayout>
      <div className="p-4 md:p-6">
        {view === 'home' && (
          <HomeView 
            services={services} 
            loading={loading} 
            onNewClient={startNewClient}
            userName={user?.name || 'Tecnico'}
          />
        )}
        
        {view === 'novo-cliente' && (
          <ClientFormView 
            client={currentClient}
            onSave={saveClient}
            onBack={() => goTo('home')}
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
            onStartService={startService}
            onBack={() => goTo('novo-cliente')}
            onNewClient={() => { setCurrentClient(null); goTo('novo-cliente'); }}
          />
        )}
        
        {view === 'servico' && (
          <ServiceView 
            service={currentService}
            cart={cart}
            total={saleTotal}
            onFinish={finishService}
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
      </div>
    </SuperLayout>
  );
}

// ============ HOME VIEW ============
type FilterTab = 'todos' | 'pendente' | 'em_andamento' | 'concluido';

function HomeView({ services, loading, onNewClient, userName }: {
  services: Service[];
  loading: boolean;
  onNewClient: () => void;
  userName: string;
}) {
  const [filterTab, setFilterTab] = useState<FilterTab>('todos');

  const stats = {
    today: services.filter(s => 
      new Date(s.created_at).toDateString() === new Date().toDateString()
    ).length,
    pending: services.filter(s => s.status === 'pendente').length,
    inProgress: services.filter(s => s.status === 'em_andamento').length,
    completed: services.filter(s => s.status === 'concluido').length,
    all: services.length,
  };

  const filteredServices = services.filter(service => {
    if (filterTab === 'todos') return true;
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

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border p-2">
        <div className="flex gap-2 overflow-x-auto">
          {filterTabs.map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? `${tab.activeBg} text-white shadow-md` 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                {isActive && <Check className="w-4 h-4" />}
                <span>{tab.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/20' : 'bg-muted'}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>
                {filterTab === 'todos' && 'Todos os Servicos'}
                {filterTab === 'pendente' && 'Servicos Pendentes'}
                {filterTab === 'em_andamento' && 'Servicos em Andamento'}
                {filterTab === 'concluido' && 'Servicos Finalizados'}
              </span>
            </div>
            <Badge variant="outline">{filteredServices.length} servico(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {filterTab === 'todos' 
                  ? 'Nenhum servico ainda'
                  : filterTab === 'pendente' 
                    ? 'Nenhum servico pendente'
                    : filterTab === 'em_andamento'
                      ? 'Nenhum servico em andamento'
                      : 'Nenhum servico finalizado'
                }
              </p>
              {filterTab === 'todos' && (
                <Button onClick={onNewClient} className="mt-4 bg-orange-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Servico
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ SERVICE CARD ============
function ServiceCard({ service }: { service: Service }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${service.status === 'pendente' ? 'bg-yellow-100' : 
              service.status === 'em_andamento' ? 'bg-blue-100' : 'bg-green-100'}
          `}>
            <Car className={`w-6 h-6 ${
              service.status === 'pendente' ? 'text-yellow-600' : 
              service.status === 'em_andamento' ? 'text-blue-600' : 'text-green-600'
            }`} />
          </div>
          <div>
            <p className="font-semibold">{service.client_name}</p>
            <p className="text-sm text-muted-foreground">
              {service.vehicle} - {service.plate}
            </p>
          </div>
        </div>
        <div className="text-right">
          <StatusBadge status={service.status} />
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(service.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone:</span>
                <span className="font-medium">{service.client_phone}</span>
              </div>
              {service.client_address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endereco:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{service.client_address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium capitalize">{service.type}</span>
              </div>
              {service.technician_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tecnico:</span>
                  <span className="font-medium">{service.technician_name}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============ CLIENT FORM VIEW ============
function ClientFormView({ client, onSave, onBack }: {
  client: Client | null;
  onSave: (client: Client) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<Client>(client || {
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

// ============ SALES VIEW ============
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

// ============ SERVICE VIEW ============
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

// ============ FINALIZE VIEW ============
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
  
  // Satisfaction
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const funcCanvasRef = useRef<HTMLCanvasElement>(null);
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawingFunc, setIsDrawingFunc] = useState(false);
  const [isDrawingClient, setIsDrawingClient] = useState(false);

  // Count photos per step
  const photosAntes = photos.filter(p => p.type === 'antes');
  const photosDurante = photos.filter(p => p.type === 'durante');
  const photosDepois = photos.filter(p => p.type === 'depois');

  // Check if step is complete
  const step1Complete = photosAntes.length >= 1;
  const step2Complete = photosDurante.length >= 1;
  const step3Complete = photosDepois.length >= 1;

  // Validation
  const signaturesComplete = signatureFuncionario && signatureCliente;
  const satisfactionComplete = rating > 0;
  const canFinalize = step3Complete && signaturesComplete && satisfactionComplete;

  // Initialize canvases
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
      setPhotos([...photos, { url: reader.result as string, type: typeMap[currentPhotoStep], file }]);
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

  const goToStep2 = () => {
    if (step1Complete) setCurrentPhotoStep(2);
  };

  const goToStep3 = () => {
    if (step2Complete) setCurrentPhotoStep(3);
  };

  const goToSignatures = () => {
    if (step3Complete) setShowSignatures(true);
  };

  const goToSatisfaction = () => {
    if (signaturesComplete) setShowSatisfaction(true);
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
  const currentStepColor = currentPhotoStep === 1 ? 'red' : currentPhotoStep === 2 ? 'yellow' : 'green';
  const currentStepBg = currentPhotoStep === 1 ? 'bg-red-500' : currentPhotoStep === 2 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-6">
      {/* Success Screen */}
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

      {/* Header */}
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

      {/* Step Progress Indicator */}
      {!showSignatures && (
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Progresso das Fotos</span>
            <span className="text-sm font-bold">{photos.length} foto(s)</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Step 1 - Antes */}
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
              {step1Complete ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center font-bold">1</span>
              )}
              <div className="text-left">
                <p className="font-bold text-sm">Antes</p>
                <p className="text-xs opacity-70">{photosAntes.length} foto(s)</p>
              </div>
            </button>

            <div className={`w-8 h-0.5 ${step1Complete ? 'bg-green-500' : 'bg-gray-300'}`} />

            {/* Step 2 - Durante */}
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
              {step2Complete ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center font-bold">2</span>
              )}
              <div className="text-left">
                <p className="font-bold text-sm">Durante</p>
                <p className="text-xs opacity-70">{photosDurante.length} foto(s)</p>
              </div>
            </button>

            <div className={`w-8 h-0.5 ${step2Complete ? 'bg-green-500' : 'bg-gray-300'}`} />

            {/* Step 3 - Depois */}
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
              {step3Complete ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center font-bold">3</span>
              )}
              <div className="text-left">
                <p className="font-bold text-sm">Depois</p>
                <p className="text-xs opacity-70">{photosDepois.length} foto(s)</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Photo Capture Section */}
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
              <Badge variant="outline" className={`
                ${currentPhotoStep === 1 ? 'text-red-600 border-red-300' : 
                  currentPhotoStep === 2 ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300'}
              `}>
                {currentPhotoStep === 1 ? photosAntes.length : currentPhotoStep === 2 ? photosDurante.length : photosDepois.length} foto(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step Instructions */}
            <div className={`p-4 rounded-xl ${
              currentPhotoStep === 1 ? 'bg-red-50 border border-red-200' : 
              currentPhotoStep === 2 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`font-medium ${
                currentPhotoStep === 1 ? 'text-red-700' : 
                currentPhotoStep === 2 ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {currentPhotoStep === 1 && 'Tire fotos do veiculo ANTES de iniciar o servico'}
                {currentPhotoStep === 2 && 'Tire fotos DURANTE a realizacao do servico'}
                {currentPhotoStep === 3 && 'Tire fotos DEPOIS de concluir o servico'}
              </p>
            </div>

            {/* Camera Button */}
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
              <p className={`font-medium ${
                currentPhotoStep === 1 ? 'text-red-600' : 
                currentPhotoStep === 2 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                Toque para tirar foto
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentPhotoStep === 1 ? 'Posicao do veiculo, pecas, etc' : 
                 currentPhotoStep === 2 ? 'Momento da instalacao' : 
                 'Resultado final do servico'}
              </p>
            </button>

            {/* Current Step Photos */}
            {photos.filter(p => 
              (currentPhotoStep === 1 && p.type === 'antes') ||
              (currentPhotoStep === 2 && p.type === 'durante') ||
              (currentPhotoStep === 3 && p.type === 'depois')
            ).length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.filter(p => 
                  (currentPhotoStep === 1 && p.type === 'antes') ||
                  (currentPhotoStep === 2 && p.type === 'durante') ||
                  (currentPhotoStep === 3 && p.type === 'depois')
                ).map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.url}
                      alt={`${photo.type} ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2"
                    />
                    <button
                      onClick={() => removePhoto(photos.indexOf(photo))}
                      className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentPhotoStep === 1 && !step1Complete && (
                <p className="text-center text-sm text-muted-foreground w-full">
                  Tire pelo menos 1 foto para continuar
                </p>
              )}
              
              {currentPhotoStep === 1 && step1Complete && (
                <Button 
                  onClick={goToStep2} 
                  className="w-full h-12 text-base bg-yellow-500 hover:bg-yellow-600"
                >
                  <span className="mr-2">Continuar para Durante</span>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Button>
              )}
              
              {currentPhotoStep === 2 && !step2Complete && (
                <p className="text-center text-sm text-muted-foreground w-full">
                  Tire pelo menos 1 foto para continuar
                </p>
              )}
              
              {currentPhotoStep === 2 && step2Complete && (
                <Button 
                  onClick={goToStep3} 
                  className="w-full h-12 text-base bg-green-500 hover:bg-green-600"
                >
                  <span className="mr-2">Continuar para Depois</span>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Button>
              )}
              
              {currentPhotoStep === 3 && !step3Complete && (
                <p className="text-center text-sm text-muted-foreground w-full">
                  Tire pelo menos 1 foto para continuar
                </p>
              )}
              
              {currentPhotoStep === 3 && step3Complete && (
                <Button 
                  onClick={goToSignatures} 
                  className="w-full h-12 text-base bg-primary hover:bg-primary/90"
                >
                  <span className="mr-2">Ir para Assinaturas</span>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signatures Section */}
      {showSignatures && (
        <div className="space-y-6">
          {/* Back to Photos Button */}
          <Button variant="outline" onClick={() => setShowSignatures(false)} className="w-full">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar para Fotos
          </Button>

          {/* Photo Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Fotos Capturadas</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Antes: {photosAntes.length}
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Durante: {photosDurante.length}
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Depois: {photosDepois.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Signature Funcionario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Pen className="w-5 h-5 text-orange-500" />
                  Assinatura do Funcionario
                </span>
                {signatureFuncionario && <Badge className="bg-green-100 text-green-800 border-green-300">Assinatura Salva</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-white">
                <canvas
                  ref={funcCanvasRef}
                  width={500}
                  height={150}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={(e) => funcCanvasRef.current && startDrawing(e, funcCanvasRef.current, setIsDrawingFunc)}
                  onMouseMove={(e) => funcCanvasRef.current && draw(e, funcCanvasRef.current, isDrawingFunc, setIsDrawingFunc)}
                  onMouseUp={() => stopDrawing(setIsDrawingFunc)}
                  onMouseLeave={() => stopDrawing(setIsDrawingFunc)}
                  onTouchStart={(e) => funcCanvasRef.current && startDrawing(e, funcCanvasRef.current, setIsDrawingFunc)}
                  onTouchMove={(e) => funcCanvasRef.current && draw(e, funcCanvasRef.current, isDrawingFunc, setIsDrawingFunc)}
                  onTouchEnd={() => stopDrawing(setIsDrawingFunc)}
                />
                {!signatureFuncionario && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground/50 text-sm">Desenhe sua assinatura aqui</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => clearSignature(funcCanvasRef, setSignatureFuncionario)}>
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
                <Button size="sm" className="bg-orange-500" onClick={() => saveSignature(funcCanvasRef, setSignatureFuncionario)}>
                  <Save className="w-4 h-4 mr-1" />
                  Salvar Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Signature Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Pen className="w-5 h-5 text-green-500" />
                  Assinatura do Cliente
                </span>
                {signatureCliente && <Badge className="bg-green-100 text-green-800 border-green-300">Assinatura Salva</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-white">
                <canvas
                  ref={clientCanvasRef}
                  width={500}
                  height={150}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={(e) => clientCanvasRef.current && startDrawing(e, clientCanvasRef.current, setIsDrawingClient)}
                  onMouseMove={(e) => clientCanvasRef.current && draw(e, clientCanvasRef.current, isDrawingClient, setIsDrawingClient)}
                  onMouseUp={() => stopDrawing(setIsDrawingClient)}
                  onMouseLeave={() => stopDrawing(setIsDrawingClient)}
                  onTouchStart={(e) => clientCanvasRef.current && startDrawing(e, clientCanvasRef.current, setIsDrawingClient)}
                  onTouchMove={(e) => clientCanvasRef.current && draw(e, clientCanvasRef.current, isDrawingClient, setIsDrawingClient)}
                  onTouchEnd={() => stopDrawing(setIsDrawingClient)}
                />
                {!signatureCliente && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground/50 text-sm">Cliente: assine aqui para confirmar o servico</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => clearSignature(clientCanvasRef, setSignatureCliente)}>
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
                <Button size="sm" className="bg-green-600" onClick={() => saveSignature(clientCanvasRef, setSignatureCliente)}>
                  <Save className="w-4 h-4 mr-1" />
                  Salvar Assinatura do Cliente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          <Card>
            <CardHeader>
              <CardTitle>Observacoes Finais</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observacoes sobre o servico realizado..."
                className="w-full p-3 rounded-xl border bg-transparent min-h-[80px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Satisfaction Evaluation */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-primary" />
                Avaliacao do Servico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                De 0 a 10, qual sua nota para o servico?
              </p>
              
              {/* Numeric Rating 0-10 */}
              <div className="grid grid-cols-11 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className={`
                      h-10 rounded-lg font-bold text-sm transition-all
                      ${rating === num 
                        ? num >= 8 ? 'bg-green-500 text-white shadow-lg scale-110' 
                          : num >= 5 ? 'bg-yellow-500 text-white shadow-lg scale-110'
                          : 'bg-red-500 text-white shadow-lg scale-110'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Rating Labels */}
              <div className="text-center">
                {rating >= 9 && <p className="text-green-600 font-bold text-lg">Excelente! Nota {rating}/10</p>}
                {rating === 8 && <p className="text-green-500 font-medium">Muito Bom! Nota 8/10</p>}
                {rating === 7 && <p className="text-lime-500 font-medium">Bom! Nota 7/10</p>}
                {rating >= 5 && rating <= 6 && <p className="text-yellow-500 font-medium">Regular. Nota {rating}/10</p>}
                {rating >= 3 && rating <= 4 && <p className="text-orange-500 font-medium">Ruim. Nota {rating}/10</p>}
                {rating >= 1 && rating <= 2 && <p className="text-red-500 font-medium">Muito Ruim. Nota {rating}/10</p>}
                {rating === 0 && <p className="text-muted-foreground text-sm">Selecione uma nota de 0 a 10</p>}
              </div>

              {/* Quick Feedback Tags */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 text-center">Tags rapidas (opcional):</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Atendimento', 'Instalacao', 'Rapidez', 'Qualidade', 'Profissional'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (comment.includes(tag)) {
                          setComment(comment.replace(`, ${tag}`, '').replace(tag, '').trim());
                        } else {
                          setComment(comment ? `${comment}, ${tag}` : tag);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        comment.includes(tag) 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-muted border-muted-foreground/20 text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Field */}
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comentario adicional (opcional)"
                  className="w-full p-3 rounded-xl border bg-transparent min-h-[80px] resize-none text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Go to Satisfaction Button */}
          {!showSatisfaction && signaturesComplete && (
            <Button 
              onClick={goToSatisfaction}
              className="w-full h-14 text-lg bg-primary"
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              Avaliar Servico
            </Button>
          )}

          {/* Final Action */}
          {showSatisfaction && (
            <>
              <Button 
                onClick={handleSave}
                disabled={!canFinalize || saving}
                className="w-full h-14 text-lg bg-green-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Concluir e Salvar Servico
                  </>
                )}
              </Button>

              {/* Validation Info */}
              {!canFinalize && (
                <div className="text-center text-sm text-muted-foreground space-y-1">
                  {rating === 0 && <p>Selecione uma avaliacao (1-5 estrelas)</p>}
                  {!signatureFuncionario && <p>Salve a assinatura do funcionario</p>}
                  {!signatureCliente && <p>Salve a assinatura do cliente</p>}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============ STATUS BADGE ============
function StatusBadge({ status }: { status: ServiceStatus }) {
  const config: Record<ServiceStatus, { label: string; className: string }> = {
    pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    em_andamento: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
    concluido: { label: 'Concluido', className: 'bg-green-100 text-green-800' },
    cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  return (
    <Badge className={config[status].className}>
      {config[status].label}
    </Badge>
  );
}
