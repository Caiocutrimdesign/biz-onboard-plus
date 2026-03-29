import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, ShoppingCart, Star, Smile, Settings, Plus, Search,
  ChevronLeft, ChevronRight, X, Check, Camera, PenTool,
  Car, User, Phone, MapPin, FileText, Clock, CheckCircle,
  AlertCircle, Loader2, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import SuperLayout from '@/components/layout/SuperLayout';
import SignaturePad from '@/components/tec/SignaturePad';
import PhotoUpload from '@/components/tec/PhotoUpload';
import { tecService } from '@/lib/tecService';
import type { Service, ServiceStatus, ServiceType, PhotoType } from '@/types/tec';

type Tab = 'tec' | 'erp' | 'shell' | 'satisfaction';
type TECView = 'list' | 'create' | 'detail';

export default function TECPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('tec');
  const [tecView, setTECView] = useState<TECView>('list');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Service Form
  const [showNewService, setShowNewService] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [clientSearch, setClientSearch] = useState('');
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    client_phone: '',
    client_address: '',
    vehicle: '',
    plate: '',
    service_type: 'instalacao' as ServiceType,
    notes: '',
  });
  
  // Photos and Signature
  const [photos, setPhotos] = useState<Array<{ url: string; type: PhotoType }>>([]);
  const [signature, setSignature] = useState<string | null>(null);

  const tabs = [
    { id: 'tec' as Tab, label: 'TEC', icon: Wrench, color: 'orange', description: 'Servicos Tecnicos' },
    { id: 'erp' as Tab, label: 'ERP', icon: ShoppingCart, color: 'blue', description: 'Gestao Empresarial' },
    { id: 'shell' as Tab, label: 'SHELL', icon: Star, color: 'green', description: 'Vendas e Pedidos' },
    { id: 'satisfaction' as Tab, label: 'Satisfacao', icon: Smile, color: 'purple', description: 'Avaliacao de Clientes' },
  ];

  const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', hover: 'hover:bg-orange-600' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', hover: 'hover:bg-blue-600' },
    green: { bg: 'bg-green-500', text: 'text-green-500', hover: 'hover:bg-green-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', hover: 'hover:bg-purple-600' },
  };

  const serviceTypes: { value: ServiceType; label: string }[] = [
    { value: 'instalacao', label: 'Instalacao' },
    { value: 'manutencao', label: 'Manutencao' },
    { value: 'retirada', label: 'Retirada' },
    { value: 'suporte', label: 'Suporte' },
  ];

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

  const resetForm = () => {
    setFormData({
      client_id: '',
      client_name: '',
      client_phone: '',
      client_address: '',
      vehicle: '',
      plate: '',
      service_type: 'instalacao',
      notes: '',
    });
    setPhotos([]);
    setSignature(null);
    setCurrentStep(1);
    setClientSearch('');
  };

  const handleCreateService = async () => {
    setSaving(true);
    try {
      const newService = await tecService.saveService({
        client_id: formData.client_id || undefined,
        client_name: formData.client_name,
        client_phone: formData.client_phone,
        client_address: formData.client_address,
        vehicle: formData.vehicle,
        plate: formData.plate.toUpperCase(),
        type: formData.service_type,
        status: 'pendente',
        technician_id: user?.id || 'unknown',
        technician_name: user?.name,
        observations: formData.notes,
        photos: [],
        signature: signature || undefined,
      });

      // Save photos
      for (const photo of photos) {
        await tecService.savePhotos(newService.id, [{
          url: photo.url,
          type: photo.type,
        }]);
      }

      await loadServices();
      resetForm();
      setShowNewService(false);
      alert('Servico criado com sucesso!');
    } catch (e) {
      console.error('Error creating service:', e);
      alert('Erro ao criar servico');
    }
    setSaving(false);
  };

  const handlePhotoUpload = (photo: { url: string; type: PhotoType }, _file: File) => {
    setPhotos([...photos, photo]);
  };

  const handleSignatureSave = (sig: string) => {
    setSignature(sig);
  };

  const searchClients = () => {
    if (!clientSearch.trim()) return [];
    
    try {
      const registrations = localStorage.getItem('customer_registrations');
      if (!registrations) return [];
      
      const clients = JSON.parse(registrations);
      const search = clientSearch.toLowerCase();
      
      return clients.filter((c: any) => 
        c.phone?.toLowerCase().includes(search) ||
        c.name?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search)
      );
    } catch {
      return [];
    }
  };

  const selectClient = (client: any) => {
    setFormData({
      ...formData,
      client_id: client.id || '',
      client_name: client.name || client.full_name || '',
      client_phone: client.phone || '',
      client_address: client.address || '',
      vehicle: client.vehicle_type || '',
      plate: client.plate || '',
    });
    setClientSearch('');
  };

  const updateServiceStatus = async (id: string, status: ServiceStatus) => {
    try {
      tecService.updateService(id, { status });
      await loadServices();
    } catch (e) {
      console.error('Error updating service:', e);
    }
  };

  const stats = {
    total: services.length,
    pendente: services.filter(s => s.status === 'pendente').length,
    emAndamento: services.filter(s => s.status === 'em_andamento').length,
    concluido: services.filter(s => s.status === 'concluido').length,
  };

  const statusColors: Record<ServiceStatus, string> = {
    pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    em_andamento: 'bg-blue-100 text-blue-800 border-blue-200',
    concluido: 'bg-green-100 text-green-800 border-green-200',
    cancelado: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels: Record<ServiceStatus, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluido: 'Concluido',
    cancelado: 'Cancelado',
  };

  const filteredClients = clientSearch.length >= 2 ? searchClients() : [];

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-7 h-7 text-orange-500" />
              Central de Operacoes
            </h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.name}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const colors = colorClasses[tab.color];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all whitespace-nowrap ${
                  isActive 
                    ? `${colors.bg} text-white shadow-lg` 
                    : 'bg-card hover:bg-muted border'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-bold">{tab.label}</p>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'tec' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-orange-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.pendente}</p>
                        <p className="text-xs text-muted-foreground">Pendentes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.emAndamento}</p>
                        <p className="text-xs text-muted-foreground">Em Andamento</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.concluido}</p>
                        <p className="text-xs text-muted-foreground">Concluidos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowNewService(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Servico
                </Button>
                <Button variant="outline" onClick={loadServices}>
                  <Clock className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>

              {/* Services List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-500" />
                    Servicos Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-12">
                      <Wrench className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-lg font-medium text-muted-foreground">Nenhum servico ainda</p>
                      <p className="text-sm text-muted-foreground mt-1">Clique em "Novo Servico" para comecar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {services.map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Car className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold truncate">{service.client_name}</p>
                                  <p className="text-sm text-muted-foreground">{service.vehicle} - {service.plate}</p>
                                </div>
                                <Badge className={statusColors[service.status]}>
                                  {statusLabels[service.status]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Wrench className="w-3 h-3" />
                                  {service.type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {service.technician_name || 'Nao definido'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(service.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              {/* Quick Actions */}
                              <div className="flex gap-2 mt-3">
                                {service.status === 'pendente' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => updateServiceStatus(service.id, 'em_andamento')}
                                  >
                                    <ChevronRight className="w-3 h-3 mr-1" />
                                    Iniciar
                                  </Button>
                                )}
                                {service.status === 'em_andamento' && (
                                  <Button 
                                    size="sm" 
                                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => updateServiceStatus(service.id, 'concluido')}
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Concluir
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'erp' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  ERP - Gestao Empresarial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                  <p className="text-lg font-medium text-muted-foreground">Modulo ERP em breve</p>
                  <p className="text-sm text-muted-foreground mt-2">Controle de estoque, financas e gestao</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'shell' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-500" />
                  SHELL - Vendas e Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <Star className="w-16 h-16 mx-auto mb-4 text-green-300" />
                  <p className="text-lg font-medium text-muted-foreground">Modulo SHELL em breve</p>
                  <p className="text-sm text-muted-foreground mt-2">Gerencie vendas e pedidos</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'satisfaction' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-purple-500" />
                  Satisfacao do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <Smile className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                  <p className="text-lg font-medium text-muted-foreground">Sistema de Avaliacao</p>
                  <p className="text-sm text-muted-foreground mt-2">Colete feedback dos clientes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* New Service Modal */}
      <AnimatePresence>
        {showNewService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewService(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-lg font-bold">Novo Servico</h2>
                  <p className="text-sm text-muted-foreground">Passo {currentStep} de 3</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewService(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress */}
              <div className="px-4 pt-2">
                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-1.5 rounded-full ${
                        step <= currentStep ? 'bg-orange-500' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Step 1: Client Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4" />
                        Buscar Cliente Existente
                      </label>
                      <div className="relative">
                        <Input
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          placeholder="Digite telefone, nome ou email..."
                          className="pr-20"
                        />
                        {clientSearch && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                            onClick={() => setClientSearch('')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Search Results */}
                      {filteredClients.length > 0 && (
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          {filteredClients.slice(0, 5).map((client: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => selectClient(client)}
                              className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0"
                            >
                              <p className="font-medium">{client.name || client.full_name}</p>
                              <p className="text-sm text-muted-foreground">{client.phone}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-2 text-xs text-muted-foreground">
                          ou preencha manualmente
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Nome do Cliente *</label>
                        <Input
                          value={formData.client_name}
                          onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Telefone *</label>
                        <Input
                          value={formData.client_phone}
                          onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                          placeholder="(99) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Endereco</label>
                      <Input
                        value={formData.client_address}
                        onChange={(e) => setFormData({...formData, client_address: e.target.value})}
                        placeholder="Endereco completo"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Vehicle & Service */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Veiculo *</label>
                        <Input
                          value={formData.vehicle}
                          onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                          placeholder="Ex: Fiat Toro, VW Saveiro"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Placa *</label>
                        <Input
                          value={formData.plate}
                          onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                          placeholder="ABC-1234"
                          className="uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo de Servico *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {serviceTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({...formData, service_type: type.value})}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                              formData.service_type === type.value
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-muted hover:border-muted-foreground/30'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Observacoes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Observacoes sobre o servico..."
                        className="w-full p-3 rounded-xl border bg-transparent min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Photos & Signature */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <PhotoUpload
                      onPhotoUpload={handlePhotoUpload}
                      existingPhotos={photos}
                    />

                    <div className="border-t pt-6">
                      <SignaturePad
                        onSave={handleSignatureSave}
                        initialValue={signature || undefined}
                      />
                      {signature && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Assinatura salva
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background border-t p-4 flex justify-between rounded-b-2xl">
                <Button
                  variant="outline"
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowNewService(false)}
                >
                  {currentStep > 1 ? (
                    <>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </>
                  ) : 'Cancelar'}
                </Button>
                
                {currentStep < 3 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={
                      (currentStep === 1 && !formData.client_name && !formData.client_phone) ||
                      (currentStep === 2 && !formData.vehicle && !formData.plate)
                    }
                  >
                    Proximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateService}
                    disabled={saving || !formData.client_name || !formData.vehicle}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Criar Servico
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SuperLayout>
  );
}
