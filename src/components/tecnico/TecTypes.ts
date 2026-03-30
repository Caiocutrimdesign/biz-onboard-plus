import type { Service, ServiceStatus, ServiceType, Technician } from '@/types/tec';

export type TECView = 'home' | 'novo-cliente' | 'servico' | 'vendas' | 'finalizar' | 'meus-servicos' | 'servicos-designados' | 'novo-servico';

export type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  vehicle?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  plate?: string;
  renavam?: string;
  technician_id?: string;
  technician_name?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: 'gps_plus' | 'central' | 'cobertura';
  isMonthly?: boolean;
};

export type CompanyCategory = {
  id: 'gps_plus' | 'central' | 'cobertura';
  name: string;
  description: string;
  icon: string;
  color: string;
};

export const COMPANIES: CompanyCategory[] = [
  { 
    id: 'gps_plus', 
    name: 'GPS+', 
    description: 'Rastreamento basico com localizacao em tempo real',
    icon: 'MapPinned',
    color: 'blue'
  },
  { 
    id: 'central', 
    name: 'Rastreamento com Central', 
    description: 'Rastreamento + Central 24h + Bloqueio Remoto',
    icon: 'Shield',
    color: 'purple'
  },
  { 
    id: 'cobertura', 
    name: 'Cobertura / Protecao', 
    description: 'Protecao + Seguro + Assistencia 24h (Filip / Top Pro)',
    icon: 'Star',
    color: 'amber'
  },
];

export const PRODUCTS: Product[] = [
  // GPS+ Products
  { id: 'gps_1', name: 'Kit GPS+ Basic', price: 297, description: 'Equipamento + Instalacao', category: 'gps_plus' },
  { id: 'gps_2', name: 'Mensalidade GPS+ Basic', price: 49.90, description: 'Taxa mensal', category: 'gps_plus', isMonthly: true },
  
  // Central Products
  { id: 'cen_1', name: 'Kit Central Premium', price: 497, description: 'Equipamento + Central 24h + App', category: 'central' },
  { id: 'cen_2', name: 'Kit Central Gold', price: 697, description: 'Equipamento + Central + Bloqueio + App', category: 'central' },
  { id: 'cen_3', name: 'Mensalidade Central', price: 79.90, description: 'Taxa mensal', category: 'central', isMonthly: true },
  
  // Cobertura Products
  { id: 'cob_1', name: 'Filip Cobertura', price: 397, description: 'Cobertura Basica + App', category: 'cobertura' },
  { id: 'cob_2', name: 'Top Pro Cobertura', price: 597, description: 'Cobertura Premium + Assistencia', category: 'cobertura' },
  { id: 'cob_3', name: 'Top Pro Cobertura Plus', price: 797, description: 'Cobertura Total + Seguro Completo', category: 'cobertura' },
  { id: 'cob_4', name: 'Mensalidade Cobertura', price: 99.90, description: 'Taxa mensal', category: 'cobertura', isMonthly: true },
];

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  'em_andamento': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700' },
  'concluido': { label: 'Concluido', color: 'bg-green-100 text-green-700' },
  'finalizado': { label: 'Concluido', color: 'bg-green-100 text-green-700' },
  'cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};
