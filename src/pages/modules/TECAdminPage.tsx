import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, Search, Filter, Calendar, Car, User,
  CheckCircle, Clock, AlertCircle, X, Image,
  Camera, Eye, MapPin, Phone, FileText, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SuperLayout from '@/components/layout/SuperLayout';
import { crmService } from '@/lib/crmService';
import type { Servico as Service, ServicoPhoto as ServicePhoto } from '@/lib/crmService';
import { SERVICE_STATUS_LABELS as STATUS_LABELS, SERVICE_STATUS_COLORS as STATUS_COLORS } from '@/types/tec';

export default function TECAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await crmService.getServicos();
      setServices(data || []);
    } catch (e) {
      console.error('Error loading services:', e);
    }
    setLoading(false);
  };

  const filteredServices = services.filter(s => {
    const matchSearch = !search || 
      s.client_name.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      s.plate.toLowerCase().includes(search.toLowerCase()) ||
      (s.technician_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: services.length,
    pendente: services.filter(s => s.status === 'pendente').length,
    em_andamento: services.filter(s => s.status === 'em_andamento').length,
    concluido: services.filter(s => s.status === 'concluido').length,
  };

  const getPhotosByType = (photos: ServicePhoto[], type: string) => {
    return photos.filter(p => p.type === type);
  };

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="w-7 h-7 text-orange-500" />
              TEC - Central de Serviços
            </h1>
            <p className="text-muted-foreground">Todos os serviços dos técnicos</p>
          </div>
          <Button onClick={loadServices} variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-white/80">Total</p>
                </div>
                <Wrench className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.pendente}</p>
                  <p className="text-white/80">Pendentes</p>
                </div>
                <AlertCircle className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.em_andamento}</p>
                  <p className="text-white/80">Em Andamento</p>
                </div>
                <Clock className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats.concluido}</p>
                  <p className="text-white/80">Concluídos</p>
                </div>
                <CheckCircle className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, veículo, placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pendente', 'em_andamento', 'concluido'].map(f => (
              <Button
                key={f}
                variant={statusFilter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(f)}
              >
                {f === 'all' ? 'Todos' : STATUS_LABELS[f as keyof typeof STATUS_LABELS]}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : filteredServices.length > 0 ? (
              <div className="space-y-3">
                {filteredServices.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Car className="w-7 h-7 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{service.client_name}</p>
                        <Badge className={STATUS_COLORS[service.status]}>
                          {STATUS_LABELS[service.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {service.vehicle} ({service.plate})
                        </span>
                        {service.technician_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {service.technician_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(service.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    {service.photos?.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Image className="w-4 h-4" />
                        <span className="text-sm">{service.photos.length}</span>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum serviço encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedService && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-500" />
                    Detalhes do Serviço
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="font-medium">{selectedService.client_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedService.client_phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Veículo</p>
                      <p className="font-medium">{selectedService.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Placa</p>
                      <p className="font-medium">{selectedService.plate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Técnico</p>
                      <p className="font-medium">{selectedService.technician_name || 'Não atribuído'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={STATUS_COLORS[selectedService.status]}>
                        {STATUS_LABELS[selectedService.status]}
                      </Badge>
                    </div>
                  </div>

                  {selectedService.client_address && (
                    <div className="bg-muted p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedService.client_address}
                      </p>
                    </div>
                  )}

                  {selectedService.observations && (
                    <div className="bg-muted p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Observações</p>
                      <p className="text-sm">{selectedService.observations}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Fotos ({selectedService.photos?.length || 0})
                    </h3>

                    {['antes', 'durante', 'depois'].map(type => {
                      const photos = getPhotosByType(selectedService.photos || [], type);
                      if (photos.length === 0) return null;

                      return (
                        <div key={type} className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                            {type === 'antes' ? '📷 Antes' : type === 'durante' ? '⚡ Durante' : '✅ Depois'}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {photos.map(photo => (
                              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={photo.url}
                                  alt={`${type}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {(!selectedService.photos || selectedService.photos.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma foto registrada
                      </p>
                    )}
                  </div>

                  {selectedService.signature && (
                    <div>
                      <h3 className="font-semibold mb-2">Assinatura</h3>
                      <div className="bg-muted p-4 rounded-xl">
                        <img
                          src={selectedService.signature}
                          alt="Assinatura"
                          className="max-h-24 mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SuperLayout>
  );
}
