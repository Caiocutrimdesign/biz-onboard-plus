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

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  tags: string[];
  value?: number;
  ownerId?: string;
  pipelineId: string;
  stageId: string;
  notes: Note[];
  tasks: Task[];
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
  nextContactAt?: Date;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'sms' | 'whatsapp' | 'task';
  title: string;
  description?: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: Stage[];
  isDefault: boolean;
  createdAt: Date;
}

export interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  probability: number;
  isFinal?: boolean;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  leadId: string;
  lead?: Lead;
  pipelineId: string;
  stageId: string;
  ownerId: string;
  ownerName: string;
  expectedCloseDate?: Date;
  closedAt?: Date;
  won: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'user';
  phone?: string;
  active: boolean;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  document: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  active: boolean;
  lastRun?: Date;
  runCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AutomationTriggerType = 
  | 'lead_created'
  | 'lead_updated'
  | 'stage_changed'
  | 'email_opened'
  | 'email_clicked'
  | 'form_submitted'
  | 'date_reached'
  | 'tag_added';

export interface AutomationTrigger {
  type: AutomationTriggerType;
  config?: Record<string, unknown>;
}

export interface AutomationCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean;
}

export type AutomationActionType = 
  | 'send_email'
  | 'send_sms'
  | 'send_whatsapp'
  | 'add_tag'
  | 'remove_tag'
  | 'update_stage'
  | 'assign_owner'
  | 'add_note'
  | 'create_task'
  | 'webhook';

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  config: Record<string, unknown>;
  delay?: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId?: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledAt?: Date;
  sentAt?: Date;
  stats: EmailStats;
  segmentIds: string[];
  createdAt: Date;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  thumbnail?: string;
  category: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  leadId?: string;
  leadName?: string;
  userId: string;
  userName: string;
  type: 'meeting' | 'call' | 'presentation' | 'follow_up';
  location?: string;
  reminder: boolean;
  reminderMinutes: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
}

export interface Funnel {
  id: string;
  name: string;
  description?: string;
  stages: FunnelStage[];
  isActive: boolean;
  createdAt: Date;
}

export interface FunnelStage {
  id: string;
  name: string;
  order: number;
  conversionRate?: number;
  pageUrl?: string;
}

export interface Analytics {
  totalLeads: number;
  newLeadsThisMonth: number;
  totalDeals: number;
  dealsWonThisMonth: number;
  dealsLostThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  conversionRate: number;
  averageDealValue: number;
  leadsBySource: Record<LeadSource, number>;
  leadsByStatus: Record<LeadStatus, number>;
  dealsByStage: Record<string, number>;
  dailyLeads: { date: string; count: number }[];
  dailyDeals: { date: string; count: number; value: number }[];
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

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'bg-blue-500',
  contatado: 'bg-purple-500',
  qualificado: 'bg-indigo-500',
  proposta: 'bg-yellow-500',
  negociacao: 'bg-orange-500',
  ganho: 'bg-green-500',
  perdido: 'bg-red-500',
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

export const DEFAULT_PIPELINE: Pipeline = {
  id: 'default',
  name: 'Pipeline Padrão',
  description: 'Pipeline padrão de vendas',
  isDefault: true,
  createdAt: new Date(),
  stages: [
    { id: 'stage-1', name: 'Novo Lead', color: '#3B82F6', order: 0, probability: 10 },
    { id: 'stage-2', name: 'Contatado', color: '#8B5CF6', order: 1, probability: 20 },
    { id: 'stage-3', name: 'Qualificado', color: '#06B6D4', order: 2, probability: 40 },
    { id: 'stage-4', name: 'Proposta', color: '#F59E0B', order: 3, probability: 60 },
    { id: 'stage-5', name: 'Negociação', color: '#F97316', order: 4, probability: 80 },
    { id: 'stage-6', name: 'Ganho', color: '#22C55E', order: 5, probability: 100, isFinal: true },
    { id: 'stage-7', name: 'Perdido', color: '#EF4444', order: 6, probability: 0, isFinal: true },
  ],
};
