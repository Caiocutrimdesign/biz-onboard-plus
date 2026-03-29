import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, ThumbsUp, ThumbsDown, Clock, MessageCircle, 
  Filter, TrendingUp, Users, CheckCircle2, AlertCircle,
  ChevronRight, Smile, Meh, Frown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Satisfaction {
  id: string;
  customerName: string;
  phone: string;
  rating: 'otimo' | 'regular' | 'ruim';
  contacted: boolean;
  feedback?: string;
  createdAt: string;
}

const mockSatisfactions: Satisfaction[] = [
  { id: '1', customerName: 'João Silva', phone: '(98) 98765-4321', rating: 'otimo', contacted: true, feedback: 'Atendimento excelente!', createdAt: '2024-01-15' },
  { id: '2', customerName: 'Maria Santos', phone: '(98) 97654-3210', rating: 'otimo', contacted: true, feedback: 'Very satisfied', createdAt: '2024-01-14' },
  { id: '3', customerName: 'Pedro Oliveira', phone: '(98) 96543-2109', rating: 'regular', contacted: false, feedback: 'Aguardei um pouco', createdAt: '2024-01-13' },
  { id: '4', customerName: 'Ana Costa', phone: '(98) 95432-1098', rating: 'ruim', contacted: false, feedback: 'Não ligaram', createdAt: '2024-01-12' },
  { id: '5', customerName: 'Carlos Lima', phone: '(98) 94321-0987', rating: 'otimo', contacted: true, createdAt: '2024-01-11' },
];

const ratings = {
  otimo: { label: 'Ótimo', icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
  regular: { label: 'Regular', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ruim: { label: 'Ruim', icon: Frown, color: 'text-red-600', bg: 'bg-red-100' },
};

export function SatisfactionSection() {
  const [satisfactions] = useState<Satisfaction[]>(mockSatisfactions);
  const [filter, setFilter] = useState<'all' | 'otimo' | 'regular' | 'ruim' | 'pending'>('all');

  const filtered = satisfactions.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !s.contacted;
    return s.rating === filter;
  });

  const stats = {
    total: satisfactions.length,
    otimo: satisfactions.filter(s => s.rating === 'otimo').length,
    regular: satisfactions.filter(s => s.rating === 'regular').length,
    ruim: satisfactions.filter(s => s.rating === 'ruim').length,
    pending: satisfactions.filter(s => !s.contacted).length,
  };

  const satisfactionRate = stats.total > 0 
    ? Math.round((stats.otimo / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Satisfação dos Clientes</h2>
          <p className="text-muted-foreground">Acompanhe o feedback dos clientes</p>
        </div>
        <Button className="bg-green-500 hover:bg-green-600">
          <MessageCircle className="w-4 h-4 mr-2" />
          Enviar Pesquisa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total pesquisas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{satisfactionRate}%</p>
                <p className="text-sm text-muted-foreground">Satisfação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Aguardando contato</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.otimo}</p>
                <p className="text-sm text-muted-foreground">Avaliações positivas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todos', count: stats.total },
          { key: 'otimo', label: '😊 Ótimo', count: stats.otimo },
          { key: 'regular', label: '😐 Regular', count: stats.regular },
          { key: 'ruim', label: '😞 Ruim', count: stats.ruim },
          { key: 'pending', label: '⏳ Pendentes', count: stats.pending },
        ].map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.key as any)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((s, i) => {
          const rating = ratings[s.rating];
          const Icon = rating.icon;
          
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${rating.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${rating.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{s.customerName}</p>
                        {s.contacted ? (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Contatado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{s.phone}</span>
                        <span>•</span>
                        <span className={rating.color}>{rating.label}</span>
                        <span>•</span>
                        <span>{new Date(s.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {s.feedback && (
                        <p className="mt-2 text-sm bg-muted p-2 rounded-lg">{s.feedback}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const link = `https://wa.me/55${s.phone.replace(/\D/g, '')}`;
                          window.open(link, '_blank');
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      {s.contacted && (
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Smile className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma pesquisa encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
