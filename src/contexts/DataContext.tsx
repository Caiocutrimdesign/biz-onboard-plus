import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { crmService, type Cliente, type Servico } from '@/lib/crmService';
import { useAuth } from './AuthContext';

interface DataContextValue {
  customers: Cliente[];
  tecnicos: any[]; // We can use the tech profile as list
  services: Servico[];
  servicos: Servico[];
  isLoading: boolean;
  refreshCustomers: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshAll: () => Promise<void>;
  saveCustomer: (customer: Partial<Cliente>) => Promise<any>;
  deleteCustomer: (id: string) => Promise<any>;
  addServico: (service: Partial<Servico>) => Promise<any>;
  updateServico: (id: string, service: Partial<Servico>) => Promise<any>;
  deleteServico: (id: string) => Promise<any>;
  updateTecnico: (id: string, updates: any) => Promise<any>;
  deleteTecnico: (id: string) => Promise<any>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [services, setServices] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomers = useCallback(async () => {
    const data = await crmService.getClientes();
    setCustomers(data);
  }, []);

  const refreshServices = useCallback(async () => {
    // Determine if we should filter by technician
    const tecnicoId = user?.tipo === 'tecnico' ? user.id : undefined;
    const data = await crmService.getServicos(tecnicoId);
    setServices(data);
  }, [user]);

  const refreshTecnicos = useCallback(async () => {
    const data = await crmService.getTecnicos();
    setTecnicos(data || []);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([refreshCustomers(), refreshTecnicos(), refreshServices()]);
    setIsLoading(false);
  }, [refreshCustomers, refreshTecnicos, refreshServices]);

  const saveCustomer = useCallback(async (customer: Partial<Cliente>) => {
    if (customer.id) {
      return await crmService.updateCliente(customer.id, customer);
    } else {
      return await crmService.createCliente(customer as any);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    return await crmService.deleteCliente(id);
  }, []);

  const addServico = useCallback(async (service: Partial<Servico>) => {
    return await crmService.createServico(service as any);
  }, []);

  const updateServico = useCallback(async (id: string, service: Partial<Servico>) => {
    return await crmService.updateServico(id, service);
  }, []);

  const deleteServico = useCallback(async (id: string) => {
    return await crmService.deleteServico(id);
  }, []);

  const updateTecnico = useCallback(async (id: string, updates: any) => {
    const res = await crmService.updateTecnico(id, updates);
    if (res.success) refreshTecnicos();
    return res;
  }, [refreshTecnicos]);

  const deleteTecnico = useCallback(async (id: string) => {
    const res = await crmService.deleteTecnico(id);
    if (res.success) refreshTecnicos();
    return res;
  }, [refreshTecnicos]);

  useEffect(() => {
    if (user) {
      refreshAll();

      // Real-time subscriptions
      const customerSub = crmService.subscribeToChanges('customers', refreshCustomers);
      const serviceSub = crmService.subscribeToChanges('tec_services', refreshServices);

      return () => {
        customerSub.unsubscribe();
        serviceSub.unsubscribe();
      };
    }
  }, [user, refreshAll, refreshCustomers, refreshServices]);

  const value: DataContextValue = {
    customers,
    tecnicos,
    services,
    servicos: services,
    isLoading,
    refreshCustomers,
    refreshServices,
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
