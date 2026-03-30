import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wrench, Building2, ShoppingCart,
  Settings, ChevronLeft, Menu, X,
  LogOut, Bell, UserCog, Cake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SuperLayoutProps {
  children: React.ReactNode;
  showCRM?: boolean;
  showFullMenu?: boolean;
}

const tecMenuItems = [
  { id: 'tec', label: 'Módulo TEC', icon: Wrench, path: '/tecnico', color: 'text-orange-500' },
];

const fullMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: 'text-blue-500' },
  { id: 'crm', label: 'CRM', icon: UserCog, path: '/crm', color: 'text-purple-500' },
  { id: 'aniversariantes', label: 'Aniversariantes', icon: Cake, path: '/crm/aniversariantes', color: 'text-pink-500' },
  { id: 'tec', label: 'TEC', icon: Wrench, path: '/tec', color: 'text-orange-500' },
  { id: 'erp', label: 'ERP', icon: Building2, path: '/erp', color: 'text-green-500' },
  { id: 'shell', label: 'SHELL', icon: ShoppingCart, path: '/shell', color: 'text-cyan-500' },
];

export default function SuperLayout({ children, showCRM = true, showFullMenu = false }: SuperLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isInTEC = location.pathname.startsWith('/tec') || location.pathname.startsWith('/erp') || location.pathname.startsWith('/shell');
  const userRole = (user?.role as string);
  const isTechnician = userRole === 'technician' || userRole === 'tecnico';
  const menuItems = isTechnician ? tecMenuItems : fullMenuItems;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                <p className="text-xs text-muted-foreground">
                  {isInTEC ? 'Area Tecnico' : 'Plataforma Unificada'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">
              {isInTEC ? 'MENU TECNICO' : 'MENU PRINCIPAL'}
            </p>
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
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 rotate-180" />
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
                <p className="text-sm font-medium truncate">{user?.name || 'Tecnico'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'tecnico@rastremix.com'}</p>
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
      <div className="fixed inset-x-0 top-0 z-[100] lg:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                console.log('Menu clicked!');
                setIsMobileOpen((prev) => !prev);
              }}
              className="relative z-[101] p-2 -ml-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 cursor-pointer touch-manipulation"
              aria-label="Abrir menu"
              style={{ pointerEvents: 'auto' }}
            >
              <Menu className="h-7 w-7 text-gray-800" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-gray-900">
                {isInTEC ? 'TEC' : 'Rastremix'}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative -mr-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-orange-500 to-red-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-white text-lg">
                {isInTEC ? 'Area TEC' : 'Rastremix'}
              </span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'usuario@rastremix.com'}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium
                    ${active
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-white">
            <button
              onClick={() => {
                handleLogout();
                setIsMobileOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pointer-events-auto">
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
