import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, Plus, Car, Smartphone, Mail, MapPin,
  Users, Clock, CheckCircle2, AlertCircle, User, CreditCard,
  Calendar, X, Save, Trash2, Send, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { STATUS_LABELS, STATUS_COLORS, type CustomerRegistration, type CustomerStatus } from '@/types/customer';

const STORAGE_KEY = 'rastremix_customers';
const WESALES_KEY = 'wesales_api_key';

export default function ClientsSection() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [allCustomers, setAllCustomers] = useState<CustomerRegistration[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRegistration | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomerRegistration>>({});

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
    active: allCustomers.filter(c => c.status === 'cliente_ativado').length,
    pending: allCustomers.filter(c => c.status === 'novo_cadastro').length,
    inProgress: allCustomers.filter(c => c.status === 'em_atendimento').length,
  }), [allCustomers]);

  const handleActivate = (id: string) => {
    const updated = allCustomers.map(c => 
      c.id === id ? { ...c, status: 'cliente_ativado' as CustomerStatus } : c
    );
    saveCustomers(updated);
    setIsViewOpen(false);
  };

  const handleReject = (id: string) => {
    const updated = allCustomers.map(c => 
      c.id === id ? { ...c, status: 'cancelado' as CustomerStatus } : c
    );
    saveCustomers(updated);
    setIsViewOpen(false);
  };

  const handleEdit = (customer: CustomerRegistration) => {
    setEditForm({ ...customer });
    setIsViewOpen(false);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.id) return;
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
      setIsViewOpen(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-white/70">Gerencie todos os clientes cadastrados</p>
        
        <div className="flex gap-4 mt-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Ativos', value: stats.active },
            { label: 'Pendentes', value: stats.pending },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 px-4 py-2 rounded-xl">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
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
            <DialogTitle>Detalhes do Cliente</DialogTitle>
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
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                  <p className="font-medium">{selectedCustomer.cpf_cnpj}</p>
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
                  <p className="font-medium capitalize">{selectedCustomer.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedCustomer.status]}>
                    {STATUS_LABELS[selectedCustomer.status]}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleActivate(selectedCustomer.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Ativar
                </Button>
                <Button 
                  onClick={() => handleSyncToWeSales(selectedCustomer)}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" /> Enviar WeSales
                </Button>
                <Button 
                  onClick={() => handleEdit(selectedCustomer)}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" /> Editar
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
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleDelete(editForm.id!);
                  setIsEditOpen(false);
                }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
