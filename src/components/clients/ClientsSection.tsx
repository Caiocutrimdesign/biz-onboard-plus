import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, Plus, Car, Smartphone, Mail, MapPin,
  Users, Clock, CheckCircle2, AlertCircle, User, CreditCard,
  Calendar, X, Save, Trash2, Send, RefreshCw, MessageCircle,
  Play, Power, Pause, Loader2, Check, Edit2, Trash, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { STATUS_LABELS, STATUS_COLORS, type CustomerRegistration, type CustomerStatus } from '@/types/customer';
import { customerService } from '@/lib/customerService';
import { tecService } from '@/lib/tecService';
import type { Technician } from '@/types/tec';

const WESALES_KEY = 'wesales_api_key';

function generateWhatsAppMessage(customer: CustomerRegistration): string {
  const statusLabel = STATUS_LABELS[customer.status] || customer.status;
  
  const message = `Olá ${customer.full_name.toUpperCase()} 👋

Segue seu cadastro:

📄 Nome: ${customer.full_name.toUpperCase()}
📱 Telefone: ${customer.phone.replace(/\D/g, '')}
🚗 Veículo: ${(customer.brand || '').toUpperCase()} ${(customer.model || '').toUpperCase()}
🔢 Placa: ${(customer.plate || '').toUpperCase()}
📦 Plano: ${(customer.plan || 'Não informado').toUpperCase()}
✅ Status: ${statusLabel.toUpperCase()}

Qualquer dúvida estamos à disposição!`;

  return encodeURIComponent(message);
}

function getWhatsAppLink(customer: CustomerRegistration): string {
  const phone = customer.phone.replace(/\D/g, '');
  const message = generateWhatsAppMessage(customer);
  return `https://wa.me/55${phone}?text=${message}`;
}

export default function ClientsSection() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [allCustomers, setAllCustomers] = useState<CustomerRegistration[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRegistration | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomerRegistration>>({});
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [syncingWeSales, setSyncingWeSales] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadTechnicians();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const customers = await customerService.getAllCustomers();
      setAllCustomers(customers);
    } catch (e) {
      console.error('Erro ao carregar clientes:', e);
    }
    setLoading(false);
  };

  const loadTechnicians = async () => {
    setLoadingTechnicians(true);
    try {
      const techs = await tecService.getAllTechnicians();
      setTechnicians(techs.filter(t => t.active !== false));
    } catch (e) {
      console.error('Erro ao carregar técnicos:', e);
    }
    setLoadingTechnicians(false);
  };

  const handleAssignTechnician = async (customerId: string, technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    
    const updatedCustomer = {
      ...allCustomers.find(c => c.id === customerId),
      technician_id: technicianId,
      technician_name: technician?.name || '',
    } as CustomerRegistration;

    customerService.saveLocalCustomer(updatedCustomer);

    setAllCustomers(prev => prev.map(c => 
      c.id === customerId ? updatedCustomer : c
    ));

    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(updatedCustomer);
    }
  };

  const logStatusChange = (customerId: string, previousStatus: string, newStatus: string, user?: string) => {
    const log = {
      timestamp: new Date().toISOString(),
      customerId,
      previousStatus,
      newStatus,
      user: user || 'System',
    };
    console.log('📝 Status Change:', log);
    const logs = JSON.parse(localStorage.getItem('status_change_logs') || '[]');
    logs.unshift(log);
    localStorage.setItem('status_change_logs', JSON.stringify(logs.slice(0, 100)));
  };

  const updateCustomerStatus = (id: string, newStatus: CustomerStatus, previousStatus: string) => {
    setLoadingStatus(id);
    setTimeout(() => {
      logStatusChange(id, previousStatus, newStatus);
      customerService.updateCustomerStatus(id, newStatus);
      
      const updated = allCustomers.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      );
      setAllCustomers(updated);
      
      if (selectedCustomer?.id === id) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus });
      }
      setLoadingStatus(null);
    }, 300);
  };

  const handleActivate = (id: string, previousStatus: string) => {
    updateCustomerStatus(id, 'active', previousStatus);
  };

  const handleInactivate = (id: string, previousStatus: string) => {
    updateCustomerStatus(id, 'inactive', previousStatus);
  };

  const handleDisable = (id: string, previousStatus: string) => {
    updateCustomerStatus(id, 'disabled', previousStatus);
  };

  const handleReject = (id: string) => {
    const customer = allCustomers.find(c => c.id === id);
    if (customer && confirm('Tem certeza que deseja cancelar este cliente?')) {
      logStatusChange(id, customer.status, 'cancelado');
      customerService.updateCustomerStatus(id, 'cancelado');
      const updated = allCustomers.map(c => 
        c.id === id ? { ...c, status: 'cancelado' as CustomerStatus } : c
      );
      setAllCustomers(updated);
      setIsViewOpen(false);
    }
  };

  const handleEdit = (customer: CustomerRegistration) => {
    setEditForm({ ...customer });
    setIsViewOpen(false);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.id) return;
    
    const customer = allCustomers.find(c => c.id === editForm.id);
    if (customer && customer.status !== editForm.status) {
      logStatusChange(editForm.id!, customer.status, editForm.status || customer.status);
    }

    customerService.saveLocalCustomer(editForm as CustomerRegistration);
    
    const updated = allCustomers.map(c => 
      c.id === editForm.id ? { ...c, ...editForm } as CustomerRegistration : c
    );
    setAllCustomers(updated);
    setIsEditOpen(false);
    setEditForm({});
  };

  const handleSyncToWeSales = async (customer: CustomerRegistration) => {
    const apiKey = localStorage.getItem(WESALES_KEY);
    if (!apiKey) {
      alert('Configure a API Key da WeSales nas configurações primeiro!');
      return;
    }

    setSyncingWeSales(customer.id);
    
    const result = await customerService.syncToWeSales(customer);
    
    if (result.success) {
      alert(`✅ ${result.message}`);
    } else {
      alert(`❌ ${result.message}`);
    }
    
    setSyncingWeSales(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      customerService.deleteCustomer(id);
      const updated = allCustomers.filter(c => c.id !== id);
      setAllCustomers(updated);
      setIsEditOpen(false);
      setIsViewOpen(false);
    }
  };

  const handleSendWhatsApp = (customer: CustomerRegistration) => {
    const link = getWhatsAppLink(customer);
    console.log('📱 Opening WhatsApp with message:', customer.full_name);
    window.open(link, '_blank');
  };

  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((c) => {
      const matchSearch = !search || 
        [c.full_name, c.phone, c.plate, c.cpf_cnpj, c.email]
          .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allCustomers, search, statusFilter]);

  const stats = useMemo(() => ({
    total: allCustomers.length,
    active: allCustomers.filter(c => c.status === 'active' || c.status === 'cliente_ativado' || c.status === 'ativo').length,
    inactive: allCustomers.filter(c => c.status === 'inactive' || c.status === 'inativo').length,
    disabled: allCustomers.filter(c => c.status === 'disabled' || c.status === 'desativado').length,
    pending: allCustomers.filter(c => c.status === 'novo_cadastro' || c.status === 'novo' || c.status === 'pendente').length,
  }), [allCustomers]);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7" />
              Clientes
            </h1>
            <p className="text-white/70">Gerencie todos os clientes cadastrados</p>
          </div>
          <Button 
            onClick={loadCustomers}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="flex gap-4 mt-4 flex-wrap">
          {[
            { label: 'Total', value: stats.total, color: 'bg-white/20' },
            { label: 'Ativos', value: stats.active, color: 'bg-green-500/30' },
            { label: 'Inativos', value: stats.inactive, color: 'bg-gray-500/30' },
            { label: 'Desativados', value: stats.disabled, color: 'bg-red-500/30' },
            { label: 'Pendentes', value: stats.pending, color: 'bg-yellow-500/30' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} px-4 py-2 rounded-xl`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone, placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 h-12 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{customer.full_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-3 h-3" /> {customer.phone}
                    {customer.plate && (
                      <>
                        <span className="mx-1">|</span>
                        <Car className="w-3 h-3" /> {customer.plate}
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={STATUS_COLORS[customer.status]}>
                  {STATUS_LABELS[customer.status]}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setIsViewOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" /> Ver
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhum cliente encontrado</p>
          <p className="text-sm mt-2">Cadastros aparecerão aqui</p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Detalhes do Cliente
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedCustomer.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCustomer.email || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                  <p className="font-medium">{selectedCustomer.cpf_cnpj || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Veículo</p>
                  <p className="font-medium">{selectedCustomer.brand} {selectedCustomer.model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Placa</p>
                  <p className="font-medium uppercase">{selectedCustomer.plate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <p className="font-medium capitalize">{selectedCustomer.plan || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedCustomer.status]}>
                    {STATUS_LABELS[selectedCustomer.status]}
                  </Badge>
                </div>
              </div>

              {(selectedCustomer.city || selectedCustomer.street) && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Localização</p>
                  <p className="text-sm">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {selectedCustomer.street && `${selectedCustomer.street}, ${selectedCustomer.number}`}
                    {selectedCustomer.city && ` - ${selectedCustomer.city}`}
                    {selectedCustomer.state && `/${selectedCustomer.state}`}
                  </p>
                </div>
              )}

              {/* Técnico Designado */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-medium text-orange-800">Técnico Designado</p>
                </div>
                {loadingTechnicians ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                    <span className="text-sm text-orange-600">Carregando técnicos...</span>
                  </div>
                ) : (
                  <Select 
                    value={selectedCustomer.technician_id || ''} 
                    onValueChange={(value) => handleAssignTechnician(selectedCustomer.id!, value)}
                  >
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue placeholder="Selecione um técnico..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum técnico</SelectItem>
                      {technicians.map((tec) => (
                        <SelectItem key={tec.id} value={tec.id}>
                          {tec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedCustomer.technician_name && (
                  <p className="text-xs text-orange-600 mt-2">
                    Atual: <strong>{selectedCustomer.technician_name}</strong>
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Alterar Status:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleActivate(selectedCustomer.id, selectedCustomer.status)}
                    disabled={loadingStatus === selectedCustomer.id}
                    className={`${selectedCustomer.status === 'active' || selectedCustomer.status === 'ativo' ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  >
                    {loadingStatus === selectedCustomer.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleInactivate(selectedCustomer.id, selectedCustomer.status)}
                    disabled={loadingStatus === selectedCustomer.id}
                    variant="outline"
                    className={`${selectedCustomer.status === 'inactive' || selectedCustomer.status === 'inativo' ? 'border-orange-500 bg-orange-50 text-orange-700' : ''}`}
                  >
                    {loadingStatus === selectedCustomer.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Inativo
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDisable(selectedCustomer.id, selectedCustomer.status)}
                    disabled={loadingStatus === selectedCustomer.id}
                    variant="destructive"
                  >
                    {loadingStatus === selectedCustomer.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2" />
                        Desativar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleSendWhatsApp(selectedCustomer)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  onClick={() => handleSyncToWeSales(selectedCustomer)}
                  variant="outline"
                  className="flex-1"
                  disabled={syncingWeSales === selectedCustomer.id}
                >
                  {syncingWeSales === selectedCustomer.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  WeSales
                </Button>
                <Button 
                  onClick={() => handleEdit(selectedCustomer)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  onClick={() => handleReject(selectedCustomer.id)}
                  variant="destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Editar Cliente
            </DialogTitle>
          </DialogHeader>
          {editForm.id && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Nome Completo</label>
                  <Input 
                    value={editForm.full_name || ''} 
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Telefone</label>
                  <Input 
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input 
                    value={editForm.email || ''} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CPF/CNPJ</label>
                  <Input 
                    value={editForm.cpf_cnpj || ''} 
                    onChange={(e) => setEditForm({...editForm, cpf_cnpj: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Veículo (Marca)</label>
                  <Input 
                    value={editForm.brand || ''} 
                    onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Veículo (Modelo)</label>
                  <Input 
                    value={editForm.model || ''} 
                    onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Placa</label>
                  <Input 
                    value={editForm.plate || ''} 
                    onChange={(e) => setEditForm({...editForm, plate: e.target.value.toUpperCase()})}
                    className="uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <Select 
                    value={editForm.status} 
                    onValueChange={(v) => setEditForm({...editForm, status: v as CustomerStatus})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cidade</label>
                  <Input 
                    value={editForm.city || ''} 
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Estado</label>
                  <Input 
                    value={editForm.state || ''} 
                    onChange={(e) => setEditForm({...editForm, state: e.target.value.toUpperCase()})}
                    maxLength={2}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Observações</label>
                <Input 
                  value={editForm.notes || ''} 
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  placeholder="Observações sobre o cliente..."
                />
              </div>
              
              <DialogFooter className="flex-wrap gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(editForm.id!)}>
                  <Trash className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
