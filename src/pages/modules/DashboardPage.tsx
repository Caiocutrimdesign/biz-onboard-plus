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

export default function DashboardPage() {
  const stats = {
    totalCustomers: 0,
    activeClients: 0,
    pendingServices: 0,
    monthlyRevenue: 0,
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.totalCustomers}</p>
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
                    <p className="text-3xl font-bold">{stats.activeClients}</p>
                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">+0%</Badge>
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
                    <p className="text-3xl font-bold">{stats.pendingServices}</p>
                    <p className="text-sm text-muted-foreground">Pendências</p>
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
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-muted-foreground">Receita Mensal</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Atividade Recente</CardTitle>
            <Button variant="ghost" size="sm">Ver tudo</Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">As atividades aparecerão aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperLayout>
  );
}
