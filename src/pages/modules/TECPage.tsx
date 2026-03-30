import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import SuperLayout from '@/components/layout/SuperLayout';
import { crmService } from '@/lib/crmService';
import { 
  getAssignedServicesForTechnician, 
  finishService as finishServiceCtx, 
  updateService as updateServiceCtx, 
  getServicesByTechnician, 
  startService as startServiceCtx, 
  createService as createServiceCtx 
} from '@/contexts/ServiceContext';

// Modular Components & Types
import { 
  TECView, Client, Product, 
  STATUS_CONFIG 
} from '@/components/tecnico/TecTypes';
import { HomeView } from '@/components/tecnico/HomeView';
import { ClientFormView } from '@/components/tecnico/ClientFormView';
import { SalesView } from '@/components/tecnico/SalesView';
import { ServiceView } from '@/components/tecnico/ServiceView';
import { FinalizeView } from '@/components/tecnico/FinalizeView';
import { StatusBadge } from '@/components/tecnico/StatusBadge';

import type { Service, ServiceStatus, PhotoType, Technician } from '@/types/tec';

export default function TECPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { saveCustomer, isLoading: dataLoading, refreshServices } = useData();
  const [view, setView] = useState<TECView>('home');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [currentService, setCurrentService] = useState<Partial<Service>>({});

  // Safety check for role
  const isAuthorized = user?.role === 'tecnico' || user?.tipo === 'tecnico' || user?.role === 'admin';

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('TECPage: Loading data for user', user.id);
      
      // Load all services for this technician
      const [tecServices, allServices, allTechnicians] = await Promise.all([
        getServicesByTechnician(user.id),
        crmService.getServicos(), // Get all services
        crmService.getTecnicos()
      ]);
      
      console.log('TECPage: Loaded services:', tecServices.length, 'for technician:', user.id);
      console.log('TECPage: All services in system:', allServices.length);
      
      // Combine both lists and remove duplicates
      const allServicesList = [...tecServices, ...allServices].filter((service, index, self) => 
        index === self.findIndex(s => s.id === service.id)
      );
      
      setServices(allServicesList as any as Service[]);
      setTechnicians(allTechnicians as any as Technician[]);
    } catch (error: any) {
      console.error('TECPage: Error loading data', error);
      toast.error('Erro ao carregar dados do técnico');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  // Reload services when view changes to home
  useEffect(() => {
    if (view === 'home' && user?.id) {
      loadData();
    }
  }, [view, user?.id, loadData]);

  const goTo = (newView: TECView) => {
    console.log(`TECPage: Navigating to ${newView}`);
    setView(newView);
    window.scrollTo(0, 0);
  };

  const startNewClient = () => {
    setCurrentClient({
      id: `client_${Date.now()}`,
      name: '',
      phone: '',
      technician_id: user?.id,
      technician_name: user?.name || ''
    });
    goTo('novo-cliente');
  };

  const saveClient = async (clientData: Client) => {
    try {
      setLoading(true);
      console.log('TECPage: Saving client', clientData);
      
      const result = await crmService.createCliente({
        full_name: clientData.name,
        phone: clientData.phone,
        email: clientData.email || null,
        cpf_cnpj: clientData.cpf || null,
        cep: clientData.cep || null,
        street: clientData.address || null,
        neighborhood: clientData.neighborhood || null,
        city: clientData.city || null,
        state: clientData.state || null,
        status: 'active',
        technician_id: clientData.technician_id || user?.id,
        technician_name: clientData.technician_name || user?.name || ''
      });

      if (!result.success) throw new Error(result.error || 'Erro ao cadastrar cliente');
      
      console.log('TECPage: Client saved with ID:', result.data?.id);

      setCurrentClient({ ...clientData, id: result.data?.id });
      goTo('vendas');
    } catch (error: any) {
      console.error('TECPage: Error saving client', error);
      toast.error(error.message || 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  const confirmProducts = (products: Product[]) => {
    console.log('TECPage: Products confirmed', products);
    const mainProduct = products[0];
    setCurrentService({
      id: `svc_${Date.now()}`,
      client_id: currentClient?.id,
      client_name: currentClient?.name || '',
      client_phone: currentClient?.phone || '',
      client_address: currentClient?.address || '',
      type: mainProduct?.category === 'gps_plus' ? 'instalacao' : 'suporte',
      status: 'pendente',
      vehicle: currentClient?.vehicleModel || '',
      plate: currentClient?.plate || '',
      photos: [],
      observations: products.map(p => p.name).join(', ')
    });
    goTo('servico');
  };

  const handleUploadPhoto = async (file: File, type: PhotoType): Promise<string | null> => {
    if (!currentService.id && !currentClient?.id) return null;
    try {
      const id = currentService.id || currentClient?.id || 'unknown';
      console.log(`TECPage: Uploading ${type} photo for ${id}`);
      const result = await crmService.uploadPhoto(file, id, type) as { success: boolean; url?: string; error?: string };
      if (!result.success || !result.url) throw new Error(result.error || 'Erro no upload');
      return result.url;
    } catch (error: any) {
      console.error('TECPage: Photo upload error', error);
      toast.error('Erro ao enviar foto');
      return null;
    }
  };

  const handleStartService = async () => {
    if (!currentService.id) return;
    try {
      console.log('TECPage: Starting service', currentService.id);
      setCurrentService(prev => ({ ...prev, status: 'em_andamento' }));
      toast.success('Serviço iniciado!');
    } catch (error) {
      console.error('TECPage: Error starting service', error);
    }
  };

  const handleFinalizeService = async (obs: string, signature: string) => {
    try {
      setLoading(true);
      console.log('TECPage: Finalizing service', currentService.id);
      
      // Save to database via CRM service directly
      const result = await crmService.createServico({
        client_id: currentService.client_id || '',
        client_name: currentService.client_name || '',
        client_phone: currentService.client_phone || '',
        client_address: currentService.client_address || '',
        type: currentService.type || 'suporte',
        status: 'concluido',
        observations: obs,
        signature: signature,
        technician_id: user?.id || '',
        technician_name: user?.name || '',
        vehicle: currentService.vehicle || '',
        plate: currentService.plate || '',
        scheduled_date: new Date().toISOString(),
      });

      console.log('TECPage: Service save result:', result);

      if (!result.success) throw new Error(result.error || 'Erro ao salvar serviço');

      toast.success('Atendimento concluído com sucesso!');
      loadData();
      goTo('home');
    } catch (error: any) {
      console.error('TECPage: Error finalizing service', error);
      toast.error(error.message || 'Erro ao finalizar serviço');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || !isAuthorized) {
    console.warn('TECPage: Unauthorized access attempt', user?.role);
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Acesso Restrito</h2>
            <p className="text-muted-foreground">Esta área é exclusiva para técnicos autorizados.</p>
            <Button className="w-full bg-orange-600" onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SuperLayout showCRM={false}>
      <main className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && (
              <HomeView 
                services={services}
                loading={loading}
                userName={(user as any).full_name || user.name || 'Técnico'}
                onNewClient={startNewClient}
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
                onBack={() => goTo('novo-cliente')}
                onConfirm={confirmProducts}
              />
            )}

            {view === 'servico' && (
              <ServiceView 
                service={currentService}
                onBack={() => goTo('vendas')}
                onUpdate={(updates) => setCurrentService(prev => ({ ...prev, ...updates }))}
                onUploadPhoto={handleUploadPhoto}
                onStartService={handleStartService}
                onFinalize={() => goTo('finalizar')}
              />
            )}

            {view === 'finalizar' && (
              <FinalizeView 
                service={currentService}
                onBack={() => goTo('servico')}
                onSave={handleFinalizeService}
                onUploadPhoto={handleUploadPhoto}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </SuperLayout>
  );
}
