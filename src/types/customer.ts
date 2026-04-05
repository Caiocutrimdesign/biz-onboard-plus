export type CustomerStatus =
  | 'novo_cadastro'
  | 'em_atendimento'
  | 'aguardando_pagamento'
  | 'pagamento_confirmado'
  | 'aguardando_instalacao'
  | 'cliente_ativado'
  | 'active'
  | 'inactive'
  | 'disabled'
  | 'pendente'
  | 'cancelado';

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  novo_cadastro: 'Novo Cadastro',
  em_atendimento: 'Em Atendimento',
  aguardando_pagamento: 'Aguardando Pagamento',
  pagamento_confirmado: 'Pagamento Confirmado',
  aguardando_instalacao: 'Aguardando Instalação',
  cliente_ativado: 'Cliente Ativado',
  active: 'Ativo',
  inactive: 'Inativo',
  disabled: 'Desativado',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

export const STATUS_COLORS: Record<CustomerStatus, string> = {
  novo_cadastro: 'bg-blue-100 text-blue-800',
  em_atendimento: 'bg-amber-100 text-amber-800',
  aguardando_pagamento: 'bg-orange-100 text-orange-800',
  pagamento_confirmado: 'bg-emerald-100 text-emerald-800',
  aguardando_instalacao: 'bg-purple-100 text-purple-800',
  cliente_ativado: 'bg-green-100 text-green-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  disabled: 'bg-red-100 text-red-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  cancelado: 'bg-red-100 text-red-800',
};

export type VehicleType = 'carro' | 'moto' | 'caminhao' | 'frota';
export type PlanType = 'basico' | 'bloqueio' | 'completo' | 'frota';
export type PaymentMethod = 'pix' | 'cartao' | 'boleto' | 'recorrente' | 'conversar';

export interface CustomerRegistration {
  // Personal
  full_name?: string;
  phone?: string;
  cpf_cnpj?: string;
  email?: string;
  birth_date?: string;
  // Address
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  complement?: string;
  // Vehicle
  vehicle_type?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  renavam?: string;
  chassis?: string;
  vehicle?: string;
  // Plan
  plan?: string;
  // Payment
  payment_method?: string;
  // Notes
  notes?: string;
  preferred_contact_time?: string;
  // TEC
  satisfaction?: any;
  tec_service_id?: string;
  technician_id?: string;
  technician_name?: string;
  // Logistics (GMP)
  latitude?: number;
  longitude?: number;
  distance_to_base?: number;
  // Meta
  status?: CustomerStatus;
  created_at?: string;
  updated_at?: string;
  synced?: boolean;
  id?: string;
}
