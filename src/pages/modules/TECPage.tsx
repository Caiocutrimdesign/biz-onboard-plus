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
import { ServicesListView } from '@/components/tecnico/ServicesListView';
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
      
      // Single parallel call - get all services once and technicians
      const [allServices, allTechnicians] = await Promise.all([
        crmService.getServicos(),
        crmService.getTecnicos()
      ]);
      
      // Normalize technician ID for comparison
      const normalizedUserId = user.id.replace('user_', '');
      
      // Filter services for this technician (local filtering is faster)
      const myServices = allServices.filter((s: any) => {
        const techId = s.technician_id?.replace('user_', '') || '';
        return techId === normalizedUserId || techId === user.id;
      });
      
      // Get services NOT assigned to this technician (from Admin panel)
      const unassignedServices = allServices.filter((s: any) => {
        const techId = s.technician_id?.replace('user_', '') || '';
        return !techId || (techId !== normalizedUserId && techId !== user.id);
      });
      
      console.log('TECPage: My services:', myServices.length, '| Unassigned:', unassignedServices.length);
      
      // Combine - my services first, then unassigned
      const allServicesList = [...myServices, ...unassignedServices];
      
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
    console.log('TECPage: saveClient called with:', clientData);
    
    // Validate required fields
    if (!clientData.name?.trim()) {
      toast.error('Nome é obrigatório');
      throw new Error('Nome é obrigatório');
    }
    if (!clientData.phone?.trim()) {
      toast.error('Telefone é obrigatório');
      throw new Error('Telefone é obrigatório');
    }
    
    console.log('TECPage: Validation passed, calling crmService.createCliente');
    
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
      technician_id: clientData.technician_id || user?.id || null,
      technician_name: clientData.technician_name || user?.name || null
    });

    console.log('TECPage: Create client result:', result);

    if (!result.success) {
      const errorMsg = result.error || 'Erro ao cadastrar cliente';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('TECPage: Client saved with ID:', result.data?.id);

    setCurrentClient({ ...clientData, id: result.data?.id });
    goTo('vendas');
  };

  const confirmProducts = (products: Product[]) => {
    console.log('TECPage: Products confirmed', products);
    const mainProduct = products[0];
    setCurrentService({
      client_name: currentClient?.name || '',
      client_phone: currentClient?.phone || '',
      client_address: currentClient?.address || '',
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
    try {
      console.log('TECPage: Starting service');
      console.log('TECPage: currentService:', currentService);
      
      const { supabase } = await import('@/lib/supabaseClient');
      
      // If service already has an ID (created by Admin), just update
      if (currentService.id) {
        const { error } = await supabase
          .from('tec_services')
          .update({ status: 'em_andamento' })
          .eq('id', currentService.id);
        
        if (error) throw error;
        
        setCurrentService(prev => ({ ...prev, status: 'em_andamento' }));
        toast.success('Serviço iniciado! Continue com as fotos.');
      } else {
        // Service doesn't have ID yet (created by technician), need to insert first
        const serviceData = {
          client_name: currentService.client_name || currentClient?.name || 'Cliente',
          client_phone: currentService.client_phone || currentClient?.phone || null,
          client_address: currentService.client_address || currentClient?.address || null,
          observations: currentService.observations || null,
          technician_id: user?.id || null,
          technician_name: (user as any)?.full_name || user?.name || null,
          vehicle: currentService.vehicle || currentClient?.vehicleModel || null,
          plate: currentService.plate || currentClient?.plate || null,
          status: 'em_andamento',
          scheduled_date: new Date().toISOString(),
        };
        
        console.log('TECPage: Inserting new service:', serviceData);
        
        const { data, error } = await supabase
          .from('tec_services')
          .insert([serviceData])
          .select()
          .single();
        
        if (error) throw error;
        
        console.log('TECPage: Service inserted with ID:', data.id);
        
        setCurrentService(prev => ({ ...prev, id: data.id, status: 'em_andamento' }));
        toast.success('Serviço iniciado! Continue com as fotos.');
      }
    } catch (error: any) {
      console.error('TECPage: Error starting service:', error);
      toast.error('Erro ao iniciar serviço: ' + error.message);
    }
  };

  const handleFinalizeService = async (obs: string, signature: string, photos: string[]) => {
    try {
      setLoading(true);
      console.log('TECPage: Finalizing service');
      console.log('TECPage: Photos to save:', photos);
      console.log('TECPage: Current service ID:', currentService.id);
      
      // Import supabase
      const { supabase } = await import('@/lib/supabaseClient');
      
      const photosJson = (photos && photos.length > 0) ? JSON.stringify(photos) : null;
      
      // If service has an ID, UPDATE it. Otherwise INSERT new
      if (currentService.id) {
        // Update existing service
        const { data, error } = await supabase
          .from('tec_services')
          .update({
            status: 'concluido',
            completed_date: new Date().toISOString(),
            observations: obs || currentService.observations || null,
            signature: signature || null,
            photos: photosJson || currentService.photos || null,
          })
          .eq('id', currentService.id)
          .select();
        
        if (error) {
          console.error('TECPage: Supabase update error:', error);
          throw new Error(error.message || 'Erro ao atualizar no banco');
        }
        
        console.log('TECPage: Service updated successfully:', data);
      } else {
        // Insert new service (from new client flow)
        const serviceData = {
          client_name: currentService.client_name || currentClient?.name || 'Cliente',
          client_phone: currentService.client_phone || currentClient?.phone || null,
          client_address: currentService.client_address || currentClient?.address || null,
          observations: obs || null,
          signature: signature || null,
          photos: photosJson,
          technician_id: user?.id || null,
          technician_name: (user as any)?.full_name || user?.name || null,
          vehicle: currentService.vehicle || currentClient?.vehicleModel || null,
          plate: currentService.plate || currentClient?.plate || null,
          status: 'concluido',
          completed_date: new Date().toISOString(),
        };
        
        console.log('TECPage: Service data to insert:', serviceData);
        
        const { data, error } = await supabase
          .from('tec_services')
          .insert([serviceData])
          .select();
        
        if (error) {
          console.error('TECPage: Supabase insert error:', error);
          throw new Error(error.message || 'Erro ao salvar no banco');
        }
        
        console.log('TECPage: Service inserted successfully:', data);
      }

      toast.success('Atendimento concluído com sucesso!');
      loadData();
      
      // Reset current service
      setCurrentService({});
      goTo('home');
    } catch (error: any) {
      console.error('TECPage: Error finalizing service:', error);
      toast.error(error.message || 'Erro ao finalizar atendimento');
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

            {(view === 'meus-servicos' || view === 'servicos-designados') && (
              <ServicesListView 
                services={services}
                loading={loading}
                onBack={() => goTo('home')}
                goTo={goTo}
                onSelectService={(service) => {
                  console.log('TECPage: Service selected from list:', service);
                  setCurrentService(service);
                }}
                filter={view === 'servicos-designados' ? 'pending' : 'all'}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </SuperLayout>
  );
}
