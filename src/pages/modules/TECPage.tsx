import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Plus, Search, X, Check, Camera, Pen, FileText, 
  Clock, User, Phone, Car, MapPin, DollarSign, Package,
  ChevronLeft, ChevronRight, Save, Loader2, Trash2, Eye,
  CheckCircle, AlertCircle, Image, Eraser
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import SuperLayout from '@/components/layout/SuperLayout';
import { tecService } from '@/lib/tecService';
import type { Service, ServiceStatus, ServiceType, PhotoType } from '@/types/tec';

type TECView = 'home' | 'novo-cliente' | 'servico' | 'vendas' | 'finalizar';
type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  vehicle?: string;
  plate?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

const PRODUCTS: Product[] = [
  { id: '1', name: 'Rastreador Basic', price: 297, description: 'Rastreador com monitoramento 24h' },
  { id: '2', name: 'Rastreador Premium', price: 497, description: 'Rastreador + Bloqueio + App' },
  { id: '3', name: 'Rastreador Gold', price: 697, description: 'Rastreador + Bloqueio + App + Seguro' },
  { id: '4', name: 'Instalacao', price: 150, description: 'Servico de instalacao' },
  { id: '5', name: 'Mensalidade Basic', price: 49.90, description: 'Taxa mensal Basic' },
  { id: '6', name: 'Mensalidade Premium', price: 79.90, description: 'Taxa mensal Premium' },
];

export default function TECPage() {
  const { user } = useAuth();
  const [view, setView] = useState<TECView>('home');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Current client being registered
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  // Current service being created
  const [currentService, setCurrentService] = useState<Partial<Service>>({});
  
  // Sales cart
  const [cart, setCart] = useState<Product[]>([]);
  const [saleTotal, setSaleTotal] = useState(0);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await tecService.getAllServices();
      setServices(data);
    } catch (e) {
      console.error('Error loading services:', e);
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
      address: '',
      vehicle: '',
      plate: '',
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

  const startService = () => {
    if (!currentClient) return;
    
    setCurrentService({
      client_id: currentClient.id,
      client_name: currentClient.name,
      client_phone: currentClient.phone,
      client_address: currentClient.address,
      vehicle: currentClient.vehicle,
      plate: currentClient.plate,
      type: 'instalacao',
      status: 'pendente',
      technician_id: user?.id || 'unknown',
      technician_name: user?.name,
      photos: [],
      observations: '',
    });
    goTo('servico');
  };

  const finishService = async () => {
    if (!currentService) return;
    goTo('finalizar');
  };

  const saveFinalizedService = async (serviceData: {
    photos: Array<{ url: string; type: PhotoType }>;
    signatureFuncionario: string;
    signatureCliente: string;
    observations: string;
  }) => {
    try {
      await tecService.saveService({
        ...currentService,
        observations: serviceData.observations,
        signature: serviceData.signatureFuncionario,
      } as any);

      // Save photos
      const savedService = await tecService.saveService(currentService as any);
      
      for (const photo of serviceData.photos) {
        await tecService.savePhotos(savedService.id, [photo]);
      }

      await loadServices();
      
      // Reset everything
      setCurrentClient(null);
      setCurrentService({});
      setCart([]);
      setSaleTotal(0);
      goTo('home');
    } catch (e) {
      console.error('Error saving service:', e);
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
function HomeView({ services, loading, onNewClient, userName }: {
  services: Service[];
  loading: boolean;
  onNewClient: () => void;
  userName: string;
}) {
  const stats = {
    today: services.filter(s => 
      new Date(s.created_at).toDateString() === new Date().toDateString()
    ).length,
    pending: services.filter(s => s.status === 'pendente').length,
    inProgress: services.filter(s => s.status === 'em_andamento').length,
    completed: services.filter(s => s.status === 'concluido').length,
  };

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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNewClient}
          className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-left shadow-lg"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Plus className="w-7 h-7" />
          </div>
          <p className="text-xl font-bold">Novo Cliente</p>
          <p className="text-white/80 text-sm mt-1">Cadastrar cliente + servico</p>
        </motion.button>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Concluidos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ultimos Servicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum servico ainda</p>
              <Button onClick={onNewClient} className="mt-4 bg-orange-500">
                <Plus className="w-4 h-4 mr-2" />
                Novo Servico
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.slice(0, 10).map((service) => (
                <div key={service.id} className="p-4 rounded-xl border hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{service.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.vehicle} - {service.plate}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
    address: '',
    vehicle: '',
    plate: '',
  });
  const [step, setStep] = useState(1);

  const isValid = form.name.trim() && form.phone.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Cadastro do Cliente</h1>
          <p className="text-sm text-muted-foreground">Passo {step} de 2</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-muted'}`} />
        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-muted'}`} />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Nome do cliente"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Telefone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="(99) 99999-9999"
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
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Endereco</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    placeholder="Endereco completo"
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Veiculo *</label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={form.vehicle}
                    onChange={(e) => setForm({...form, vehicle: e.target.value})}
                    placeholder="Ex: Fiat Toro, VW Saveiro"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Placa *</label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={form.plate}
                    onChange={(e) => setForm({...form, plate: e.target.value.toUpperCase()})}
                    placeholder="ABC-1234"
                    className="pl-10 uppercase"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-xl mt-4">
                <p className="font-medium mb-2">Resumo do Cliente:</p>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><strong>Nome:</strong> {form.name}</p>
                  <p><strong>Telefone:</strong> {form.phone}</p>
                  <p><strong>Veiculo:</strong> {form.vehicle} - {form.plate}</p>
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
            disabled={step === 1 && !form.name}
          >
            Proximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={() => onSave(form)}
            className="flex-1 bg-green-600"
            disabled={!form.vehicle || !form.plate}
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
function SalesView({ client, cart, total, products, onAddProduct, onRemoveProduct, onStartService, onBack, onNewClient }: {
  client: Client | null;
  cart: Product[];
  total: number;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (index: number) => void;
  onStartService: () => void;
  onBack: () => void;
  onNewClient: () => void;
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
            <h1 className="text-xl font-bold">Vendas</h1>
            <p className="text-sm text-muted-foreground">
              Cliente: {client?.name}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onNewClient}>
          Trocar Cliente
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onAddProduct(product)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">R$ {product.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Toque para add</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              Nenhum produto adicionado
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

      {/* Action */}
      <Button 
        onClick={onStartService}
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
              <p className="font-medium">{service?.plate}</p>
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
  }) => void;
  onBack: () => void;
}) {
  const [photos, setPhotos] = useState<Array<{ url: string; type: PhotoType; file?: File }>>([]);
  const [photoType, setPhotoType] = useState<PhotoType>('antes');
  const [signatureFuncionario, setSignatureFuncionario] = useState<string>('');
  const [signatureCliente, setSignatureCliente] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);
  
  const funcCanvasRef = useRef<HTMLCanvasElement>(null);
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = photos.length > 0 && signatureFuncionario && signatureCliente;

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos([...photos, { url: reader.result as string, type: photoType, file }]);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const clearSignature = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = (canvasRef: React.RefObject<HTMLCanvasElement>, setter: (sig: string) => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setter(canvas.toDataURL('image/png'));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Convert file photos to base64 if needed
    const finalPhotos = await Promise.all(photos.map(async (p) => {
      if (p.file) {
        return { url: p.url, type: p.type };
      }
      return { url: p.url, type: p.type };
    }));

    onSave({
      photos: finalPhotos,
      signatureFuncionario,
      signatureCliente,
      observations,
    });
    
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Finalizar Servico</h1>
            <p className="text-sm text-muted-foreground">
              Fotos, assinaturas e observacoes
            </p>
          </div>
        </div>
      </div>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Fotos do Servico
            </span>
            <Badge>{photos.length} foto(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo Type Selector */}
          <div className="flex gap-2">
            {(['antes', 'durante', 'depois'] as PhotoType[]).map((type) => (
              <button
                key={type}
                onClick={() => setPhotoType(type)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  photoType === type
                    ? type === 'antes' ? 'bg-red-500 text-white' :
                      type === 'durante' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                    : 'bg-muted'
                }`}
              >
                {type === 'antes' ? 'Antes' : type === 'durante' ? 'Durante' : 'Depois'}
              </button>
            ))}
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
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Camera className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Toque para tirar foto</p>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo.url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className={`absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded ${
                    photo.type === 'antes' ? 'bg-red-500 text-white' :
                    photo.type === 'durante' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {photo.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature Funcionario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Pen className="w-5 h-5" />
              Assinatura do Funcionario
            </span>
            {signatureFuncionario && <Badge variant="outline" className="text-green-600">Salva</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-white">
            <canvas
              ref={funcCanvasRef}
              width={500}
              height={150}
              className="w-full touch-none"
              onMouseDown={(e) => {
                const canvas = funcCanvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
              }}
              onMouseMove={(e) => {
                const canvas = funcCanvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                if (e.buttons === 1) {
                  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  ctx.stroke();
                }
              }}
            />
            {!signatureFuncionario && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground/50 text-sm">Desenhe aqui</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => clearSignature(funcCanvasRef)}>
              <Eraser className="w-4 h-4 mr-1" />
              Limpar
            </Button>
            <Button size="sm" className="bg-orange-500" onClick={() => saveSignature(funcCanvasRef, setSignatureFuncionario)}>
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signature Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Pen className="w-5 h-5" />
              Assinatura do Cliente
            </span>
            {signatureCliente && <Badge variant="outline" className="text-green-600">Salva</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-white">
            <canvas
              ref={clientCanvasRef}
              width={500}
              height={150}
              className="w-full touch-none"
              onMouseDown={(e) => {
                const canvas = clientCanvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
              }}
              onMouseMove={(e) => {
                const canvas = clientCanvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                if (e.buttons === 1) {
                  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  ctx.stroke();
                }
              }}
            />
            {!signatureCliente && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground/50 text-sm">Cliente assina aqui</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => clearSignature(clientCanvasRef)}>
              <Eraser className="w-4 h-4 mr-1" />
              Limpar
            </Button>
            <Button size="sm" className="bg-green-600" onClick={() => saveSignature(clientCanvasRef, setSignatureCliente)}>
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Observacoes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Observacoes sobre o servico..."
            className="w-full p-3 rounded-xl border bg-transparent min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Action */}
      <Button 
        onClick={handleSave}
        disabled={!isValid || saving}
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
            Concluir Servico
          </>
        )}
      </Button>
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
