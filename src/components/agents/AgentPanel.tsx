import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Play, Pause, RotateCcw, Settings, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Zap, Brain, Bell, BarChart3,
  Shield, Link2, MapPin, Users, Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOrchestrator, type AgentState, type AgentLog } from '@/agents/orchestrator/useAgentOrchestrator';

const AGENT_ICONS: Record<string, React.ElementType> = {
  crm: Brain,
  customer: Users,
  analytics: BarChart3,
  notification: Bell,
  sales: Zap,
  guardian: Shield,
  sync: Radio,
  gpsCollector: MapPin,
  gpsNormalizer: Activity,
  lovablesync: Link2,
  wesales: Users,
};

const AGENT_COLORS: Record<string, string> = {
  crm: 'from-violet-500 to-purple-500',
  customer: 'from-blue-500 to-cyan-500',
  analytics: 'from-emerald-500 to-green-500',
  notification: 'from-amber-500 to-orange-500',
  sales: 'from-pink-500 to-rose-500',
  guardian: 'from-indigo-500 to-blue-500',
  sync: 'from-teal-500 to-cyan-500',
  gpsCollector: 'from-red-500 to-pink-500',
  gpsNormalizer: 'from-orange-500 to-amber-500',
  lovablesync: 'from-green-500 to-emerald-500',
  wesales: 'from-purple-500 to-violet-500',
};

function StatusBadge({ status }: { status: AgentState['status'] }) {
  const config = {
    running: { icon: Activity, color: 'bg-blue-500', text: 'Executando', pulse: true },
    idle: { icon: Clock, color: 'bg-green-500', text: 'Aguardando', pulse: false },
    error: { icon: AlertTriangle, color: 'bg-red-500', text: 'Erro', pulse: true },
    disabled: { icon: XCircle, color: 'bg-gray-500', text: 'Desativado', pulse: false },
  }[status];

  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-white border-none gap-1`}>
      <motion.div
        animate={config.pulse ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Icon className="w-3 h-3" />
      </motion.div>
      {config.text}
    </Badge>
  );
}

function AgentCard({ agent, onRestart }: { agent: AgentState; onRestart: () => void }) {
  const Icon = AGENT_ICONS[agent.id] || Activity;
  const colorClass = AGENT_COLORS[agent.id] || 'from-gray-500 to-gray-600';

  const formatTime = (date: Date | null) => {
    if (!date) return 'Nunca';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s atrás`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    return `${hours}h atrás`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}`} />
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}
                animate={agent.status === 'running' ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-display font-bold text-lg">{agent.name}</h3>
                <StatusBadge status={agent.status} />
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onRestart}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">Última Execução</p>
              <p className="font-bold">{formatTime(agent.lastRun)}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">Intervalo</p>
              <p className="font-bold">{agent.interval / 1000}s</p>
            </div>
          </div>

          {agent.errors > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-xs font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {agent.errors} erro(s) detectado(s)
              </p>
            </div>
          )}

          {agent.data && agent.id === 'analytics' && (
            <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">Insights</p>
              <div className="flex gap-4 text-sm">
                <span className="font-bold">{agent.data.totalCustomers || agent.data.total || 0} clientes</span>
                <span className="text-muted-foreground">
                  {(agent.data.conversionRate || 0).toFixed(1)}% conversão
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LogItem({ log }: { log: AgentLog }) {
  const icons = {
    info: <Clock className="w-4 h-4 text-blue-500" />,
    success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      {icons[log.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{log.message}</p>
        <p className="text-xs text-muted-foreground">
          {log.agentId} • {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
        </p>
      </div>
    </motion.div>
  );
}

export function AgentPanel() {
  const { 
    agents, 
    logs, 
    stats, 
    isRunning, 
    startAgents, 
    stopAgents,
    restartAgent 
  } = useAgentOrchestrator();

  const agentList = Object.values(agents);

  return (
    <div className="space-y-6">
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={isRunning ? { rotate: [0, 360] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Activity className="w-5 h-5" />
              </motion.div>
              <span className="text-white/60 text-sm font-medium">Sistema de Agentes</span>
            </div>
            <h1 className="font-display text-4xl font-black mb-2">
              Agentes Inteligentes
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              {agentList.filter(a => a.status === 'running').length} de {agentList.length} agentes ativos
            </p>
          </div>

          <Button
            onClick={isRunning ? stopAgents : startAgents}
            className={`h-14 px-8 rounded-2xl font-bold shadow-lg ${
              isRunning 
                ? 'bg-white/20 hover:bg-white/30 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Ativar
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Total Clientes', value: stats.totalCustomers, icon: Users, color: 'text-white' },
            { label: 'Novos Hoje', value: stats.newToday, icon: Activity, color: 'text-yellow-300' },
            { label: 'Clientes Ativos', value: stats.activeCustomers, icon: CheckCircle2, color: 'text-green-300' },
            { label: 'Pendentes Sync', value: stats.pendingSync, icon: Radio, color: 'text-orange-300' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <s.icon className={`w-6 h-6 ${s.color}`} />
              <div>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentList.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onRestart={() => restartAgent(agent.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto space-y-2">
            <AnimatePresence mode="popLayout">
              {logs.slice(0, 20).map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma atividade ainda
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                <span className="font-medium">Sistema</span>
                <Badge className={`${
                  stats.systemHealth === 'healthy' ? 'bg-green-500' :
                  stats.systemHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                } text-white border-none`}>
                  {stats.systemHealth === 'healthy' ? 'Saudável' :
                   stats.systemHealth === 'degraded' ? 'Degradado' : 'Crítico'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Executando', count: agentList.filter(a => a.status === 'running').length, color: 'text-blue-500' },
                  { label: 'Aguardando', count: agentList.filter(a => a.status === 'idle').length, color: 'text-green-500' },
                  { label: 'Com Erro', count: agentList.filter(a => a.status === 'error').length, color: 'text-red-500' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-2xl bg-muted/50">
                    <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-2">Resumo</p>
                <p className="font-medium">
                  {stats.totalCustomers} clientes cadastrados, {stats.activeCustomers} ativos, 
                  {stats.pendingSync > 0 && ` ${stats.pendingSync} pendente(s) de sincronização`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AgentPanel;
