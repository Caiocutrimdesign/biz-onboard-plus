import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if we have valid credentials
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;

export type LeadStatus = 
  | 'novo'
  | 'contatado'
  | 'qualificado'
  | 'proposta'
  | 'negociacao'
  | 'ganho'
  | 'perdido';

export type LeadSource = 
  | 'website'
  | 'facebook'
  | 'instagram'
  | 'google_ads'
  | 'indicacao'
  | 'telefone'
  | 'feira'
  | 'outro';

export type LeadPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface DBLead {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  value: number;
  tags: string[];
  notes: string;
  owner_id: string | null;
  pipeline_id: string;
  stage_id: string;
  created_at: string;
  updated_at: string;
  last_contact_at: string | null;
  next_contact_at: string | null;
}

export interface DBCustomer {
  id: string;
  full_name: string;
  phone: string;
  cpf_cnpj: string | null;
  email: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  vehicle_type: string | null;
  plate: string | null;
  brand: string | null;
  model: string | null;
  year: string | null;
  color: string | null;
  renavam: string | null;
  chassis: string | null;
  plan: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  google_ads: 'Google Ads',
  indicacao: 'Indicação',
  telefone: 'Telefone',
  feira: 'Feira',
  outro: 'Outro',
};

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  baixa: 'text-gray-500 bg-gray-100',
  media: 'text-yellow-600 bg-yellow-100',
  alta: 'text-orange-600 bg-orange-100',
  urgente: 'text-red-600 bg-red-100',
};
