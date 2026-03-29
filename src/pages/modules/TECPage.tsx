import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Clock, CheckCircle, AlertCircle, TrendingUp,
  Car, MapPin, Wrench, DollarSign, Calendar, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import SuperLayout from '@/components/layout/SuperLayout';

export default function TECPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    setLoading(true);
    try {
      const data = localStorage.getItem('tec_services');
      setServices(data ? JSON.parse(data) : []);
    } catch (e) {
      setServices([]);
    }
    setLoading(false);
  };

  const stats = {
    total: services.length,
    emAndamento: services.filter(s => s.status === 'em_andamento').length,
    concluidos: services.filter(s => s.status === 'concluido').length,
    pendentes: services.filter(s => s.status === 'pendente').length,
  };

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="w-7 h-7 text-orange-500" />
              TEC - Central de Serviços
            </h1>
            <p className="text-muted-foreground">Gerencie instalações e manutenções</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Serviços</p>
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
                  <p className="text-2xl font-bold">{stats.emAndamento}</p>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.concluidos}</p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendentes}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : services.length > 0 ? (
              <div className="space-y-3">
                {services.map((service: any, i: number) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{service.clientName || 'Cliente'}</p>
                      <p className="text-sm text-muted-foreground">{service.vehicle || 'Veículo não informado'}</p>
                    </div>
                    <Badge className={`
                      ${service.status === 'concluido' ? 'bg-green-100 text-green-800' : ''}
                      ${service.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${service.status === 'pendente' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {service.status === 'concluido' ? 'Concluído' : 
                       service.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum serviço registrado ainda</p>
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Serviço
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperLayout>
  );
}
