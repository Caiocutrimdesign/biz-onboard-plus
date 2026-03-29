import { Activity, Play, Pause, Users, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentOrchestrator } from '@/agents/orchestrator/useAgentOrchestrator';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; text: string }> = {
    running: { color: 'bg-blue-500', text: 'Executando' },
    idle: { color: 'bg-green-500', text: 'Aguardando' },
    error: { color: 'bg-red-500', text: 'Erro' },
  };
  const { color, text } = config[status] || { color: 'bg-gray-500', text: status };

  return (
    <Badge className={`${color} text-white border-none`}>
      {text}
    </Badge>
  );
}

export function AgentPanel() {
  const { agents, stats, isRunning, startAgents, stopAgents } = useAgentOrchestrator();
  const agentList = Object.values(agents);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium opacity-70">Sistema de Agentes</span>
            </div>
            <h1 className="text-2xl font-bold mt-1">Agentes Inteligentes</h1>
            <p className="opacity-70">
              {agentList.filter(a => a.status === 'running').length} de {agentList.length} agentes ativos
            </p>
          </div>
          <Button
            onClick={isRunning ? stopAgents : startAgents}
            className={isRunning ? 'bg-white/20 hover:bg-white/30' : 'bg-green-500 hover:bg-green-600'}
          >
            {isRunning ? (
              <><Pause className="w-4 h-4 mr-2" /> Pausar</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Ativar</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Clientes', value: stats.totalCustomers, icon: Users },
            { label: 'Novos Hoje', value: stats.newToday, icon: Activity },
            { label: 'Clientes Ativos', value: stats.activeCustomers, icon: CheckCircle2 },
            { label: 'Pendentes Sync', value: stats.pendingSync, icon: RefreshCw },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl">
              <s.icon className="w-5 h-5" />
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs opacity-60">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentList.map((agent) => (
          <Card key={agent.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{agent.name}</span>
                <StatusBadge status={agent.status} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intervalo: {agent.interval / 1000}s
              </p>
              <p className="text-sm text-muted-foreground">
                Última execução: {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString('pt-BR') : 'Nunca'}
              </p>
              {agent.errors > 0 && (
                <p className="text-sm text-red-500 mt-1">{agent.errors} erro(s)</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AgentPanel;
