import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, Users, Filter, Eye, Edit3, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import logo from '@/assets/logo-rastremix.png';
import { STATUS_LABELS, STATUS_COLORS, type CustomerStatus, type CustomerRegistration } from '@/types/customer';

// Mock data for now — will be replaced with Supabase queries
const MOCK_CUSTOMERS: CustomerRegistration[] = [
  {
    id: '1', full_name: 'Carlos Silva', phone: '(11) 99999-1111', cpf_cnpj: '123.456.789-00',
    email: 'carlos@email.com', cep: '01001-000', street: 'Rua A', number: '100', neighborhood: 'Centro',
    city: 'São Paulo', state: 'SP', vehicle_type: 'carro', plate: 'ABC-1234', brand: 'Volkswagen',
    model: 'Gol', year: '2022', color: 'Prata', plan: 'completo', payment_method: 'pix',
    status: 'novo_cadastro', created_at: '2026-03-28T10:00:00Z',
  },
  {
    id: '2', full_name: 'Ana Oliveira', phone: '(21) 98888-2222', cpf_cnpj: '987.654.321-00',
    email: 'ana@email.com', cep: '20040-020', street: 'Rua B', number: '200', neighborhood: 'Copacabana',
    city: 'Rio de Janeiro', state: 'RJ', vehicle_type: 'moto', plate: 'DEF-5678', brand: 'Honda',
    model: 'CG 160', year: '2024', color: 'Vermelha', plan: 'bloqueio', payment_method: 'cartao',
    status: 'em_atendimento', created_at: '2026-03-27T14:30:00Z',
  },
  {
    id: '3', full_name: 'Roberto Santos', phone: '(31) 97777-3333', cpf_cnpj: '11.222.333/0001-44',
    email: 'roberto@empresa.com', cep: '30130-000', street: 'Av C', number: '300', neighborhood: 'Savassi',
    city: 'Belo Horizonte', state: 'MG', vehicle_type: 'frota', plate: 'GHI-9012', brand: 'Fiat',
    model: 'Strada', year: '2023', color: 'Branco', plan: 'frota', payment_method: 'boleto',
    status: 'cliente_ativado', created_at: '2026-03-25T09:15:00Z',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customers] = useState<CustomerRegistration[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch = !search || [c.full_name, c.phone, c.plate, c.cpf_cnpj, c.email]
        .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const stats = useMemo(() => ({
    total: customers.length,
    novos: customers.filter((c) => c.status === 'novo_cadastro').length,
    ativos: customers.filter((c) => c.status === 'cliente_ativado').length,
    pendentes: customers.filter((c) => ['aguardando_pagamento', 'pendente'].includes(c.status)).length,
  }), [customers]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Rastremix" className="h-8" />
            <span className="font-display text-sm font-semibold text-muted-foreground">ADMIN</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Novos', value: stats.novos, color: 'text-blue-600' },
            { label: 'Ativos', value: stats.ativos, color: 'text-success' },
            { label: 'Pendentes', value: stats.pendentes, color: 'text-warning' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone, placa ou CPF/CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-10 text-base" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full sm:w-56">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">Veículo</th>
                  <th className="px-4 py-3 font-semibold">Plano</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">{c.cpf_cnpj}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3">
                      <p>{c.brand} {c.model}</p>
                      <p className="text-xs text-muted-foreground">{c.plate}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{c.plan}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={STATUS_COLORS[c.status]}>
                        {STATUS_LABELS[c.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedCustomer(c); setDetailOpen(true); }}
                        className="gap-1 text-primary"
                      >
                        <Eye className="h-4 w-4" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedCustomer?.full_name}</DialogTitle>
            <DialogDescription>Cadastro realizado em {selectedCustomer && new Date(selectedCustomer.created_at).toLocaleDateString('pt-BR')}</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Telefone</p><p className="font-medium">{selectedCustomer.phone}</p></div>
                <div><p className="text-muted-foreground">CPF/CNPJ</p><p className="font-medium">{selectedCustomer.cpf_cnpj}</p></div>
                <div><p className="text-muted-foreground">E-mail</p><p className="font-medium">{selectedCustomer.email}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge className={STATUS_COLORS[selectedCustomer.status]}>{STATUS_LABELS[selectedCustomer.status]}</Badge></div>
              </div>
              <div>
                <h3 className="mb-2 font-display font-semibold">Endereço</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.street}, {selectedCustomer.number} — {selectedCustomer.neighborhood}<br />
                  {selectedCustomer.city}/{selectedCustomer.state} — CEP: {selectedCustomer.cep}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-display font-semibold">Veículo</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Tipo:</span> <span className="capitalize">{selectedCustomer.vehicle_type}</span></div>
                  <div><span className="text-muted-foreground">Placa:</span> {selectedCustomer.plate}</div>
                  <div><span className="text-muted-foreground">Marca/Modelo:</span> {selectedCustomer.brand} {selectedCustomer.model}</div>
                  <div><span className="text-muted-foreground">Ano:</span> {selectedCustomer.year}</div>
                  <div><span className="text-muted-foreground">Cor:</span> {selectedCustomer.color}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Plano:</span> <span className="capitalize font-medium">{selectedCustomer.plan}</span></div>
                <div><span className="text-muted-foreground">Pagamento:</span> <span className="capitalize">{selectedCustomer.payment_method}</span></div>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <h3 className="mb-2 font-display font-semibold">Observações</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
