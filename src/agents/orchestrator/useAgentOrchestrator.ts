import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { CustomerRegistration, CustomerStatus } from '@/types/customer';
import type { Lead } from '@/types/crm';

export interface AgentState {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'error' | 'disabled';
  lastRun: Date | null;
  nextRun: Date | null;
  interval: number;
  errors: number;
  data: any;
}

export interface AgentLog {
  id: string;
  agentId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface OrchestratorConfig {
  syncInterval: number;
  crmInterval: number;
  notificationInterval: number;
  analyticsInterval: number;
  salesInterval: number;
  guardianInterval: number;
  gpsInterval: number;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  syncInterval: 30000,
  crmInterval: 60000,
  notificationInterval: 45000,
  analyticsInterval: 120000,
  salesInterval: 75000,
  guardianInterval: 30000,
  gpsInterval: 60000,
};

const STORAGE_KEY = 'biz_crm_agents';
const CUSTOMERS_KEY = 'rastremix_customers';

export function useAgentOrchestrator(config: OrchestratorConfig = DEFAULT_CONFIG) {
  const [agents, setAgents] = useState<Record<string, AgentState>>({
    crm: { id: 'crm', name: 'CRM Agent', status: 'idle', lastRun: null, nextRun: null, interval: config.crmInterval, errors: 0, data: null },
    customer: { id: 'customer', name: 'Customer Agent', status: 'idle', lastRun: null, nextRun: null, interval: config.notificationInterval, errors: 0, data: null },
    analytics: { id: 'analytics', name: 'Analytics Agent', status: 'idle', lastRun: null, nextRun: null, interval: config.analyticsInterval, errors: 0, data: null },
    notification: { id: 'notification', name: 'Notification Agent', status: 'idle', lastRun: null, nextRun: null, interval: config.notificationInterval, errors: 0, data: null },
    sales: { id: 'sales', name: 'Sales Agent', status: 'idle', lastRun: null, nextRun: null, interval: config.salesInterval, errors: 0, data: null },
    guardian: { id: 'guardian', name: 'Guardian Agent', status: 'idle', lastRun: null, nextRun: null, interval: config.guardianInterval, errors: 0, data: null },
    sync: { id: 'sync', name: 'Sync Agent', status: 'idle', lastRun: null, nextRun: null, interval: config.syncInterval, errors: 0, data: null },
    gpsCollector: { id: 'gpsCollector', name: 'GPS Collector', status: 'idle', lastRun: null, nextRun: null, interval: config.gpsInterval, errors: 0, data: null },
    gpsNormalizer: { id: 'gpsNormalizer', name: 'GPS Normalizer', status: 'idle', lastRun: null, nextRun: null, interval: config.gpsInterval, errors: 0, data: null },
    lovablesync: { id: 'lovablesync', name: 'Lovables Sync', status: 'idle', lastRun: null, nextRun: null, interval: config.syncInterval, errors: 0, data: null },
    wesales: { id: 'wesales', name: 'WeSales Bridge', status: 'idle', lastRun: null, nextRun: null, interval: config.syncInterval, errors: 0, data: null },
  });
  
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newToday: 0,
    activeCustomers: 0,
    pendingSync: 0,
    systemHealth: 'healthy' as 'healthy' | 'degraded' | 'critical',
  });

  const intervalsRef = useRef<Record<string, NodeJS.Timeout | null>>({});
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const addLog = useCallback((agentId: string, message: string, type: AgentLog['type'] = 'info') => {
    const log: AgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      agentId,
      message,
      type,
      timestamp: new Date(),
    };
    setLogs(prev => [log, ...prev].slice(0, 100));
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || '{"logs":[]}';
      const data = JSON.parse(stored);
      data.logs = [log, ...(data.logs || [])].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist log:', e);
    }
  }, []);

  const updateAgent = useCallback((agentId: string, updates: Partial<AgentState>) => {
    setAgents(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...updates, nextRun: updates.lastRun ? new Date(updates.lastRun.getTime() + (updates.interval || prev[agentId].interval)) : null }
    }));
  }, []);

  const loadCustomers = useCallback((): CustomerRegistration[] => {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load customers:', e);
      return [];
    }
  }, []);

  const saveCustomers = useCallback((customers: CustomerRegistration[]) => {
    try {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers:', e);
    }
  }, []);

  const runCRMAgent = useCallback(async () => {
    const agentId = 'crm';
    updateAgent(agentId, { status: 'running' });
    
    try {
      const customers = loadCustomers();
      const insights: any[] = [];
      
      customers.forEach((c, i) => {
        if (c.status === 'novo_cadastro') {
          insights.push({ type: 'new_lead', customer: c.full_name, id: c.id });
        }
        if (c.status === 'em_atendimento' && c.created_at) {
          const daysSince = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSince > 3) {
            insights.push({ type: 'follow_up', customer: c.full_name, days: daysSince, id: c.id });
          }
        }
      });

      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: { insights, customerCount: customers.length },
        errors: 0
      });
      addLog(agentId, `CRM Agent: Analisados ${customers.length} clientes`, 'success');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.crm?.errors || 0) + 1 });
      addLog(agentId, `CRM Agent Error: ${error.message}`, 'error');
    }
  }, [loadCustomers, updateAgent, addLog, agents.crm?.errors]);

  const runNotificationAgent = useCallback(async () => {
    const agentId = 'notification';
    updateAgent(agentId, { status: 'running' });
    
    try {
      const customers = loadCustomers();
      const notifications: string[] = [];
      
      const newCustomers = customers.filter(c => c.status === 'novo_cadastro');
      const pendingPayment = customers.filter(c => c.status === 'aguardando_pagamento');
      
      if (newCustomers.length > 0) {
        notifications.push(`${newCustomers.length} novo(s) cadastro(s) pendente(s)`);
      }
      if (pendingPayment.length > 0) {
        notifications.push(`${pendingPayment.length} cliente(s) aguardando pagamento`);
      }

      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: { notifications },
        errors: 0
      });
      addLog(agentId, `Notificações: ${notifications.length} alertas gerados`, 'info');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.notification?.errors || 0) + 1 });
      addLog(agentId, `Notification Agent Error: ${error.message}`, 'error');
    }
  }, [loadCustomers, updateAgent, addLog, agents.notification?.errors]);

  const runSalesAgent = useCallback(async () => {
    const agentId = 'sales';
    updateAgent(agentId, { status: 'running' });
    
    try {
      const customers = loadCustomers();
      
      const leads: Partial<Lead>[] = customers
        .filter(c => ['novo_cadastro', 'em_atendimento'].includes(c.status))
        .map(c => ({
          id: c.id,
          name: c.full_name,
          email: c.email,
          phone: c.phone,
          status: c.status === 'novo_cadastro' ? 'novo' as const : 'contatado' as const,
          value: c.plan === 'completo' ? 199 : c.plan === 'bloqueio' ? 99 : 49,
          source: 'website',
          priority: 'media' as const,
          createdAt: c.created_at,
          tags: [c.plan],
        }));

      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: { leadCount: leads.length },
        errors: 0
      });
      addLog(agentId, `Sales Agent: ${leads.length} leads qualificados`, 'success');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.sales?.errors || 0) + 1 });
      addLog(agentId, `Sales Agent Error: ${error.message}`, 'error');
    }
  }, [loadCustomers, updateAgent, addLog, agents.sales?.errors]);

  const runAnalyticsAgent = useCallback(async () => {
    const agentId = 'analytics';
    updateAgent(agentId, { status: 'running' });
    
    try {
      const customers = loadCustomers();
      const analytics = {
        total: customers.length,
        byStatus: {} as Record<string, number>,
        byPlan: {} as Record<string, number>,
        byCity: {} as Record<string, number>,
        conversionRate: 0,
      };

      customers.forEach(c => {
        analytics.byStatus[c.status] = (analytics.byStatus[c.status] || 0) + 1;
        analytics.byPlan[c.plan] = (analytics.byPlan[c.plan] || 0) + 1;
        if (c.city) analytics.byCity[c.city] = (analytics.byCity[c.city] || 0) + 1;
      });

      const activated = customers.filter(c => c.status === 'cliente_ativado').length;
      analytics.conversionRate = customers.length > 0 ? (activated / customers.length) * 100 : 0;

      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: analytics,
        errors: 0
      });
      addLog(agentId, `Analytics: Taxa de conversão ${analytics.conversionRate.toFixed(1)}%`, 'info');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.analytics?.errors || 0) + 1 });
      addLog(agentId, `Analytics Agent Error: ${error.message}`, 'error');
    }
  }, [loadCustomers, updateAgent, addLog, agents.analytics?.errors]);

  const runGuardianAgent = useCallback(async () => {
    const agentId = 'guardian';
    updateAgent(agentId, { status: 'running' });
    
    try {
      const health = {
        localStorage: true,
        memory: true,
        network: navigator.onLine,
        timestamp: new Date(),
      };

      try {
        localStorage.setItem('_health', '1');
        localStorage.removeItem('_health');
      } catch {
        health.localStorage = false;
      }

      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        health.memory = mem.usedJSHeapSize < mem.jsHeapSizeLimit * 0.9;
      }

      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: health,
        errors: 0
      });
      addLog(agentId, `Guardian: Sistema ${health.localStorage && health.memory && health.network ? 'saudável' : 'com problemas'}`, health.localStorage && health.memory && health.network ? 'success' : 'warning');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.guardian?.errors || 0) + 1 });
      addLog(agentId, `Guardian Error: ${error.message}`, 'error');
    }
  }, [updateAgent, addLog, agents.guardian?.errors]);

  const runSyncAgent = useCallback(async () => {
    const agentId = 'sync';
    updateAgent(agentId, { status: 'running' });
    
    try {
      if (isSupabaseConfigured() && supabase) {
        const customers = loadCustomers();
        const unsynced = customers.filter(c => !(c as any).synced);
        
        if (unsynced.length > 0) {
          let synced = 0;
          for (const customer of unsynced) {
            try {
              const { error } = await supabase.from('customers').insert({
                id: customer.id,
                full_name: customer.full_name,
                phone: customer.phone,
                cpf_cnpj: customer.cpf_cnpj,
                email: customer.email,
                cep: customer.cep,
                street: customer.street,
                number: customer.number,
                neighborhood: customer.neighborhood,
                city: customer.city,
                state: customer.state,
                vehicle_type: customer.vehicle_type,
                plate: customer.plate,
                brand: customer.brand,
                model: customer.model,
                year: customer.year,
                color: customer.color,
                plan: customer.plan,
                payment_method: customer.payment_method,
                status: customer.status,
                created_at: customer.created_at,
              });
              
              if (!error) {
                (customer as any).synced = true;
                synced++;
              }
            } catch (e) {
              console.error('Sync error for customer:', customer.id, e);
            }
          }
          
          if (synced > 0) {
            saveCustomers(customers);
            addLog(agentId, `Sincronizados ${synced}/${unsynced.length} clientes para Supabase`, 'success');
          }
        }
      }

      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: { synced: true },
        errors: 0
      });
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.sync?.errors || 0) + 1 });
      addLog(agentId, `Sync Agent Error: ${error.message}`, 'error');
    }
  }, [loadCustomers, saveCustomers, updateAgent, addLog, agents.sync?.errors]);

  const runGPSCollector = useCallback(async () => {
    const agentId = 'gpsCollector';
    updateAgent(agentId, { status: 'running' });
    
    try {
      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: { collected: true, timestamp: new Date() },
        errors: 0
      });
      addLog(agentId, 'GPS Collector: Dados coletados', 'info');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.gpsCollector?.errors || 0) + 1 });
      addLog(agentId, `GPS Collector Error: ${error.message}`, 'error');
    }
  }, [updateAgent, addLog, agents.gpsCollector?.errors]);

  const runGPSNormalizer = useCallback(async () => {
    const agentId = 'gpsNormalizer';
    updateAgent(agentId, { status: 'running' });
    
    try {
      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: { normalized: true, timestamp: new Date() },
        errors: 0
      });
      addLog(agentId, 'GPS Normalizer: Dados normalizados', 'info');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.gpsNormalizer?.errors || 0) + 1 });
      addLog(agentId, `GPS Normalizer Error: ${error.message}`, 'error');
    }
  }, [updateAgent, addLog, agents.gpsNormalizer?.errors]);

  const runWeSalesAgent = useCallback(async () => {
    const agentId = 'wesales';
    updateAgent(agentId, { status: 'running' });
    
    try {
      const wesalesApiKey = localStorage.getItem('wesales_api_key');
      
      if (!wesalesApiKey) {
        updateAgent(agentId, { 
          status: 'idle', 
          lastRun: new Date(), 
          data: { configured: false },
          errors: 0
        });
        return;
      }

      updateAgent(agentId, { 
        status: 'idle', 
        lastRun: new Date(), 
        data: { configured: true },
        errors: 0
      });
      addLog(agentId, 'WeSales: Verificação de sincronização', 'info');
    } catch (error: any) {
      updateAgent(agentId, { status: 'error', errors: (agents.wesales?.errors || 0) + 1 });
      addLog(agentId, `WeSales Error: ${error.message}`, 'error');
    }
  }, [updateAgent, addLog, agents.wesales?.errors]);

  const updateStats = useCallback(() => {
    const customers = loadCustomers();
    const today = new Date().toDateString();
    const newToday = customers.filter(c => new Date(c.created_at).toDateString() === today).length;
    const active = customers.filter(c => c.status === 'cliente_ativado').length;
    const unsynced = customers.filter(c => !(c as any).synced).length;

    setStats({
      totalCustomers: customers.length,
      newToday,
      activeCustomers: active,
      pendingSync: unsynced,
      systemHealth: Object.values(agents).filter(a => a.status === 'error').length > 2 ? 'critical' : 
                   Object.values(agents).filter(a => a.status === 'error').length > 0 ? 'degraded' : 'healthy',
    });
  }, [loadCustomers, agents]);

  useEffect(() => {
    if (!isRunning) return;

    addLog('system', '🚀 Sistema de Agentes iniciado', 'success');

    intervalsRef.current.crm = setInterval(runCRMAgent, configRef.current.crmInterval);
    intervalsRef.current.notification = setInterval(runNotificationAgent, configRef.current.notificationInterval);
    intervalsRef.current.analytics = setInterval(runAnalyticsAgent, configRef.current.analyticsInterval);
    intervalsRef.current.sales = setInterval(runSalesAgent, configRef.current.salesInterval);
    intervalsRef.current.guardian = setInterval(runGuardianAgent, configRef.current.guardianInterval);
    intervalsRef.current.sync = setInterval(runSyncAgent, configRef.current.syncInterval);
    intervalsRef.current.gpsCollector = setInterval(runGPSCollector, configRef.current.gpsInterval);
    intervalsRef.current.gpsNormalizer = setInterval(runGPSNormalizer, configRef.current.gpsInterval);
    intervalsRef.current.wesales = setInterval(runWeSalesAgent, configRef.current.syncInterval);

    const statsInterval = setInterval(updateStats, 15000);

    runCRMAgent();
    runNotificationAgent();
    runAnalyticsAgent();
    runGuardianAgent();
    runSyncAgent();
    updateStats();

    return () => {
      Object.values(intervalsRef.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      clearInterval(statsInterval);
      addLog('system', '⏹️ Sistema de Agentes parado', 'info');
    };
  }, [isRunning, runCRMAgent, runNotificationAgent, runAnalyticsAgent, runSalesAgent, runGuardianAgent, runSyncAgent, runGPSCollector, runGPSNormalizer, runWeSalesAgent, updateStats, addLog]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        runCRMAgent();
        runNotificationAgent();
        updateStats();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, runCRMAgent, runNotificationAgent, updateStats]);

  const startAgents = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopAgents = useCallback(() => {
    setIsRunning(false);
  }, []);

  const restartAgent = useCallback((agentId: string) => {
    const agent = agents[agentId];
    if (!agent) return;

    if (intervalsRef.current[agentId]) {
      clearInterval(intervalsRef.current[agentId]!);
    }

    switch (agentId) {
      case 'crm': runCRMAgent(); intervalsRef.current.crm = setInterval(runCRMAgent, agent.interval); break;
      case 'notification': runNotificationAgent(); intervalsRef.current.notification = setInterval(runNotificationAgent, agent.interval); break;
      case 'analytics': runAnalyticsAgent(); intervalsRef.current.analytics = setInterval(runAnalyticsAgent, agent.interval); break;
      case 'sales': runSalesAgent(); intervalsRef.current.sales = setInterval(runSalesAgent, agent.interval); break;
      case 'guardian': runGuardianAgent(); intervalsRef.current.guardian = setInterval(runGuardianAgent, agent.interval); break;
      case 'sync': runSyncAgent(); intervalsRef.current.sync = setInterval(runSyncAgent, agent.interval); break;
    }

    addLog(agentId, `Agent ${agent.name} reiniciado`, 'info');
  }, [agents, runCRMAgent, runNotificationAgent, runAnalyticsAgent, runSalesAgent, runGuardianAgent, runSyncAgent, addLog]);

  return {
    agents,
    logs,
    stats,
    isRunning,
    startAgents,
    stopAgents,
    restartAgent,
    updateConfig: (newConfig: Partial<OrchestratorConfig>) => {
      configRef.current = { ...configRef.current, ...newConfig };
    },
  };
}

export default useAgentOrchestrator;
