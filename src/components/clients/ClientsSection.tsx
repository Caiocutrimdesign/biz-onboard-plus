import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, Plus, Car, Smartphone, Mail, MapPin,
  Users, Clock, CheckCircle2, AlertCircle, User, CreditCard,
  Calendar, X, Save, Trash2, Send, RefreshCw, MessageCircle,
  Play, Power, Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { STATUS_LABELS, STATUS_COLORS, type CustomerRegistration, type CustomerStatus } from '@/types/customer';

const STORAGE_KEY = 'rastremix_customers';
const WESALES_KEY = 'wesales_api_key';

function generateWhatsAppMessage(customer: CustomerRegistration): string {
  const statusLabel = STATUS_LABELS[customer.status] || customer.status;
  
  const message = `Olá ${customer.full_name.toUpperCase()} 👋

Segue seu cadastro:

📄 Nome: ${customer.full_name.toUpperCase()}
📱 Telefone: ${customer.phone.replace(/\D/g, '')}
🚗 Veículo: ${customer.brand.toUpperCase()} ${customer.model.toUpperCase()}
🔢 Placa: ${customer.plate.toUpperCase()}
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
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      setAllCustomers(data ? JSON.parse(data) : []);
    } catch (e) {
      setAllCustomers([]);
    }
  };

  const saveCustomers = (customers: CustomerRegistration[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    setAllCustomers(customers);
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
      const updated = allCustomers.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      );
      saveCustomers(updated);
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
      const updated = allCustomers.map(c => 
        c.id === id ? { ...c, status: 'cancelado' as CustomerStatus } : c
      );
      saveCustomers(updated);
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
    const updated = allCustomers.map(c => 
      c.id === editForm.id ? { ...c, ...editForm } as CustomerRegistration : c
    );
    saveCustomers(updated);
    setIsEditOpen(false);
    setEditForm({});
  };

  const handleSyncToWeSales = (customer: CustomerRegistration) => {
    const apiKey = localStorage.getItem(WESALES_KEY);
    if (!apiKey) {
      alert('Configure a API Key da WeSales nas configurações primeiro!');
      return;
    }
    alert(`Cliente "${customer.full_name}" seria sincronizado com WeSales.\nAPI Key: ${apiKey.substring(0, 10)}...`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updated = allCustomers.filter(c => c.id !== id);
      saveCustomers(updated);
      setIsEditOpen(false);
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
    active: allCustomers.filter(c => c.status === 'active' || c.status === 'cliente_ativado').length,
    inactive: allCustomers.filter(c => c.status === 'inactive').length,
    disabled: allCustomers.filter(c => c.status === 'disabled').length,
    pending: allCustomers.filter(c => c.status === 'novo_cadastro').length,
  }), [allCustomers]);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-white/70">Gerencie todos os clientes cadastrados</p>
        
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

      {filteredCustomers.length > 0 ? (
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
                    <span className="mx-1">|</span>
                    <Car className="w-3 h-3" /> {customer.plate}
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
        </div>
      )}

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

              {selectedCustomer.city && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Localização</p>
                  <p className="text-sm">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {selectedCustomer.city} - {selectedCustomer.state}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-3 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Alterar Status:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleActivate(selectedCustomer.id, selectedCustomer.status)}
                    disabled={loadingStatus === selectedCustomer.id}
                    className={`${selectedCustomer.status === 'active' ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  >
                    {loadingStatus === selectedCustomer.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
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
                    className={`${selectedCustomer.status === 'inactive' ? 'border-orange-500 bg-orange-50 text-orange-700' : ''}`}
                  >
                    {loadingStatus === selectedCustomer.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
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
                      <RefreshCw className="w-4 h-4 animate-spin" />
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
                  Enviar Cadastro via WhatsApp
                </Button>
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  onClick={() => handleSyncToWeSales(selectedCustomer)}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  WeSales
                </Button>
                <Button 
                  onClick={() => handleEdit(selectedCustomer)}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
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
                    onChange={(e) => setEditForm({...editForm, plate: e.target.value})}
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
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Observações</label>
                <Input 
                  value={editForm.notes || ''} 
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  placeholder="Observações sobre o cliente..."
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleDelete(editForm.id!);
                  setIsEditOpen(false);
                  setIsViewOpen(false);
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
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
