import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wrench, Plus, Clock, CheckCircle, 
  Package, DollarSign, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service } from '@/types/tec';
import { TECView } from './TecTypes';
import { ServiceCard } from './ServiceCard';

interface HomeViewProps {
  services: Service[];
  loading: boolean;
  onNewClient: () => void;
  userName?: string;
  goTo: (view: TECView) => void;
}

export function HomeView({ services, loading, onNewClient, userName, goTo }: HomeViewProps) {
  const stats = {
    pending: services.filter(s => s.status === 'pendente').length,
    in_progress: services.filter(s => s.status === 'em_andamento').length,
    completed: services.filter(s => s.status === 'concluido' || s.status === 'finalizado').length,
  };

  const filteredServices = services.filter(s => s.status !== 'concluido' && s.status !== 'finalizado' && s.status !== 'cancelado');

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {userName || 'Técnico'}!</h1>
        <p className="text-sm text-muted-foreground">Aqui está o resumo das suas atividades.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">{services.length}</h4>
              <p className="text-xs text-muted-foreground">Total Ativo</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">{stats.pending}</h4>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">{stats.in_progress}</h4>
              <p className="text-xs text-muted-foreground">Em Curso</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">{stats.completed}</h4>
              <p className="text-xs text-muted-foreground">Concluidos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          className="h-24 text-lg font-bold gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 transition-all shadow-lg"
          onClick={onNewClient}
        >
          <Plus className="w-6 h-6" />
          Novo Atendimento
        </Button>
        <Button 
          variant="outline"
          className="h-24 text-lg font-bold gap-3 rounded-2xl border-2 hover:bg-gray-50 transition-all"
          onClick={() => goTo('meus-servicos')}
        >
          <Wrench className="w-6 h-6" />
          Agenda de Serviços
        </Button>
      </div>

      {/* Active Services */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Próximos Serviços</CardTitle>
          <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => goTo('meus-servicos')}>Ver todos</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic">
              Nenhum serviço agendado para hoje.
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:border-orange-200 transition-colors cursor-pointer" onClick={() => goTo('vendas')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Vendas efetuadas</h4>
                <p className="text-xs text-muted-foreground text-blue-600 font-bold">Ver histórico comercial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:border-orange-200 transition-colors cursor-pointer" onClick={() => goTo('meus-servicos')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Serviços concluídos</h4>
                <p className="text-xs text-muted-foreground text-green-600 font-bold">Relatórios finalizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
