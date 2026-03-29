import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Shield, Users, BarChart3, Bell, Zap, 
  Activity, Clock, CheckCircle, AlertTriangle, 
  Database, GitBranch, Wrench, MessageSquare, 
  Play, Pause, RefreshCw, Eye, Settings, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SuperLayout from '@/components/layout/SuperLayout';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  status: 'active' | 'paused' | 'error';
  lastRun: Date;
  tasksCompleted: number;
  uptime: string;
  category: 'core' | 'ai' | 'integration' | 'security';
}

const agents: Agent[] = [
  {
    id: 'crm-agent',
    name: 'CRM Agent',
    description: 'Analisa leads, detecta oportunidades e sugere ações de vendas',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 145,
    uptime: '99.9%',
    category: 'core',
  },
  {
    id: 'customer-agent',
    name: 'Customer Agent',
    description: 'Gerencia ciclo de vida do cliente, NPS e satisfação',
    icon: Heart,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 89,
    uptime: '99.5%',
    category: 'core',
  },
  {
    id: 'analytics-agent',
    name: 'Analytics Agent',
    description: 'Coleta métricas, detecta anomalias e gera relatórios inteligentes',
    icon: BarChart3,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 234,
    uptime: '99.8%',
    category: 'ai',
  },
  {
    id: 'notification-agent',
    name: 'Notification Agent',
    description: 'Envia alertas, lembretes e notificações em tempo real',
    icon: Bell,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 567,
    uptime: '99.7%',
    category: 'core',
  },
  {
    id: 'sales-agent',
    name: 'Sales Agent',
    description: 'Automatiza follow-ups e nutre leads até conversão',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 178,
    uptime: '99.4%',
    category: 'ai',
  },
  {
    id: 'guardian-agent',
    name: 'Guardian Agent',
    description: 'Monitora sistema 24/7, previne crashes e circuit breaker',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 9999,
    uptime: '99.99%',
    category: 'security',
  },
  {
    id: 'collector-agent',
    name: 'GPS Collector Agent',
    description: 'Coleta dados de localização em tempo real dos dispositivos',
    icon: MapPin,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 4521,
    uptime: '99.6%',
    category: 'integration',
  },
  {
    id: 'normalizer-agent',
    name: 'GPS Normalizer Agent',
    description: 'Normaliza e padroniza dados de GPS para consistência',
    icon: Database,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 3899,
    uptime: '99.8%',
    category: 'integration',
  },
  {
    id: 'lovable-sync-agent',
    name: 'Lovabl3 Sync Agent',
    description: 'Sincroniza código entre Lovabl3 e repositórios Git',
    icon: GitBranch,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500',
    status: 'active',
    lastRun: new Date(),
    tasksCompleted: 45,
    uptime: '98.5%',
    category: 'integration',
  },
];

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function MapPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

export default function AgentsMonitorPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'core' | 'ai' | 'integration' | 'security'>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredAgents = agents.filter(agent => {
    if (filter !== 'all' && agent.status !== filter) return false;
    if (categoryFilter !== 'all' && agent.category !== categoryFilter) return false;
    return true;
  });

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    paused: agents.filter(a => a.status === 'paused').length,
    totalTasks: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
    avgUptime: Math.round(agents.reduce((sum, a) => sum + parseFloat(a.uptime), 0) / agents.length * 10) / 10,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      core: 'Núcleo',
      ai: 'Inteligência Artificial',
      integration: 'Integração',
      security: 'Segurança',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'bg-purple-100 text-purple-800',
      ai: 'bg-cyan-100 text-cyan-800',
      integration: 'bg-blue-100 text-blue-800',
      security: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="w-7 h-7 text-primary" />
              Centro de Agentes - Monitor 24/7
            </h1>
            <p className="text-muted-foreground">Todos os agentes trabalhando continuamente</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-white/80">Total Agentes</p>
                </div>
                <Cpu className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.active}</p>
                  <p className="text-white/80">Ativos Agora</p>
                </div>
                <Activity className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.totalTasks.toLocaleString()}</p>
                  <p className="text-white/80">Tarefas Concluídas</p>
                </div>
                <CheckCircle className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.avgUptime}%</p>
                  <p className="text-white/80">Uptime Médio</p>
                </div>
                <Clock className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Ativos' },
              { key: 'paused', label: 'Pausados' },
            ].map(f => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f.key as any)}
              >
                {f.key === 'active' && <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />}
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todas Categorias' },
              { key: 'core', label: 'Núcleo' },
              { key: 'ai', label: 'IA' },
              { key: 'integration', label: 'Integração' },
              { key: 'security', label: 'Segurança' },
            ].map(f => (
              <Button
                key={f.key}
                variant={categoryFilter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(f.key as any)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${agent.bgColor}/10 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${agent.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <Badge className={getCategoryColor(agent.category)} variant="secondary">
                            {getCategoryLabel(agent.category)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {agent.status === 'active' ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        ) : (
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{agent.uptime}</span>
                      </div>
                      <Progress 
                        value={parseFloat(agent.uptime)} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tarefas</span>
                        <span className="font-medium">{agent.tasksCompleted.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Última execução</span>
                        <span className="text-xs">agora</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedAgent(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl ${selectedAgent.bgColor}/10 flex items-center justify-center`}>
                  <selectedAgent.icon className={`w-8 h-8 ${selectedAgent.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                  <Badge className={getCategoryColor(selectedAgent.category)}>
                    {getCategoryLabel(selectedAgent.category)}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">{selectedAgent.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{selectedAgent.tasksCompleted.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Tarefas</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{selectedAgent.uptime}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedAgent(null)}>
                  Fechar
                </Button>
                <Button className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </SuperLayout>
  );
}
