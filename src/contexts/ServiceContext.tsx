import { useState, useCallback, useEffect } from 'react';
import type { Service, ServiceStatus, ServiceType, ServiceHistory } from '@/types/service';

const SERVICES_KEY = 'rastremix_services';
const SERVICES_HISTORY_KEY = 'rastremix_services_history';

export function getServices(): Service[] {
  try {
    const data = localStorage.getItem(SERVICES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getServiceById(id: string): Service | undefined {
  return getServices().find(s => s.id === id);
}

export function getServicesByClient(clientId: string): Service[] {
  return getServices().filter(s => s.cliente_id === clientId);
}

export function getServicesByTechnician(technicianId: string): Service[] {
  const normalizedId = technicianId.replace('user_', '');
  return getServices().filter(s => s.tecnico_id === technicianId || s.tecnico_id === normalizedId);
}

export function getAssignedServicesForTechnician(technicianId: string): Service[] {
  const normalizedId = technicianId.replace('user_', '');
  return getServices().filter(s => 
    (s.tecnico_id === technicianId || s.tecnico_id === normalizedId) && 
    (s.status === 'designado' || s.status === 'em_andamento')
  );
}

export function getServicesByStatus(status: ServiceStatus): Service[] {
  return getServices().filter(s => s.status === status);
}

export function saveService(service: Service): void {
  const services = getServices();
  services.push(service);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  
  addHistory(service.id, 'Criação do serviço', '-', service.status, service.criado_por === 'admin' ? 'Admin' : 'Técnico');
}

export function createService(data: {
  cliente_id: string;
  cliente_name: string;
  cliente_phone: string;
  cliente_address?: string;
  tipo_servico: ServiceType;
  descricao: string;
  data_agendamento?: string;
  tecnico_id?: string;
  tecnico_name?: string;
  criado_por: 'admin' | 'tecnico';
}): Service {
  const service: Service = {
    id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cliente_id: data.cliente_id,
    cliente_name: data.cliente_name,
    cliente_phone: data.cliente_phone,
    cliente_address: data.cliente_address,
    tipo_servico: data.tipo_servico,
    descricao: data.descricao,
    data_agendamento: data.data_agendamento,
    status: data.tecnico_id ? 'designado' : 'pendente',
    tecnico_id: data.tecnico_id,
    tecnico_name: data.tecnico_name,
    criado_por: data.criado_por,
    data_criacao: new Date().toISOString(),
  };
  
  saveService(service);
  return service;
}

export function updateService(id: string, data: Partial<Service>, changedBy: string = 'Admin'): void {
  const services = getServices();
  const index = services.findIndex(s => s.id === id);
  if (index !== -1) {
    const oldService = services[index];
    services[index] = { ...services[index], ...data, updated_at: new Date().toISOString() };
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    
    if (data.status && data.status !== oldService.status) {
      addHistory(id, 'Status alterado', oldService.status, data.status, changedBy);
    }
    if (data.tecnico_id && data.tecnico_id !== oldService.tecnico_id) {
      addHistory(id, 'Técnico atribuído', oldService.tecnico_name || 'Nenhum', data.tecnico_name || 'Nenhum', changedBy);
    }
  }
}

export function assignTechnician(serviceId: string, technicianId: string, technicianName: string): void {
  updateService(serviceId, {
    tecnico_id: technicianId,
    tecnico_name: technicianName,
    status: 'designado',
  }, 'Admin');
}

export function startService(serviceId: string): void {
  updateService(serviceId, {
    status: 'em_andamento',
    data_inicio: new Date().toISOString(),
  }, 'Técnico');
}

export function finishService(serviceId: string, observacoes: string, tecnicoName: string): void {
  updateService(serviceId, {
    status: 'finalizado',
    data_finalizacao: new Date().toISOString(),
    observacoes_tecnico: observacoes,
    finalizado_por: tecnicoName,
  }, 'Técnico');
}

export function cancelService(serviceId: string): void {
  updateService(serviceId, {
    status: 'cancelado',
  }, 'Admin');
}

function addHistory(serviceId: string, action: string, oldValue?: string, newValue?: string, changedBy: string = 'Sistema'): void {
  const history = getServiceHistory();
  history.push({
    id: `history-${Date.now()}`,
    service_id: serviceId,
    action,
    old_value: oldValue,
    new_value: newValue,
    changed_by: changedBy,
    changed_at: new Date().toISOString(),
  });
  localStorage.setItem(SERVICES_HISTORY_KEY, JSON.stringify(history));
}

export function getServiceHistory(): ServiceHistory[] {
  try {
    const data = localStorage.getItem(SERVICES_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getHistoryByService(serviceId: string): ServiceHistory[] {
  return getServiceHistory().filter(h => h.service_id === serviceId);
}

export function deleteService(id: string): void {
  const services = getServices().filter(s => s.id !== id);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

interface ServiceContextValue {
  services: Service[];
  loading: boolean;
  loadServices: () => void;
  createService: (data: Parameters<typeof createService>[0]) => Service;
  updateServiceStatus: (id: string, status: ServiceStatus, changedBy?: string) => void;
  assignTech: (id: string, techId: string, techName: string) => void;
  startServiceByTech: (id: string) => void;
  finishServiceByTech: (id: string, obs: string, tecnicoName: string) => void;
  cancelServiceByAdmin: (id: string) => void;
  getMyServices: (techId: string) => Service[];
  getAssignedServices: (techId: string) => Service[];
  deleteService: (id: string) => void;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(() => {
    setLoading(true);
    setServices(getServices());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const createServiceFn = useCallback((data: Parameters<typeof createService>[0]) => {
    const service = createService(data);
    loadServices();
    return service;
  }, [loadServices]);

  const updateServiceStatus = useCallback((id: string, status: ServiceStatus, changedBy: string = 'Admin') => {
    updateService(id, { status }, changedBy);
    loadServices();
  }, [loadServices]);

  const assignTech = useCallback((id: string, techId: string, techName: string) => {
    assignTechnician(id, techId, techName);
    loadServices();
  }, [loadServices]);

  const startServiceByTech = useCallback((id: string) => {
    startService(id);
    loadServices();
  }, [loadServices]);

  const finishServiceByTech = useCallback((id: string, obs: string, tecnicoName: string) => {
    finishService(id, obs, tecnicoName);
    loadServices();
  }, [loadServices]);

  const cancelServiceByAdmin = useCallback((id: string) => {
    cancelService(id);
    loadServices();
  }, [loadServices]);

  const getMyServices = useCallback((techId: string) => {
    return getServicesByTechnician(techId);
  }, []);

  const getAssignedServices = useCallback((techId: string) => {
    return getAssignedServicesForTechnician(techId);
  }, []);

  const deleteServiceFn = useCallback((id: string) => {
    deleteService(id);
    loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    loadServices,
    createService: createServiceFn,
    updateServiceStatus,
    assignTech,
    startServiceByTech,
    finishServiceByTech,
    cancelServiceByAdmin,
    getMyServices,
    getAssignedServices,
    deleteService: deleteServiceFn,
  };
}
