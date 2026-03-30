import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { crmService, type Cliente, type Servico } from '@/lib/crmService';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Tecnico {
  id: string;
  name: string;
  nome: string;
  email: string;
  tipo: string;
  phone?: string;
}

interface DataContextValue {
  customers: Cliente[];
  tecnicos: Tecnico[];
  services: Servico[];
  servicos: Servico[];
  isLoading: boolean;
  refreshCustomers: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshTecnicos: () => Promise<void>;
  refreshAll: () => Promise<void>;
  saveCustomer: (customer: Partial<Cliente>) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteCustomer: (id: string) => Promise<{ success: boolean; error?: string }>;
  addServico: (service: Partial<Servico>) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateServico: (id: string, service: Partial<Servico>) => Promise<{ success: boolean; error?: string }>;
  deleteServico: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateTecnico: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteTecnico: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [services, setServices] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomers = useCallback(async () => {
    try {
      const data = await crmService.getClientes();
      setCustomers(data);
    } catch (error: any) {
      console.error('DataContext: Error refreshing customers:', error);
      toast.error('Erro ao carregar clientes');
    }
  }, []);

  const refreshServices = useCallback(async () => {
    try {
      const userRole = (user as any)?.role || user?.tipo;
      const tecnicoId = userRole === 'tecnico' ? user?.id : undefined;
      const data = await crmService.getServicos(tecnicoId);
      setServices(data);
    } catch (error: any) {
      console.error('DataContext: Error refreshing services:', error);
      toast.error('Erro ao carregar serviços');
    }
  }, [user]);

  const refreshTecnicos = useCallback(async () => {
    try {
      const data = await crmService.getTecnicos();
      console.log('DataContext: Loaded tecnicos:', data.length);
      setTecnicos(data);
    } catch (error: any) {
      console.error('DataContext: Error refreshing tecnicos:', error);
      toast.error('Erro ao carregar técnicos');
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([refreshCustomers(), refreshTecnicos(), refreshServices()]);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCustomers, refreshTecnicos, refreshServices]);

  const saveCustomer = useCallback(async (customer: Partial<Cliente>): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      let result;
      if (customer.id) {
        result = await crmService.updateCliente(customer.id, customer);
      } else {
        result = await crmService.createCliente(customer as any);
      }
      
      if (result.success) {
        await refreshCustomers();
        return { success: true, data: result.data };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('DataContext: Error saving customer:', error);
      return { success: false, error: error.message };
    }
  }, [refreshCustomers]);

  const deleteCustomer = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await crmService.deleteCliente(id);
      if (result.success) {
        await refreshCustomers();
      }
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('DataContext: Error deleting customer:', error);
      return { success: false, error: error.message };
    }
  }, [refreshCustomers]);

  const addServico = useCallback(async (service: Partial<Servico>): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const result = await crmService.createServico(service as any);
      if (result.success) {
        await refreshServices();
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('DataContext: Error adding service:', error);
      return { success: false, error: error.message };
    }
  }, [refreshServices]);

  const updateServico = useCallback(async (id: string, service: Partial<Servico>): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await crmService.updateServico(id, service);
      if (result.success) {
        await refreshServices();
      }
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('DataContext: Error updating service:', error);
      return { success: false, error: error.message };
    }
  }, [refreshServices]);

  const deleteServico = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await crmService.deleteServico(id);
      if (result.success) {
        await refreshServices();
      }
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('DataContext: Error deleting service:', error);
      return { success: false, error: error.message };
    }
  }, [refreshServices]);

  const updateTecnico = useCallback(async (id: string, updates: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await crmService.updateTecnico(id, updates);
      if (result.success) {
        await refreshTecnicos();
      }
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('DataContext: Error updating tecnico:', error);
      return { success: false, error: error.message };
    }
  }, [refreshTecnicos]);

  const deleteTecnico = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await crmService.deleteTecnico(id);
      if (result.success) {
        await refreshTecnicos();
      }
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('DataContext: Error deleting tecnico:', error);
      return { success: false, error: error.message };
    }
  }, [refreshTecnicos]);

  useEffect(() => {
    if (user) {
      refreshAll();

      // Cleanup subscriptions on unmount
      let customerSub: { unsubscribe: () => void } | null = null;
      let serviceSub: { unsubscribe: () => void } | null = null;
      let tecnicoSub: { unsubscribe: () => void } | null = null;

      try {
        customerSub = crmService.subscribeToChanges('customers', refreshCustomers);
        serviceSub = crmService.subscribeToChanges('tec_services', refreshServices);
        tecnicoSub = crmService.subscribeToChanges('profiles', refreshTecnicos);
      } catch (e) {
        console.warn('Subscriptions not available:', e);
      }

      return () => {
        customerSub?.unsubscribe();
        serviceSub?.unsubscribe();
        tecnicoSub?.unsubscribe();
      };
    }
  }, [user, refreshAll, refreshCustomers, refreshServices, refreshTecnicos]);

  const value: DataContextValue = {
    customers,
    tecnicos,
    services,
    servicos: services,
    isLoading,
    refreshCustomers,
    refreshServices,
    refreshTecnicos,
    refreshAll,
    saveCustomer,
    deleteCustomer,
    addServico,
    updateServico,
    deleteServico,
    updateTecnico,
    deleteTecnico,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataProvider;
