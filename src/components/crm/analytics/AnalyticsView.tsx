import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCRMStore } from '@/stores/crmStore';
import { STATUS_LABELS, SOURCE_LABELS } from '@/types/crm';

export default function AnalyticsView() {
  const { analytics, leads, pipelines } = useCRMStore();

  const pipeline = pipelines[0];
  const totalLeadsValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Acompanhe o desempenho do seu negócio</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 px-4 rounded-xl border border-gray-300">
            <option>Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
            <option>Este ano</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {(totalLeadsValue || 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>+16% em relação ao mês passado</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total de Leads</p>
              <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>+23 novos esta semana</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Taxa de Conversão</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics?.conversionRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>+5% em relação ao mês passado</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ticket Médio</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {(analytics?.averageDealValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm text-red-600">
            <ArrowDownRight className="h-4 w-4" />
            <span>-3% em relação ao mês passado</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Leads por Status</h3>
          <div className="space-y-4">
            {Object.entries(analytics?.leadsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getStatusColor(status)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {leads.length > 0 ? ((count / leads.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Leads por Fonte</h3>
          <div className="space-y-4">
            {Object.entries(analytics?.leadsBySource || {}).map(([source, count]) => (
              <div key={source} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] || source}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-red-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Funil de Vendas</h3>
        <div className="flex items-end gap-4 h-64">
          {pipeline?.stages?.filter((s: any) => !s.isFinal).map((stage: any, index: number) => {
            const count = leads.filter((l: any) => l.stageId === stage.id).length;
            const stageCounts = pipeline.stages.filter((s: any) => !s.isFinal).map((s: any) => leads.filter((l: any) => l.stageId === s.id).length);
            const maxCount = stageCounts.length > 0 ? Math.max(...stageCounts, 1) : 1;
            const height = (count / maxCount) * 100;

            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full rounded-t-lg flex items-end justify-center pb-2"
                  style={{ backgroundColor: stage.color, height: `${Math.max(height, 10)}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 10)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <span className="text-white font-bold">{count}</span>
                </motion.div>
                <span className="text-sm text-gray-600 text-center">{stage.name}</span>
                <span className="text-xs text-gray-400">{stage.probability}%</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Leads nos Últimos 7 Dias</h3>
          <div className="h-48 flex items-end gap-2">
            {(analytics?.dailyLeads || []).map((day: any, index: number) => (
              <motion.div
                key={day.date}
                className="flex-1 bg-blue-100 rounded-t-lg flex items-end justify-center"
                initial={{ height: 0 }}
                animate={{ height: `${(day.count / 20) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <span className="text-xs text-blue-600 font-medium mb-1">{day.count}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2 mt-2 text-xs text-gray-400">
            {(analytics?.dailyLeads || []).map((day: any) => (
              <span key={day.date} className="flex-1 text-center">
                {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Performance da Equipe</h3>
          <div className="space-y-4">
            {[
              { name: 'Carlos Silva', leads: 45, revenue: 125000, deals: 12 },
              { name: 'Ana Oliveira', leads: 38, revenue: 98000, deals: 10 },
              { name: 'Pedro Santos', leads: 32, revenue: 72000, deals: 8 },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.leads} leads • {member.deals} negócios</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">R$ {member.revenue.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    novo: 'bg-blue-500',
    contatado: 'bg-purple-500',
    qualificado: 'bg-indigo-500',
    proposta: 'bg-yellow-500',
    negociacao: 'bg-orange-500',
    ganho: 'bg-green-500',
    perdido: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}
