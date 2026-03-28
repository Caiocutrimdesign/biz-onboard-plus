import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useWeSalesBridge } from '@/integrations/wesales/useWeSalesBridge';
import type { SyncLog } from '@/integrations/types';

interface ReminderConfig {
  autoSync: boolean;
  syncInterval: number;
  notifyOnError: boolean;
  retryFailed: boolean;
  maxRetries: number;
}

const DEFAULT_CONFIG: ReminderConfig = {
  autoSync: true,
  syncInterval: 60000,
  notifyOnError: true,
  retryFailed: true,
  maxRetries: 3,
};

export function useWeSalesSyncAgent(config: ReminderConfig = DEFAULT_CONFIG) {
  const [isRunning, setIsRunning] = useState(false);
  const [lastReminder, setLastReminder] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [reminders, setReminders] = useState<string[]>([]);
  const [syncHistory, setSyncHistory] = useState<{
    timestamp: Date;
    synced: number;
    failed: number;
    message: string;
  }[]>([]);

  const weSales = useWeSalesBridge({
    apiKey: '',
    apiUrl: 'https://api.wesales.com.br/v1',
    autoSync: false,
    syncInterval: config.syncInterval,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  const addReminder = useCallback((message: string) => {
    const reminder = {
      id: `rem-${Date.now()}`,
      message,
      timestamp: new Date(),
      type: 'info' as const,
    };

    setReminders(prev => [
      `${new Date().toLocaleTimeString('pt-BR')} - ${message}`,
      ...prev.slice(0, 9),
    ]);

    setLastReminder(new Date());
  }, []);

  const checkPendingSync = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .or('wesales_synced.is.null,wesales_synced.eq.false');

      if (error) throw error;
      setPendingCount(data?.length || 0);

      if ((data?.length || 0) > 0) {
        addReminder(`⚠️ ${data?.length} cliente(s) pendente(s) de sincronização`);
      }

      return data?.length || 0;
    } catch (error: any) {
      console.error('Erro ao verificar pendências:', error);
      return 0;
    }
  }, [addReminder]);

  const checkFailedSync = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('wesales_sync_logs')
        .select('id')
        .eq('status', 'failed')
        .lt('attempts', config.maxRetries);

      if (error) throw error;
      setFailedCount(data?.length || 0);

      if ((data?.length || 0) > 0) {
        addReminder(`🔴 ${data?.length} sincronização(ões) falharam e precisam de atenção`);
      }

      return data?.length || 0;
    } catch (error) {
      return 0;
    }
  }, [addReminder, config.maxRetries]);

  const retryFailedSync = useCallback(async () => {
    const failed = await checkFailedSync();
    if (failed === 0) return;

    addReminder('🔄 Tentando re-sincronizar registros que falharam...');

    try {
      const { data, error } = await supabase
        .from('wesales_sync_logs')
        .select('*, customers(*)')
        .eq('status', 'failed')
        .lt('attempts', config.maxRetries);

      if (error) throw error;

      let retried = 0;
      let succeeded = 0;

      for (const log of data || []) {
        try {
          if (log.type === 'customer' && log.customers) {
            const result = await weSales.syncCustomer(log.customers);
            if (result.lead.success || result.deal.success) {
              succeeded++;
              await supabase.from('wesales_sync_logs')
                .update({ status: 'synced', attempts: log.attempts + 1 })
                .eq('id', log.id);
            }
          }
          retried++;
        } catch (e) {
          await supabase.from('wesales_sync_logs')
            .update({ attempts: log.attempts + 1 })
            .eq('id', log.id);
        }
      }

      addReminder(`✅ ${succeeded}/${retried} re-sincronizações concluídas`);
      setSyncHistory(prev => [{
        timestamp: new Date(),
        synced: succeeded,
        failed: retried - succeeded,
        message: `Re-sincronização: ${succeeded} успех, ${retried - succeeded} falhas`,
      }, ...prev].slice(0, 20));

    } catch (error: any) {
      addReminder(`❌ Erro ao re-sincronizar: ${error.message}`);
    }
  }, [checkFailedSync, weSales, addReminder, config.maxRetries]);

  const runSync = useCallback(async () => {
    if (isRunning) {
      addReminder('⚠️ Sincronização já está em andamento');
      return;
    }

    setIsRunning(true);
    addReminder('🚀 Iniciando sincronização com WeSales CRM...');

    try {
      const pendingBefore = await checkPendingSync();
      if (pendingBefore === 0) {
        addReminder('✅ Nenhum cliente pendente para sincronizar');
        setSyncHistory(prev => [{
          timestamp: new Date(),
          synced: 0,
          failed: 0,
          message: 'Nenhuma pendência',
        }, ...prev].slice(0, 20));
        return;
      }

      const result = await weSales.syncAllPending();

      if (result.failed === 0) {
        addReminder(`✅ Sincronização completa! ${result.synced} cliente(s) enviado(s) para WeSales`);
      } else {
        addReminder(`⚠️ Sincronização parcial: ${result.synced} sucesso, ${result.failed} falhas`);
      }

      setSyncHistory(prev => [{
        timestamp: new Date(),
        synced: result.synced,
        failed: result.failed,
        message: `${result.synced} sincronizados, ${result.failed} falharam`,
      }, ...prev].slice(0, 20));

      await checkPendingSync();
      await checkFailedSync();

    } catch (error: any) {
      addReminder(`❌ Erro na sincronização: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, checkPendingSync, checkFailedSync, weSales, addReminder]);

  const autoSync = useCallback(async () => {
    if (!config.autoSync) return;

    const pending = await checkPendingSync();
    const failed = await checkFailedSync();

    if (pending > 0 || failed > 0) {
      addReminder(`📡 Verificando sincronização com WeSales...`);
      await runSync();
    }
  }, [config.autoSync, checkPendingSync, checkFailedSync, runSync, addReminder]);

  const getStatus = useCallback(() => {
    const apiKeyConfigured = weSales.isConfigured;
    const pending = pendingCount;
    const failed = failedCount;
    const running = isRunning;

    if (!apiKeyConfigured) {
      return {
        status: 'not_configured',
        color: 'gray',
        text: 'API Key não configurada',
        action: 'Configure a API Key da WeSales',
      };
    }

    if (running) {
      return {
        status: 'syncing',
        color: 'blue',
        text: 'Sincronizando...',
        action: 'Aguardando conclusão',
      };
    }

    if (failed > 0) {
      return {
        status: 'error',
        color: 'red',
        text: `${failed} falha(s)`,
        action: 'Revisar e tentar novamente',
      };
    }

    if (pending > 0) {
      return {
        status: 'pending',
        color: 'yellow',
        text: `${pending} pendente(s)`,
        action: 'Sincronizar agora',
      };
    }

    return {
      status: 'ok',
      color: 'green',
      text: 'Tudo sincronizado',
      action: 'Última sync há ' + (lastReminder ? formatTimeSince(lastReminder) : 'nunca'),
    };
  }, [weSales.isConfigured, pendingCount, failedCount, isRunning, lastReminder]);

  const formatTimeSince = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      checkPendingSync();
      checkFailedSync();
      addReminder('🤖 Agente WeSales Sync iniciado');
      addReminder('📝 Lembrete: Configure a API Key quando receber da WeSales');
    }
  }, []);

  useEffect(() => {
    if (config.autoSync) {
      intervalRef.current = setInterval(autoSync, config.syncInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config.autoSync, config.syncInterval, autoSync]);

  return {
    isRunning,
    isConfigured: weSales.isConfigured,
    lastReminder,
    lastSync: weSales.lastSync,
    pendingCount,
    failedCount,
    reminders,
    syncHistory,
    setApiKey: weSales.setApiKey,
    runSync,
    retryFailedSync,
    checkPendingSync,
    checkFailedSync,
    autoSync,
    getStatus,
    configStatus: weSales.configStatus,
  };
}
