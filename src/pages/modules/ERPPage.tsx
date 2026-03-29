import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Package, Truck, DollarSign, Calendar,
  Filter, Search, CheckCircle, Clock, AlertCircle, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SuperLayout from '@/components/layout/SuperLayout';

export default function ERPPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const tecServices = localStorage.getItem('tec_services');
      const customers = localStorage.getItem('rastremix_customers');
      setServices({
        tec: tecServices ? JSON.parse(tecServices) : [],
        customers: customers ? JSON.parse(customers) : [],
      });
    } catch (e) {
      setServices({ tec: [], customers: [] });
    }
  };

  const allServices = [...(services.tec || []), ...(services.customers || [])];
  
  const stats = {
    totalRevenue: allServices.reduce((acc: number, s: any) => acc + (s.value || 0), 0),
    servicesCompleted: (services.tec || []).filter((s: any) => s.status === 'concluido').length,
    clientsTotal: (services.customers || []).length,
    pendingServices: (services.tec || []).filter((s: any) => s.status === 'pendente').length,
  };

  const filteredServices = allServices.filter((s: any) => {
    const matchSearch = !search || 
      (s.clientName || s.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-7 h-7 text-green-500" />
              ERP - Gestão Empresarial
            </h1>
            <p className="text-muted-foreground">Visão completa do negócio</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.servicesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Serviços Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.clientsTotal}</p>
                  <p className="text-sm text-muted-foreground">Clientes Cadastrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingServices}</p>
                  <p className="text-sm text-muted-foreground">Pendências</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviço ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pendente', 'em_andamento', 'concluido'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Todos' : 
                 f === 'pendente' ? 'Pendentes' :
                 f === 'em_andamento' ? 'Em Andamento' : 'Concluídos'}
              </Button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredServices.length > 0 ? (
              <div className="space-y-3">
                {filteredServices.slice(0, 20).map((service: any, i: number) => (
                  <motion.div
                    key={service.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      service.full_name ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {service.full_name ? (
                        <Package className="w-6 h-6 text-purple-600" />
                      ) : (
                        <Truck className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{service.clientName || service.full_name || 'Registro'}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.vehicle || service.plate || 'Sem veículo'}
                        {service.plan && ` • ${service.plan}`}
                      </p>
                    </div>
                    <Badge className={`
                      ${service.status === 'concluido' ? 'bg-green-100 text-green-800' : ''}
                      ${service.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${service.status === 'pendente' ? 'bg-blue-100 text-blue-800' : ''}
                      ${service.status === 'novo_cadastro' ? 'bg-purple-100 text-purple-800' : ''}
                    `}>
                      {service.status === 'concluido' ? 'Concluído' : 
                       service.status === 'em_andamento' ? 'Em Andamento' :
                       service.status === 'pendente' ? 'Pendente' :
                       service.status === 'novo_cadastro' ? 'Novo' : service.status}
                    </Badge>
                    {service.value && (
                      <p className="text-sm font-medium text-green-600">
                        R$ {service.value.toLocaleString('pt-BR')}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground w-20 text-right">
                      {new Date(service.createdAt || service.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperLayout>
  );
}
