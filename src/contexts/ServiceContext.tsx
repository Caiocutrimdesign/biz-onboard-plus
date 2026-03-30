import { useState, useCallback, useEffect } from 'react';
import type { Service, ServiceStatus, ServiceType, ServiceHistory } from '@/types/service';
import { crmService } from '@/lib/crmService';

const SERVICES_HISTORY_KEY = 'rastremix_services_history';

function convertToService(unified: any): Service {
  return {
    id: unified.id,
    cliente_id: unified.client_id || '',
    cliente_name: unified.client_name,
    cliente_phone: unified.client_phone,
    cliente_address: unified.client_address,
    tipo_servico: (unified.type || unified.service_type) as ServiceType,
    descricao: unified.observations || '',
    data_agendamento: unified.scheduled_date,
    status: unified.status as ServiceStatus,
    tecnico_id: unified.technician_id,
    tecnico_name: unified.technician_name,
    data_criacao: unified.created_at,
    data_inicio: unified.status === 'em_andamento' ? unified.updated_at : undefined,
    data_finalizacao: unified.completed_date,
    fotos_inicio: [],
    fotos_final: [],
    observacoes_tecnico: '',
    criado_por: 'admin',
    updated_at: unified.updated_at,
  };
}

export async function getServices(): Promise<Service[]> {
  const data = await crmService.getServicos();
  return data.map(convertToService);
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  const services = await getServices();
  return services.find(s => s.id === id);
}

export async function getServicesByClient(clientId: string): Promise<Service[]> {
  const services = await getServices();
  return services.filter(s => s.cliente_id === clientId);
}

export async function getServicesByTechnician(technicianId: string): Promise<Service[]> {
  const normalizedId = technicianId.replace('user_', '');
  const services = await getServices();
  return services.filter(s => s.tecnico_id === technicianId || s.tecnico_id === normalizedId);
}

export async function getAssignedServicesForTechnician(technicianId: string): Promise<Service[]> {
  const normalizedId = technicianId.replace('user_', '');
  const services = await getServices();
  return services.filter(s => 
    (s.tecnico_id === technicianId || s.tecnico_id === normalizedId) && 
    (s.status === 'designado' || s.status === 'em_andamento')
  );
}

export async function getServicesByStatus(status: ServiceStatus): Promise<Service[]> {
  const services = await getServices();
  return services.filter(s => s.status === status);
}

export async function createService(data: {
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
}): Promise<Service> {
  const res = await crmService.createServico({
    client_id: data.cliente_id,
    client_name: data.cliente_name,
    client_phone: data.cliente_phone,
    client_address: data.cliente_address,
    type: data.tipo_servico,
    technician_id: data.tecnico_id || '',
    technician_name: data.tecnico_name,
    status: data.tecnico_id ? 'designado' : 'pendente',
    observations: data.descricao,
    scheduled_date: data.data_agendamento || null,
    vehicle: '',
    plate: '',
  });

  if (!res.success) throw new Error(res.error);
  const service = res.data;

  addHistory(service.id, 'Criação do serviço', '-', service.status, data.criado_por === 'admin' ? 'Admin' : 'Técnico');
  
  return convertToService(service);
}

export async function updateService(id: string, data: Partial<Service>, changedBy: string = 'Admin'): Promise<void> {
  const oldService = await getServiceById(id);
  
  await crmService.updateServico(id, {
    client_id: data.cliente_id,
    client_name: data.cliente_name,
    client_phone: data.cliente_phone,
    client_address: data.cliente_address,
    type: data.tipo_servico as string,
    technician_id: data.tecnico_id,
    technician_name: data.tecnico_name,
    status: data.status as any,
    observations: data.descricao,
    scheduled_date: data.data_agendamento,
  });
  
  if (data.status && oldService && data.status !== oldService.status) {
    addHistory(id, 'Status alterado', oldService.status, data.status, changedBy);
  }
  if (data.tecnico_id && oldService && data.tecnico_id !== oldService.tecnico_id) {
    addHistory(id, 'Técnico atribuído', oldService.tecnico_name || 'Nenhum', data.tecnico_name || 'Nenhum', changedBy);
  }
}

export async function assignTechnician(serviceId: string, technicianId: string, technicianName: string): Promise<void> {
  await updateService(serviceId, {
    tecnico_id: technicianId,
    tecnico_name: technicianName,
    status: 'designado',
  }, 'Admin');
}

export async function startService(serviceId: string, fotosInicio?: string[], localizacao?: string): Promise<void> {
  await updateService(serviceId, {
    status: 'em_andamento',
    data_inicio: new Date().toISOString(),
    fotos_inicio: fotosInicio,
    localizacao_inicio: localizacao,
  }, 'Técnico');
}

export async function finishService(
  serviceId: string, 
  observacoes: string, 
  tecnicoName: string,
  fotosFinal?: string[],
  assinatura?: string[],
  checklist?: { item: string; concluido: boolean }[],
  localizacaoFim?: string
): Promise<void> {
  await updateService(serviceId, {
    status: 'finalizado',
    data_finalizacao: new Date().toISOString(),
    observacoes_tecnico: observacoes,
    finalizado_por: tecnicoName,
    fotos_final: fotosFinal,
    assinatura_cliente: assinatura?.[0],
    checklist: checklist,
    localizacao_fim: localizacaoFim,
  }, 'Técnico');
}

export async function cancelService(serviceId: string): Promise<void> {
  await updateService(serviceId, {
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

export async function deleteService(id: string): Promise<void> {
  await crmService.deleteServico(id);
}

interface ServiceContextValue {
  services: Service[];
  loading: boolean;
  loadServices: () => Promise<void>;
  createService: (data: Parameters<typeof createService>[0]) => Promise<Service>;
  updateServiceStatus: (id: string, status: ServiceStatus, changedBy?: string) => Promise<void>;
  assignTech: (id: string, techId: string, techName: string) => Promise<void>;
  startServiceByTech: (id: string) => Promise<void>;
  finishServiceByTech: (id: string, obs: string, tecnicoName: string) => Promise<void>;
  cancelServiceByAdmin: (id: string) => Promise<void>;
  getMyServices: (techId: string) => Promise<Service[]>;
  getAssignedServices: (techId: string) => Promise<Service[]>;
  deleteService: (id: string) => Promise<void>;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const data = await crmService.getServicos();
    setServices(data.map(convertToService));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const createServiceFn = useCallback(async (data: Parameters<typeof createService>[0]) => {
    const service = await createService(data);
    await loadServices();
    return service;
  }, [loadServices]);

  const updateServiceStatus = useCallback(async (id: string, status: ServiceStatus, changedBy: string = 'Admin') => {
    await updateService(id, { status }, changedBy);
    await loadServices();
  }, [loadServices]);

  const assignTech = useCallback(async (id: string, techId: string, techName: string) => {
    await assignTechnician(id, techId, techName);
    await loadServices();
  }, [loadServices]);

  const startServiceByTech = useCallback(async (id: string) => {
    await startService(id);
    await loadServices();
  }, [loadServices]);

  const finishServiceByTech = useCallback(async (id: string, obs: string, tecnicoName: string) => {
    await finishService(id, obs, tecnicoName);
    await loadServices();
  }, [loadServices]);

  const cancelServiceByAdmin = useCallback(async (id: string) => {
    await cancelService(id);
    await loadServices();
  }, [loadServices]);

  const getMyServices = useCallback(async (techId: string) => {
    return await getServicesByTechnician(techId);
  }, []);

  const getAssignedServices = useCallback(async (techId: string) => {
    return await getAssignedServicesForTechnician(techId);
  }, []);

  const deleteServiceFn = useCallback(async (id: string) => {
    await deleteService(id);
    await loadServices();
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
