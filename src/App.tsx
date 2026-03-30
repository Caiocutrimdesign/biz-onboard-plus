// Lovable Sync - With Error Boundary
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
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
import BirthdaysPage from "./pages/crm/BirthdaysPage";

import DashboardPage from "./pages/modules/DashboardPage";
import TECPage from "./pages/modules/TECPage";
import ERPPage from "./pages/modules/ERPPage";
import SHELLPage from "./pages/modules/SHELLPage";
import AgentsMonitorPage from "./pages/modules/AgentsMonitorPage";
import TECAdminPage from "./pages/modules/TECAdminPage";
import TechniciansPage from "./pages/modules/TechniciansPage";
import CRMAgentsPage from "./pages/modules/CRMAgentsPage";

const queryClient = new QueryClient();

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (e: any) {
    console.error("ErrorBoundary caught:", e);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado</h1>
          <p className="text-muted-foreground">{e.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/planos" element={<PlansPage />} />
        <Route path="/aprenda" element={<LearningPage />} />
        
        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <AdminLogin />
            </GuestRoute>
          }
        />
        
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

        <Route
          path="/crm"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user', 'employee']}>
              <CRMPage />
            </ProtectedRoute>
          }
        />
        
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

        <Route
          path="/crm/aniversariantes"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <BirthdaysPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tec"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user', 'employee', 'technician']}>
              <TECPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tec/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TECAdminPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/erp"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <ERPPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/shell"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user', 'employee']}>
              <SHELLPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/agents-monitor"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AgentsMonitorPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <AgentProvider autoStart={false}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AgentProvider>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
