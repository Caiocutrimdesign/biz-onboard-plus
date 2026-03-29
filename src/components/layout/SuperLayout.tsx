import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Wrench, Building2, ShoppingCart,
  Settings, ChevronLeft, ChevronRight, Menu, X,
  LogOut, Bell, Search, Shield, Package, FileText, Calendar,
  Bot, Smile, BarChart3, Target, Zap, Mail, GitBranch, UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface SuperLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: 'text-blue-500' },
  { id: 'crm', label: 'CRM', icon: Users, path: '/crm', color: 'text-purple-500' },
  { id: 'tec', label: 'TEC', icon: Wrench, path: '/tec', color: 'text-orange-500' },
  { id: 'erp', label: 'ERP', icon: Building2, path: '/erp', color: 'text-green-500' },
  { id: 'shell', label: 'SHELL', icon: ShoppingCart, path: '/shell', color: 'text-pink-500' },
];

const secondaryItems = [
  { id: 'satisfaction', label: 'Satisfação', icon: Smile, path: '/dashboard/satisfaction', color: 'text-green-500' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics', color: 'text-cyan-500' },
  { id: 'calendar', label: 'Agendamentos', icon: Calendar, path: '/dashboard/calendar', color: 'text-orange-500' },
  { id: 'users', label: 'Usuários', icon: UserCog, path: '/dashboard/users', color: 'text-teal-500' },
  { id: 'agents', label: 'Agentes', icon: Bot, path: '/dashboard/agents', color: 'text-violet-500' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/dashboard/settings', color: 'text-gray-500' },
];

export default function SuperLayout({ children }: SuperLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">R</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <span className="font-display font-bold text-gray-900">Rastremix</span>
                <p className="text-xs text-muted-foreground">Plataforma Unificada</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">PRINCIPAL</p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : item.color}`} />
                {!isCollapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
                {active && !isCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </Link>
            );
          })}

          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 mt-4">FERRAMENTAS</p>
          )}
          {secondaryItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${active 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : item.color}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-gray-200">
          <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@rastremix.com'}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed inset-x-0 top-0 z-50 lg:hidden bg-white border-b border-gray-200">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-gray-900">Rastremix</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white overflow-y-auto">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="font-display font-bold text-gray-900">Rastremix</span>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 my-3" />
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
