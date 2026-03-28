import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead, Pipeline, Deal, User, Tag, Automation, EmailCampaign, Appointment, Analytics, DEFAULT_PIPELINE } from '@/types/crm';

interface CRMStore {
  leads: Lead[];
  pipelines: Pipeline[];
  deals: Deal[];
  users: User[];
  tags: Tag[];
  automations: Automation[];
  emailCampaigns: EmailCampaign[];
  appointments: Appointment[];
  currentUser: User | null;
  analytics: Analytics | null;
  
  setCurrentUser: (user: User | null) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadToStage: (leadId: string, stageId: string) => void;
  
  addPipeline: (pipeline: Pipeline) => void;
  updatePipeline: (id: string, data: Partial<Pipeline>) => void;
  deletePipeline: (id: string) => void;
  
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  
  addTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;
  
  addAutomation: (automation: Automation) => void;
  updateAutomation: (id: string, data: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  addNoteToLead: (leadId: string, note: Lead['notes'][0]) => void;
  addTaskToLead: (leadId: string, task: Lead['tasks'][0]) => void;
  addActivityToLead: (leadId: string, activity: Lead['activities'][0]) => void;
  
  calculateAnalytics: () => Analytics;
}

const mockUsers: User[] = [
  { id: '1', name: 'Carlos Silva', email: 'carlos@empresa.com', role: 'admin', phone: '(11) 99999-1111', active: true, createdAt: new Date() },
  { id: '2', name: 'Ana Oliveira', email: 'ana@empresa.com', role: 'manager', phone: '(11) 98888-2222', active: true, createdAt: new Date() },
  { id: '3', name: 'Pedro Santos', email: 'pedro@empresa.com', role: 'user', phone: '(11) 97777-3333', active: true, createdAt: new Date() },
];

const mockTags: Tag[] = [
  { id: '1', name: 'Quente', color: '#EF4444' },
  { id: '2', name: 'Frio', color: '#3B82F6' },
  { id: '3', name: 'VIP', color: '#F59E0B' },
  { id: '4', name: 'Em negócio', color: '#22C55E' },
  { id: '5', name: 'Aguardando', color: '#8B5CF6' },
];

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'João Mendes',
    email: 'joao.mendes@tech.com',
    phone: '(11) 99999-0001',
    company: 'Tech Solutions',
    document: '12.345.678/0001-90',
    city: 'São Paulo',
    state: 'SP',
    status: 'novo',
    source: 'website',
    priority: 'alta',
    tags: ['Quente', 'VIP'],
    value: 50000,
    pipelineId: 'default',
    stageId: 'stage-1',
    ownerId: '1',
    notes: [{ id: '1', content: 'Cliente interessado em solução completa', authorId: '1', authorName: 'Carlos Silva', createdAt: new Date() }],
    tasks: [],
    activities: [],
    createdAt: new Date('2026-03-25'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: '2',
    name: 'Maria Ferreira',
    email: 'maria@startup.io',
    phone: '(21) 98888-0002',
    company: 'Startup XYZ',
    city: 'Rio de Janeiro',
    state: 'RJ',
    status: 'contatado',
    source: 'facebook',
    priority: 'media',
    tags: ['Em negócio'],
    value: 35000,
    pipelineId: 'default',
    stageId: 'stage-2',
    ownerId: '2',
    notes: [],
    tasks: [{ id: '1', title: 'Enviar proposta comercial', dueDate: new Date('2026-03-30'), completed: false, createdAt: new Date() }],
    activities: [{ id: '1', type: 'call', title: 'Ligação realizada', userId: '2', userName: 'Ana Oliveira', createdAt: new Date() }],
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-27'),
  },
  {
    id: '3',
    name: 'Roberto Costa',
    email: 'roberto.costa@corp.com.br',
    phone: '(31) 97777-0003',
    company: 'Corp Brasil',
    document: '98.765.432/0001-10',
    city: 'Belo Horizonte',
    state: 'MG',
    status: 'qualificado',
    source: 'indicacao',
    priority: 'alta',
    tags: ['Quente', 'Em negócio'],
    value: 120000,
    pipelineId: 'default',
    stageId: 'stage-3',
    ownerId: '1',
    notes: [],
    tasks: [],
    activities: [],
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-03-28'),
    nextContactAt: new Date('2026-03-31'),
  },
  {
    id: '4',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@ecommerce.com',
    phone: '(19) 96666-0004',
    company: 'E-commerce Plus',
    city: 'Campinas',
    state: 'SP',
    status: 'proposta',
    source: 'google_ads',
    priority: 'alta',
    tags: ['VIP', 'Aguardando'],
    value: 85000,
    pipelineId: 'default',
    stageId: 'stage-4',
    ownerId: '3',
    notes: [],
    tasks: [],
    activities: [],
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-03-28'),
  },
  {
    id: '5',
    name: 'Lucas Almeida',
    email: 'lucas@agency.com',
    phone: '(41) 95555-0005',
    company: 'Agency Digital',
    city: 'Curitiba',
    state: 'PR',
    status: 'negociacao',
    source: 'instagram',
    priority: 'media',
    tags: ['Em negócio'],
    value: 45000,
    pipelineId: 'default',
    stageId: 'stage-5',
    ownerId: '2',
    notes: [],
    tasks: [],
    activities: [],
    createdAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-03-27'),
  },
  {
    id: '6',
    name: 'Paula Nunes',
    email: 'paula.nunes@retail.com',
    phone: '(51) 94444-0006',
    company: 'Retail Brasil',
    city: 'Porto Alegre',
    state: 'RS',
    status: 'ganho',
    source: 'feira',
    priority: 'alta',
    tags: ['VIP'],
    value: 200000,
    pipelineId: 'default',
    stageId: 'stage-6',
    ownerId: '1',
    notes: [],
    tasks: [],
    activities: [],
    createdAt: new Date('2026-02-20'),
    updatedAt: new Date('2026-03-15'),
    lastContactAt: new Date('2026-03-15'),
  },
  {
    id: '7',
    name: 'Marcos Vinícius',
    email: 'marcos.v@logistics.com',
    phone: '(62) 93333-0007',
    company: 'Logística Express',
    city: 'Goiânia',
    state: 'GO',
    status: 'perdido',
    source: 'telefone',
    priority: 'baixa',
    tags: ['Frio'],
    value: 30000,
    pipelineId: 'default',
    stageId: 'stage-7',
    ownerId: '3',
    notes: [],
    tasks: [],
    activities: [],
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-03-01'),
  },
  {
    id: '8',
    name: 'Carla Dias',
    email: 'carla.dias@fintech.com',
    phone: '(11) 92222-0008',
    company: 'Fintech Nova',
    city: 'São Paulo',
    state: 'SP',
    status: 'novo',
    source: 'outro',
    priority: 'alta',
    tags: ['Quente', 'VIP'],
    value: 150000,
    pipelineId: 'default',
    stageId: 'stage-1',
    ownerId: '1',
    notes: [],
    tasks: [],
    activities: [],
    createdAt: new Date('2026-03-28'),
    updatedAt: new Date('2026-03-28'),
  },
];

const defaultPipeline: Pipeline = {
  id: 'default',
  name: 'Pipeline de Vendas',
  description: 'Pipeline padrão para acompanhamento de vendas',
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

const mockAnalytics: Analytics = {
  totalLeads: 156,
  newLeadsThisMonth: 23,
  totalDeals: 89,
  dealsWonThisMonth: 12,
  dealsLostThisMonth: 5,
  revenueThisMonth: 285000,
  revenueLastMonth: 245000,
  conversionRate: 32.5,
  averageDealValue: 18500,
  leadsBySource: {
    website: 45,
    facebook: 32,
    instagram: 28,
    google_ads: 22,
    indicacao: 15,
    telefone: 8,
    feira: 4,
    outro: 2,
  },
  leadsByStatus: {
    novo: 35,
    contatado: 28,
    qualificado: 22,
    proposta: 15,
    negociacao: 8,
    ganho: 45,
    perdido: 3,
  },
  dealsByStage: {
    'stage-1': 12,
    'stage-2': 18,
    'stage-3': 15,
    'stage-4': 10,
    'stage-5': 5,
    'stage-6': 45,
    'stage-7': 3,
  },
  dailyLeads: [
    { date: '2026-03-22', count: 5 },
    { date: '2026-03-23', count: 8 },
    { date: '2026-03-24', count: 3 },
    { date: '2026-03-25', count: 12 },
    { date: '2026-03-26', count: 7 },
    { date: '2026-03-27', count: 15 },
    { date: '2026-03-28', count: 9 },
  ],
  dailyDeals: [
    { date: '2026-03-22', count: 2, value: 25000 },
    { date: '2026-03-23', count: 3, value: 45000 },
    { date: '2026-03-24', count: 1, value: 15000 },
    { date: '2026-03-25', count: 4, value: 85000 },
    { date: '2026-03-26', count: 2, value: 30000 },
    { date: '2026-03-27', count: 5, value: 120000 },
    { date: '2026-03-28', count: 3, value: 55000 },
  ],
};

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      leads: mockLeads,
      pipelines: [defaultPipeline],
      deals: [],
      users: mockUsers,
      tags: mockTags,
      automations: [],
      emailCampaigns: [],
      appointments: [],
      currentUser: mockUsers[0],
      analytics: mockAnalytics,

      setCurrentUser: (user) => set({ currentUser: user }),

      addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),

      updateLead: (id, data) => set((state) => ({
        leads: state.leads.map((l) => l.id === id ? { ...l, ...data, updatedAt: new Date() } : l),
      })),

      deleteLead: (id) => set((state) => ({ leads: state.leads.filter((l) => l.id !== id) })),

      moveLeadToStage: (leadId, stageId) => set((state) => ({
        leads: state.leads.map((l) => 
          l.id === leadId ? { ...l, stageId, status: get().pipelines[0].stages.find(s => s.id === stageId)?.name.toLowerCase().replace(' ', '_') as Lead['status'] || l.status, updatedAt: new Date() } : l
        ),
      })),

      addPipeline: (pipeline) => set((state) => ({ pipelines: [...state.pipelines, pipeline] })),

      updatePipeline: (id, data) => set((state) => ({
        pipelines: state.pipelines.map((p) => p.id === id ? { ...p, ...data } : p),
      })),

      deletePipeline: (id) => set((state) => ({
        pipelines: state.pipelines.filter((p) => p.id !== id),
      })),

      addDeal: (deal) => set((state) => ({ deals: [...state.deals, deal] })),

      updateDeal: (id, data) => set((state) => ({
        deals: state.deals.map((d) => d.id === id ? { ...d, ...data, updatedAt: new Date() } : d),
      })),

      deleteDeal: (id) => set((state) => ({ deals: state.deals.filter((d) => d.id !== id) })),

      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),

      deleteTag: (id) => set((state) => ({ tags: state.tags.filter((t) => t.id !== id) })),

      addAutomation: (automation) => set((state) => ({ automations: [...state.automations, automation] })),

      updateAutomation: (id, data) => set((state) => ({
        automations: state.automations.map((a) => a.id === id ? { ...a, ...data, updatedAt: new Date() } : a),
      })),

      deleteAutomation: (id) => set((state) => ({
        automations: state.automations.filter((a) => a.id !== id),
      })),

      toggleAutomation: (id) => set((state) => ({
        automations: state.automations.map((a) => a.id === id ? { ...a, active: !a.active } : a),
      })),

      addAppointment: (appointment) => set((state) => ({ appointments: [...state.appointments, appointment] })),

      updateAppointment: (id, data) => set((state) => ({
        appointments: state.appointments.map((a) => a.id === id ? { ...a, ...data } : a),
      })),

      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id),
      })),

      addNoteToLead: (leadId, note) => set((state) => ({
        leads: state.leads.map((l) => 
          l.id === leadId ? { ...l, notes: [...l.notes, note], updatedAt: new Date() } : l
        ),
      })),

      addTaskToLead: (leadId, task) => set((state) => ({
        leads: state.leads.map((l) => 
          l.id === leadId ? { ...l, tasks: [...l.tasks, task], updatedAt: new Date() } : l
        ),
      })),

      addActivityToLead: (leadId, activity) => set((state) => ({
        leads: state.leads.map((l) => 
          l.id === leadId ? { ...l, activities: [...l.activities, activity], updatedAt: new Date() } : l
        ),
      })),

      calculateAnalytics: () => {
        const state = get();
        const analytics: Analytics = {
          totalLeads: state.leads.length,
          newLeadsThisMonth: state.leads.filter(l => {
            const now = new Date();
            const leadDate = new Date(l.createdAt);
            return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
          }).length,
          totalDeals: state.deals.length,
          dealsWonThisMonth: state.deals.filter(d => d.won).length,
          dealsLostThisMonth: state.deals.filter(d => !d.won).length,
          revenueThisMonth: state.deals.filter(d => d.won).reduce((sum, d) => sum + d.value, 0),
          revenueLastMonth: 0,
          conversionRate: state.leads.length > 0 ? (state.leads.filter(l => l.status === 'ganho').length / state.leads.length) * 100 : 0,
          averageDealValue: state.deals.length > 0 ? state.deals.reduce((sum, d) => sum + d.value, 0) / state.deals.length : 0,
          leadsBySource: state.leads.reduce((acc, l) => {
            acc[l.source] = (acc[l.source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) as Analytics['leadsBySource'],
          leadsByStatus: state.leads.reduce((acc, l) => {
            acc[l.status] = (acc[l.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) as Analytics['leadsByStatus'],
          dealsByStage: state.leads.reduce((acc, l) => {
            acc[l.stageId] = (acc[l.stageId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          dailyLeads: [],
          dailyDeals: [],
        };
        return analytics;
      },
    }),
    {
      name: 'crm-storage',
    }
  )
);
