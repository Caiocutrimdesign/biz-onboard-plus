import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, DollarSign, Target, ArrowUpRight, 
  ArrowDownRight, Clock, CheckCircle2, Phone, Mail, MessageSquare,
  Calendar, Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCRMStore } from '@/stores/crmStore';
import { STATUS_LABELS, SOURCE_LABELS } from '@/types/crm';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-display font-bold text-gray-900">{value}</p>
    </Card>
  </motion.div>
);

export default function CRMDashboard() {
  const { leads, analytics, appointments } = useCRMStore();

  const recentLeads = [...leads].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const upcomingAppointments = appointments
    .filter(a => new Date(a.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const revenueGrowth = analytics ? 
    Math.round(((analytics.revenueThisMonth - analytics.revenueLastMonth) / analytics.revenueLastMonth) * 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total de Leads"
          value={analytics?.totalLeads || 0}
          trend="up"
          trendValue="+12%"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Target}
          label="Conversão"
          value={`${analytics?.conversionRate.toFixed(1) || 0}%`}
          trend="up"
          trendValue="+5%"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={DollarSign}
          label="Receita Mensal"
          value={`R$ ${(analytics?.revenueThisMonth || 0).toLocaleString('pt-BR')}`}
          trend={revenueGrowth >= 0 ? 'up' : 'down'}
          trendValue={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Ticket Médio"
          value={`R$ ${(analytics?.averageDealValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          trend="up"
          trendValue="+8%"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg">Leads Recentes</h3>
              <Badge variant="outline">{recentLeads.length} novos</Badge>
            </div>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-sm text-gray-500 truncate">{lead.email}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <Badge className={`${getStatusColor(lead.status)} text-white border-none mb-1`}>
                      {STATUS_LABELS[lead.status]}
                    </Badge>
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(lead.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg">Fontes de Leads</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics?.leadsBySource || {}).map(([source, count]) => (
                <div key={source} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{SOURCE_LABELS[source as keyof typeof SOURCE_LABELS]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / Math.max(...Object.values(analytics?.leadsBySource || { website: 1 }))) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg">Próximos Agendamentos</h3>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex flex-col items-center justify-center">
                      <span className="text-xs text-blue-600 font-medium">
                        {new Date(apt.startDate).toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {new Date(apt.startDate).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{apt.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {apt.leadName && ` • ${apt.leadName}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum agendamento próximo</p>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg">Status dos Leads</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics?.leadsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                    <span className="text-sm font-medium">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
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

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias`;
  if (days < 30) return `${Math.floor(days / 7)} semanas`;
  return `${Math.floor(days / 30)} meses`;
}
