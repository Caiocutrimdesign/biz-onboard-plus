import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgentProvider } from "@/agents/context/AgentContext";
import { ProtectedRoute, GuestRoute } from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CRMPage from "./pages/crm/CRMPage";
import NotFound from "./pages/NotFound";
import PlansPage from "./pages/crm/PlansPage";
import LearningPage from "./pages/crm/LearningPage";
import UsersPage from "./pages/crm/UsersPage";

import DashboardPage from "./pages/modules/DashboardPage";
import TECPage from "./pages/modules/TECPage";
import ERPPage from "./pages/modules/ERPPage";
import SHELLPage from "./pages/modules/SHELLPage";
import AgentsMonitorPage from "./pages/modules/AgentsMonitorPage";
import TECAdminPage from "./pages/modules/TECAdminPage";
import TechniciansPage from "./pages/modules/TechniciansPage";
import CRMAgentsPage from "./pages/modules/CRMAgentsPage";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/aprenda" element={<LearningPage />} />
      
      {/* Auth Routes */}
      <Route
        path="/admin/login"
        element={
          <GuestRoute>
            <AdminLogin />
          </GuestRoute>
        }
      />
      
      {/* Protected Routes - Unified Platform */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user', 'employee']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/satisfaction"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/calendar"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/agents"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      {/* CRM Module */}
      <Route
        path="/crm"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user', 'employee']}>
            <CRMPage />
          </ProtectedRoute>
        }
      />
      
      {/* CRM Management Routes */}
      <Route
        path="/crm/tecnicos"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TechniciansPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/crm/agentes"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CRMAgentsPage />
          </ProtectedRoute>
        }
      />
      
      {/* TEC Module */}
      <Route
        path="/tec"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user', 'employee', 'technician']}>
            <TECPage />
          </ProtectedRoute>
        }
      />
      
      {/* TEC Admin Panel */}
      <Route
        path="/tec/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TECAdminPage />
          </ProtectedRoute>
        }
      />
      
      {/* ERP Module */}
      <Route
        path="/erp"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <ERPPage />
          </ProtectedRoute>
        }
      />
      
      {/* SHELL Module */}
      <Route
        path="/shell"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user', 'employee']}>
            <SHELLPage />
          </ProtectedRoute>
        }
      />
      
      {/* Legacy Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Agents Monitor */}
      <Route
        path="/dashboard/agents-monitor"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AgentsMonitorPage />
          </ProtectedRoute>
        }
      />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AgentProvider autoStart={true}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AgentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
