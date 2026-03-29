import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Target, Zap, Mail, Calendar, 
  BarChart3, GitBranch, Settings, Bell, Menu, X,
  ChevronRight, LogOut, Search, Plus, ChevronDown, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCRMStore } from '@/stores/crmStore';
import { useAgents } from '@/agents/context/AgentContext';

type CRMLodule = 'dashboard' | 'leads' | 'pipeline' | 'automation' | 'email' | 'calendar' | 'analytics' | 'funnels' | 'agents' | 'settings';

const modules = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { id: 'leads', label: 'Leads', icon: Users, color: 'text-purple-500' },
  { id: 'pipeline', label: 'Pipeline', icon: Target, color: 'text-green-500' },
  { id: 'automation', label: 'Automações', icon: Zap, color: 'text-yellow-500' },
  { id: 'email', label: 'E-mail', icon: Mail, color: 'text-pink-500' },
  { id: 'calendar', label: 'Agendamentos', icon: Calendar, color: 'text-orange-500' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-500' },
  { id: 'funnels', label: 'Funis', icon: GitBranch, color: 'text-indigo-500' },
  { id: 'agents', label: 'Agentes', icon: Bot, color: 'text-violet-500' },
  { id: 'settings', label: 'Configurações', icon: Settings, color: 'text-gray-500' },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModule] = useState<CRMLodule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, leads } = useCRMStore();
  
  let runningAgents = 0;
  try {
    const { agents } = useAgents();
    runningAgents = Object.values(agents).filter(a => a.status === 'running').length;
  } catch {
    runningAgents = 0;
  }

  const pendingLeads = leads.filter(l => l.status === 'novo' || l.status === 'contatado').length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300
      `}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">BZ</span>
              </div>
              <span className="font-display font-bold text-gray-900">Biz CRM</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">BZ</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as CRMLodule)}
              className={`
                group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeModule === mod.id 
                  ? 'bg-gradient-brand text-white shadow-brand' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <mod.icon className={`h-5 w-5 ${activeModule === mod.id ? 'text-white' : mod.color}`} />
              {isSidebarOpen && (
                <>
                  <span className="flex-1 text-left">{mod.label}</span>
                  {mod.id === 'leads' && pendingLeads > 0 && (
                    <Badge className="bg-white/20 text-white text-xs">{pendingLeads}</Badge>
                  )}
                  {mod.id === 'agents' && runningAgents > 0 && (
                    <Badge className="bg-green-500/80 text-white text-xs animate-pulse">{runningAgents}</Badge>
                  )}
                  {activeModule === mod.id && <ChevronRight className="h-4 w-4 opacity-50" />}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar leads, negócios..." 
                className="w-64 pl-10 h-10 rounded-xl bg-gray-100 border-none focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold">
                {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-64 h-full bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-16 items-center px-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                    <span className="text-white font-bold text-sm">BZ</span>
                  </div>
                  <span className="font-display font-bold text-gray-900">Biz CRM</span>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {modules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModule(mod.id as CRMLodule);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${activeModule === mod.id 
                        ? 'bg-gradient-brand text-white shadow-brand' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <mod.icon className={`h-5 w-5 ${activeModule === mod.id ? 'text-white' : mod.color}`} />
                    <span>{mod.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
