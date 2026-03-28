export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export type AgentType = 'crm' | 'customer' | 'analytics' | 'notification' | 'sales';

export interface AgentConfig {
  name: string;
  description: string;
  enabled: boolean;
  interval?: number;
  model?: string;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  duration: number;
}

export interface AgentTask {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AgentResult;
  createdAt: Date;
  completedAt?: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  value: number;
  source: string;
  createdAt: Date;
  lastContactAt?: Date;
  nextContactAt?: Date;
  ownerId?: string;
  score?: number;
  tags?: string[];
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  plan?: string;
  status: 'novo_cadastro' | 'em_atendimento' | 'cliente_ativado' | 'inativo';
  created_at: Date;
}

export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}

export interface Analytics {
  totalLeads: number;
  newLeadsThisMonth: number;
  conversionRate: number;
  revenue: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  predictions?: {
    nextMonthLeads: number;
    predictedRevenue: number;
    churnRisk: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface SalesInsight {
  type: 'lead_score' | 'next_action' | 'risk_alert' | 'opportunity';
  title: string;
  description: string;
  leadId?: string;
  confidence: number;
  action?: string;
}
