import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { unifiedDataService, type UnifiedCustomer, type UnifiedTecnico, type UnifiedService } from '@/lib/unifiedDataService';

interface DataContextValue {
  customers: UnifiedCustomer[];
  tecnicos: UnifiedTecnico[];
  services: UnifiedService[];
  isLoading: boolean;
  refreshCustomers: () => Promise<void>;
  refreshTecnicos: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshAll: () => Promise<void>;
  saveCustomer: (customer: Partial<UnifiedCustomer>) => Promise<UnifiedCustomer>;
  updateCustomerStatus: (id: string, status: string) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  saveTecnico: (tecnico: Partial<UnifiedTecnico>) => Promise<UnifiedTecnico>;
  deleteTecnico: (id: string) => Promise<void>;
  saveService: (service: Partial<UnifiedService>) => Promise<UnifiedService>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<UnifiedCustomer[]>([]);
  const [tecnicos, setTecnicos] = useState<UnifiedTecnico[]>([]);
  const [services, setServices] = useState<UnifiedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomers = useCallback(async () => {
    const data = await unifiedDataService.getCustomers();
    setCustomers(data);
  }, []);

  const refreshTecnicos = useCallback(async () => {
    const data = await unifiedDataService.getTecnicos();
    setTecnicos(data);
  }, []);

  const refreshServices = useCallback(async () => {
    const data = await unifiedDataService.getServices();
    setServices(data);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([refreshCustomers(), refreshTecnicos(), refreshServices()]);
    setIsLoading(false);
  }, [refreshCustomers, refreshTecnicos, refreshServices]);

  const saveCustomer = useCallback(async (customer: Partial<UnifiedCustomer>) => {
    return await unifiedDataService.saveCustomer(customer);
  }, []);

  const updateCustomerStatus = useCallback(async (id: string, status: string) => {
    await unifiedDataService.updateCustomerStatus(id, status as any);
    await refreshCustomers();
  }, [refreshCustomers]);

  const deleteCustomer = useCallback(async (id: string) => {
    await unifiedDataService.deleteCustomer(id);
    await refreshCustomers();
  }, [refreshCustomers]);

  const saveTecnico = useCallback(async (tecnico: Partial<UnifiedTecnico>) => {
    return await unifiedDataService.saveTecnico(tecnico);
  }, []);

  const deleteTecnico = useCallback(async (id: string) => {
    await unifiedDataService.deleteTecnico(id);
    await refreshTecnicos();
  }, [refreshTecnicos]);

  const saveService = useCallback(async (service: Partial<UnifiedService>) => {
    return await unifiedDataService.saveService(service);
  }, []);

  useEffect(() => {
    refreshAll();

    const unsubCustomers = unifiedDataService.subscribe('customers', (data) => {
      setCustomers(data);
    });

    const unsubTecnicos = unifiedDataService.subscribe('tecnicos', (data) => {
      setTecnicos(data);
    });

    const unsubServices = unifiedDataService.subscribe('services', (data) => {
      setServices(data);
    });

    const unsubscribeRealtime = unifiedDataService.subscribeToRealtime();

    return () => {
      unsubCustomers();
      unsubTecnicos();
      unsubServices();
      unsubscribeRealtime();
    };
  }, [refreshAll]);

  const value: DataContextValue = {
    customers,
    tecnicos,
    services,
    isLoading,
    refreshCustomers,
    refreshTecnicos,
    refreshServices,
    refreshAll,
    saveCustomer,
    updateCustomerStatus,
    deleteCustomer,
    saveTecnico,
    deleteTecnico,
    saveService,
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
