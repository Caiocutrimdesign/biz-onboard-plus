import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { CustomerRegistration } from '@/types/customer';

export interface AgentState {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'error' | 'disabled';
  lastRun: Date | null;
  interval: number;
  errors: number;
}

const STORAGE_KEY = 'biz_crm_agents';
const CUSTOMERS_KEY = 'rastremix_customers';

export function useAgentOrchestrator() {
  const [agents, setAgents] = useState<Record<string, AgentState>>({
    sync: { id: 'sync', name: 'Sync Agent', status: 'idle', lastRun: null, interval: 60000, errors: 0 },
  });
  
  const [logs, setLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newToday: 0,
    activeCustomers: 0,
    pendingSync: 0,
  });

  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [{
      id: Date.now(),
      message,
      type: 'info',
      timestamp: new Date(),
    }, ...prev].slice(0, 20));
  }, []);

  const updateAgent = useCallback((agentId: string, updates: Partial<AgentState>) => {
    setAgents(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...updates },
    }));
  }, []);

  const loadCustomers = useCallback((): CustomerRegistration[] => {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }, []);

  const runSyncAgent = useCallback(async () => {
    const agentId = 'sync';
    updateAgent(agentId, { status: 'running' });
    
    try {
      if (isSupabaseConfigured() && supabase) {
        const customers = loadCustomers();
        const unsynced = customers.filter(c => !(c as any).synced);
        
        if (unsynced.length > 0) {
          for (const customer of unsynced) {
            try {
              const { error } = await supabase.from('customers').insert({
                id: customer.id,
                full_name: customer.full_name,
                phone: customer.phone,
                status: customer.status,
                created_at: customer.created_at,
              });
              if (!error) (customer as any).synced = true;
            } catch {}
          }
          localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
          addLog(`Sincronizados ${unsynced.filter(c => (c as any).synced).length} clientes`);
        }
      }
      updateAgent(agentId, { status: 'idle', lastRun: new Date(), errors: 0 });
    } catch {
      updateAgent(agentId, { status: 'error', errors: 1 });
    }
  }, [loadCustomers, updateAgent, addLog]);



  const updateStats = useCallback(() => {
    const customers = loadCustomers();
    setStats({
      totalCustomers: customers.length,
      newToday: customers.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length,
      activeCustomers: customers.filter(c => c.status === 'cliente_ativado').length,
      pendingSync: customers.filter(c => !(c as any).synced).length,
    });
  }, [loadCustomers]);

  useEffect(() => {
    if (!isRunning) return;

    intervalsRef.current.push(setInterval(runSyncAgent, 60000));
    intervalsRef.current.push(setInterval(updateStats, 15000));

    runSyncAgent();
    updateStats();
    addLog('Sistema de Sincronização iniciado');

    return () => {
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
    };
  }, [isRunning, runSyncAgent, updateStats, addLog]);

  return {
    agents,
    logs,
    stats,
    isRunning,
    startAgents: () => setIsRunning(true),
    stopAgents: () => setIsRunning(false),
  };
}

export default useAgentOrchestrator;
