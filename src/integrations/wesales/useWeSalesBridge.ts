import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { 
  WeSalesConfig, 
  WeSalesLead, 
  WeSalesCustomer, 
  WeSalesDeal,
  SyncResult, 
  SyncLog 
} from '@/integrations/types';

const DEFAULT_CONFIG: WeSalesConfig = {
  apiKey: '',
  apiUrl: 'https://api.wesales.com.br/v1',
  autoSync: true,
  syncInterval: 300000,
};

export function useWeSalesBridge(config: WeSalesConfig = DEFAULT_CONFIG) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [pendingSync, setPendingSync] = useState(0);
  const [configStatus, setConfigStatus] = useState({
    apiKeySet: false,
    webhookConfigured: false,
    customFieldsMapped: false,
  });
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  const logSync = useCallback(async (
    type: SyncLog['type'],
    externalId: string,
    status: SyncLog['status'],
    data: any,
    error?: string
  ) => {
    const log: SyncLog = {
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      externalId,
      status,
      attempts: 1,
      lastAttempt: new Date(),
      error,
      data,
    };

    setSyncLogs(prev => [log, ...prev].slice(0, 100));

    try {
      await supabase.from('wesales_sync_logs').insert({
        id: log.id,
        type: log.type,
        external_id: log.externalId,
        we_sales_id: log.weSalesId,
        status: log.status,
        attempts: log.attempts,
        last_attempt: log.lastAttempt.toISOString(),
        error: log.error,
        data: JSON.stringify(log.data),
      });
    } catch (e) {
      console.error('Erro ao salvar log de sync:', e);
    }

    return log;
  }, []);

  const updateSyncLog = useCallback(async (
    logId: string,
    updates: Partial<SyncLog>
  ) => {
    setSyncLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, ...updates } : log
    ));
  }, []);

  const setApiKey = useCallback(async (apiKey: string) => {
    if (!apiKey || apiKey.length < 10) {
      return { success: false, error: 'API Key inválida' };
    }

    try {
      const testResponse = await fetch(`${config.apiUrl}/ping`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        return { success: false, error: 'API Key inválida ou expirada' };
      }

      localStorage.setItem('wesales_api_key', apiKey);
      setConfigStatus(prev => ({ ...prev, apiKeySet: true }));
      setIsConfigured(true);

      return { success: true };
    } catch (error) {
      localStorage.setItem('wesales_api_key', apiKey);
      setConfigStatus(prev => ({ ...prev, apiKeySet: true }));
      setIsConfigured(true);
      return { success: true, warning: 'Não foi possível verificar a API, mas salva' };
    }
  }, [config.apiUrl]);

  const getApiKey = useCallback(() => {
    if (config.apiKey) return config.apiKey;
    return localStorage.getItem('wesales_api_key') || '';
  }, [config.apiKey]);

  const createLead = useCallback(async (
    customer: any,
    vehicle?: any
  ): Promise<SyncResult> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      const log = await logSync('customer', customer.id, 'pending', customer, 'API Key não configurada');
      return { success: false, error: 'API Key não configurada', syncedAt: new Date() };
    }

    const weSalesLead: WeSalesLead = {
      external_id: customer.id,
      name: customer.full_name || customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.cpf_cnpj,
      company: customer.company,
      source: 'website_registration',
      tags: ['Rastremix', customer.plan || 'Sem plano'].filter(Boolean),
      custom_fields: {
        vehicle_plate: vehicle?.plate || customer.plate,
        vehicle_brand: vehicle?.brand || customer.brand,
        vehicle_model: vehicle?.model || customer.model,
        vehicle_year: vehicle?.year || customer.year,
        vehicle_color: vehicle?.color || customer.color,
        plan: customer.plan,
        payment_method: customer.payment_method,
        registration_date: customer.created_at || new Date().toISOString(),
      },
      notes: vehicle 
        ? `Veículo: ${vehicle.brand || ''} ${vehicle.model || ''} (${vehicle.plate || ''})\nPlano: ${customer.plan || ''}\nPagamento: ${customer.payment_method || ''}`
        : `Plano: ${customer.plan || ''}\nPagamento: ${customer.payment_method || ''}`,
    };

    const log = await logSync('customer', customer.id, 'pending', weSalesLead);

    try {
      const response = await fetch(`${config.apiUrl}/leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weSalesLead),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Erro HTTP: ${response.status}`;
        await updateSyncLog(log.id, { status: 'failed', error: errorMsg });
        return { success: false, error: errorMsg, syncedAt: new Date() };
      }

      const result = await response.json();
      await updateSyncLog(log.id, { 
        status: 'synced', 
        weSalesId: result.id,
      });

      return { 
        success: true, 
        weSalesId: result.id, 
        externalId: customer.id,
        syncedAt: new Date() 
      };
    } catch (error: any) {
      const errorMsg = error.message || 'Erro desconhecido';
      await updateSyncLog(log.id, { status: 'failed', error: errorMsg });
      return { success: false, error: errorMsg, syncedAt: new Date() };
    }
  }, [config.apiUrl, getApiKey, logSync, updateSyncLog]);

  const createDeal = useCallback(async (
    customer: any,
    vehicle?: any
  ): Promise<SyncResult> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API Key não configurada', syncedAt: new Date() };
    }

    const dealValue = getDealValue(customer.plan);

    const weSalesDeal: WeSalesDeal = {
      external_id: `deal-${customer.id}`,
      title: `Rastremix - ${customer.full_name || customer.name} (${vehicle?.plate || customer.plate || 'N/I'})`,
      value: dealValue,
      custom_fields: {
        vehicle_plate: vehicle?.plate || customer.plate,
        vehicle_brand: vehicle?.brand || customer.brand,
        vehicle_model: vehicle?.model || customer.model,
        plan: customer.plan,
      },
      notes: `Cliente Rastremix\nPlano: ${customer.plan || ''}\nValor: R$ ${dealValue.toLocaleString('pt-BR')}`,
    };

    const log = await logSync('deal', `deal-${customer.id}`, 'pending', weSalesDeal);

    try {
      const response = await fetch(`${config.apiUrl}/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weSalesDeal),
      });

      if (!response.ok) {
        const errorMsg = `Erro HTTP: ${response.status}`;
        await updateSyncLog(log.id, { status: 'failed', error: errorMsg });
        return { success: false, error: errorMsg, syncedAt: new Date() };
      }

      const result = await response.json();
      await updateSyncLog(log.id, { status: 'synced', weSalesId: result.id });

      return { success: true, weSalesId: result.id, syncedAt: new Date() };
    } catch (error: any) {
      await updateSyncLog(log.id, { status: 'failed', error: error.message });
      return { success: false, error: error.message, syncedAt: new Date() };
    }
  }, [config.apiUrl, getApiKey, logSync, updateSyncLog]);

  const getDealValue = (plan?: string): number => {
    const planValues: Record<string, number> = {
      'basico': 49.90,
      'basic': 49.90,
      'completo': 89.90,
      'full': 89.90,
      'frota': 149.90,
      'fleet': 149.90,
      'bloqueio': 69.90,
      'block': 69.90,
    };
    return planValues[plan?.toLowerCase() || ''] || 89.90;
  };

  const syncCustomer = useCallback(async (
    customer: any,
    vehicle?: any
  ): Promise<{ lead: SyncResult; deal: SyncResult }> => {
    const leadResult = await createLead(customer, vehicle);
    const dealResult = await createDeal(customer, vehicle);

    await supabase.from('wesales_customers').upsert({
      id: customer.id,
      external_id: customer.id,
      we_sales_lead_id: leadResult.weSalesId,
      we_sales_deal_id: dealResult.weSalesId,
      synced_at: new Date().toISOString(),
      sync_status: leadResult.success && dealResult.success ? 'synced' : 'partial',
    });

    return { lead: leadResult, deal: dealResult };
  }, [createLead, createDeal]);

  const syncAllPending = useCallback(async (): Promise<{
    synced: number;
    failed: number;
    results: { customerId: string; result: any }[];
  }> => {
    setIsSyncing(true);
    
    try {
      const { data: pendingCustomers, error } = await supabase
        .from('customers')
        .select('*, vehicles:vehicle_id(*)')
        .is('wesales_synced', null);

      if (error) throw error;

      let synced = 0;
      let failed = 0;
      const results: { customerId: string; result: any }[] = [];

      for (const customer of pendingCustomers || []) {
        try {
          const result = await syncCustomer(customer);
          if (result.lead.success || result.deal.success) {
            synced++;
            await supabase.from('customers').update({ wesales_synced: true }).eq('id', customer.id);
          } else {
            failed++;
          }
          results.push({ customerId: customer.id, result });
        } catch (e) {
          failed++;
          results.push({ customerId: customer.id, result: { error: String(e) } });
        }
      }

      setLastSync(new Date());
      setPendingSync(0);
      return { synced, failed, results };
    } finally {
      setIsSyncing(false);
    }
  }, [syncCustomer]);

  const handleWebhook = useCallback(async (payload: any) => {
    console.log('WeSales Webhook received:', payload);
    
    switch (payload.event) {
      case 'lead.created':
      case 'lead.updated':
        await supabase.from('wesales_webhook_logs').insert({
          event: payload.event,
          data: JSON.stringify(payload.data),
          received_at: new Date().toISOString(),
        });
        break;
      
      case 'deal.created':
      case 'deal.updated':
        await supabase.from('wesales_webhook_logs').insert({
          event: payload.event,
          data: JSON.stringify(payload.data),
          received_at: new Date().toISOString(),
        });
        break;
    }
  }, []);

  const getSyncStats = useCallback(() => {
    const total = syncLogs.length;
    const synced = syncLogs.filter(l => l.status === 'synced').length;
    const failed = syncLogs.filter(l => l.status === 'failed').length;
    const pending = syncLogs.filter(l => l.status === 'pending').length;

    return {
      total,
      synced,
      failed,
      pending,
      successRate: total > 0 ? ((synced / total) * 100).toFixed(1) : '0',
    };
  }, [syncLogs]);

  const setupWebhook = useCallback(async (webhookUrl: string) => {
    const apiKey = getApiKey();
    if (!apiKey) return { success: false, error: 'API Key não configurada' };

    try {
      const response = await fetch(`${config.apiUrl}/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          events: ['lead.created', 'lead.updated', 'deal.created', 'deal.updated'],
        }),
      });

      if (!response.ok) {
        return { success: false, error: 'Erro ao configurar webhook' };
      }

      setConfigStatus(prev => ({ ...prev, webhookConfigured: true }));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [config.apiUrl, getApiKey]);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      const savedApiKey = localStorage.getItem('wesales_api_key');
      if (savedApiKey) {
        setIsConfigured(true);
        setConfigStatus(prev => ({ ...prev, apiKeySet: true }));
      }
    }
  }, []);

  useEffect(() => {
    if (config.autoSync && isConfigured) {
      syncIntervalRef.current = setInterval(() => {
        syncAllPending();
      }, config.syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [config.autoSync, config.syncInterval, isConfigured, syncAllPending]);

  return {
    isConfigured,
    isSyncing,
    lastSync,
    syncLogs,
    pendingSync,
    configStatus,
    setApiKey,
    createLead,
    createDeal,
    syncCustomer,
    syncAllPending,
    handleWebhook,
    getSyncStats,
    setupWebhook,
  };
}

export type { WeSalesConfig };
