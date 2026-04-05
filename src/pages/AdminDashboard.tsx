import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Users, Car, DollarSign, Settings, Bell, 
  Menu, X, ChevronRight, TrendingUp, ShieldCheck, Phone, Mail, Calendar,
  BarChart3, Target, Zap, CalendarCheck, GitBranch, Bot, HelpCircle,
  MessageSquare, Send, Gift, Wrench, ClipboardList, Cake, Building2, Shield, Search
} from 'lucide-react';
import TechniciansPage from './modules/TechniciansPage';
import ServicesPage from './modules/ServicesPage';
import BirthdaysPage from './modules/BirthdaysPage';
import UsersPage from './modules/UsersPage';
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

type Module = 'dashboard' | 'clientes' | 'veiculos' | 'financeiro' | 'agendamentos' | 'usuarios' | 'config' | 'tecnicos' | 'servicos' | 'aniversarios' | 'empresa';

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
    <div className="flex h-screen bg-gray-50/30 text-gray-900 overflow-hidden selection:bg-blue-100">
      {/* Sidebar - Desktop Premium */}
      <aside className={`hidden lg:flex flex-col ${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-gray-100 transition-all duration-500 ease-in-out relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="flex h-24 items-center px-8 border-b border-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-xl shadow-red-100 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <Shield className="text-white w-6 h-6" />
              </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="font-display font-black text-2xl tracking-tighter text-gray-900 leading-none block">RASTREMIX</span>
                <span className="block text-[10px] text-red-500 font-black uppercase tracking-[0.3em] mt-1.5 opacity-60">Control Center v4.2</span>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto hidden-scrollbar">
          {/* Grupo Monitoramento Tático */}
          <div>
            {isSidebarOpen && (
              <p className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Monitoramento Tático</p>
            )}
            <div className="space-y-1.5">
              {monitoramentoItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item)}
                  className={`w-full flex items-center gap-4 rounded-2xl px-6 py-4 text-sm font-black transition-all group relative ${
                    activeModule === item.id 
                      ? 'bg-red-50 text-red-600 border border-red-100/50 shadow-sm' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-all ${activeModule === item.id ? 'text-red-600' : 'text-gray-300 group-hover:text-red-400'}`} />
                  {isSidebarOpen && <span>{item.label}</span>}
                  {activeModule === item.id && (
                    <motion.div layoutId="activeNav" className="absolute left-1 w-1 h-6 bg-red-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gestão Administrativa */}
          <div>
            {isSidebarOpen && (
              <p className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Administrativo</p>
            )}
            <div className="space-y-1.5">
              {administrativoItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item)}
                  className={`w-full flex items-center gap-4 rounded-2xl px-6 py-4 text-sm font-black transition-all group relative ${
                    activeModule === item.id 
                      ? 'bg-red-50 text-red-600 border border-red-100/50 shadow-sm' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-all ${activeModule === item.id ? 'text-red-600' : 'text-gray-300 group-hover:text-red-400'}`} />
                  {isSidebarOpen && <span>{item.label}</span>}
                  {activeModule === item.id && (
                    <motion.div layoutId="activeNav" className="absolute left-1 w-1 h-6 bg-red-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={handleCRMNavigation}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
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
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Header Premium */}
        <header className="h-24 flex items-center justify-between px-10 bg-white/80 backdrop-blur-3xl border-b border-gray-100 relative z-20 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)} 
              className="lg:hidden p-3 hover:bg-gray-100 rounded-2xl transition-all border border-gray-200"
            >
              <Menu className="h-6 w-6 text-gray-900" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black capitalize tracking-tight text-gray-900 lg:text-3xl">{activeModule}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Sistema Operacional Rastremix</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative group">
                <Input 
                   placeholder="Pesquisar registros..." 
                   className="w-80 bg-gray-50 border-gray-100 rounded-2xl focus:ring-red-50 focus:border-red-200 pl-12 text-sm text-gray-900 placeholder:text-gray-300 h-12 transition-all" 
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
            </div>

            <Button variant="ghost" size="icon" className="relative h-12 w-12 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-gray-50 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2 w-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            </Button>

            <div className="flex items-center gap-4 pl-6 border-l border-gray-100 h-10">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-gray-900 leading-none mb-1 tracking-tight">{user?.name || 'Gestor Admin'}</p>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest opacity-60">Acesso Restrito</p>
               </div>
               <motion.div 
                 whileHover={{ scale: 1.05, rotate: 5 }}
                 className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black shadow-xl shadow-red-100 border-2 border-white cursor-pointer overflow-hidden"
               >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </motion.div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className={`flex-1 relative z-10 flex flex-col ${activeModule === 'mapa' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              {/* Mapa View (Layout de Três Painéis) */}
              {activeModule === 'mapa' && (
                <div className="flex-1 relative flex overflow-hidden min-h-0">
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
                      { label: 'Total Clientes', value: stats.total, icon: Users, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-100', delay: 0 },
                      { label: 'Clientes Ativos', value: stats.active, icon: ShieldCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', delay: 0.1 },
                      { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', delay: 0.2 },
                      { label: 'Em Atendimento', value: stats.inProgress, icon: TrendingUp, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100', delay: 0.3 },
                    ].map((s, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: s.delay }}
                        className={`bg-white p-6 rounded-3xl border ${s.borderColor} shadow-sm group hover:shadow-md transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-2xl ${s.bgColor} transition-colors`}>
                            <s.icon className={`h-6 w-6 ${s.color}`} />
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold border-gray-100 text-gray-400">+12.5%</Badge>
                        </div>
                        <p className="text-3xl font-display font-bold tracking-tight text-gray-900">{s.value}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                       <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                          <div>
                             <h3 className="font-display font-bold text-lg text-gray-900">Cadastros Recentes</h3>
                             <p className="text-xs text-gray-400">Últimos 5 clientes registrados no portal</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setActiveModule('clientes')} className="text-xs uppercase font-bold tracking-widest text-red-600 hover:bg-red-50">Ver Todos</Button>
                       </div>
                       <div className="p-2">
                          {allCustomers.slice(0, 5).map((c: any, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                     <Users className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                  </div>
                                  <div>
                                     <p className="font-bold text-gray-900">{c.full_name}</p>
                                     <p className="text-xs text-gray-400 font-mono">{c.phone}</p>
                                  </div>
                               </div>
                               <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100">{c.plan || 'Standard'}</Badge>
                            </div>
                          ))}
                          {allCustomers.length === 0 && (
                            <div className="py-12 text-center">
                               <p className="text-gray-300 italic">Aguardando novos cadastros...</p>
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Birthday / Quick Actions Sidebar */}
                    <div className="space-y-8">
                       {/* Birthday Card */}
                       {birthdays.length > 0 && (
                          <div className="bg-white rounded-3xl border border-pink-100 shadow-sm shadow-pink-100/50 p-6">
                            <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                                  <Gift className="text-pink-600 w-6 h-6" />
                                </div>
                               <div>
                                  <h3 className="font-bold text-gray-900">Aniversariantes</h3>
                                  <p className="text-[10px] text-pink-600 font-black uppercase tracking-tighter">Hoje ({birthdays.length})</p>
                               </div>
                            </div>
                            <div className="space-y-4">
                               {birthdays.slice(0, 3).map((b: any, i) => (
                                  <div key={i} className="flex items-center justify-between bg-pink-50/30 p-3 rounded-2xl border border-pink-50">
                                     <p className="text-sm font-bold text-gray-800 truncate pr-2">{b.full_name}</p>
                                     <Button onClick={() => sendBirthdayMessage(b)} size="icon" className="h-8 w-8 bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm">
                                        <Send className="w-3 h-3 text-white" />
                                     </Button>
                                  </div>
                               ))}
                            </div>
                          </div>
                       )}

                       {/* Action Cards */}
                       <div className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm shadow-red-100/50">
                          <h3 className="font-bold text-gray-900 mb-2">Ação Rápida</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Automação e Tarefas</p>
                          <Button 
                             onClick={handleCRMNavigation}
                              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 h-12 rounded-xl"
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

              {/* Usuarios View */}
              {activeModule === 'usuarios' && <UsersPage />}

              {['veiculos', 'financeiro', 'agendamentos', 'config'].includes(activeModule) && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-red-50 border border-red-100 flex items-center justify-center mb-10 relative">
                     <div className="absolute inset-0 bg-red-400/20 rounded-[2.5rem] blur-3xl animate-pulse" />
                    {activeModule === 'veiculos' && <Car className="h-14 w-14 text-red-600 relative z-10" />}
                    {activeModule === 'financeiro' && <DollarSign className="h-14 w-14 text-red-600 relative z-10" />}
                    {activeModule === 'agendamentos' && <CalendarCheck className="h-14 w-14 text-red-600 relative z-10" />}
                    {activeModule === 'config' && <Settings className="h-14 w-14 text-red-600 relative z-10" />}
                  </div>
                  <h2 className="text-4xl font-black mb-4 capitalize tracking-tight text-gray-900">Módulo em <span className="text-red-600">Expansão</span></h2>
                  <p className="text-gray-500 max-w-md mb-12 leading-relaxed font-medium">
                    Estamos preparando uma experiência de alta performance para o módulo de <strong>{activeModule}</strong>. Por enquanto, utilize o CRM Inteligente para estas operações.
                  </p>
                  <Button 
                    onClick={handleCRMNavigation} 
                    className="h-16 px-10 bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105"
                  >
                    <Zap className="w-5 h-5 mr-3 text-white animate-pulse" />
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
            className="fixed inset-0 z-[100] lg:hidden bg-gray-900/40 backdrop-blur-sm"
          >
             <motion.aside 
               initial={{ x: -280 }}
               animate={{ x: 0 }}
               exit={{ x: -280 }}
               className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col"
             >
                {/* Header Mobile */}
                <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                        <Shield className="text-white w-5 h-5" />
                      </div>
                      <span className="font-display font-bold text-xl uppercase tracking-tight text-gray-900">Rastremix</span>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="text-gray-400 hover:bg-gray-100 rounded-xl">
                      <X className="w-6 h-6" />
                   </Button>
                </div>

                <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                   <div>
                      <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Monitoramento</p>
                      <div className="space-y-1">
                         {monitoramentoItems.map((item) => (
                            <button
                               key={item.id}
                               onClick={() => { handleNavigate(item); setIsMobileOpen(false); }}
                               className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                                  activeModule === item.id 
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                                    : 'text-gray-500 hover:bg-gray-50'
                               }`}
                            >
                               <item.icon className={`w-6 h-6 ${activeModule === item.id ? 'text-white' : 'text-gray-400'}`} />
                               {item.label}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Administrativo</p>
                      <div className="space-y-1">
                         {administrativoItems.map((item) => (
                            <button
                               key={item.id}
                               onClick={() => { handleNavigate(item); setIsMobileOpen(false); }}
                               className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                                  activeModule === item.id 
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                                    : 'text-gray-500 hover:bg-gray-50'
                               }`}
                            >
                               <item.icon className={`w-6 h-6 ${activeModule === item.id ? 'text-white' : 'text-gray-400'}`} />
                               {item.label}
                            </button>
                         ))}
                      </div>
                   </div>
                </nav>

                <div className="p-6 space-y-4 border-t border-gray-100">
                   <Button onClick={handleLogout} variant="destructive" className="w-full py-6 rounded-2xl font-bold">
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
