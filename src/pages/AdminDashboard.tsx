import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Users, Car, DollarSign, Settings, Bell, 
  Menu, X, ChevronRight, TrendingUp, ShieldCheck, Phone, Mail, Calendar,
  BarChart3, Target, Zap, CalendarCheck, GitBranch, Bot, HelpCircle,
  MessageSquare, Send, Gift, Wrench, ClipboardList, Cake, Building2, Shield
} from 'lucide-react';
import TechniciansPage from './modules/TechniciansPage';
import ServicesPage from './modules/ServicesPage';
import BirthdaysPage from './modules/BirthdaysPage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ClientsSection from '@/components/clients/ClientsSection';
import { useAuth } from '@/contexts/AuthContext';
import { Logo3D } from '@/components/ui/Logo3D';
import { useData } from '@/contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitoringSidePanel } from '@/components/admin/monitoring/MonitoringSidePanel';
import { MapComponent } from '@/components/admin/monitoring/MapComponent';
import 'leaflet/dist/leaflet.css';

type Module = 'dashboard' | 'clientes' | 'veiculos' | 'financeiro' | 'agendamentos' | 'config' | 'tecnicos' | 'servicos' | 'aniversarios' | 'empresa';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const monitoramentoItems: NavItem[] = [
  { id: 'alertas', label: 'Alertas', icon: Bell, path: '/admin?tab=alertas' },
  { id: 'cercas', label: 'Cercas Virtuais', icon: Target, path: '/admin?tab=cercas' },
  { id: 'comando', label: 'Comando', icon: Zap, path: '/admin?tab=comando' },
  { id: 'gestao_alertas', label: 'Gestão de alertas', icon: ShieldCheck, path: '/admin?tab=gestao_alertas' },
  { id: 'manutencao', label: 'Manutenção', icon: Wrench, path: '/admin?tab=manutencao' },
  { id: 'mapa', label: 'Mapa', icon: GitBranch, path: '/admin?tab=mapa' },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3, path: '/admin?tab=relatorios' },
  { id: 'smartcam', label: 'SmartCam', icon: Bot, path: '/admin?tab=smartcam' },
];

const administrativoItems: NavItem[] = [
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, path: '/admin?tab=financeiro' },
  { id: 'gerenciar', label: 'Gerenciar', icon: Settings, path: '/admin?tab=gerenciar' },
  { id: 'home_admin', label: 'Home', icon: LayoutDashboard, path: '/admin?tab=home_admin' },
  { id: 'os', label: 'Ordem de serviço', icon: ClipboardList, path: '/admin?tab=os' },
  { id: 'suporte', label: 'Suporte', icon: HelpCircle, path: '/admin?tab=suporte' },
  { id: 'usuarios', label: 'Usuários', icon: Users, path: '/admin?tab=usuarios' },
  { id: 'veiculos', label: 'Veículos', icon: Car, path: '/admin?tab=veiculos' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { customers: allCustomers, isLoading } = useData();
  const [activeModule, setActiveModule] = useState<string>('mapa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const allNavItems = [...monitoramentoItems, ...administrativoItems];
    const tab = searchParams.get('tab');
    if (tab && allNavItems.some(item => item.id === tab)) {
      setActiveModule(tab);
    }
  }, [searchParams]);

  const birthdays = useMemo(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    return allCustomers.filter((c: any) => {
      if (!c.birth_date) return false;
      const birth = new Date(c.birth_date);
      return birth.getMonth() === todayMonth && birth.getDate() === todayDay;
    });
  }, [allCustomers]);

  const stats = useMemo(() => ({
    total: allCustomers.length,
    active: allCustomers.filter((c: any) => c.status === 'cliente_ativado' || c.status === 'active' || c.status === 'ativo').length,
    pending: allCustomers.filter((c: any) => c.status === 'novo_cadastro' || c.status === 'novo' || c.status === 'pendente').length,
    inProgress: allCustomers.filter((c: any) => c.status === 'em_atendimento' || c.status === 'em_andamento').length,
  }), [allCustomers]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden selection:bg-primary/30">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col ${isSidebarOpen ? 'w-64' : 'w-22'} bg-white border-r border-gray-100 transition-all duration-500 ease-in-out relative z-30`}>
        <div className="flex h-20 items-center justify-center border-b border-gray-100 px-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
                <Shield className="text-white w-6 h-6" />
              </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="font-display font-bold text-lg leading-none block">RASTREMIX</span>
                <span className="block text-[10px] text-primary font-bold uppercase tracking-widest mt-1">CRM PLATFORM</span>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Grupo Monitoramento */}
          <div>
            {isSidebarOpen && (
              <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Monitoramento</p>
            )}
            <div className="space-y-1">
              {monitoramentoItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all group ${
                    activeModule === item.id 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform group-hover:scale-110 ${activeModule === item.id ? 'text-primary' : 'text-white/20'}`} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Grupo Administrativo */}
          <div>
            {isSidebarOpen && (
              <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Administrativo</p>
            )}
            <div className="space-y-1">
              {administrativoItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all group ${
                    activeModule === item.id 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform group-hover:scale-110 ${activeModule === item.id ? 'text-primary' : 'text-white/20'}`} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={handleCRMNavigation}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20"
          >
            <Zap className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span>CRM Inteligente</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110" />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 bg-white border-b border-gray-100 relative z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)} 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-display font-bold capitalize tracking-tight text-gray-800">{activeModule}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Painel de Gerenciamento</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
                <Input 
                   placeholder="Pesquisar..." 
                   className="w-64 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary/20 pl-10 text-gray-900" 
                />
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full pulse-glow" />
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-none">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">Super Usuário</p>
               </div>
               <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold shadow-lg border border-white/10">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mapa View (Layout de Três Painéis) */}
              {activeModule === 'mapa' && (
                <div className="absolute inset-0 flex overflow-hidden">
                   <MonitoringSidePanel />
                   <MapComponent />
                </div>
              )}

              {/* Dashboard / Home View */}
              {(activeModule === 'dashboard' || activeModule === 'home_admin') && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Clientes', value: stats.total, icon: Users, color: 'text-primary', delay: 0 },
                      { label: 'Clientes Ativos', value: stats.active, icon: ShieldCheck, color: 'text-green-500', delay: 0.1 },
                      { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-yellow-500', delay: 0.2 },
                      { label: 'Em Atendimento', value: stats.inProgress, icon: TrendingUp, color: 'text-blue-500', delay: 0.3 },
                    ].map((s, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: s.delay }}
                        className="glass-card p-6 rounded-3xl group hover:bg-white/15 transition-all duration-500 hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-colors`}>
                            <s.icon className={`h-6 w-6 ${s.color}`} />
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold border-white/10 text-white/50">+12.5%</Badge>
                        </div>
                        <p className="text-3xl font-display font-bold tracking-tight">{s.value}</p>
                        <p className="text-xs uppercase tracking-widest text-white/40 font-bold mt-1">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
                       <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                          <div>
                             <h3 className="font-display font-bold text-lg">Cadastros Recentes</h3>
                             <p className="text-xs text-white/40">Últimos 5 clientes registrados no portal</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setActiveModule('clientes')} className="text-xs uppercase font-bold tracking-widest text-primary hover:bg-primary/10">Ver Todos</Button>
                       </div>
                       <div className="p-2">
                          {allCustomers.slice(0, 5).map((c: any, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/5">
                                     <Users className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />
                                  </div>
                                  <div>
                                     <p className="font-bold text-white/90">{c.full_name}</p>
                                     <p className="text-xs text-white/40 font-mono">{c.phone}</p>
                                  </div>
                               </div>
                               <Badge className="bg-white/5 text-white/60 hover:bg-white/10 border-white/10">{c.plan || 'Standard'}</Badge>
                            </div>
                          ))}
                          {allCustomers.length === 0 && (
                            <div className="py-12 text-center">
                               <p className="text-white/20 italic">Aguardando novos cadastros...</p>
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Birthday / Quick Actions Sidebar */}
                    <div className="space-y-8">
                       {/* Birthday Card */}
                       {birthdays.length > 0 && (
                          <div className="glass-card rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20 p-6">
                            <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                                  <Gift className="text-white w-6 h-6" />
                               </div>
                               <div>
                                  <h3 className="font-bold">Aniversariantes</h3>
                                  <p className="text-xs text-pink-500 font-bold uppercase tracking-tighter">Hoje ({birthdays.length})</p>
                               </div>
                            </div>
                            <div className="space-y-4">
                               {birthdays.slice(0, 3).map((b: any, i) => (
                                  <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                                     <p className="text-sm font-medium truncate pr-2">{b.full_name}</p>
                                     <Button onClick={() => sendBirthdayMessage(b)} size="icon" className="h-8 w-8 bg-pink-500 hover:bg-pink-600 rounded-lg">
                                        <Send className="w-3 h-3" />
                                     </Button>
                                  </div>
                               ))}
                            </div>
                          </div>
                       )}

                       {/* Action Cards */}
                       <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-primary/10 to-orange-500/10 border-primary/20">
                          <h3 className="font-bold mb-4">Ação Rápida</h3>
                          <p className="text-xs text-white/50 mb-6">Execute tarefas críticas com um clique.</p>
                          <Button 
                             onClick={handleCRMNavigation}
                             className="w-full bg-primary hover:bg-primary/90 text-white shadow-brand h-12"
                          >
                             <Bot className="w-4 h-4 mr-2" />
                             Automação CRM
                          </Button>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clientes View */}
              {activeModule === 'clientes' && <ClientsSection />}

              {/* Aniversarios View */}
              {activeModule === 'aniversarios' && <BirthdaysPage />}

              {/* Tecnicos View */}
              {activeModule === 'tecnicos' && <TechniciansPage />}

              {/* Servicos View */}
              {activeModule === 'servicos' && <ServicesPage />}

              {/* Other Module Placeholders */}
              {['veiculos', 'financeiro', 'agendamentos', 'config'].includes(activeModule) && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
                     <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
                    {activeModule === 'veiculos' && <Car className="h-12 w-12 text-primary relative z-10" />}
                    {activeModule === 'financeiro' && <DollarSign className="h-12 w-12 text-primary relative z-10" />}
                    {activeModule === 'agendamentos' && <CalendarCheck className="h-12 w-12 text-primary relative z-10" />}
                    {activeModule === 'config' && <Settings className="h-12 w-12 text-primary relative z-10" />}
                  </div>
                  <h2 className="text-3xl font-display font-bold mb-4 capitalize tracking-tight">{activeModule}</h2>
                  <p className="text-white/40 max-w-md mb-10 leading-relaxed">
                    Estamos preparando uma experiência incrível para o módulo de <strong>{activeModule}</strong>. Por enquanto, utilize o CRM Inteligente para estas operações.
                  </p>
                  <Button onClick={handleCRMNavigation} size="lg" className="bg-white text-black hover:bg-white/90">
                    <Zap className="w-5 h-5 mr-2 text-primary" />
                    Abrir CRM Inteligente
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Drawer (Glass Mode) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden bg-black/80 backdrop-blur-sm"
          >
             <motion.aside 
               initial={{ x: -280 }}
               animate={{ x: 0 }}
               exit={{ x: -280 }}
               className="absolute left-0 top-0 bottom-0 w-80 bg-[#0A0A0B] border-r border-white/10 shadow-2xl flex flex-col"
             >
                {/* Header Mobile */}
                <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
                   <div className="flex items-center gap-3">
                      <Shield className="text-primary w-8 h-8" />
                      <span className="font-display font-bold text-xl uppercase">Rastremix</span>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="text-white/40">
                      <X className="w-6 h-6" />
                   </Button>
                </div>

                <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
                   <div>
                      <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Monitoramento</p>
                      <div className="space-y-2">
                         {monitoramentoItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => { handleNavigate(item); setIsMobileOpen(false); }}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                                 activeModule === item.id ? 'bg-primary text-white shadow-brand' : 'text-white/40'
                              }`}
                            >
                               <item.icon className="w-6 h-6" />
                               {item.label}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Administrativo</p>
                      <div className="space-y-2">
                         {administrativoItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => { handleNavigate(item); setIsMobileOpen(false); }}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                                 activeModule === item.id ? 'bg-primary text-white shadow-brand' : 'text-white/40'
                              }`}
                            >
                               <item.icon className="w-6 h-6" />
                               {item.label}
                            </button>
                         ))}
                      </div>
                   </div>
                </nav>

                <div className="p-6 space-y-4 border-t border-white/10">
                   <Button onClick={handleLogout} variant="destructive" className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-red-500/20">
                      Sair do Portal
                   </Button>
                </div>
             </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
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
