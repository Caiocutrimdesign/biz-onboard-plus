import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Clock, CheckCircle, AlertCircle, TrendingUp,
  Car, DollarSign, Calendar, Plus, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import SuperLayout from '@/components/layout/SuperLayout';
import { customerService, type CustomerStats } from '@/lib/customerService';
import { tecService } from '@/lib/tecService';

export default function DashboardPage() {
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    disabled: 0,
    pending: 0,
  });
  const [tecStats, setTecStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const customerStats = customerService.getStats();
      setStats(customerStats);

      const services = await tecService.getAllServices();
      setTecStats({
        total: services.length,
        pending: services.filter(s => s.status === 'pendente').length,
        inProgress: services.filter(s => s.status === 'em_andamento').length,
        completed: services.filter(s => s.status === 'concluido').length,
      });

      const customers = await customerService.getAllCustomers();
      setRecentCustomers(customers.slice(0, 5));
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  };

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da Rastremix</p>
          </div>
          <div className="flex gap-2">
            <Link to="/crm">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Ver CRM
              </Button>
            </Link>
            <Link to="/tec">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Customers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Clientes</p>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">+{stats.pending}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Cadastros Pendentes</p>
                  </div>
                </div>
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Car className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{tecStats.completed}</p>
                    <p className="text-sm text-muted-foreground">Serviços Concluídos</p>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/crm">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">CRM</h3>
                    <p className="text-sm text-muted-foreground">Gerenciar clientes</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/tec">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Car className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">TEC</h3>
                    <p className="text-sm text-muted-foreground">Central de serviços</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/erp">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">ERP</h3>
                    <p className="text-sm text-muted-foreground">Gestão empresarial</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clientes Recentes</CardTitle>
              <Link to="/crm">
                <Button variant="ghost" size="sm">Ver tudo</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentCustomers.length > 0 ? (
                <div className="space-y-3">
                  {recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.full_name}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone} • {customer.plate}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{customer.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum cliente ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Serviços Recentes</CardTitle>
              <Link to="/tec">
                <Button variant="ghost" size="sm">Ver tudo</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tecStats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tecStats.inProgress}</p>
                      <p className="text-xs text-muted-foreground">Em Andamento</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tecStats.completed}</p>
                      <p className="text-xs text-muted-foreground">Concluídos</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperLayout>
  );
}
