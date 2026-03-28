import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Zap, Brain, Bell, TrendingUp, RefreshCw, CheckCircle2, 
  AlertCircle, Clock, ChevronRight, X, Sparkles, Target, 
  MessageSquare, BarChart3, Users, DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCRMAgent } from '@/agents/hooks/useCRMAgent';
import { useSalesAgent } from '@/agents/hooks/useSalesAgent';
import { useAnalyticsAgent } from '@/agents/hooks/useAnalyticsAgent';
import { useLovableSyncAgent } from '@/agents/hooks/useLovableSyncAgent';

interface AgentCardProps {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  status: 'active' | 'idle' | 'error';
  insights: number;
  lastRun?: Date;
  onClick?: () => void;
}

function AgentCard({ name, description, icon: Icon, color, status, insights, lastRun, onClick }: AgentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{name}</h4>
              <Badge className={`${status === 'active' ? 'bg-green-100 text-green-700' : status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'} text-xs`}>
                {status === 'active' ? '🟢 Ativo' : status === 'error' ? '🔴 Erro' : '⚪ Idle'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>💡 {insights} insights</span>
              {lastRun && <span>⏱️ {lastRun.toLocaleTimeString('pt-BR')}</span>}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface InsightCardProps {
  title: string;
  description: string;
  type: string;
  confidence: number;
  action?: string;
}

function InsightCard({ title, description, type, confidence, action }: InsightCardProps) {
  const getIcon = () => {
    if (type.includes('hot') || type.includes('opportunity')) return '🔥';
    if (type.includes('cold') || type.includes('risk')) return '❄️';
    if (type.includes('lead')) return '🎯';
    if (type.includes('pattern')) return '📊';
    return '💡';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{getIcon()}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-gray-900 text-sm">{title}</h5>
            <Badge variant="outline" className="text-xs">{confidence}%</Badge>
          </div>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
          {action && (
            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
              <span>→</span>
              <span>{action}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface AgentsPanelProps {
  onSyncClick?: () => void;
}

export default function AgentsPanel({ onSyncClick }: AgentsPanelProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'agents' | 'sync'>('insights');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  
  const crmAgent = useCRMAgent({ enabled: true, checkInterval: 60000, minScoreToHot: 70, daysWithoutContactThreshold: 3 });
  const salesAgent = useSalesAgent({ enabled: true, checkInterval: 120000, minValueToUpsell: 50000, followUpDays: 3 });
  const analyticsAgent = useAnalyticsAgent({ enabled: true, refreshInterval: 300000, includePredictions: true, showTrends: true });
  const lovableAgent = useLovableSyncAgent({ checkInterval: 300000, autoFix: true, remotes: ['origin', 'antigravity', 'lovable'] });

  useEffect(() => {
    crmAgent.runAnalysis();
    salesAgent.runAnalysis();
    analyticsAgent.generateReport('daily');
  }, []);

  const allInsights = [
    ...crmAgent.insights.map(i => ({ ...i, agent: 'CRM Agent' })),
    ...salesAgent.insights.map(i => ({ ...i, agent: 'Sales Agent' })),
  ].sort((a, b) => b.confidence - a.confidence).slice(0, 10);

  const tabs = [
    { id: 'insights' as const, label: 'Insights', icon: Sparkles },
    { id: 'agents' as const, label: 'Agentes', icon: Bot },
    { id: 'sync' as const, label: 'Deploy', icon: RefreshCw },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-gray-900">🤖 Agentes Inteligentes</h3>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
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
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {allInsights.length > 0 ? (
              allInsights.map((insight, index) => (
                <InsightCard
                  key={`${insight.agent}-${index}`}
                  title={insight.title}
                  description={insight.description}
                  type={insight.type}
                  confidence={insight.confidence}
                  action={insight.action}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Nenhum insight disponível ainda</p>
                <p className="text-sm text-gray-400 mt-1">Os agentes estão analisando seus dados...</p>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'agents' && (
          <motion.div
            key="agents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <AgentCard
              name="CRM Agent"
              description="Monitora leads e detecta padrões de conversão"
              icon={Target}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              status={crmAgent.isRunning ? 'active' : 'idle'}
              insights={crmAgent.insights.length}
              lastRun={crmAgent.lastCheck || undefined}
            />
            <AgentCard
              name="Sales Agent"
              description="Qualifica leads e sugere próximos passos"
              icon={TrendingUp}
              color="bg-gradient-to-br from-green-500 to-green-600"
              status={salesAgent.isAnalyzing ? 'active' : 'idle'}
              insights={salesAgent.insights.length}
            />
            <AgentCard
              name="Analytics Agent"
              description="Gera relatórios e predições inteligentes"
              icon={BarChart3}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              status={analyticsAgent.isGenerating ? 'active' : 'idle'}
              insights={analyticsAgent.reports.length}
              lastRun={analyticsAgent.lastUpdate || undefined}
            />
            <AgentCard
              name="Deploy Agent"
              description="Sincroniza código com Lovable automaticamente"
              icon={RefreshCw}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              status={lovableAgent.syncStatus === 'error' ? 'error' : lovableAgent.syncStatus === 'syncing' ? 'active' : 'idle'}
              insights={lovableAgent.syncHistory.length}
              lastRun={lovableAgent.lastSync || undefined}
              onClick={() => lovableAgent.sync()}
            />
          </motion.div>
        )}

        {activeTab === 'sync' && (
          <motion.div
            key="sync"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    lovableAgent.syncStatus === 'success' 
                      ? 'bg-green-100' 
                      : lovableAgent.syncStatus === 'error' 
                      ? 'bg-red-100' 
                      : 'bg-blue-100'
                  }`}>
                    {lovableAgent.syncStatus === 'success' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : lovableAgent.syncStatus === 'error' ? (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    ) : (
                      <RefreshCw className={`h-6 w-6 text-blue-600 ${lovableAgent.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Status: {
                      lovableAgent.syncStatus === 'success' ? 'Sincronizado' :
                      lovableAgent.syncStatus === 'error' ? 'Erro' :
                      lovableAgent.syncStatus === 'syncing' ? 'Sincronizando...' : 'Aguardando'
                    }</h4>
                    <p className="text-sm text-gray-500">
                      {lovableAgent.lastSync 
                        ? `Última sync: ${lovableAgent.lastSync.toLocaleString('pt-BR')}`
                        : 'Nunca sincronizado'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => lovableAgent.sync()}
                  disabled={lovableAgent.syncStatus === 'syncing'}
                  className="bg-gradient-brand"
                >
                  {lovableAgent.syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar Agora
                    </>
                  )}
                </Button>
              </div>

              {lovableAgent.lastError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Erro na sincronização</p>
                      <p className="text-sm text-red-600">{lovableAgent.lastError}</p>
                      {lovableAgent.suggestedFix && (
                        <div className="mt-2 p-2 rounded bg-white border border-red-200">
                          <p className="text-xs font-medium text-red-700">💡 Sugestão:</p>
                          <p className="text-xs text-red-600">{lovableAgent.suggestedFix.solution}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {lovableAgent.suggestedFix && !lovableAgent.lastError && (
                <div className="mt-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">⚠️ Atenção</p>
                      <p className="text-sm text-yellow-600">{lovableAgent.suggestedFix.solution}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📊 Informações do Sistema</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Node.js</p>
                  <p className="font-medium">{lovableAgent.nodeVersion || 'Verificando...'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Git Status</p>
                  <p className="font-medium">{lovableAgent.gitStatus?.clean ? '✅ Limpo' : '⚠️ Alterações pendentes'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Remotas</p>
                  <p className="font-medium">origin, antigravity, lovable</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-500">Histórico</p>
                  <p className="font-medium">{lovableAgent.syncHistory.length} sincronizações</p>
                </div>
              </div>
            </Card>

            <Button 
              onClick={() => lovableAgent.forceSync()}
              variant="outline"
              className="w-full"
            >
              🔄 Sincronização Forçada (Emergency)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
