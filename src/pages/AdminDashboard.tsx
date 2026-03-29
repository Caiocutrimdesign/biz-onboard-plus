import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Users, Car, DollarSign, Settings, Bell, 
  Menu, ChevronRight, TrendingUp, ShieldCheck, Phone, Mail, Calendar,
  BarChart3, Target, Zap, CalendarCheck, GitBranch, Bot, HelpCircle,
  MessageSquare, Send, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import logo from '@/assets/logo-rastremix.png';
import ClientsSection from '@/components/clients/ClientsSection';
import { useAuth } from '@/contexts/AuthContext';
import { Logo3D } from '@/components/ui/Logo3D';

type Module = 'dashboard' | 'clientes' | 'veiculos' | 'financeiro' | 'agendamentos' | 'config';

interface NavItem {
  id: Module;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'clientes', label: 'Clientes', icon: Users, path: '/admin?tab=clientes' },
  { id: 'veiculos', label: 'Veículos', icon: Car, path: '/admin?tab=veiculos' },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, path: '/admin?tab=financeiro' },
  { id: 'agendamentos', label: 'Agendamentos', icon: CalendarCheck, path: '/admin?tab=agendamentos' },
  { id: 'config', label: 'Configurações', icon: Settings, path: '/admin?tab=config' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const data = localStorage.getItem('rastremix_customers');
      if (data) {
        const customers = JSON.parse(data);
        setAllCustomers(customers);
        
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();
        
        const todayBirthdays = customers.filter((c: any) => {
          if (!c.birth_date) return false;
          const birth = new Date(c.birth_date);
          return birth.getMonth() === todayMonth && birth.getDate() === todayDay;
        });
        setBirthdays(todayBirthdays);
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  };

  const stats = {
    total: allCustomers.length,
    active: allCustomers.filter((c: any) => c.status === 'cliente_ativado').length,
    pending: allCustomers.filter((c: any) => c.status === 'novo_cadastro').length,
    inProgress: allCustomers.filter((c: any) => c.status === 'em_atendimento').length,
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleNavigate = (item: NavItem) => {
    setActiveModule(item.id);
    if (item.path !== '/admin') {
      navigate(item.path);
    }
  };

  const sendBirthdayMessage = (customer: any) => {
    const phone = customer.phone?.replace(/\D/g, '') || '';
    const name = customer.full_name?.split(' ')[0] || 'Cliente';
    const message = encodeURIComponent(`🎉 Parabéns, ${name}! 🎉\n\nDesejamos um dia repleto de alegria e muitas felicidades!\n\nEquipe Rastremix - Proteção Veicular`);
    
    if (phone.length >= 10) {
      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    } else {
      window.open(`https://mail.google.com/mail/?view=cm&to=${customer.email}&su=Parabéns%20de%20Hoje&body=${decodeURIComponent(message)}`, '_blank');
    }
  };

  const sendAllBirthdayMessages = () => {
    birthdays.forEach((c: any) => sendBirthdayMessage(c));
  };

  const handleCRMNavigation = () => {
    navigate('/crm');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col bg-surface-dark border-r border-border transition-all duration-300`}>
        <div className="flex h-20 items-center justify-center border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Logo3D size={isSidebarOpen ? 40 : 32} animated={false} />
            {isSidebarOpen && (
              <div>
                <span className="font-bold text-sm">Rastremix</span>
                <span className="block text-xs text-primary">CRM Plus</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeModule === item.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={handleCRMNavigation}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-blue-500 hover:bg-blue-500/10 transition-all"
          >
            <Zap className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span>CRM Completo</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-card">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-lg">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold capitalize">{activeModule}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleCRMNavigation}>
              <Zap className="w-4 h-4 mr-2" />
              CRM Completo
            </Button>
            <div className="relative p-2 text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dashboard View */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="rounded-2xl bg-gradient-to-r from-primary to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Bem-vindo, {user?.name || 'Administrador'}!</h2>
                    <p className="text-white/70 mt-1">Resumo da sua operação hoje</p>
                  </div>
                  <Button onClick={handleCRMNavigation} className="bg-white/20 hover:bg-white/30 text-white border-0">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver CRM
                  </Button>
                </div>
              </div>

              {/* Birthday Section */}
              {birthdays.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Gift className="h-6 w-6" />
                    <h3 className="text-lg font-bold">Aniversariantes de Hoje</h3>
                    <Badge className="bg-white/20 text-white">{birthdays.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {birthdays.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Gift className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{b.full_name}</p>
                            <p className="text-sm text-white/70">{b.phone}</p>
                          </div>
                        </div>
                        <Button onClick={() => sendBirthdayMessage(b)} size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Enviar
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={sendAllBirthdayMessages} className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para Todos
                  </Button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Clientes', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'Clientes Ativos', value: stats.active, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                  { label: 'Em Atendimento', value: stats.inProgress, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border bg-card p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${s.bg} p-2 rounded-lg`}>
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">+12%</Badge>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Novo Cliente', icon: Users, action: () => setActiveModule('clientes'), color: 'text-primary' },
                  { label: 'Ver Agendamentos', icon: Calendar, action: () => setActiveModule('agendamentos'), color: 'text-blue-500' },
                  { label: 'Relatórios', icon: BarChart3, action: () => navigate('/crm?tab=analytics'), color: 'text-green-500' },
                  { label: 'Configurações', icon: Settings, action: () => setActiveModule('config'), color: 'text-gray-500' },
                ].map((a, i) => (
                  <button
                    key={i}
                    onClick={a.action}
                    className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-muted transition-colors"
                  >
                    <a.icon className={`h-5 w-5 ${a.color}`} />
                    <span className="text-sm font-medium">{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-bold mb-4">Últimos Cadastros</h3>
                {allCustomers.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{c.full_name}</p>
                        <p className="text-sm text-muted-foreground">{c.phone}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{c.plan}</Badge>
                  </div>
                ))}
                {allCustomers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum cliente cadastrado ainda</p>
                )}
              </div>
            </div>
          )}

          {/* Clientes View */}
          {activeModule === 'clientes' && <ClientsSection />}

          {/* Other Modules */}
          {['veiculos', 'financeiro', 'agendamentos', 'config'].includes(activeModule) && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                {activeModule === 'veiculos' && <Car className="h-10 w-10 text-primary" />}
                {activeModule === 'financeiro' && <DollarSign className="h-10 w-10 text-primary" />}
                {activeModule === 'agendamentos' && <CalendarCheck className="h-10 w-10 text-primary" />}
                {activeModule === 'config' && <Settings className="h-10 w-10 text-primary" />}
              </div>
              <h2 className="text-2xl font-bold mb-2 capitalize">{activeModule}</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Este módulo está em desenvolvimento. Use o CRM Completo para gerenciar {activeModule}.
              </p>
              <Button onClick={handleCRMNavigation}>
                <Zap className="w-4 h-4 mr-2" />
                Abrir CRM Completo
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
