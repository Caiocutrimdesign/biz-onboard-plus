import { motion } from 'framer-motion';
import { GitBranch, Plus, ChevronRight, Eye, Edit2, Trash2, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FunnelsView() {
  const funnels = [
    {
      id: '1',
      name: 'Funil de Vendas padrão',
      description: 'Funil completo para captura e conversão de leads',
      stages: 6,
      leads: 156,
      conversionRate: 12.5,
      revenue: 285000,
      active: true,
    },
    {
      id: '2',
      name: 'Landing Page Produto',
      description: 'Captura para lançamento de novos produtos',
      stages: 4,
      leads: 89,
      conversionRate: 8.2,
      revenue: 45000,
      active: true,
    },
    {
      id: '3',
      name: 'Webinar Inscrição',
      description: 'Funil para inscrição em webinars',
      stages: 3,
      leads: 234,
      conversionRate: 15.8,
      revenue: 0,
      active: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Funis de Vendas</h1>
          <p className="text-gray-500">Crie e gerencie seus funis de vendas</p>
        </div>
        <Button className="bg-gradient-brand">
          <Plus className="h-4 w-4 mr-2" />
          Novo Funil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{funnels.length}</p>
              <p className="text-sm text-gray-500">Funis Ativos</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">479</p>
              <p className="text-sm text-gray-500">Total de Leads</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12.2%</p>
              <p className="text-sm text-gray-500">Conversão Média</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {funnels.map((funnel, index) => (
          <motion.div
            key={funnel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center">
                    <GitBranch className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{funnel.name}</h3>
                      <Badge className={funnel.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                        {funnel.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{funnel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Etapas</p>
                  <p className="text-lg font-bold text-gray-900">{funnel.stages}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Leads</p>
                  <p className="text-lg font-bold text-gray-900">{funnel.leads}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Conversão</p>
                  <p className="text-lg font-bold text-green-600">{funnel.conversionRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Receita</p>
                  <p className="text-lg font-bold text-gray-900">
                    {funnel.revenue > 0 ? `R$ ${funnel.revenue.toLocaleString('pt-BR')}` : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {['Captura', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento'].slice(0, funnel.stages).map((stage, i) => (
                    <div key={stage} className="flex items-center">
                      <div className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {stage}
                      </div>
                      {i < funnel.stages - 1 && <ArrowRight className="h-4 w-4 text-gray-300 mx-1" />}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
