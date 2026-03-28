import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Check, X, Cloud, CloudOff, Loader2, 
  AlertTriangle, Zap, Clock, ExternalLink
} from 'lucide-react';
import { useLovableAutoSync } from '@/agents/hooks/useLovableAutoSync';

interface SyncIndicatorProps {
  autoSync?: boolean;
  onSyncComplete?: (result: any) => void;
}

export default function SyncIndicator({ autoSync = true, onSyncComplete }: SyncIndicatorProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const { commitAndPush, verifyDeployment, getStatus } = useLovableAutoSync({
    autoSync,
    syncAfterCommit: true,
    verifyDeployment: true,
    remotes: ['origin', 'lovable'],
  });

  const status = getStatus();

  const sync = useCallback(async () => {
    setNotification({ type: 'info', message: '🔄 Sincronizando...' });
    setShowNotification(true);

    try {
      const result = await commitAndPush();
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: `✅ Sincronizado! Enviado para: ${result.pushedTo.join(', ')}`,
        });
        setLastSyncTime(new Date());
        onSyncComplete?.(result);
      } else {
        setNotification({
          type: 'error',
          message: `⚠️ ${result.message}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `❌ Erro: ${error.message}`,
      });
    }

    setTimeout(() => setShowNotification(false), 5000);
  }, [commitAndPush, onSyncComplete]);

  const checkDeployment = useCallback(async () => {
    const deployment = await verifyDeployment();
    if (deployment.deployed) {
      setNotification({
        type: 'success',
        message: `🌐 Deploy OK: ${deployment.url}`,
      });
    }
  }, [verifyDeployment]);

  useEffect(() => {
    if (autoSync) {
      const interval = setInterval(async () => {
        const status = await checkGitChanges();
        if (status.hasChanges && !status.isRunning) {
          await sync();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoSync, sync]);

  const checkGitChanges = async () => {
    try {
      const response = await fetch('data:text/plain;base64,' + btoa(''), { method: 'HEAD' });
      return { hasChanges: false, isRunning: status.isRunning };
    } catch {
      return { hasChanges: false, isRunning: status.isRunning };
    }
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={sync}
            disabled={status.isRunning}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
              ${status.isRunning 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              transition-all duration-300
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {status.isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : lastSyncTime ? (
              <Cloud className="h-4 w-4 text-green-500" />
            ) : (
              <CloudOff className="h-4 w-4 text-gray-400" />
            )}
            
            <span className="text-sm font-medium">
              {status.isRunning 
                ? 'Sincronizando...' 
                : lastSyncTime 
                ? formatTimeSince(lastSyncTime)
                : 'Sincronizar'
              }
            </span>

            {status.isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </motion.button>

          <motion.button
            onClick={checkDeployment}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Deploy</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showNotification && notification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`
                mt-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
                ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                ${notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                ${notification.type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
              `}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {status.isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg">
            <Zap className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Sincronizando com Lovable...</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
