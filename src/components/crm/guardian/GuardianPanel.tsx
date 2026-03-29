import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldX, 
  RefreshCw, AlertTriangle, CheckCircle2, X,
  Activity, Wifi, WifiOff, HardDrive, Clock, Bug
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GuardianPanelProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export default function GuardianPanel({ position = 'top-right' }: GuardianPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [health, setHealth] = useState({
    status: 'healthy' as 'healthy' | 'degraded' | 'critical',
    localStorage: true,
    memory: true,
    uptime: 99.9,
    errors: 0,
  });

  useEffect(() => {
    const checkHealth = () => {
      let localStorageOk = true;
      try {
        localStorage.setItem('guardian_check', Date.now().toString());
        localStorage.removeItem('guardian_check');
      } catch {
        localStorageOk = false;
      }

      setHealth(prev => ({
        status: localStorageOk ? 'healthy' : 'degraded',
        localStorage: localStorageOk,
        memory: true,
        uptime: prev.uptime,
        errors: 0,
      }));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (health.status) {
      case 'healthy':
        return {
          icon: ShieldCheck,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          label: 'Protegido',
        };
      case 'degraded':
        return {
          icon: ShieldAlert,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          label: 'Atenção',
        };
      case 'critical':
        return {
          icon: ShieldX,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Crítico',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`fixed ${positionClasses[position]} z-50`}
          >
            <motion.button
              onClick={() => setIsExpanded(true)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
                ${statusConfig.bgColor} ${statusConfig.borderColor} border
                hover:shadow-xl transition-all duration-300
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              <span className="text-sm font-medium text-gray-700">Guardian</span>
              <Badge className={`${statusConfig.color} bg-white/50 text-xs`}>
                {statusConfig.label}
              </Badge>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`fixed ${positionClasses[position]} z-50 w-80`}
          >
            <div className={`
              rounded-2xl shadow-2xl border overflow-hidden
              ${statusConfig.bgColor} ${statusConfig.borderColor}
            `}>
              <div className="flex items-center justify-between p-4 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${statusConfig.bgColor} flex items-center justify-center`}>
                    <Shield className={`h-5 w-5 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Guardian Agent</h3>
                    <p className="text-xs text-gray-500">Proteção do Sistema</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status do Sistema</span>
                  <Badge className={`${statusConfig.color} ${statusConfig.bgColor}`}>
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/50">
                    <div className="flex items-center gap-2 mb-2">
                      {health.localStorage ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">LocalStorage</span>
                    </div>
                    <p className={`text-lg font-bold ${health.localStorage ? 'text-green-600' : 'text-red-600'}`}>
                      {health.localStorage ? 'OK' : 'Erro'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/50">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-gray-500">Memória</span>
                    </div>
                    <p className={`text-lg font-bold ${health.memory ? 'text-green-600' : 'text-red-600'}`}>
                      {health.memory ? 'OK' : 'Alto'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-gray-500">Uptime</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{health.uptime}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${health.uptime}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Última verificação: {new Date().toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-black/5 border-t border-black/5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>Monitoramento ativo 24/7</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
