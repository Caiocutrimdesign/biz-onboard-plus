import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LogOut, Users, Filter, Eye, LayoutDashboard, 
  Map, DollarSign, Settings, Bell, ChevronRight, 
  Menu, X, TrendingUp, ShieldCheck, Car, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import logo from '@/assets/logo-rastremix.png';
import { STATUS_LABELS, STATUS_COLORS, type CustomerStatus, type CustomerRegistration } from '@/types/customer';

// Mock data
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

type Module = 'dashboard' | 'clientes' | 'financeiro' | 'rastreamento' | 'config';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch = !search || [c.full_name, c.phone, c.plate, c.cpf_cnpj, c.email]
        .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const stats = useMemo(() => ({
    total: customers.length,
    revenue: 12450.80,
    activeVehicles: 154,
    pendingRegs: customers.filter(c => c.status === 'novo_cadastro').length
  }), [customers]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'rastreamento', label: 'Rastreamento', icon: Map },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'config', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-surface-dark overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col border-r border-surface-dark-foreground/10 bg-surface-dark transition-all duration-300`}
      >
        <div className="flex h-20 items-center justify-center border-b border-surface-dark-foreground/10 px-6">
          <img src={logo} alt="Rastremix" className={`${isSidebarOpen ? 'h-8' : 'h-6'} transition-all`} />
          {isSidebarOpen && <span className="ml-2 text-xs font-bold text-primary">ADMIN</span>}
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as Module)}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeModule === item.id 
                  ? 'bg-primary text-primary-foreground shadow-brand' 
                  : 'text-surface-dark-foreground/60 hover:bg-surface-dark-foreground/5 hover:text-surface-dark-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeModule === item.id ? '' : 'group-hover:text-primary'}`} />
              {isSidebarOpen && <span>{item.label}</span>}
              {activeModule === item.id && isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-surface-dark-foreground/10 p-4">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-border bg-card px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-2 hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-display text-xl font-bold capitalize">
              {navItems.find(n => n.id === activeModule)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary border-2 border-card" />
            </div>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
              <div className="flex h-full w-full items-center justify-center bg-gradient-brand text-xs font-bold text-white">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeModule === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Welcome Card */}
              <div className="relative overflow-hidden rounded-3xl bg-surface-dark p-8 text-surface-dark-foreground shadow-2xl">
                <div className="relative z-10">
                  <h1 className="font-display text-3xl font-bold">Bem-vindo de volta, Administrador!</h1>
                  <p className="mt-2 text-surface-dark-foreground/60">Aqui está o que está acontecendo na Rastremix hoje.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/20 via-transparent to-transparent" />
                <ShieldCheck className="absolute -bottom-8 -right-8 h-48 w-48 text-primary/10 rotate-12" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total Clientes', value: stats.total, icon: Users, color: 'text-primary' },
                  { label: 'Receita Mensal', value: `R$ ${stats.revenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-success' },
                  { label: 'Veículos Ativos', value: stats.activeVehicles, icon: Car, color: 'text-blue-500' },
                  { label: 'Reg. Pendentes', value: stats.pendingRegs, icon: Smartphone, color: 'text-warning' },
                ].map((s, idx) => (
                  <div key={idx} className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`rounded-xl bg-muted p-2 transition-colors group-hover:bg-primary group-hover:text-primary-foreground`}>
                        <s.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-xs">+12%</Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                    <p className={`mt-1 font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card p-6 h-80 flex flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-display font-bold">Crescimento de Clientes</h3>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1 flex items-end gap-2 px-2">
                    {[40, 65, 45, 85, 95, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/10 rounded-t-lg transition-all hover:bg-primary" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border bg-card p-6 h-80">
                  <h3 className="font-display font-bold mb-6">Status dos Planos</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Plano Completo', value: 65, color: 'bg-primary' },
                      { label: 'Rastreio Elite', value: 25, color: 'bg-blue-500' },
                      { label: 'Apenas Bloqueio', value: 10, color: 'bg-warning' },
                    ].map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{p.label}</span>
                          <span className="font-bold">{p.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${p.color}`} style={{ width: `${p.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'clientes' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar clientes..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="h-12 pl-12 rounded-xl"
                  />
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 w-full sm:w-48 rounded-xl">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="bg-gradient-brand h-12 rounded-xl px-6 font-bold">Novo Cliente</Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left">
                        <th className="px-6 py-4 font-bold">CLIENTE</th>
                        <th className="px-6 py-4 font-bold">VEÍCULO</th>
                        <th className="px-6 py-4 font-bold">PLANO</th>
                        <th className="px-6 py-4 font-bold">STATUS</th>
                        <th className="px-6 py-4 font-bold">DATA</th>
                        <th className="px-6 py-4 font-bold">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredCustomers.map((c) => (
                        <tr key={c.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground">{c.full_name}</div>
                            <div className="text-xs text-muted-foreground">{c.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-primary/60" />
                              <span className="font-medium">{c.brand} {c.model}</span>
                            </div>
                            <div className="text-xs text-muted-foreground ml-6">{c.plate}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize">{c.plan}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${STATUS_COLORS[c.status]} border-none rounded-full px-4`}>
                              {STATUS_LABELS[c.status]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">
                            {new Date(c.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedCustomer(c); setDetailOpen(true); }}
                              className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                            >
                              <Eye className="h-4 w-4 mr-2" /> Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCustomers.length === 0 && (
                    <div className="py-20 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4 text-muted-foreground">
                        <Users className="h-10 w-10" />
                      </div>
                      <p className="text-lg font-bold">Nenhum cliente encontrado</p>
                      <p className="text-muted-foreground">Tente ajustar seus filtros de busca.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {['rastreamento', 'financeiro', 'config'].includes(activeModule) && (
            <div className="flex h-full items-center justify-center text-center p-12 bg-muted/10 rounded-3xl border-2 border-dashed border-border animate-in fade-in duration-500">
              <div className="max-w-md">
                 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                   {navItems.find(n => n.id === activeModule)?.icon({ className: 'h-10 w-10' })}
                 </div>
                 <h2 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Módulo {navItems.find(n => n.id === activeModule)?.label}</h2>
                 <p className="text-muted-foreground">Este módulo está sendo sincronizado com o sistema principal da Rastremix. Em breve estará disponível para gestão completa.</p>
                 <Button variant="outline" className="mt-8 rounded-xl font-bold border-primary text-primary hover:bg-primary hover:text-white" onClick={() => setActiveModule('dashboard')}>
                   Voltar ao Dashboard
                 </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-none p-0 overflow-hidden bg-card shadow-2xl">
          <div className="bg-gradient-brand px-8 py-10 text-white">
            <Badge className="bg-white/20 hover:bg-white/30 border-none text-white mb-4 uppercase text-[10px] tracking-widest font-bold">Ficha do Cliente</Badge>
            <DialogTitle className="font-display text-4xl font-black mb-1">{selectedCustomer?.full_name}</DialogTitle>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> {selectedCustomer?.phone}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {selectedCustomer?.id}</span>
            </div>
          </div>
          
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Informações Pessoais</h3>
                <div className="space-y-3">
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">CPF / CNPJ</p><p className="font-bold">{selectedCustomer?.cpf_cnpj}</p></div>
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">E-mail</p><p className="font-bold">{selectedCustomer?.email}</p></div>
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Status do Cadastro</p>
                    <Badge className={`${selectedCustomer ? STATUS_COLORS[selectedCustomer.status] : ''} mt-1 border-none rounded-full`}>
                      {selectedCustomer ? STATUS_LABELS[selectedCustomer.status] : ''}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Endereço Completo</h3>
                <div className="space-y-1 text-sm font-medium">
                  <p>{selectedCustomer?.street}, {selectedCustomer?.number}</p>
                  <p>{selectedCustomer?.neighborhood}</p>
                  <p>{selectedCustomer?.city} / {selectedCustomer?.state}</p>
                  <p className="text-muted-foreground">CEP: {selectedCustomer?.cep}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/50 p-6 border border-border/50">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">Dados do Veículo & Plano</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-border/30 mb-2">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Veículo</p><p className="text-sm font-bold">{selectedCustomer?.brand} {selectedCustomer?.model}</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-border/30 mb-2 font-display font-black text-primary text-[10px]">
                    {selectedCustomer?.plate.substring(0, 3)}
                  </div>
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Placa</p><p className="text-sm font-bold uppercase tracking-widest">{selectedCustomer?.plate}</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-border/30 mb-2">
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Plano</p><p className="text-sm font-bold capitalize">{selectedCustomer?.plan}</p></div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="flex-1 bg-gradient-brand h-12 rounded-xl font-bold shadow-brand">Ativar Cliente</Button>
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-destructive text-destructive hover:bg-destructive/10">Reprovar Cadastro</Button>
              <Button variant="ghost" className="h-12 rounded-xl font-bold">Editar Dados</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

