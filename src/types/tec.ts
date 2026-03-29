export type ServiceStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
export type ServiceType = 'instalacao' | 'manutencao' | 'retirada' | 'suporte';
export type PhotoType = 'antes' | 'durante' | 'depois';

export interface ServicePhoto {
  id: string;
  service_id: string;
  url: string;
  type: PhotoType;
  created_at: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  cpf?: string;
  role?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  rating?: number;
  created_at: string;
}

export interface Service {
  id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_address?: string;
  technician_id: string;
  technician_name?: string;
  vehicle: string;
  plate: string;
  type: ServiceType;
  status: ServiceStatus;
  photos: ServicePhoto[];
  signature?: string;
  observations?: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TECAgent {
  id: string;
  name: string;
  description: string;
  technician_id: string;
  technician_name?: string;
  status: 'ativo' | 'inativo';
  config?: Record<string, any>;
  created_at: string;
}

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  concluido: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  retirada: 'Retirada',
  suporte: 'Suporte',
};
