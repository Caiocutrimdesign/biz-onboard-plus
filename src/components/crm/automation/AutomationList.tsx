import { motion } from 'framer-motion';
import { Zap, Plus, Play, Pause, Copy, Trash2, MoreHorizontal, Clock, Users, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCRMStore } from '@/stores/crmStore';

export default function AutomationList() {
  const { automations, toggleAutomation } = useCRMStore();

  const mockAutomations = [
    {
      id: '1',
      name: 'Bem-vindo Novos Leads',
      description: 'Envia e-mail de boas-vindas quando um lead é criado',
      trigger: 'lead_created',
      actions: 2,
      runs: 156,
      active: true,
      lastRun: new Date('2026-03-28'),
    },
    {
      id: '2',
      name: 'Follow-up after 3 days',
      description: 'Envia lembrete após 3 dias sem resposta',
      trigger: 'stage_changed',
      actions: 1,
      runs: 89,
      active: true,
      lastRun: new Date('2026-03-27'),
    },
    {
      id: '3',
      name: 'Lead Quente - Prioridade Alta',
      description: 'Notifica equipe quando lead prioritário entra',
      trigger: 'lead_updated',
      actions: 3,
      runs: 234,
      active: false,
      lastRun: new Date('2026-03-25'),
    },
    {
      id: '4',
      name: 'Aniversário do Cliente',
      description: 'Envia mensagem especial no aniversário',
      trigger: 'date_reached',
      actions: 2,
      runs: 45,
      active: true,
      lastRun: new Date('2026-03-15'),
    },
  ];

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'lead_created':
        return <Users className="h-4 w-4" />;
      case 'email_opened':
        return <Mail className="h-4 w-4" />;
      case 'date_reached':
        return <Clock className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      lead_created: 'Lead criado',
      lead_updated: 'Lead atualizado',
      stage_changed: 'Etapa alterada',
      email_opened: 'E-mail aberto',
      date_reached: 'Data alcançada',
    };
    return labels[trigger] || trigger;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Automações</h1>
          <p className="text-gray-500">Crie fluxos automatizados para suas vendas</p>
        </div>
        <Button className="bg-gradient-brand">
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockAutomations.filter(a => a.active).length}</p>
              <p className="text-sm text-gray-500">Ativas</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockAutomations.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockAutomations.reduce((sum, a) => sum + a.runs, 0)}
              </p>
              <p className="text-sm text-gray-500">Execuções</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockAutomations.map((automation, index) => (
          <motion.div
            key={automation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    automation.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {getTriggerIcon(automation.trigger)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                    <p className="text-sm text-gray-500">{automation.description}</p>
                  </div>
                </div>
                <Badge className={automation.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                  {automation.active ? 'Ativa' : 'Pausada'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  {getTriggerIcon(automation.trigger)}
                  <span>{getTriggerLabel(automation.trigger)}</span>
                </div>
                <span>•</span>
                <span>{automation.actions} ações</span>
                <span>•</span>
                <span>{automation.runs} execuções</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Última execução: {automation.lastRun.toLocaleDateString('pt-BR')}
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleAutomation(automation.id)}
                  >
                    {automation.active ? (
                      <Pause className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Play className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
