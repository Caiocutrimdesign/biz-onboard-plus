import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Map, DollarSign, Settings, Bell, 
  Menu, ChevronRight, TrendingUp, ShieldCheck, Users, Car, Smartphone, Search, Filter, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import logo from '@/assets/logo-rastremix.png';
import ClientsSection from '@/components/clients/ClientsSection';
import { STATUS_LABELS, STATUS_COLORS, type CustomerRegistration } from '@/types/customer';
import { useAuth } from '@/contexts/AuthContext';

type Module = 'dashboard' | 'clientes' | 'financeiro' | 'rastreamento' | 'config';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [allCustomers, setAllCustomers] = useState<CustomerRegistration[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    try {
      const localData = localStorage.getItem('rastremix_customers');
      if (localData) {
        const localCustomers = JSON.parse(localData);
        setAllCustomers([...localCustomers]);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const stats = {
    total: allCustomers.length,
    revenue: 12450.80,
    activeVehicles: 154,
    pendingRegs: allCustomers.filter(c => c.status === 'novo_cadastro').length
  };

  const handleLogout = async () => {
    await logout();
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
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col border-r border-surface-dark-foreground/10 bg-surface-dark transition-all duration-300`}
      >
        <div className="flex h-20 items-center justify-center border-b border-surface-dark-foreground/10 px-6">
          <img src={logo} alt="Rastremix" className={`${isSidebarOpen ? 'h-10' : 'h-8'} transition-all`} />
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

      <main className="flex-1 flex flex-col overflow-hidden bg-background">
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
            <Button 
              onClick={() => navigate('/crm')}
              className="bg-gradient-brand hover:opacity-90"
            >
              CRM Completo
            </Button>
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

        <div className="flex-1 overflow-y-auto p-8">
          {activeModule === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative overflow-hidden rounded-3xl bg-surface-dark p-8 text-surface-dark-foreground shadow-2xl">
                <div className="relative z-10">
                  <h1 className="font-display text-3xl font-bold">Bem-vindo de volta, Administrador!</h1>
                  <p className="mt-2 text-surface-dark-foreground/60">Aqui está o que está acontecendo na Rastremix hoje.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/20 via-transparent to-transparent" />
                <ShieldCheck className="absolute -bottom-8 -right-8 h-48 w-48 text-primary/10 rotate-12" />
              </div>

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

          {activeModule === 'clientes' && <ClientsSection />}

          {['rastreamento', 'financeiro', 'config'].includes(activeModule) && (
            <div className="flex h-full items-center justify-center text-center p-12 bg-muted/10 rounded-3xl border-2 border-dashed border-border animate-in fade-in duration-500">
              <div className="max-w-md">
                 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                   {(() => { const Icon = navItems.find(n => n.id === activeModule)?.icon; return Icon ? <Icon className="h-10 w-10" /> : null; })()}
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
    </div>
  );
}
