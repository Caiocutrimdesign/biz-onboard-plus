import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, CheckCircle2, AlertCircle, Clock, Settings, 
  Zap, Bell, ChevronRight, ExternalLink, Copy, Check,
  ArrowRightLeft, CloudOff, CloudOn, Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWeSalesSyncAgent } from '@/integrations/wesales/useWeSalesSyncAgent';

export default function WeSalesSyncPanel() {
  const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'settings'>('status');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const agent = useWeSalesSyncAgent({
    autoSync: true,
    syncInterval: 60000,
    notifyOnError: true,
    retryFailed: true,
    maxRetries: 3,
  });

  const status = agent.getStatus();

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    const result = await agent.setApiKey(apiKeyInput.trim());
    if (result.success) {
      setApiKeyInput('');
      agent.checkPendingSync();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'ok': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'syncing': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const tabs = [
    { id: 'status' as const, label: 'Status', icon: CloudOn },
    { id: 'logs' as const, label: 'Logs', icon: Clock },
    { id: 'settings' as const, label: 'Config', icon: Settings },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900">WeSales Bridge</h3>
            <p className="text-sm text-gray-500">Sincronização com CRM</p>
          </div>
        </div>
        <Badge className={getStatusColor()}>
          {status.status === 'syncing' ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : status.status === 'ok' ? (
            <CheckCircle2 className="h-3 w-3 mr-1" />
          ) : status.status === 'error' ? (
            <AlertCircle className="h-3 w-3 mr-1" />
          ) : (
            <CloudOff className="h-3 w-3 mr-1" />
          )}
          {status.text}
        </Badge>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'status' && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    status.color === 'green' ? 'bg-green-100' :
                    status.color === 'yellow' ? 'bg-yellow-100' :
                    status.color === 'red' ? 'bg-red-100' :
                    status.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {status.color === 'green' ? (
                      <CloudOn className="h-6 w-6 text-green-600" />
                    ) : status.color === 'red' ? (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    ) : status.color === 'blue' ? (
                      <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                    ) : (
                      <CloudOff className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{status.action}</p>
                    <p className="text-sm text-gray-500">
                      {agent.lastSync 
                        ? `Última sync: ${agent.lastSync.toLocaleString('pt-BR')}`
                        : 'Nunca sincronizado'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => agent.runSync()}
                  disabled={agent.isRunning || !agent.isConfigured}
                  className="bg-gradient-brand"
                >
                  {agent.isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{agent.pendingCount}</p>
                <p className="text-xs text-gray-500">Pendentes</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{agent.failedCount}</p>
                <p className="text-xs text-gray-500">Falhas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{agent.syncHistory.length}</p>
                <p className="text-xs text-gray-500">Total Syncs</p>
              </Card>
            </div>

            {agent.reminders.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Últimos Lembretes
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agent.reminders.slice(0, 5).map((reminder, i) => (
                    <div key={i} className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                      {reminder}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Histórico de Sincronização</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {agent.syncHistory.length > 0 ? agent.syncHistory.map((sync, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`h-5 w-5 ${sync.failed > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{sync.message}</p>
                        <p className="text-xs text-gray-500">{sync.timestamp.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-green-600">{sync.synced} ✅</Badge>
                      {sync.failed > 0 && (
                        <Badge variant="outline" className="text-red-600">{sync.failed} ❌</Badge>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum histórico ainda</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Configuração da API</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    API Key WeSales
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Cole sua API Key aqui..."
                        className="pr-10"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? <Copy className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button onClick={handleSaveApiKey} className="bg-gradient-brand">
                      Salvar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Obtenha sua API Key em: weSales.com.br → Configurações → API
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auto Sync</span>
                    <Badge className={agent.configStatus.apiKeySet ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {agent.configStatus.apiKeySet ? '✅ Configurado' : '⚠️ Pendente'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Intervalo de Sync</span>
                    <span className="text-sm font-medium">A cada 1 minuto</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Webhook URL</h4>
              <p className="text-sm text-gray-500 mb-3">
                Configure esta URL no painel da WeSales para receber atualizações:
              </p>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/api/webhooks/wesales`}
                  readOnly
                  className="text-sm"
                />
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/wesales`)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </Card>

            <Button 
              onClick={() => agent.retryFailedSync()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente (Falhas)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!agent.isConfigured && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900">Configure a API Key</h4>
              <p className="text-sm text-purple-700 mt-1">
                Para ativar a sincronização com WeSales, configure sua API Key na aba "Config".
              </p>
              <Button 
                size="sm" 
                className="mt-3 bg-purple-600 hover:bg-purple-700"
                onClick={() => setActiveTab('settings')}
              >
                Configurar Agora
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
