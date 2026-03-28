import { motion } from 'framer-motion';
import { Mail, Plus, Send, Clock, Eye, MousePointer, UserMinus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EmailList() {
  const campaigns = [
    {
      id: '1',
      name: 'Newsletter Março 2026',
      subject: 'Novidades do mês para você!',
      status: 'sent',
      sent: 2450,
      opened: 892,
      clicked: 234,
      sentAt: new Date('2026-03-20'),
    },
    {
      id: '2',
      name: 'Promoção de Páscoa',
      subject: 'Ofertas especiais de Páscoa! 🐰',
      status: 'sending',
      sent: 1200,
      opened: 0,
      clicked: 0,
      scheduledAt: new Date('2026-03-30'),
    },
    {
      id: '3',
      name: 'Lançamento de Produto',
      subject: 'Apresentando nosso novo produto',
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
    },
  ];

  const templates = [
    { id: '1', name: 'Newsletter Padrão', category: 'Newsletter' },
    { id: '2', name: 'Oferta Especial', category: 'Promoção' },
    { id: '3', name: 'Bem-vindo', category: 'Onboarding' },
    { id: '4', name: 'Recuperação', category: 'Vendas' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'sending': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'sending': return 'Enviando';
      case 'scheduled': return 'Agendada';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">E-mail Marketing</h1>
          <p className="text-gray-500">Gerencie suas campanhas de e-mail</p>
        </div>
        <Button className="bg-gradient-brand">
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3.650</p>
              <p className="text-sm text-gray-500">E-mails Enviados</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">36%</p>
              <p className="text-sm text-gray-500">Taxa de Abertura</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <MousePointer className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">9.5%</p>
              <p className="text-sm text-gray-500">Taxa de Clique</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <UserMinus className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500">Descadastros</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Campanhas Recentes</h3>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-500">{campaign.subject}</p>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-gray-400" />
                      <span>{campaign.sent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span>{campaign.opened.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-gray-400" />
                      <span>{campaign.clicked.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Templates</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Todos os Templates
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
