export type ServiceStatus = 'pendente' | 'designado' | 'em_andamento' | 'finalizado' | 'cancelado';

export type ServiceType = 
  | 'instalacao' 
  | 'manutencao' 
  | 'retirada' 
  | 'vistoria' 
  | 'troca_equipamento'
  | 'suporte'
  | 'outro';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  retirada: 'Retirada',
  vistoria: 'Vistoria',
  troca_equipamento: 'Troca de Equipamento',
  suporte: 'Suporte',
  outro: 'Outro',
};

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  pendente: 'Pendente',
  designado: 'Designado',
  em_andamento: 'Em Andamento',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  designado: 'bg-purple-100 text-purple-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  finalizado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export const SERVICE_STATUS_ORDER: ServiceStatus[] = ['pendente', 'designado', 'em_andamento', 'finalizado', 'cancelado'];

export interface ChecklistItem {
  item: string;
  concluido: boolean;
}

export interface Service {
  id: string;
  cliente_id: string;
  cliente_name: string;
  cliente_phone: string;
  cliente_address?: string;
  tecnico_id?: string;
  tecnico_name?: string;
  tipo_servico: ServiceType;
  descricao: string;
  status: ServiceStatus;
  data_criacao: string;
  data_agendamento?: string;
  data_inicio?: string;
  data_finalizacao?: string;
  observacoes?: string;
  observacoes_tecnico?: string;
  criado_por?: 'admin' | 'tecnico';
  finalizado_por?: string;
  updated_at?: string;
  fotos_inicio?: string[];
  fotos_final?: string[];
  assinatura_cliente?: string;
  checklist?: ChecklistItem[];
  localizacao_inicio?: string;
  localizacao_fim?: string;
}

export interface ServiceHistory {
  id: string;
  service_id: string;
  action: string;
  old_value?: string;
  new_value?: string;
  changed_by: string;
  changed_at: string;
}
